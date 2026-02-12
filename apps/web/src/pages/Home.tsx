import { useState } from 'react';
import type { CreateGameResponse } from '@chess-app/shared';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameData, setGameData] = useState<CreateGameResponse | null>(null);

  const createGame = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/games`, {
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

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="frosted-glass p-8 max-w-2xl w-full">
        <h1 className="text-4xl font-bold text-center mb-8">Chess Game</h1>

        {!gameData ? (
          <div className="text-center">
            <p className="text-white/80 mb-6">
              Create a new game and share the links with your opponent
            </p>
            <Button onClick={createGame} disabled={loading} size="lg" className="w-auto mx-auto">
              {loading ? 'Creating Game...' : 'Create New Game'}
            </Button>
            {error && (
              <Alert variant="destructive" className="mt-4 bg-red-500/20 border-red-500/30">
                <AlertDescription className="text-red-300">{error}</AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center mb-6">
              <p className="text-green-300 text-lg font-semibold">✓ Game Created Successfully!</p>
            </div>

            <div className="space-y-4">
              <div className="bg-white/5 p-4 rounded-lg border border-white/20">
                <h3 className="text-sm font-semibold mb-2 text-white/60">White Player Link</h3>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={gameData.whiteUrl}
                    readOnly
                    className="flex-1 text-sm bg-white/10 border-white/30 text-white"
                  />
                  <Button
                    onClick={() => copyToClipboard(gameData.whiteUrl)}
                    variant="outline"
                    size="icon"
                    className="bg-white/20 hover:bg-white/30 border-white/30"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-white/5 p-4 rounded-lg border border-white/20">
                <h3 className="text-sm font-semibold mb-2 text-white/60">Black Player Link</h3>
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={gameData.blackUrl}
                    readOnly
                    className="flex-1 text-sm bg-white/10 border-white/30 text-white"
                  />
                  <Button
                    onClick={() => copyToClipboard(gameData.blackUrl)}
                    variant="outline"
                    size="icon"
                    className="bg-white/20 hover:bg-white/30 border-white/30"
                    title="Copy to clipboard"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
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
