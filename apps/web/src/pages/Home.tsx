import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import type { CreateGameResponse } from '@chess-app/shared';
import { Copy, Zap, ExternalLink, Crown, Users, Sparkles, Clock, BookOpen, Code2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { BoardPlayground } from '@/components/BoardPlayground';
import { api } from '@/lib/api-client';

function Home() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gameData, setGameData] = useState<CreateGameResponse | null>(null);

  const createGame = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.games.create();
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
    <div className="min-h-screen flex items-center justify-center p-4 py-8">
      <div className="frosted-glass p-8 md:p-12 max-w-6xl w-full">
        {!gameData ? (
          <>
            {/* Hero + Playground: two-column on large screens */}
            <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center mb-12">
              {/* Left: Hero content */}
              <div>
                <div className="inline-block mb-6 relative">
                  <Crown className="w-16 h-16 mx-auto text-yellow-400" />
                  <Sparkles className="w-6 h-6 absolute -top-4 -right-4 text-yellow-200 animate-pulse" />
                </div>
                <h1 className="text-5xl md:text-6xl font-bold pb-4 bg-linear-to-r from-white via-violet-100 to-violet-200 bg-clip-text text-transparent">
                  Play Chess Online
                </h1>
                <p className="text-xl md:text-2xl text-white/80 mb-4 font-light">
                  Challenge your friends to an instant match
                </p>
                <p className="text-white/60 mb-8">
                  No sign-up required. Create a game in seconds and share secure links with your
                  opponent. Play from anywhere, on any device.
                </p>

                {/* CTA Button */}
                <div>
                  <Button
                    onClick={createGame}
                    disabled={loading}
                    size="lg"
                    className="bg-linear-to-r from-violet-600 to-violet-800 hover:from-violet-700 hover:to-violet-900 text-white shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 min-h-14 px-12 text-lg font-semibold"
                    data-testid="create-game-button"
                  >
                    {loading ? (
                      <LoadingSpinner size="sm" text="Creating Game..." />
                    ) : (
                      <>
                        <Crown className="w-5 h-5 mr-2" />
                        Start Playing Now
                      </>
                    )}
                  </Button>

                  {import.meta.env.DEV && (
                    <div className="mt-4">
                      <Button
                        onClick={createAndJoinAsWhite}
                        disabled={loading}
                        size="sm"
                        variant="outline"
                        className="gap-2"
                        title="Ctrl+D - Create and join as white player"
                      >
                        <Zap className="h-4 w-4" />
                        Quick Dev Game
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Tip: Press <kbd className="px-2 py-1 bg-white/10 rounded">Ctrl+D</kbd> for
                        quick test
                      </p>
                    </div>
                  )}

                  {error && (
                    <Alert variant="destructive" className="mt-6 max-w-md">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                </div>
              </div>

              {/* Right: Board playground */}
              <div className="flex flex-col items-center">
                <p className="text-sm text-white/50 mb-4 font-medium tracking-wide uppercase">
                  Try it out
                </p>
                <BoardPlayground />
              </div>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-6 mb-10">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-all">
                <Users className="w-8 h-8 mb-3 text-violet-400" />
                <h3 className="text-lg font-semibold mb-2">Multiplayer</h3>
                <p className="text-sm text-white/70">
                  Real-time gameplay with live move updates between players
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-all">
                <Clock className="w-8 h-8 mb-3 text-green-400" />
                <h3 className="text-lg font-semibold mb-2">Instant Start</h3>
                <p className="text-sm text-white/70">
                  No registration needed. Create and start playing immediately
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 hover:bg-white/15 transition-all">
                <Sparkles className="w-8 h-8 mb-3 text-violet-400" />
                <h3 className="text-lg font-semibold mb-2">Classic Rules</h3>
                <p className="text-sm text-white/70">
                  Full chess rules with all special moves and endgame detection
                </p>
              </div>
            </div>

            {/* Marketing Links */}
            <div className="pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-4 justify-center items-center text-sm text-white/50">
              <Link
                to="/getting-started"
                className="flex items-center gap-2 hover:text-white/80 transition-colors"
                data-testid="getting-started-link"
              >
                <BookOpen className="w-4 h-4" />
                Getting Started Guide
              </Link>
              <span className="hidden sm:inline text-white/20">·</span>
              <Link
                to="/how-it-was-built"
                className="flex items-center gap-2 hover:text-white/80 transition-colors"
                data-testid="how-built-link"
              >
                <Code2 className="w-4 h-4" />
                How It Was Built
              </Link>
            </div>
          </>
        ) : (
          <div className="space-y-8">
            {/* Success Header */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-full mb-4">
                <Sparkles className="w-8 h-8 text-green-400" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Game Ready!</h2>
              <p className="text-white/70">Share these secure links to start playing</p>
            </div>

            {/* Player Links - Modern Card Design */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* White Player Link */}
              <div className="bg-linear-to-br from-white/10 to-white/5 p-6 rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-white/90 flex items-center justify-center">
                    <Crown className="w-5 h-5 text-gray-800" />
                  </div>
                  <h3 className="text-lg font-semibold">White Player</h3>
                </div>
                <Input
                  type="text"
                  value={gameData.whiteUrl}
                  readOnly
                  className="mb-3 text-sm bg-white/10 border-white/30 text-white font-mono"
                  data-testid="white-url"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => window.open(gameData.whiteUrl, '_blank')}
                    variant="outline"
                    className="flex-1 bg-white/20 hover:bg-white/30 border-white/30 gap-2"
                    data-testid="open-white-link"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Game
                  </Button>
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
              <div className="bg-linear-to-br from-gray-800/40 to-gray-900/40 p-6 rounded-xl border border-white/20 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center border-2 border-white/30">
                    <Crown className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold">Black Player</h3>
                </div>
                <Input
                  type="text"
                  value={gameData.blackUrl}
                  readOnly
                  className="mb-3 text-sm bg-white/10 border-white/30 text-white font-mono"
                  data-testid="black-url"
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => window.open(gameData.blackUrl, '_blank')}
                    variant="outline"
                    className="flex-1 bg-white/20 hover:bg-white/30 border-white/30 gap-2"
                    data-testid="open-black-link"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open Game
                  </Button>
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
            </div>

            {/* Instructions */}
            <div className="bg-violet-500/10 border border-violet-500/30 rounded-lg p-4">
              <p className="text-sm text-white/80 text-center">
                <strong>🔒 Secure Play:</strong> Each link is unique and private. Send the white
                link to one player and the black link to another. Only the link holder can control
                their pieces.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Button
                onClick={() => setGameData(null)}
                variant="outline"
                size="lg"
                className="bg-white/10 hover:bg-white/20 border-white/30"
              >
                Create Another Game
              </Button>

              {import.meta.env.DEV && (
                <Button
                  onClick={createAndJoinAsWhite}
                  disabled={loading}
                  size="lg"
                  variant="outline"
                  className="gap-2"
                  title="Quick test - Create and join as white player"
                >
                  <Zap className="h-4 w-4" />
                  Quick Dev Game
                </Button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;
