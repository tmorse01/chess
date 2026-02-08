import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ChessBoard } from './ChessBoard';

// Mock react-chessboard
vi.mock('react-chessboard', () => ({
  Chessboard: ({ position, boardOrientation }: { position: string; boardOrientation: string }) => (
    <div data-testid="chessboard" data-position={position} data-orientation={boardOrientation}>
      Chessboard Mock
    </div>
  ),
}));

describe('ChessBoard', () => {
  const mockOnMove = vi.fn();

  it('should render chess board', () => {
    render(
      <ChessBoard
        fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        playerColor="white"
        isPlayerTurn={true}
        status="active"
        onMove={mockOnMove}
      />
    );

    const chessboard = screen.getByTestId('chessboard');
    expect(chessboard).toBeDefined();
    expect(chessboard.getAttribute('data-orientation')).toBe('white');
  });

  it('should render with player as black', () => {
    render(
      <ChessBoard
        fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        playerColor="black"
        isPlayerTurn={false}
        status="active"
        onMove={mockOnMove}
      />
    );

    const chessboard = screen.getByTestId('chessboard');
    expect(chessboard).toBeDefined();
    expect(chessboard.getAttribute('data-orientation')).toBe('black');
  });

  it('should render when game has ended', () => {
    render(
      <ChessBoard
        fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        playerColor="white"
        isPlayerTurn={false}
        status="ended"
        onMove={mockOnMove}
      />
    );

    const chessboard = screen.getByTestId('chessboard');
    expect(chessboard).toBeDefined();
  });

  it('should handle null player color', () => {
    render(
      <ChessBoard
        fen="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        playerColor={null}
        isPlayerTurn={false}
        status="waiting"
        onMove={mockOnMove}
      />
    );

    const chessboard = screen.getByTestId('chessboard');
    expect(chessboard).toBeDefined();
    expect(chessboard.getAttribute('data-orientation')).toBe('white');
  });
});
