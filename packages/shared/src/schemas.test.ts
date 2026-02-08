import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { gameSchema, moveSchema, makeMoveRequestSchema } from './schemas.js';

describe('Shared Schemas', () => {
  describe('gameSchema', () => {
    it('validates a complete game object', () => {
      const validGame = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        status: 'waiting',
        whiteToken: '123e4567-e89b-12d3-a456-426614174001',
        blackToken: '123e4567-e89b-12d3-a456-426614174002',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        pgn: null,
        turn: 'w',
        result: 'unknown',
        endedReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = gameSchema.safeParse(validGame);
      expect(result.success).toBe(true);
    });

    it('rejects invalid game status', () => {
      const invalidGame = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        status: 'invalid_status',
        whiteToken: '123e4567-e89b-12d3-a456-426614174001',
        blackToken: '123e4567-e89b-12d3-a456-426614174002',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        pgn: null,
        turn: 'w',
        result: 'unknown',
        endedReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const result = gameSchema.safeParse(invalidGame);
      expect(result.success).toBe(false);
    });
  });

  describe('moveSchema', () => {
    it('validates a valid move', () => {
      const validMove = {
        id: '123e4567-e89b-12d3-a456-426614174003',
        gameId: '123e4567-e89b-12d3-a456-426614174000',
        from: 'e2',
        to: 'e4',
        san: 'e4',
        fenAfter: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        createdAt: new Date(),
      };

      const result = moveSchema.safeParse(validMove);
      expect(result.success).toBe(true);
    });

    it('validates move with promotion', () => {
      const moveWithPromotion = {
        id: '123e4567-e89b-12d3-a456-426614174003',
        gameId: '123e4567-e89b-12d3-a456-426614174000',
        from: 'e7',
        to: 'e8',
        promotion: 'q',
        san: 'e8=Q',
        fenAfter: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        createdAt: new Date(),
      };

      const result = moveSchema.safeParse(moveWithPromotion);
      expect(result.success).toBe(true);
    });

    it('rejects invalid square notation', () => {
      const invalidMove = {
        id: '123e4567-e89b-12d3-a456-426614174003',
        gameId: '123e4567-e89b-12d3-a456-426614174000',
        from: 'i9', // Invalid square
        to: 'e4',
        san: 'e4',
        fenAfter: 'rnbqkbnr/pppppppp/8/8/4P3/8/PPPP1PPP/RNBQKBNR b KQkq e3 0 1',
        createdAt: new Date(),
      };

      const result = moveSchema.safeParse(invalidMove);
      expect(result.success).toBe(false);
    });
  });

  describe('makeMoveRequestSchema', () => {
    it('validates a valid move request', () => {
      const validRequest = {
        gameId: '123e4567-e89b-12d3-a456-426614174000',
        token: '123e4567-e89b-12d3-a456-426614174001',
        from: 'e2',
        to: 'e4',
      };

      const result = makeMoveRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
    });

    it('validates move request with promotion', () => {
      const requestWithPromotion = {
        gameId: '123e4567-e89b-12d3-a456-426614174000',
        token: '123e4567-e89b-12d3-a456-426614174001',
        from: 'e7',
        to: 'e8',
        promotion: 'q',
      };

      const result = makeMoveRequestSchema.safeParse(requestWithPromotion);
      expect(result.success).toBe(true);
    });
  });
});
