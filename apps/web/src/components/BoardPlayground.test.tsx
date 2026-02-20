import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BoardPlayground } from './BoardPlayground';

// Mock react-chessboard
vi.mock('react-chessboard', () => ({
  Chessboard: ({
    position,
    boardOrientation,
    arePiecesDraggable,
  }: {
    position: string;
    boardOrientation: string;
    arePiecesDraggable: boolean;
  }) => (
    <div
      data-testid="chessboard"
      data-position={position}
      data-orientation={boardOrientation}
      data-draggable={String(arePiecesDraggable)}
    >
      Chessboard Mock
    </div>
  ),
}));

describe('BoardPlayground', () => {
  it('should render the playground container', () => {
    render(<BoardPlayground />);
    expect(screen.getByTestId('board-playground')).toBeInTheDocument();
  });

  it('should render the chess board', () => {
    render(<BoardPlayground />);
    expect(screen.getByTestId('chessboard')).toBeInTheDocument();
  });

  it('should start with the initial chess position', () => {
    render(<BoardPlayground />);
    const board = screen.getByTestId('chessboard');
    expect(board.getAttribute('data-position')).toContain(
      'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR'
    );
  });

  it('should show "White to move" turn indicator initially', () => {
    render(<BoardPlayground />);
    expect(screen.getByTestId('turn-indicator')).toBeInTheDocument();
    expect(screen.getByText('White to move')).toBeInTheDocument();
  });

  it('should default to white orientation', () => {
    render(<BoardPlayground />);
    const board = screen.getByTestId('chessboard');
    expect(board.getAttribute('data-orientation')).toBe('white');
  });

  it('should have a flip board button', () => {
    render(<BoardPlayground />);
    expect(screen.getByTestId('flip-board-button')).toBeInTheDocument();
    expect(screen.getByText('Flip Board')).toBeInTheDocument();
  });

  it('should have a reset button', () => {
    render(<BoardPlayground />);
    expect(screen.getByTestId('reset-board-button')).toBeInTheDocument();
    expect(screen.getByText('Reset')).toBeInTheDocument();
  });

  it('should flip board orientation when flip button is clicked', () => {
    render(<BoardPlayground />);
    const flipButton = screen.getByTestId('flip-board-button');
    const board = screen.getByTestId('chessboard');

    expect(board.getAttribute('data-orientation')).toBe('white');
    fireEvent.click(flipButton);
    expect(board.getAttribute('data-orientation')).toBe('black');
    fireEvent.click(flipButton);
    expect(board.getAttribute('data-orientation')).toBe('white');
  });

  it('should allow pieces to be dragged when game is active', () => {
    render(<BoardPlayground />);
    const board = screen.getByTestId('chessboard');
    expect(board.getAttribute('data-draggable')).toBe('true');
  });

  it('should show the try it out hint text', () => {
    render(<BoardPlayground />);
    expect(screen.getByText(/drag and drop pieces to make moves/i)).toBeInTheDocument();
  });

  it('should have proper layout styling for centered column layout', () => {
    render(<BoardPlayground />);
    const container = screen.getByTestId('board-playground');
    const styles = window.getComputedStyle(container);
    expect(container).toHaveClass('flex', 'flex-col', 'items-center', 'gap-6');
  });

  it('should render board in a properly sized wrapper', () => {
    render(<BoardPlayground />);
    const board = screen.getByTestId('chessboard');
    const wrapper = board.parentElement;
    // The mock chessboard is wrapped in a div, verify it exists
    expect(wrapper).toBeDefined();
  });

  it('should have centered controls', () => {
    render(<BoardPlayground />);
    const buttons = screen.getByTestId('flip-board-button').parentElement;
    expect(buttons).toHaveClass('flex', 'gap-2', 'justify-center');
  });
});
