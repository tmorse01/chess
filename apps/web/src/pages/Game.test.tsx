import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Game from './Game';

// Mock the useChessGame hook
vi.mock('../hooks/useChessGame', () => ({
  useChessGame: vi.fn(() => ({
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
    turn: 'w',
    status: 'active',
    result: 'unknown',
    endedReason: null,
    playerColor: 'white',
    isPlayerTurn: true,
    lastMove: null,
    connectionStatus: 'connected',
    error: null,
    isLoading: false,
    makeMove: vi.fn(),
    resign: vi.fn(),
    offerDraw: vi.fn(),
    acceptDraw: vi.fn(),
  })),
}));

// Mock the ChessBoard component
vi.mock('../components/ChessBoard', () => ({
  ChessBoard: () => <div data-testid="chess-board">Chess Board Mock</div>,
}));

// Mock the GameInfo component
vi.mock('../components/GameInfo', () => ({
  GameInfo: () => <div data-testid="game-info">Game Info Mock</div>,
}));

function renderGame(path: string) {
  window.history.pushState({}, '', path);
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/g/:gameId" element={<Game />} />
      </Routes>
    </BrowserRouter>
  );
}

describe('Game', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show error when gameId is missing', () => {
    window.history.pushState({}, '', '/g/');
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/g/" element={<Game />} />
        </Routes>
      </BrowserRouter>
    );

    expect(screen.getByText('Invalid Game Link')).toBeInTheDocument();
  });

  it('should show error when token is missing', () => {
    renderGame('/g/test-game-id');

    expect(screen.getByText('Invalid Game Link')).toBeInTheDocument();
  });

  it('should render game components when both gameId and token are present', () => {
    renderGame('/g/test-game-id-123?token=test-token-456');

    expect(screen.getByTestId('chess-board')).toBeInTheDocument();
    expect(screen.getByTestId('game-info')).toBeInTheDocument();
    expect(screen.getByText('Chess Game')).toBeInTheDocument();
  });

  it('should show loading state', async () => {
    const { useChessGame } = await import('../hooks/useChessGame');
    vi.mocked(useChessGame).mockReturnValueOnce({
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      turn: 'w',
      status: 'active',
      result: 'unknown',
      endedReason: null,
      playerColor: 'white',
      isPlayerTurn: true,
      lastMove: null,
      connectionStatus: 'connected',
      error: null,
      isLoading: true,
      makeMove: vi.fn(),
      resign: vi.fn(),
      offerDraw: vi.fn(),
      acceptDraw: vi.fn(),
    });

    renderGame('/g/test-game-id-123?token=test-token-456');

    // Check for skeleton loader elements instead of text
    expect(screen.queryByText('Chess Game')).not.toBeInTheDocument();
  });

  it('should display error message when error exists', async () => {
    const { useChessGame } = await import('../hooks/useChessGame');
    vi.mocked(useChessGame).mockReturnValueOnce({
      fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
      turn: 'w',
      status: 'active',
      result: 'unknown',
      endedReason: null,
      playerColor: 'white',
      isPlayerTurn: true,
      lastMove: null,
      connectionStatus: 'connected',
      error: 'Test error message',
      isLoading: false,
      makeMove: vi.fn(),
      resign: vi.fn(),
      offerDraw: vi.fn(),
      acceptDraw: vi.fn(),
    });

    renderGame('/g/test-game-id-123?token=test-token-456');

    expect(screen.getByText('Test error message')).toBeInTheDocument();
  });
});
