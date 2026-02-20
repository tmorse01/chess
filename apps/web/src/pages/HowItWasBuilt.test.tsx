import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import HowItWasBuilt from './HowItWasBuilt';

function renderHowItWasBuilt() {
  return render(
    <BrowserRouter>
      <HowItWasBuilt />
    </BrowserRouter>
  );
}

describe('HowItWasBuilt', () => {
  it('should render the page title', () => {
    renderHowItWasBuilt();
    expect(screen.getByTestId('how-built-title')).toBeInTheDocument();
    expect(screen.getByText('How It Was Built')).toBeInTheDocument();
  });

  it('should render architecture overview section', () => {
    renderHowItWasBuilt();
    expect(screen.getByText('Architecture Overview')).toBeInTheDocument();
    expect(screen.getByText(/full-stack TypeScript monorepo/)).toBeInTheDocument();
  });

  it('should render the tech stack section', () => {
    renderHowItWasBuilt();
    expect(screen.getByText('Tech Stack')).toBeInTheDocument();
    // These labels appear in both TechCard headings and architecture summary, use getAllByText
    expect(screen.getAllByText('Frontend').length).toBeGreaterThan(0);
    expect(screen.getByText('Backend API')).toBeInTheDocument();
    expect(screen.getAllByText('Database').length).toBeGreaterThan(0);
    expect(screen.getByText('Security')).toBeInTheDocument();
  });

  it('should render tech tags', () => {
    renderHowItWasBuilt();
    expect(screen.getByText('React 18')).toBeInTheDocument();
    expect(screen.getByText('Socket.IO')).toBeInTheDocument();
    expect(screen.getByText('PostgreSQL')).toBeInTheDocument();
  });

  it('should render the real-time architecture section', () => {
    renderHowItWasBuilt();
    expect(screen.getByText('Real-Time Architecture')).toBeInTheDocument();
    expect(screen.getByText('Game Creation')).toBeInTheDocument();
    expect(screen.getByText('WebSocket Connection')).toBeInTheDocument();
    expect(screen.getByText('Move Validation')).toBeInTheDocument();
    expect(screen.getByText('Live Sync')).toBeInTheDocument();
  });

  it('should render the chess engine section', () => {
    renderHowItWasBuilt();
    expect(screen.getByText('Chess Engine')).toBeInTheDocument();
    // chess.js appears in multiple places, use getAllByText
    expect(screen.getAllByText(/chess\.js/).length).toBeGreaterThan(0);
    expect(screen.getByText('En passant captures')).toBeInTheDocument();
    expect(screen.getByText('Check & checkmate detection')).toBeInTheDocument();
  });

  it('should have a back to home link', () => {
    renderHowItWasBuilt();
    const backLink = screen.getByText('Back to Home');
    expect(backLink).toBeInTheDocument();
    expect(backLink.closest('a')).toHaveAttribute('href', '/');
  });

  it('should have a start playing CTA link', () => {
    renderHowItWasBuilt();
    const ctaLink = screen.getByText('Start Playing Now');
    expect(ctaLink).toBeInTheDocument();
    expect(ctaLink.closest('a')).toHaveAttribute('href', '/');
  });
});
