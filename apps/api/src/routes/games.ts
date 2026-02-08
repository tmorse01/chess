import { Router, type Request, type Response, type IRouter } from 'express';
import { db } from '../db/client.js';
import { games } from '../db/schema.js';
import { eq } from 'drizzle-orm';

const router: IRouter = Router();

/**
 * POST /games
 * Create a new chess game with unique tokens for white and black players
 */
router.post('/', async (_req: Request, res: Response) => {
  try {
    // Create a new game with default values (tokens and ID auto-generated)
    const [newGame] = await db
      .insert(games)
      .values({
        // All other fields use database defaults:
        // - id: random UUID
        // - whiteToken: random UUID
        // - blackToken: random UUID
        // - fen: starting position
        // - status: 'waiting'
        // - turn: 'w'
        // - result: 'unknown'
      })
      .returning();

    if (!newGame) {
      return res.status(500).json({ error: 'Failed to create game' });
    }

    // Construct join URLs (frontend will be at the CORS origin)
    const baseUrl = process.env.CORS_ORIGIN || 'http://localhost:5173';
    const whiteUrl = `${baseUrl}/g/${newGame.id}?token=${newGame.whiteToken}`;
    const blackUrl = `${baseUrl}/g/${newGame.id}?token=${newGame.blackToken}`;

    res.status(201).json({
      gameId: newGame.id,
      whiteUrl,
      blackUrl,
    });
  } catch (error) {
    console.error('Error creating game:', error);
    res.status(500).json({ error: 'Failed to create game' });
  }
});

/**
 * GET /games/:id
 * Get public game state (no authentication required)
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate UUID format (basic check)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid game ID format' });
    }

    const [game] = await db.select().from(games).where(eq(games.id, id)).limit(1);

    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Return public game state (exclude tokens for security)
    res.json({
      id: game.id,
      status: game.status,
      fen: game.fen,
      pgn: game.pgn,
      turn: game.turn,
      result: game.result,
      endedReason: game.endedReason,
      createdAt: game.createdAt,
      updatedAt: game.updatedAt,
    });
  } catch (error) {
    console.error('Error fetching game:', error);
    res.status(500).json({ error: 'Failed to fetch game' });
  }
});

export { router as gamesRouter };
