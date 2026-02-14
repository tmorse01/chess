import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  useGamePersistence,
  saveGameToLocalStorage,
  getGameFromLocalStorage,
  clearCurrentGame,
} from './useGamePersistence';

type HookProps = {
  gameId?: string;
  token?: string;
  playerColor?: 'white' | 'black';
};

describe('useGamePersistence', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('saveGameToLocalStorage', () => {
    it('saves game data to localStorage', () => {
      const gameData = {
        gameId: 'test-game-id',
        token: 'test-token',
        playerColor: 'white' as const,
      };

      saveGameToLocalStorage(gameData);

      const stored = localStorage.getItem('chess_current_game');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed.gameId).toBe(gameData.gameId);
      expect(parsed.token).toBe(gameData.token);
      expect(parsed.playerColor).toBe(gameData.playerColor);
      expect(parsed.timestamp).toBeTypeOf('number');
    });

    it('handles errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const setItemSpy = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('Storage full');
      });

      saveGameToLocalStorage({
        gameId: 'test',
        token: 'test',
        playerColor: 'white',
      });

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
      setItemSpy.mockRestore();
    });

    it('overwrites existing stored game', () => {
      saveGameToLocalStorage({
        gameId: 'old',
        token: 'old',
        playerColor: 'white',
      });

      saveGameToLocalStorage({
        gameId: 'new',
        token: 'new',
        playerColor: 'black',
      });

      const stored = getGameFromLocalStorage();
      expect(stored?.gameId).toBe('new');
      expect(stored?.token).toBe('new');
      expect(stored?.playerColor).toBe('black');
    });
  });

  describe('getGameFromLocalStorage', () => {
    it('retrieves saved game data', () => {
      const gameData = {
        gameId: 'test-game-id',
        token: 'test-token',
        playerColor: 'black' as const,
        timestamp: Date.now(),
      };

      localStorage.setItem('chess_current_game', JSON.stringify(gameData));

      const retrieved = getGameFromLocalStorage();
      expect(retrieved).toEqual(gameData);
    });

    it('returns null when no data exists', () => {
      const retrieved = getGameFromLocalStorage();
      expect(retrieved).toBeNull();
    });

    it('returns null and clears storage for expired games', () => {
      const sevenDaysAgo = Date.now() - 8 * 24 * 60 * 60 * 1000;
      const expiredData = {
        gameId: 'expired-game',
        token: 'expired-token',
        playerColor: 'white' as const,
        timestamp: sevenDaysAgo,
      };

      localStorage.setItem('chess_current_game', JSON.stringify(expiredData));

      const retrieved = getGameFromLocalStorage();
      expect(retrieved).toBeNull();
      expect(localStorage.getItem('chess_current_game')).toBeNull();
    });

    it('handles corrupted data gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      localStorage.setItem('chess_current_game', 'invalid json{');

      const retrieved = getGameFromLocalStorage();
      expect(retrieved).toBeNull();
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('returns null when stored object is missing timestamp', () => {
      localStorage.setItem(
        'chess_current_game',
        JSON.stringify({
          gameId: 'x',
          token: 'y',
          playerColor: 'white',
        })
      );

      const retrieved = getGameFromLocalStorage();
      expect(retrieved).toBeNull();
    });
  });

  describe('clearCurrentGame', () => {
    it('removes game data from localStorage', () => {
      localStorage.setItem('chess_current_game', JSON.stringify({ test: 'data' }));

      clearCurrentGame();

      expect(localStorage.getItem('chess_current_game')).toBeNull();
    });

    it('handles errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const removeItemSpy = vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
        throw new Error('Storage error');
      });

      clearCurrentGame();

      expect(consoleErrorSpy).toHaveBeenCalled();
      consoleErrorSpy.mockRestore();
      removeItemSpy.mockRestore();
    });
  });

  describe('useGamePersistence hook', () => {
    it('saves game data when all parameters are provided', () => {
      const { rerender } = renderHook(
        ({ gameId, token, playerColor }: HookProps) =>
          useGamePersistence(gameId, token, playerColor),
        {
          initialProps: {
            gameId: 'game-123',
            token: 'token-456',
            playerColor: 'white',
          },
        }
      );

      const stored = getGameFromLocalStorage();
      expect(stored).toBeTruthy();
      expect(stored?.gameId).toBe('game-123');
      expect(stored?.token).toBe('token-456');
      expect(stored?.playerColor).toBe('white');

      rerender({
        gameId: 'game-123',
        token: 'token-456',
        playerColor: 'black',
      });

      const updated = getGameFromLocalStorage();
      expect(updated?.playerColor).toBe('black');
    });

    it('does not save when parameters are missing', () => {
      renderHook(() => useGamePersistence(undefined, undefined, undefined));

      const stored = getGameFromLocalStorage();
      expect(stored).toBeNull();
    });

    it('returns utility functions', () => {
      const { result } = renderHook(() => useGamePersistence('game-123', 'token-456', 'white'));

      expect(result.current.saveGame).toBeTypeOf('function');
      expect(result.current.getGame).toBeTypeOf('function');
      expect(result.current.clearGame).toBeTypeOf('function');
    });

    it('utility functions interact with localStorage', () => {
      const { result } = renderHook(() => useGamePersistence('game-123', 'token-456', 'white'));

      result.current.saveGame({
        gameId: 'game-999',
        token: 'token-999',
        playerColor: 'black',
      });

      const stored = result.current.getGame();
      expect(stored?.gameId).toBe('game-999');
      expect(stored?.playerColor).toBe('black');

      result.current.clearGame();
      expect(result.current.getGame()).toBeNull();
    });
  });
});
