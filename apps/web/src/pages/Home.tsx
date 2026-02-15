import { useState, useEffect } from 'react';
import type { CreateGameResponse } from '@chess-app/shared';
import { Copy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/LoadingSpinner';

// In production, API is at /api on same domain. In dev, use separate API server.
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API_BASE = import.meta.env.PROD ? '/api' : API_URL;

function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameData, setGameData] = useState<CreateGameResponse | null>(null);

  const createGame = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to create game');
      }

      const data: CreateGameResponse = await response.json();
      setGameData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  // Dev-only: Quick test game with Ctrl+D
  useEffect(() => {
    if (!import.meta.env.DEV) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
        e.preventDefault();
        createGame();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const createAndJoinAsWhite = async () => {
    await createGame();
    // After game is created, navigate to white player link
    if (gameData) {
      const url = new URL(gameData.whiteUrl);
      window.location.href = url.pathname + url.search;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="frosted-glass p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8">Chess Game</h1>

        {!gameData ? (
          <div className="text-center">
            <p className="text-muted-foreground mb-6">
              Create a new game and share the links with your opponent
            </p>
            <Button
              onClick={createGame}
              disabled={loading}
              size="lg"
              className="w-auto mx-auto min-h-12 min-w-48"
              data-testid="create-game-button"
            >
              {loading ? <LoadingSpinner size="sm" text="Creating Game..." /> : 'Create New Game'}
            </Button>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-green-300 text-lg font-semibold">✓ Game Created Successfully!</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button
                onClick={createGame}
                disabled={loading}
                size="lg"
                className="w-full sm:w-auto min-h-12 min-w-48"
                data-testid="create-game-button"
              >
                {loading ? <LoadingSpinner size="sm" text="Creating..." /> : 'Create New Game'}
              </Button>

              {/* Dev-only quick test game button */}
              {import.meta.env.DEV && (
                <Button
                  onClick={createAndJoinAsWhite}
                  disabled={loading}
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto gap-2"
                  title="Ctrl+D - Create and join as white player"
                >
                  <Zap className="h-4 w-4" />
                  Quick Dev Game
                </Button>
              )}
            </div>

            {import.meta.env.DEV && (
              <p className="text-xs text-muted-foreground mt-4">
                Tip: Press <kbd className="px-2 py-1 bg-white/10 rounded">Ctrl+D</kbd> to quick
                create a test game
              </p>
            )}

            {/* White Player Link */}
            <div className="bg-white/5 p-4 rounded-lg border border-white/20">
              <h3 className="text-sm font-semibold mb-2 text-white/60">White Player Link</h3>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={gameData.whiteUrl}
                  readOnly
                  className="flex-1 text-sm bg-white/10 border-white/30 text-white"
                  data-testid="white-url"
                />
                <Button
                  onClick={() => copyToClipboard(gameData.whiteUrl)}
                  variant="outline"
                  size="icon"
                  className="bg-white/20 hover:bg-white/30 border-white/30"
                  title="Copy to clipboard"
                  data-testid="copy-white-link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Black Player Link */}
            <div className="bg-white/5 p-4 rounded-lg border border-white/20">
              <h3 className="text-sm font-semibold mb-2 text-white/60">Black Player Link</h3>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={gameData.blackUrl}
                  readOnly
                  className="flex-1 text-sm bg-white/10 border-white/30 text-white"
                  data-testid="black-url"
                />
                <Button
                  onClick={() => copyToClipboard(gameData.blackUrl)}
                  variant="outline"
                  size="icon"
                  className="bg-white/20 hover:bg-white/30 border-white/30"
                  title="Copy to clipboard"
                  data-testid="copy-black-link"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="text-center pt-4">
              <p className="text-white/60 text-sm mb-4">
                Share these links with the players. Each link is unique and allows only that player
                to make moves.
              </p>
              <Button
                onClick={() => setGameData(null)}
                variant="outline"
                className="bg-white/20 hover:bg-white/30 border-white/30"
              >
                Create Another Game
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
