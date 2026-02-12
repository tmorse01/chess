/**
 * Chess-related helpers for E2E tests
 */

export interface Move {
  from: string;
  to: string;
  promotion?: string;
}

/**
 * Scholar's Mate - Checkmate in 4 moves
 * Quick checkmate sequence for testing
 */
export function getScholarsMateMoves(): Move[] {
  return [
    { from: 'e2', to: 'e4' },  // White
    { from: 'e7', to: 'e5' },  // Black
    { from: 'f1', to: 'c4' },  // White
    { from: 'b8', to: 'c6' },  // Black
    { from: 'd1', to: 'h5' },  // White
    { from: 'g8', to: 'f6' },  // Black
    { from: 'h5', to: 'f7' },  // White - Checkmate!
  ];
}

/**
 * Fool's Mate - Fastest possible checkmate (2 moves)
 */
export function getFoolsMateMoves(): Move[] {
  return [
    { from: 'f2', to: 'f3' },  // White
    { from: 'e7', to: 'e5' },  // Black
    { from: 'g2', to: 'g4' },  // White
    { from: 'd8', to: 'h4' },  // Black - Checkmate!
  ];
}

/**
 * Simple opening moves for testing
 */
export function getSimpleOpeningMoves(): Move[] {
  return [
    { from: 'e2', to: 'e4' },  // White
    { from: 'e7', to: 'e5' },  // Black
    { from: 'g1', to: 'f3' },  // White
    { from: 'b8', to: 'c6' },  // Black
    { from: 'f1', to: 'c4' },  // White
    { from: 'g8', to: 'f6' },  // Black
  ];
}

/**
 * Stalemate position sequence
 * This creates a stalemate scenario
 */
export function getStalemateSetup(): Move[] {
  // This is a simplified example - actual stalemate requires specific positioning
  return [
    { from: 'e2', to: 'e3' },
    { from: 'a7', to: 'a5' },
    { from: 'd1', to: 'h5' },
    { from: 'a8', to: 'a6' },
    { from: 'h5', to: 'a5' },
    { from: 'h7', to: 'h5' },
    { from: 'h2', to: 'h4' },
    { from: 'a6', to: 'h6' },
    { from: 'a5', to: 'c7' },
    { from: 'f7', to: 'f6' },
    { from: 'c7', to: 'd7' },
    { from: 'e8', to: 'f7' },
    { from: 'd7', to: 'b7' },
    { from: 'd8', to: 'd3' },
    { from: 'b7', to: 'b8' },
    { from: 'd3', to: 'h7' },
    { from: 'b8', to: 'c8' },
    { from: 'f7', to: 'g6' },
    { from: 'c8', to: 'e6' },  // Stalemate
  ];
}

/**
 * Wait helper for async operations
 */
export function wait(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
