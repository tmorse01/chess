import { useParams, useSearchParams } from 'react-router-dom';
import { useChessGame } from '../hooks/useChessGame';
import { ChessBoard } from '../components/ChessBoard';
import { GameInfo } from '../components/GameInfo';

function Game() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  if (!gameId || !token) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="frosted-glass p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-center mb-4">Invalid Game Link</h1>
          <p className="text-white/80 text-center">
            This game link is invalid. Please check the URL and try again.
          </p>
        </div>
      </div>
    );
  }

  const {
    fen,
    turn,
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
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="frosted-glass p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white/80">Loading game...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="frosted-glass p-6 lg:p-8 w-full max-w-6xl">
        <h1 className="text-3xl font-bold text-center mb-6 lg:mb-8">Chess Game</h1>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-400/30 rounded-lg">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* Main Game Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Chess Board - Takes 2 columns on large screens */}
          <div className="lg:col-span-2 flex items-center justify-center">
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
            <div className="frosted-glass p-6 h-full">
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
    </div>
  );
}

export default Game;
