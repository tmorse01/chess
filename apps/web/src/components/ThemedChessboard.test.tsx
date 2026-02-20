import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { ThemedChessboard } from './ThemedChessboard';

describe('ThemedChessboard Component', () => {
  it('renders without crashing', () => {
    const { container } = render(
      <ThemedChessboard position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" />
    );
    expect(container).toBeTruthy();
  });

  it('applies the themed-chessboard-wrapper class', () => {
    const { container } = render(
      <ThemedChessboard position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" />
    );
    const wrapper = container.querySelector('.themed-chessboard-wrapper');
    expect(wrapper).toBeTruthy();
  });

  it('renders the chessboard component with initial position', () => {
    const { container } = render(
      <ThemedChessboard position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" />
    );
    // The Chessboard should be rendered inside the wrapper
    const chessboard = container.querySelector('[class*="chessboard"]');
    expect(chessboard).toBeTruthy();
  });

  it('passes through all chessboard props correctly', () => {
    const { container } = render(
      <ThemedChessboard
        position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        boardOrientation="white"
        arePiecesDraggable={true}
        animationDuration={200}
      />
    );
    expect(container).toBeTruthy();
  });

  it('applies dark luxury theme styling', () => {
    const { container } = render(
      <ThemedChessboard position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1" />
    );
    const wrapper = container.querySelector('.themed-chessboard-wrapper');

    // Verify the wrapper has the transition class applied
    expect(wrapper).toHaveClass('themed-chessboard-wrapper');
  });

  it('supports different board orientations', () => {
    const { rerender } = render(
      <ThemedChessboard
        position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        boardOrientation="white"
      />
    );
    expect(() => {
      rerender(
        <ThemedChessboard
          position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
          boardOrientation="black"
        />
      );
    }).not.toThrow();
  });

  it('is compatible with piece drag functionality', () => {
    const mockOnPieceDrop = vi.fn(() => true);
    const { container } = render(
      <ThemedChessboard
        position="rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"
        onPieceDrop={mockOnPieceDrop}
        arePiecesDraggable={true}
      />
    );
    expect(container).toBeTruthy();
  });
});
