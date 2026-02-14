import { Chessboard } from 'react-chessboard';
// import { Chess } from 'chess.js';

interface ChessBoardProps {
  fen: string;
  playerColor: 'white' | 'black' | null;
  isPlayerTurn: boolean;
  status: 'waiting' | 'active' | 'ended';
  onMove: (from: string, to: string, promotion?: string) => void;
}

export function ChessBoard({ fen, playerColor, isPlayerTurn, status, onMove }: ChessBoardProps) {
  const isInteractive = status === 'active' && isPlayerTurn && playerColor !== null;

  // Handle piece drop
  function onDrop(sourceSquare: string, targetSquare: string, piece: string): boolean {
    if (!isInteractive) {
      return false;
    }

    try {
      // Create a temporary chess instance to validate the move
      //   const chess = new Chess(fen);

      // Check if promotion is needed
      const isPromotion =
        piece.toLowerCase() === 'p' &&
        ((piece === 'P' && targetSquare[1] === '8') || (piece === 'p' && targetSquare[1] === '1'));

      if (isPromotion) {
        // Default to queen promotion for now
        // TODO: Add promotion dialog in future enhancement
        onMove(sourceSquare, targetSquare, 'q');
      } else {
        onMove(sourceSquare, targetSquare);
      }

      return true;
    } catch (error) {
      // Invalid move
      return false;
    }
  }

  // Board styling
  const customBoardStyle = {
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
  };

  const customDarkSquareStyle = {
    backgroundColor: '#779952',
  };

  const customLightSquareStyle = {
    backgroundColor: '#edeed1',
  };

  return (
    <div className="w-full max-w-[min(90vw,600px)] touch-none">
      <Chessboard
        position={fen}
        onPieceDrop={onDrop}
        boardOrientation={playerColor || 'white'}
        arePiecesDraggable={isInteractive}
        customBoardStyle={customBoardStyle}
        customDarkSquareStyle={customDarkSquareStyle}
        customLightSquareStyle={customLightSquareStyle}
        animationDuration={200}
        snapToCursor={true}
      />
    </div>
  );
}
