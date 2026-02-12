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
        <Badge variant={isConnected ? 'default' : 'destructive'} className="gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-300' : 'bg-red-300'}`} />
          {isConnected ? 'Connected' : 'Disconnected'}
        </Badge>
      </div>

      {/* Game ID */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-white/70">Game ID</h2>
        <p className="text-lg font-mono text-white/90 break-all">{gameId.substring(0, 8)}...</p>
      </div>

      {/* Player Color */}
      {playerColor && (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold text-white/70">You are playing</h2>
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded ${
                playerColor === 'white' ? 'bg-white' : 'bg-gray-900 border border-white/30'
              }`}
            />
            <span className="text-lg font-semibold capitalize">{playerColor}</span>
          </div>
        </div>
      )}

      {/* Turn Indicator */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-white/70">Current Turn</h2>
        <div className="flex items-center gap-3">
          <div className={`w-4 h-4 rounded ${getTurnIndicatorColor()} border border-white/20`} />
          <span className="text-lg font-semibold">{getTurnText()}</span>
        </div>
      </div>

      {/* Share Link */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-white/70">Share Link</h2>
        <Button
          onClick={copyShareLink}
          variant="outline"
          className="w-full text-sm bg-white/10 hover:bg-white/20 border-white/30"
        >
          {copied ? (
            <>
              <Check className="mr-2 h-4 w-4" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="mr-2 h-4 w-4" />
              Copy Share Link
            </>
          )}
        </Button>
      </div>

      {/* Game Actions */}
      {status === 'active' && playerColor && (
        <>
          <Separator className="bg-white/10" />
          <div className="space-y-3">
            <Button
              onClick={onOfferDraw}
              variant="outline"
              className="w-full bg-blue-500/10 hover:bg-blue-500/20 border-blue-400/30 text-blue-200"
            >
              Offer Draw
            </Button>
            <Button
              onClick={onResign}
              variant="destructive"
              className="w-full bg-red-500/20 hover:bg-red-500/30 border-red-400/30"
            >
              Resign
            </Button>
          </div>
        </>
      )}

      {/* Status Message */}
      {status === 'waiting' && (
        <Alert className="bg-yellow-500/10 border-yellow-400/30">
          <AlertDescription className="text-sm text-yellow-200/90">
            Share this link with your opponent to start the game!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
