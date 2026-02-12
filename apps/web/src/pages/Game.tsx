import { useParams, useSearchParams } from 'react-router-dom';
import { useChessGame } from '../hooks/useChessGame';
import { ChessBoard } from '../components/ChessBoard';
import { GameInfo } from '../components/GameInfo';
import { GameResult } from '../components/GameResult';

function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  if (!gameId || !token) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-8 frosted-glass">
          <h1 className="mb-4 text-2xl font-bold text-center">Invalid Game Link</h1>
          <p className="text-center text-white/80">
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
    isConnected,
    error,
    isLoading,
    makeMove,
    resign,
    offerDraw,
  } = useChessGame({ gameId, token });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-md p-8 frosted-glass">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-t-2 border-b-2 border-white rounded-full animate-spin"></div>
            <p className="text-white/80">Loading game...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-6xl p-6 frosted-glass lg:p-8">
        <h1 className="mb-6 text-3xl font-bold text-center lg:mb-8">Chess Game</h1>

        {/* Error Message */}
        {error && (
          <div className="p-4 mb-4 border rounded-lg bg-red-500/20 border-red-400/30">
            <p className="text-sm text-red-200">{error}</p>
          </div>
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
            <div className="h-full p-6 frosted-glass">
              <GameInfo
                gameId={gameId}
                playerColor={playerColor}
                turn={turn}
                isPlayerTurn={isPlayerTurn}
                status={status}
                isConnected={isConnected}
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
