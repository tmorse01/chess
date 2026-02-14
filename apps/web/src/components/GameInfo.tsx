import { useState, useEffect } from 'react';
import { Copy, Check } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConnectionBadge } from './ConnectionBadge';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface MoveRow {
  moveNumber: number;
  white: string | null;
  black: string | null;
}

interface GameInfoProps {
  gameId: string;
  playerColor: 'white' | 'black' | null;
  turn: 'w' | 'b';
  isPlayerTurn: boolean;
  status: 'waiting' | 'active' | 'ended';
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
  lastMove?: { from: string; to: string; san: string } | null;
  onResign: () => void;
  onOfferDraw: () => void;
}

export function GameInfo({
  gameId,
  playerColor,
  turn,
  isPlayerTurn,
  status,
  connectionStatus,
  lastMove,
  onResign,
  onOfferDraw,
}: GameInfoProps) {
  const [copied, setCopied] = useState(false);
  const [moves, setMoves] = useState<MoveRow[]>([]);
  const [movesLoading, setMovesLoading] = useState(true);

  const currentUrl = window.location.href;

  console.log('[GameInfo] Rendering with:', {
    gameId: gameId.substring(0, 8),
    playerColor,
    turn,
    isPlayerTurn,
    status,
    connectionStatus,
  });

  // Fetch move history
  useEffect(() => {
    fetchMoves();
  }, [gameId]);

  // Re-fetch when a new move is made
  useEffect(() => {
    if (lastMove) {
      fetchMoves();
    }
  }, [lastMove]);

  const fetchMoves = async () => {
    try {
      const response = await fetch(`${API_URL}/games/${gameId}/moves`);
      if (!response.ok) {
        throw new Error('Failed to fetch moves');
      }
      const data = await response.json();
      setMoves(data);
    } catch (err) {
      console.error('Error fetching moves:', err);
    } finally {
      setMovesLoading(false);
    }
  };

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
    } catch (error) {
      console.error('Failed to copy link:', error);
      toast.error('Failed to copy link. Please try again.');
    }
  };

  const getTurnText = () => {
    if (status === 'waiting') {
      return 'Waiting for players...';
    }
    if (status === 'ended') {
      return 'Game ended';
    }
    return isPlayerTurn ? 'Your turn' : "Opponent's turn";
  };

  const getTurnIndicatorColor = () => {
    if (status !== 'active') return 'bg-gray-500';
    return turn === 'w' ? 'bg-white' : 'bg-gray-900';
  };

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex justify-end">
        <ConnectionBadge status={connectionStatus} data-testid="connection-status" />
      </div>

      {/* Game ID */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Game ID</h2>
        <p className="font-mono text-lg break-all">{gameId.substring(0, 8)}...</p>
      </div>

      {/* Player Color */}
      {playerColor && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-muted-foreground">You are playing</h2>
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded ${
                playerColor === 'white' ? 'bg-white' : 'bg-gray-900 border border-border'
              }`}
            />
            <span className="text-lg font-semibold capitalize" data-testid="player-color">
              {playerColor}
            </span>
          </div>
        </div>
      )}

      {/* Turn Indicator */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Current Turn</h2>
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded ${getTurnIndicatorColor()} border border-border`} />
          <span className="text-lg font-semibold" data-testid="current-turn">
            {getTurnText()}
          </span>
        </div>
      </div>

      {/* Share Link */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground">Share Link</h2>
        <Button
          onClick={copyShareLink}
          variant="outline"
          className="w-full text-sm"
          data-testid="copy-link-button"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 mr-2" />
              Copy Share Link
            </>
          )}
        </Button>
      </div>

      {/* Game Actions */}
      {status === 'active' && playerColor && (
        <>
          <Separator className="bg-border" />
          <div className="flex flex-col gap-2">
            <Button
              onClick={onOfferDraw}
              variant="secondary"
              className="w-full min-h-12 touch-manipulation"
            >
              Offer Draw
            </Button>
            <Button
              onClick={onResign}
              variant="destructive"
              className="w-full min-h-12 touch-manipulation"
            >
              Resign
            </Button>
          </div>
        </>
      )}

      {/* Status Message */}
      {status === 'waiting' && (
        <Alert className="bg-warning/10 border-warning/30" data-testid="game-status">
          <AlertDescription className="text-sm text-warning-foreground">
            Share this link with your opponent to start the game!
          </AlertDescription>
        </Alert>
      )}

      {/* Move History */}
      {status !== 'waiting' && (
        <>
          <Separator className="bg-border" />
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-muted-foreground">Move History</h2>
            {movesLoading ? (
              <div className="flex items-center justify-center py-4">
                <p className="text-sm text-muted-foreground">Loading moves...</p>
              </div>
            ) : moves.length === 0 ? (
              <p className="text-sm text-muted-foreground py-2">No moves yet</p>
            ) : (
              <div className="max-h-[200px] overflow-y-auto rounded border border-border/50 bg-black/20">
                <div className="p-2 space-y-1">
                  {moves.map((move, index) => (
                    <div
                      key={move.moveNumber}
                      className={`flex items-center gap-3 p-1.5 rounded text-sm font-mono ${
                        index === moves.length - 1
                          ? 'bg-violet-500/20 border border-violet-500/30'
                          : 'hover:bg-white/5'
                      }`}
                    >
                      <span className="w-6 text-right text-muted-foreground text-xs">
                        {move.moveNumber}.
                      </span>
                      <span className="flex-1 text-white">{move.white || '...'}</span>
                      <span className="flex-1 text-white/90">{move.black || '...'}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
