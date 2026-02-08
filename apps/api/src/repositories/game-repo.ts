import { db } from '../db/client.js';
import { games, moves, type Game, type NewMove } from '../db/schema.js';
import { eq } from 'drizzle-orm';

/**
 * Repository for game-related database operations
 */
export class GameRepository {
  /**
   * Find a game by ID
   */
  async findById(gameId: string): Promise<Game | undefined> {
    const [game] = await db.select().from(games).where(eq(games.id, gameId));
    return game;
  }

  /**
   * Update game state (FEN, turn, status, etc.)
   */
  async updateGameState(
    gameId: string,
    updates: {
      fen?: string;
      turn?: 'w' | 'b';
      status?: string;
      result?: string;
      endedReason?: string;
      pgn?: string;
    }
  ): Promise<Game | undefined> {
    const [updated] = await db
      .update(games)
      .set({
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(games.id, gameId))
      .returning();
    return updated;
  }

  /**
   * Record a move in the moves table
   */
  async recordMove(move: NewMove): Promise<void> {
    await db.insert(moves).values(move);
  }

  /**
   * Get all moves for a game (ordered by creation time)
   */
  async getMovesByGameId(gameId: string) {
    return db.select().from(moves).where(eq(moves.gameId, gameId)).orderBy(moves.createdAt);
  }

  /**
   * Validate that a token belongs to a game and return the player color
   */
  async validateToken(
    gameId: string,
    token: string
  ): Promise<{ valid: boolean; color?: 'w' | 'b' }> {
    const game = await this.findById(gameId);
    if (!game) {
      return { valid: false };
    }

    if (game.whiteToken === token) {
      return { valid: true, color: 'w' };
    }
    if (game.blackToken === token) {
      return { valid: true, color: 'b' };
    }

    return { valid: false };
  }
}

export const gameRepository = new GameRepository();
