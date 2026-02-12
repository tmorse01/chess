import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface GameInfoProps {
  gameId: string;
  playerColor: 'white' | 'black' | null;
  turn: 'w' | 'b';
  isPlayerTurn: boolean;
  status: 'waiting' | 'active' | 'ended';
  isConnected: boolean;
  onResign: () => void;
  onOfferDraw: () => void;
}

export function GameInfo({
  gameId,
  playerColor,
  turn,
  isPlayerTurn,
  status,
  isConnected,
  onResign,
  onOfferDraw,
}: GameInfoProps) {
  const [copied, setCopied] = useState(false);

  const currentUrl = window.location.href;

  console.log('[GameInfo] Rendering with:', {
    gameId: gameId.substring(0, 8),
    playerColor,
    turn,
    isPlayerTurn,
    status,
    isConnected,
  });

  const copyShareLink = async () => {
    try {
      await navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
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
      <div className="flex items-center gap-2">
        <Badge
          variant={isConnected ? 'default' : 'destructive'}
          className="gap-2"
          data-testid="connection-status"
        >
          <div
            className={`w-2 h-2 rounded-full ${isConnected ? 'bg-success' : 'bg-destructive'}`}
          />
          {isConnected ? 'Connected' : 'Disconnected'}
        </Badge>
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
          <div className="space-y-3">
            <Button onClick={onOfferDraw} variant="secondary" className="w-full">
              Offer Draw
            </Button>
            <Button onClick={onResign} variant="destructive" className="w-full">
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
    </div>
  );
}
