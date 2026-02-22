import { useState, useEffect } from 'react';
import { Copy, Check, ChevronDown, ChevronUp, UserCheck, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConnectionBadge } from './ConnectionBadge';
import { api } from '@/lib/api-client';

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
  const [movesExpanded, setMovesExpanded] = useState(false);

  const currentUrl = window.location.href;

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
      const data = await api.games.getMoves(gameId);
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

  const getTurnStyles = () => {
    if (status !== 'active') {
      return 'bg-gray-500/20 border-gray-500/40 text-gray-300';
    }
    if (isPlayerTurn) {
      return 'bg-violet-500/20 border-violet-500/50 text-violet-200 animate-pulse';
    }
    return 'bg-slate-700/50 border-slate-600/50 text-slate-300';
  };

  const getTurnPieceColor = () => {
    if (status !== 'active') return 'bg-gray-500';
    return turn === 'w' ? 'bg-white shadow-sm shadow-white/50' : 'bg-gray-900 border border-gray-600';
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <div className="flex justify-end">
        <ConnectionBadge status={connectionStatus} data-testid="connection-status" />
      </div>

      {/* Game ID */}
      <div className="space-y-1">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Game ID</h2>
        <p className="font-mono text-sm break-all text-muted-foreground">{gameId.substring(0, 8)}...</p>
      </div>

      {/* Opponent Status */}
      {status === 'waiting' ? (
        <Alert
          className="bg-amber-500/50 border-amber-400/60"
          data-testid="game-status"
        >
          <AlertDescription className="text-sm font-medium text-amber-950">
            Share this link with your opponent to start the game!
          </AlertDescription>
        </Alert>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-500/10 border border-green-500/30" data-testid="opponent-connected">
          <UserCheck className="w-4 h-4 text-green-400 shrink-0" />
          <span className="text-sm font-medium text-green-300">Opponent connected</span>
        </div>
      )}

      {/* Turn Indicator */}
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${getTurnStyles()}`}
        data-testid="current-turn"
      >
        <div className={`w-5 h-5 rounded-full shrink-0 ${getTurnPieceColor()}`} />
        <span className="text-base font-bold">
          {getTurnText()}
        </span>
        {status === 'active' && isPlayerTurn && (
          <Clock className="w-4 h-4 ml-auto shrink-0 opacity-70" />
        )}
      </div>

      {/* Share Link */}
      <div className="space-y-1">
        <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Share Link</h2>
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

      {/* Move History */}
      {status !== 'waiting' && (
        <>
          <Separator className="bg-border" />
          <div className="space-y-1">
            <button
              className="flex items-center justify-between w-full group"
              onClick={() => setMovesExpanded((prev) => !prev)}
              aria-expanded={movesExpanded}
              data-testid="move-history-toggle"
            >
              <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide group-hover:text-foreground transition-colors">
                Move History
                {moves.length > 0 && (
                  <span className="ml-2 text-violet-400">({moves.length})</span>
                )}
              </h2>
              {movesExpanded ? (
                <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              ) : (
                <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
              )}
            </button>

            {movesExpanded && (
              movesLoading ? (
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
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
