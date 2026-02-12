import { useNavigate } from 'react-router-dom';
import type { GameResult as GameResultType, EndReason } from '@chess-app/shared';
import { Trophy, Handshake, Frown } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

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
    <Dialog open={true}>
      <DialogContent
        className="max-w-md text-center frosted-glass"
        aria-labelledby="game-result-title"
        aria-describedby="game-result-description"
        data-testid="game-result-modal"
      >
        {/* Result Title */}
        <div className="space-y-2">
          <h2
            id="game-result-title"
            className={`text-4xl font-bold ${
              isVictory ? 'text-success' : isDraw ? 'text-warning' : 'text-destructive'
            }`}
            data-testid="result-title"
          >
            {getResultTitle()}
          </h2>
          <p
            id="game-result-description"
            className="text-xl text-muted-foreground"
            data-testid="result-message"
          >
            {getResultDescription()}
          </p>
        </div>

        {/* Icon */}
        <div className="flex justify-center py-4">
          {isVictory && (
            <Trophy
              className="w-24 h-24 text-warning"
              data-testid="trophy-icon"
              aria-hidden="true"
            />
          )}
          {isDraw && (
            <Handshake
              className="w-24 h-24 text-info"
              data-testid="handshake-icon"
              aria-hidden="true"
            />
          )}
          {!isVictory && !isDraw && (
            <Frown
              className="w-24 h-24 text-muted-foreground"
              data-testid="frown-icon"
              aria-hidden="true"
            />
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={handleNewGame}
            className="w-full"
            size="lg"
            data-testid="new-game-button"
          >
            New Game
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
