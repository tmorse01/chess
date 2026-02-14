import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GameInfo } from './GameInfo';

describe('GameInfo', () => {
  const mockOnResign = vi.fn();
  const mockOnOfferDraw = vi.fn();

  const defaultProps = {
    gameId: 'test-game-id-123456789',
    playerColor: 'white' as const,
    turn: 'w' as const,
    isPlayerTurn: true,
    status: 'active' as const,
    connectionStatus: 'connected' as const,
    onResign: mockOnResign,
    onOfferDraw: mockOnOfferDraw,
  };

  it('should render game information', () => {
    render(<GameInfo {...defaultProps} />);

    // Check for truncated game ID (first 8 characters)
    expect(screen.getByText(/test-gam/i)).toBeDefined();
    expect(screen.getByText(/You are playing/i)).toBeDefined();
    expect(screen.getByText(/white/i)).toBeDefined();
    expect(screen.getByText(/Your turn/i)).toBeDefined();
  });

  it('should show connected status', () => {
    render(<GameInfo {...defaultProps} />);

    expect(screen.getByText('Connected')).toBeDefined();
  });

  it('should show disconnected status', () => {
    render(<GameInfo {...defaultProps} connectionStatus="disconnected" />);

    expect(screen.getByText('Offline')).toBeDefined();
  });

  it('should show waiting message when game is waiting', () => {
    render(<GameInfo {...defaultProps} status="waiting" />);

    expect(screen.getByText(/Waiting for players/i)).toBeDefined();
    expect(screen.getByText(/Share this link/i)).toBeDefined();
  });

  it('should show opponent turn message', () => {
    render(<GameInfo {...defaultProps} isPlayerTurn={false} />);

    expect(screen.getByText(/Opponent's turn/i)).toBeDefined();
  });

  it('should show game ended message', () => {
    render(<GameInfo {...defaultProps} status="ended" />);

    expect(screen.getByText(/Game ended/i)).toBeDefined();
  });

  it('should render action buttons for active game', () => {
    render(<GameInfo {...defaultProps} />);

    expect(screen.getByText('Offer Draw')).toBeDefined();
    expect(screen.getByText('Resign')).toBeDefined();
  });

  it('should not render action buttons for ended game', () => {
    render(<GameInfo {...defaultProps} status="ended" />);

    expect(screen.queryByText('Offer Draw')).toBeNull();
    expect(screen.queryByText('Resign')).toBeNull();
  });

  it('should call onResign when resign button is clicked', () => {
    render(<GameInfo {...defaultProps} />);

    const resignButton = screen.getByText('Resign');
    fireEvent.click(resignButton);

    expect(mockOnResign).toHaveBeenCalledTimes(1);
  });

  it('should call onOfferDraw when offer draw button is clicked', () => {
    render(<GameInfo {...defaultProps} />);

    const offerDrawButton = screen.getByText('Offer Draw');
    fireEvent.click(offerDrawButton);

    expect(mockOnOfferDraw).toHaveBeenCalledTimes(1);
  });

  it('should show copy share link button', () => {
    render(<GameInfo {...defaultProps} />);

    expect(screen.getByText('Copy Share Link')).toBeDefined();
  });

  it('should handle null player color', () => {
    render(<GameInfo {...defaultProps} playerColor={null} />);

    expect(screen.queryByText(/You are playing/i)).toBeNull();
  });

  it('should render for black player', () => {
    render(<GameInfo {...defaultProps} playerColor="black" turn="b" />);

    expect(screen.getByText(/black/i)).toBeDefined();
    expect(screen.getByText(/Your turn/i)).toBeDefined();
  });
});
