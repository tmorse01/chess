import { Chessboard } from 'react-chessboard';
import type { ComponentProps } from 'react';
import './ThemedChessboard.css';

type ChessboardProps = ComponentProps<typeof Chessboard>;

interface ThemedChessboardProps extends Omit<
  ChessboardProps,
  'customBoardStyle' | 'customDarkSquareStyle' | 'customLightSquareStyle'
> {
  theme?: 'darkLuxury';
}

/**
 * ThemedChessboard Component
 * A wrapper around react-chessboard with custom dark luxury theme styling
 * Includes charcoal/slate squares and colored pieces (violet/slate)
 */
export function ThemedChessboard({ theme = 'darkLuxury', ...props }: ThemedChessboardProps) {
  // Dark luxury theme colors
  const customBoardStyle = {
    boxShadow: '0 8px 32px rgba(139, 92, 246, 0.15), 0 2px 8px rgba(0, 0, 0, 0.4)',
  };

  const customDarkSquareStyle = {
    backgroundColor: '#2d5a3d',
  };

  const customLightSquareStyle = {
    backgroundColor: '#f5f1e8',
  };

  return (
    <div className="themed-chessboard-wrapper">
      <Chessboard
        {...props}
        customBoardStyle={customBoardStyle}
        customDarkSquareStyle={customDarkSquareStyle}
        customLightSquareStyle={customLightSquareStyle}
      />
    </div>
  );
}
