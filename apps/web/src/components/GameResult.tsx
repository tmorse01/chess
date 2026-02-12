import { useNavigate } from 'react-router-dom';
import type { GameResult as GameResultType, EndReason } from '@chess-app/shared';

interface GameResultProps {
  result: GameResultType;
  endedReason: EndReason;
  playerColor: 'white' | 'black' | null;
}

export function GameResult({ result, endedReason, playerColor }: GameResultProps) {
  const navigate = useNavigate();

  const getResultTitle = (): string => {
    if (result === 'draw') {
      return 'Game Drawn';
    }

    const wonAsWhite = result === 'white_win' && playerColor === 'white';
    const wonAsBlack = result === 'black_win' && playerColor === 'black';

    if (wonAsWhite || wonAsBlack) {
      return 'You Won!';
    }

    return 'You Lost';
  };

  const getResultDescription = (): string => {
    switch (endedReason) {
      case 'checkmate':
        if (result === 'white_win') {
          return 'White wins by checkmate';
        }
        return 'Black wins by checkmate';

      case 'resignation':
        if (result === 'white_win') {
          return 'Black resigned';
        }
        return 'White resigned';

      case 'stalemate':
        return 'Game drawn by stalemate';

      case 'draw_agreement':
        return 'Game drawn by agreement';

      case 'timeout':
        if (result === 'white_win') {
          return 'Black ran out of time';
        }
        return 'White ran out of time';

      default:
        return 'Game ended';
    }
  };

  const handleNewGame = () => {
    navigate('/');
  };

  const isVictory =
    (result === 'white_win' && playerColor === 'white') ||
    (result === 'black_win' && playerColor === 'black');
  const isDraw = result === 'draw';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="frosted-glass p-8 max-w-md w-full text-center space-y-6">
        {/* Result Title */}
        <div className="space-y-2">
          <h2
            className={`text-4xl font-bold ${
              isVictory ? 'text-green-400' : isDraw ? 'text-yellow-400' : 'text-red-400'
            }`}
          >
            {getResultTitle()}
          </h2>
          <p className="text-xl text-white/80">{getResultDescription()}</p>
        </div>

        {/* Trophy/Icon */}
        <div className="text-6xl">
          {isVictory && '🏆'}
          {isDraw && '🤝'}
          {!isVictory && !isDraw && '😔'}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleNewGame}
            className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 border border-white/30"
          >
            New Game
          </button>
        </div>
      </div>
    </div>
  );
}
