import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { GameResult } from './GameResult';
import '@testing-library/jest-dom/vitest';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('GameResult', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
  });

  describe('Checkmate', () => {
    it('should show "You Won!" when player wins by checkmate as white', () => {
      render(
        <BrowserRouter>
          <GameResult result="white_win" endedReason="checkmate" playerColor="white" />
        </BrowserRouter>
      );

      expect(screen.getByText('You Won!')).toBeInTheDocument();
      expect(screen.getByText('White wins by checkmate')).toBeInTheDocument();
      expect(screen.getByText('🏆')).toBeInTheDocument();
    });

    it('should show "You Won!" when player wins by checkmate as black', () => {
      render(
        <BrowserRouter>
          <GameResult result="black_win" endedReason="checkmate" playerColor="black" />
        </BrowserRouter>
      );

      expect(screen.getByText('You Won!')).toBeInTheDocument();
      expect(screen.getByText('Black wins by checkmate')).toBeInTheDocument();
      expect(screen.getByText('🏆')).toBeInTheDocument();
    });

    it('should show "You Lost" when player loses by checkmate as white', () => {
      render(
        <BrowserRouter>
          <GameResult result="black_win" endedReason="checkmate" playerColor="white" />
        </BrowserRouter>
      );

      expect(screen.getByText('You Lost')).toBeInTheDocument();
      expect(screen.getByText('Black wins by checkmate')).toBeInTheDocument();
      expect(screen.getByText('😔')).toBeInTheDocument();
    });

    it('should show "You Lost" when player loses by checkmate as black', () => {
      render(
        <BrowserRouter>
          <GameResult result="white_win" endedReason="checkmate" playerColor="black" />
        </BrowserRouter>
      );

      expect(screen.getByText('You Lost')).toBeInTheDocument();
      expect(screen.getByText('White wins by checkmate')).toBeInTheDocument();
      expect(screen.getByText('😔')).toBeInTheDocument();
    });
  });

  describe('Resignation', () => {
    it('should show "You Won!" when opponent resigns', () => {
      render(
        <BrowserRouter>
          <GameResult result="white_win" endedReason="resignation" playerColor="white" />
        </BrowserRouter>
      );

      expect(screen.getByText('You Won!')).toBeInTheDocument();
      expect(screen.getByText('Black resigned')).toBeInTheDocument();
    });

    it('should show "You Lost" when player resigned', () => {
      render(
        <BrowserRouter>
          <GameResult result="black_win" endedReason="resignation" playerColor="white" />
        </BrowserRouter>
      );

      expect(screen.getByText('You Lost')).toBeInTheDocument();
      expect(screen.getByText('White resigned')).toBeInTheDocument();
    });
  });

  describe('Stalemate', () => {
    it('should show "Game Drawn" for stalemate', () => {
      render(
        <BrowserRouter>
          <GameResult result="draw" endedReason="stalemate" playerColor="white" />
        </BrowserRouter>
      );

      expect(screen.getByText('Game Drawn')).toBeInTheDocument();
      expect(screen.getByText('Game drawn by stalemate')).toBeInTheDocument();
      expect(screen.getByText('🤝')).toBeInTheDocument();
    });
  });

  describe('Draw by Agreement', () => {
    it('should show "Game Drawn" for draw by agreement', () => {
      render(
        <BrowserRouter>
          <GameResult result="draw" endedReason="draw_agreement" playerColor="black" />
        </BrowserRouter>
      );

      expect(screen.getByText('Game Drawn')).toBeInTheDocument();
      expect(screen.getByText('Game drawn by agreement')).toBeInTheDocument();
      expect(screen.getByText('🤝')).toBeInTheDocument();
    });
  });

  describe('Timeout', () => {
    it('should show timeout message when white runs out of time', () => {
      render(
        <BrowserRouter>
          <GameResult result="black_win" endedReason="timeout" playerColor="black" />
        </BrowserRouter>
      );

      expect(screen.getByText('You Won!')).toBeInTheDocument();
      expect(screen.getByText('White ran out of time')).toBeInTheDocument();
    });

    it('should show timeout message when black runs out of time', () => {
      render(
        <BrowserRouter>
          <GameResult result="white_win" endedReason="timeout" playerColor="white" />
        </BrowserRouter>
      );

      expect(screen.getByText('You Won!')).toBeInTheDocument();
      expect(screen.getByText('Black ran out of time')).toBeInTheDocument();
    });
  });

  describe('New Game button', () => {
    it('should navigate to home when "New Game" button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <BrowserRouter>
          <GameResult result="white_win" endedReason="checkmate" playerColor="white" />
        </BrowserRouter>
      );

      const newGameButton = screen.getByRole('button', { name: /new game/i });
      await user.click(newGameButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Edge cases', () => {
    it('should handle null player color', () => {
      render(
        <BrowserRouter>
          <GameResult result="white_win" endedReason="checkmate" playerColor={null} />
        </BrowserRouter>
      );

      // Should still render without crashing
      expect(screen.getByText('You Lost')).toBeInTheDocument();
    });

    it('should show generic message for unknown end reason', () => {
      render(
        <BrowserRouter>
          <GameResult result="draw" endedReason={null} playerColor="white" />
        </BrowserRouter>
      );

      expect(screen.getByText('Game Drawn')).toBeInTheDocument();
      expect(screen.getByText('Game ended')).toBeInTheDocument();
    });
  });
});
