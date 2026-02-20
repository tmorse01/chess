import { useState, useCallback } from 'react';
import { Chess } from 'chess.js';
import { Chessboard } from 'react-chessboard';
import { RotateCcw, FlipHorizontal2, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';

const customBoardStyle = {
  borderRadius: '12px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
};

const customDarkSquareStyle = { backgroundColor: '#779952' };
const customLightSquareStyle = { backgroundColor: '#edeed1' };

export function BoardPlayground() {
  const [game, setGame] = useState(() => new Chess());
  const [boardOrientation, setBoardOrientation] = useState<'white' | 'black'>('white');
  const [lastMove, setLastMove] = useState<{ from: string; to: string } | null>(null);

  const fen = game.fen();
  const turn = game.turn() === 'w' ? 'White' : 'Black';
  const isGameOver = game.isGameOver();
  const isCheck = game.inCheck();

  const gameOverReason = isGameOver
    ? game.isCheckmate()
      ? `Checkmate! ${turn === 'White' ? 'Black' : 'White'} wins`
      : game.isStalemate()
        ? 'Stalemate — Draw!'
        : game.isDraw()
          ? 'Draw!'
          : 'Game over'
    : null;

  const handleDrop = useCallback(
    (sourceSquare: string, targetSquare: string, piece: string): boolean => {
      if (isGameOver) return false;

      const isPromotion =
        piece.toLowerCase().endsWith('p') &&
        ((piece.startsWith('w') && targetSquare[1] === '8') ||
          (piece.startsWith('b') && targetSquare[1] === '1'));

      const newGame = new Chess(fen);
      const result = newGame.move({
        from: sourceSquare,
        to: targetSquare,
        promotion: isPromotion ? 'q' : undefined,
      });

      if (!result) return false;

      setLastMove({ from: sourceSquare, to: targetSquare });
      setGame(newGame);
      return true;
    },
    [fen, isGameOver]
  );

  const handleReset = () => {
    setGame(new Chess());
    setLastMove(null);
  };

  const handleFlip = () => {
    setBoardOrientation((prev) => (prev === 'white' ? 'black' : 'white'));
  };

  const customSquareStyles: Record<string, React.CSSProperties> = {};
  if (lastMove) {
    customSquareStyles[lastMove.from] = { backgroundColor: 'rgba(255, 255, 0, 0.25)' };
    customSquareStyles[lastMove.to] = { backgroundColor: 'rgba(255, 255, 0, 0.35)' };
  }

  return (
    <div className="flex flex-col items-center gap-4" data-testid="board-playground">
      {/* Turn / Status indicator */}
      <div className="flex items-center gap-3">
        {isGameOver ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 border border-yellow-500/40 rounded-full">
            <Crown className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-semibold text-yellow-200">{gameOverReason}</span>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 px-4 py-2 bg-white/10 border border-white/20 rounded-full"
            data-testid="turn-indicator"
          >
            <div
              className={`w-3 h-3 rounded-full border-2 border-white/40 ${turn === 'White' ? 'bg-white' : 'bg-gray-900'}`}
            />
            <span className="text-sm font-medium text-white/90">
              {isCheck ? `${turn} is in check!` : `${turn} to move`}
            </span>
          </div>
        )}
      </div>

      {/* Chess Board */}
      <div className="w-full max-w-[min(85vw,420px)]">
        <Chessboard
          position={fen}
          onPieceDrop={handleDrop}
          boardOrientation={boardOrientation}
          arePiecesDraggable={!isGameOver}
          customBoardStyle={customBoardStyle}
          customDarkSquareStyle={customDarkSquareStyle}
          customLightSquareStyle={customLightSquareStyle}
          customSquareStyles={customSquareStyles}
          animationDuration={150}
          snapToCursor={false}
        />
      </div>

      {/* Controls */}
      <div className="flex gap-2">
        <Button
          onClick={handleFlip}
          variant="outline"
          size="sm"
          className="bg-white/10 hover:bg-white/20 border-white/30 gap-2 text-white"
          data-testid="flip-board-button"
        >
          <FlipHorizontal2 className="w-4 h-4" />
          Flip Board
        </Button>
        <Button
          onClick={handleReset}
          variant="outline"
          size="sm"
          className="bg-white/10 hover:bg-white/20 border-white/30 gap-2 text-white"
          data-testid="reset-board-button"
        >
          <RotateCcw className="w-4 h-4" />
          Reset
        </Button>
      </div>

      <p className="text-xs text-white/40 text-center">
        Try out the board — drag and drop pieces to make moves
      </p>
    </div>
  );
}
