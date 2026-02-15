import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
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

function renderHome() {
  return render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  );
}

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the home page with create game button', () => {
    renderHome();

    expect(screen.getByText('Chess Game')).toBeInTheDocument();
    expect(screen.getByText('Create New Game')).toBeInTheDocument();
    expect(screen.getByText(/Create a new game and share the links/)).toBeInTheDocument();
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

    const createButton = screen.getByText('Create New Game');
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

    const createButton = screen.getByText('Create New Game');
    await user.click(createButton);

    await waitFor(() => {
      expect(screen.getByText(/Game Created Successfully/)).toBeInTheDocument();
    });

    expect(screen.getByText('White Player Link')).toBeInTheDocument();
    expect(screen.getByText('Black Player Link')).toBeInTheDocument();

    const inputs = screen.getAllByRole('textbox') as HTMLInputElement[];
    expect(inputs).toHaveLength(2);
    expect(inputs[0].value).toBe(mockGameData.whiteUrl);
    expect(inputs[1].value).toBe(mockGameData.blackUrl);
  });

  it('should display error message on failed creation', async () => {
    const user = userEvent.setup();

    vi.mocked(api.games.create).mockRejectedValue(new Error('Failed to create game'));

    renderHome();

    const createButton = screen.getByText('Create New Game');
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
    await user.click(screen.getByText('Create New Game'));
    await waitFor(() => {
      expect(screen.getByText(/Game Created Successfully/)).toBeInTheDocument();
    });

    // Click create another game
    await user.click(screen.getByText('Create Another Game'));

    // Should show create button again
    expect(screen.getByText('Create New Game')).toBeInTheDocument();
  });
});
