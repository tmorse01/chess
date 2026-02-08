import { z } from 'zod';

/**
 * Zod validation schemas for runtime type checking
 */

export const gameStatusSchema = z.enum(['waiting', 'active', 'ended']);

export const playerColorSchema = z.enum(['w', 'b']);

export const gameResultSchema = z.enum(['white_win', 'black_win', 'draw', 'unknown']);

export const endReasonSchema = z
  .enum(['checkmate', 'stalemate', 'resignation', 'draw_agreement', 'timeout'])
  .nullable();

export const gameSchema = z.object({
  id: z.string().uuid(),
  status: gameStatusSchema,
  whiteToken: z.string().uuid(),
  blackToken: z.string().uuid(),
  fen: z.string(),
  pgn: z.string().nullable(),
  turn: playerColorSchema,
  result: gameResultSchema,
  endedReason: endReasonSchema,
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const moveSchema = z.object({
  id: z.string().uuid(),
  gameId: z.string().uuid(),
  from: z.string().regex(/^[a-h][1-8]$/),
  to: z.string().regex(/^[a-h][1-8]$/),
  promotion: z.enum(['q', 'r', 'b', 'n']).optional(),
  san: z.string(),
  fenAfter: z.string(),
  createdAt: z.date(),
});

export const createGameResponseSchema = z.object({
  gameId: z.string().uuid(),
  whiteUrl: z.string().url(),
  blackUrl: z.string().url(),
});

export const makeMoveRequestSchema = z.object({
  gameId: z.string().uuid(),
  token: z.string().uuid(),
  from: z.string().regex(/^[a-h][1-8]$/),
  to: z.string().regex(/^[a-h][1-8]$/),
  promotion: z.enum(['q', 'r', 'b', 'n']).optional(),
});

export const joinGameRequestSchema = z.object({
  gameId: z.string().uuid(),
  token: z.string().uuid(),
});
