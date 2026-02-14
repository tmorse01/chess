import { useEffect } from 'react';

const STORAGE_KEY = 'chess_current_game';

export interface GamePersistence {
  gameId: string;
  token: string;
  playerColor: 'white' | 'black';
  timestamp: number;
}

/**
 * Hook to persist current game to localStorage for dev experience
 * (survive dev server restarts)
 */
export function useGamePersistence(
  gameId?: string,
  token?: string,
  playerColor?: 'white' | 'black'
) {
  useEffect(() => {
    if (gameId && token && playerColor) {
      saveGameToLocalStorage({ gameId, token, playerColor });
    }
  }, [gameId, token, playerColor]);

  return {
    saveGame: saveGameToLocalStorage,
    getGame: getGameFromLocalStorage,
    clearGame: clearCurrentGame,
  };
}

export function saveGameToLocalStorage(game: {
  gameId: string;
  token: string;
  playerColor: 'white' | 'black';
}): void {
  try {
    const data: GamePersistence = {
      ...game,
      timestamp: Date.now(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save game to localStorage:', error);
  }
}

export function getGameFromLocalStorage(): GamePersistence | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored) as GamePersistence;

    // Expire games older than 7 days
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - data.timestamp > sevenDaysMs) {
      clearCurrentGame();
      return null;
    }

    return data;
  } catch (error) {
    console.error('Failed to load game from localStorage:', error);
    return null;
  }
}

export function clearCurrentGame(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear game from localStorage:', error);
  }
}
