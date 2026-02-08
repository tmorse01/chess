import { useState } from 'react';

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
        <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
        <span className="text-sm text-white/70">{isConnected ? 'Connected' : 'Disconnected'}</span>
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
          <div className={`w-4 h-4 rounded ${getTurnIndicatorColor()}`} />
          <span className="text-lg font-semibold">{getTurnText()}</span>
        </div>
      </div>

      {/* Share Link */}
      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-white/70">Share Link</h2>
        <button onClick={copyShareLink} className="button-primary w-full text-sm">
          {copied ? '✓ Copied!' : 'Copy Share Link'}
        </button>
      </div>

      {/* Game Actions */}
      {status === 'active' && playerColor && (
        <div className="space-y-3 pt-4 border-t border-white/10">
          <button
            onClick={onOfferDraw}
            className="w-full px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 rounded-lg transition-all text-sm font-semibold"
          >
            Offer Draw
          </button>
          <button
            onClick={onResign}
            className="w-full px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-400/30 rounded-lg transition-all text-sm font-semibold"
          >
            Resign
          </button>
        </div>
      )}

      {/* Status Message */}
      {status === 'waiting' && (
        <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-400/30 rounded-lg">
          <p className="text-sm text-yellow-200/90">
            Share this link with your opponent to start the game!
          </p>
        </div>
      )}
    </div>
  );
}
