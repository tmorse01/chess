/**
 * Core type definitions for the chess app
 */

export type GameStatus = 'waiting' | 'active' | 'ended';

export type PlayerColor = 'w' | 'b';

export type GameResult = 'white_win' | 'black_win' | 'draw' | 'unknown';

export type EndReason =
  | 'checkmate'
  | 'stalemate'
  | 'resignation'
  | 'draw_agreement'
  | 'timeout'
  | null;

export interface Game {
  id: string;
  status: GameStatus;
  whiteToken: string;
  blackToken: string;
  fen: string;
  pgn: string | null;
  turn: PlayerColor;
  result: GameResult;
  endedReason: EndReason;
  createdAt: Date;
  updatedAt: Date;
}

export interface Move {
  id: string;
  gameId: string;
  from: string;
  to: string;
  promotion?: string;
  san: string;
  fenAfter: string;
  createdAt: Date;
}

export interface CreateGameResponse {
  gameId: string;
  whiteUrl: string;
  blackUrl: string;
}

export interface GameStateUpdate {
  gameId: string;
  fen: string;
  turn: PlayerColor;
  status: GameStatus;
  result: GameResult;
  endedReason: EndReason;
  lastMove?: {
    from: string;
    to: string;
    san: string;
  };
}

export interface MakeMoveRequest {
  gameId: string;
  token: string;
  from: string;
  to: string;
  promotion?: string;
}

export interface JoinGameRequest {
  gameId: string;
  token: string;
}
