import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import GettingStarted from './GettingStarted';

function renderGettingStarted() {
  return render(
    <BrowserRouter>
      <GettingStarted />
    </BrowserRouter>
  );
}

describe('GettingStarted', () => {
  it('should render the page title', () => {
    renderGettingStarted();
    expect(screen.getByTestId('getting-started-title')).toBeInTheDocument();
    expect(screen.getByText('Getting Started')).toBeInTheDocument();
  });

  it('should render the introductory description', () => {
    renderGettingStarted();
    expect(
      screen.getByText(/Play your first game in under a minute/)
    ).toBeInTheDocument();
  });

  it('should render all 4 steps', () => {
    renderGettingStarted();
    expect(screen.getByTestId('step-1')).toBeInTheDocument();
    expect(screen.getByTestId('step-2')).toBeInTheDocument();
    expect(screen.getByTestId('step-3')).toBeInTheDocument();
    expect(screen.getByTestId('step-4')).toBeInTheDocument();
  });

  it('should render step titles', () => {
    renderGettingStarted();
    expect(screen.getByText('Create a Game')).toBeInTheDocument();
    expect(screen.getByText('Share the Links')).toBeInTheDocument();
    expect(screen.getByText('Open Your Link')).toBeInTheDocument();
    expect(screen.getByText('Play Chess!')).toBeInTheDocument();
  });

  it('should render the during the game section', () => {
    renderGettingStarted();
    expect(screen.getByText('During the Game')).toBeInTheDocument();
    expect(screen.getByText('Your Turn')).toBeInTheDocument();
    expect(screen.getByText('Offer a Draw')).toBeInTheDocument();
    expect(screen.getByText('Resign')).toBeInTheDocument();
    expect(screen.getByText('Move History')).toBeInTheDocument();
  });

  it('should render chess rules section', () => {
    renderGettingStarted();
    expect(screen.getByText('Chess Rules Supported')).toBeInTheDocument();
    expect(screen.getByText('En passant')).toBeInTheDocument();
    expect(screen.getByText('Pawn promotion')).toBeInTheDocument();
    expect(screen.getByText('Check & checkmate')).toBeInTheDocument();
  });

  it('should have a back to home link', () => {
    renderGettingStarted();
    const backLink = screen.getByText('Back to Home');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('should have a start playing CTA link', () => {
    renderGettingStarted();
    const ctaLink = screen.getByText('Start Playing Now');
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('should have a link to the how it was built page', () => {
    renderGettingStarted();
    const link = screen.getByText('Curious how it was built?');
    expect(link).toBeInTheDocument();
    expect(link.closest('a')).toHaveAttribute('href', '/how-it-was-built');
  });
});
