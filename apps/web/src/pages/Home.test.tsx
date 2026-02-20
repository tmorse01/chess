import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './Home';
import { api } from '@/lib/api-client';

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  api: {
    games: {
      create: vi.fn(),
    },
  },
}));

// Mock BoardPlayground to avoid react-chessboard complexity in unit tests
vi.mock('@/components/BoardPlayground', () => ({
  BoardPlayground: () => <div data-testid="board-playground">Board Playground Mock</div>,
}));

function renderHome(path = '/') {
  window.history.pushState({}, '', path);
  return render(
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/start/:gameId" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the home page with create game button', () => {
    renderHome();

    expect(screen.getByText('Play Chess Online')).toBeInTheDocument();
    expect(screen.getByTestId('create-game-button')).toBeInTheDocument();
    expect(screen.getByText(/Challenge your friends to an instant match/)).toBeInTheDocument();
  });

  it('should show loading state when creating a game', async () => {
    const user = userEvent.setup();

    // Mock a delayed response
    vi.mocked(api.games.create).mockImplementation(
      () =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                gameId: 'test-game-id',
                whiteUrl: 'http://localhost:5173/g/test-game-id?token=white-token',
                blackUrl: 'http://localhost:5173/g/test-game-id?token=black-token',
              }),
            100
          )
        )
    );

    renderHome();

    const createButton = screen.getByTestId('create-game-button');
    await user.click(createButton);

    expect(screen.getByText('Creating Game...')).toBeInTheDocument();
  });

  it('should display game links after successful creation', async () => {
    const user = userEvent.setup();

    const mockGameData = {
      gameId: 'test-game-id',
      whiteUrl: 'http://localhost:5173/g/test-game-id?token=white-token-123',
      blackUrl: 'http://localhost:5173/g/test-game-id?token=black-token-456',
    };

    vi.mocked(api.games.create).mockResolvedValue(mockGameData);

    renderHome();

    const createButton = screen.getByTestId('create-game-button');
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Game Ready!/)).toBeInTheDocument();
    });

    expect(screen.getByText('White Player')).toBeInTheDocument();
    expect(screen.getByText('Black Player')).toBeInTheDocument();

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    expect(inputs).toHaveLength(2);
    expect(inputs[0].value).toBe(mockGameData.whiteUrl);
    expect(inputs[1].value).toBe(mockGameData.blackUrl);
    expect(window.location.pathname).toBe('/start/test-game-id');
    expect(window.location.search).toContain('whiteToken=white-token-123');
    expect(window.location.search).toContain('blackToken=black-token-456');
  });

  it('should restore game links from start route URL state', () => {
    renderHome('/start/test-game-id?whiteToken=white-token&blackToken=black-token');

    expect(screen.getByText(/Game Ready!/)).toBeInTheDocument();
    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    expect(inputs[0].value).toContain('/g/test-game-id?token=white-token');
    expect(inputs[1].value).toContain('/g/test-game-id?token=black-token');
  });

  it('should display error message on failed creation', async () => {
    const user = userEvent.setup();

    vi.mocked(api.games.create).mockRejectedValue(new Error('Failed to create game'));

    renderHome();

    const createButton = screen.getByTestId('create-game-button');
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText('Failed to create game')).toBeInTheDocument();
    });
  });

  it('should allow creating another game', async () => {
    const user = userEvent.setup();

    const mockGameData = {
      gameId: 'test-game-id',
      whiteUrl: 'http://localhost:5173/g/test-game-id?token=white-token',
      blackUrl: 'http://localhost:5173/g/test-game-id?token=black-token',
    };

    vi.mocked(api.games.create).mockResolvedValue(mockGameData);

    renderHome();

    // Create first game
    await user.click(screen.getByTestId('create-game-button'));
    await waitFor(() => {
      expect(screen.getByText(/Game Ready!/)).toBeInTheDocument();
    });

    // Click create another game
    await user.click(screen.getByText('Create Another Game'));

    // Should show create button again
    expect(screen.getByTestId('create-game-button')).toBeInTheDocument();
  });

  it('should render navigation links to marketing pages', () => {
    renderHome();

    const gettingStartedLink = screen.getByTestId('getting-started-link');
    expect(gettingStartedLink).toBeInTheDocument();
    expect(gettingStartedLink.closest('a')).toHaveAttribute('href', '/getting-started');

    const howBuiltLink = screen.getByTestId('how-built-link');
    expect(howBuiltLink).toBeInTheDocument();
    expect(howBuiltLink.closest('a')).toHaveAttribute('href', '/how-it-was-built');
  });

  it('should render the board playground on the home page', () => {
    renderHome();
    expect(screen.getByTestId('board-playground')).toBeInTheDocument();
  });
});
