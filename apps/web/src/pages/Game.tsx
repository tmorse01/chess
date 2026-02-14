import { useParams, useSearchParams } from 'react-router-dom';
import { useChessGame } from '../hooks/useChessGame';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { ChessBoard } from '../components/ChessBoard';
import { GameInfo } from '../components/GameInfo';
import { GameResult } from '../components/GameResult';
import { SkeletonLoader } from '../components/SkeletonLoader';
import { Alert, AlertDescription } from '@/components/ui/alert';

function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  if (!gameId || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-8 frosted-glass">
          <h1 className="mb-4 text-2xl font-bold text-center">Invalid Game Link</h1>
          <p className="text-center text-muted-foreground">
            This game link is invalid. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }

  const {
    fen,
    turn,
    result,
    endedReason,
    status,
    playerColor,
    isPlayerTurn,
    connectionStatus,
    lastMove,
    error,
    isLoading,
    makeMove,
    resign,
    offerDraw,
  } = useChessGame({ gameId, token });

  // Set document title based on player color
  useDocumentTitle(
    playerColor
      ? `Chess - Playing as ${playerColor.charAt(0).toUpperCase() + playerColor.slice(1)}`
      : 'Chess Game'
  );

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 bg-gradient-to-br from-violet-50 via-white to-violet-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <SkeletonLoader />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-6xl p-6 lg:p-8 bg-slate-900/90 border border-violet-500/30 rounded-2xl shadow-xl shadow-violet-500/10">
        <h1 className="mb-6 text-3xl font-bold text-center lg:mb-8">Chess Game</h1>

        {/* Error Message */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription className="text-sm">{error}</AlertDescription>
          </Alert>
        )}

        {/* Main Game Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {/* Chess Board - Takes 2 columns on large screens */}
          <div className="flex items-center justify-center lg:col-span-2">
            <ChessBoard
              fen={fen}
              playerColor={playerColor}
              isPlayerTurn={isPlayerTurn}
              status={status}
              onMove={makeMove}
            />
          </div>

          {/* Game Info Sidebar - Takes 1 column on large screens */}
          <div className="lg:col-span-1">
            <div className="h-full p-6 bg-slate-900/90 border border-violet-500/30 rounded-2xl shadow-xl shadow-violet-500/10">
              <GameInfo
                gameId={gameId}
                playerColor={playerColor}
                turn={turn}
                isPlayerTurn={isPlayerTurn}
                status={status}
                connectionStatus={connectionStatus}
                lastMove={lastMove}
                onResign={resign}
                onOfferDraw={offerDraw}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Game Result Modal - Shown when game ends */}
      {status === 'ended' && endedReason && (
        <GameResult result={result} endedReason={endedReason as any} playerColor={playerColor} />
      )}
    </div>
  );
}

export default Game;
