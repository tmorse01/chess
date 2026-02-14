import { Router, type Request, type Response, type IRouter } from 'express';
import { db } from '../db/client.js';
import { games, moves } from '../db/schema.js';
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

/**
 * GET /games/:id/moves
 * Get move history for a game in formatted rows (move number, white move, black move)
 */
router.get('/:id/moves', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // Validate UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return res.status(400).json({ error: 'Invalid game ID format' });
    }

    // Check if game exists
    const [game] = await db.select().from(games).where(eq(games.id, id)).limit(1);
    if (!game) {
      return res.status(404).json({ error: 'Game not found' });
    }

    // Fetch all moves for this game, ordered by creation time
    const gameMoves = await db
      .select()
      .from(moves)
      .where(eq(moves.gameId, id))
      .orderBy(moves.createdAt);

    // Format moves into rows (move number, white move, black move)
    interface MoveRow {
      moveNumber: number;
      white: string | null;
      black: string | null;
    }

    const moveRows: MoveRow[] = [];
    for (let i = 0; i < gameMoves.length; i++) {
      const move = gameMoves[i];
      const moveNumber = Math.floor(i / 2) + 1;
      const isWhiteMove = i % 2 === 0;

      // Find or create the row for this move number
      let row = moveRows.find((r) => r.moveNumber === moveNumber);
      if (!row) {
        row = { moveNumber, white: null, black: null };
        moveRows.push(row);
      }

      if (isWhiteMove) {
        row.white = move.san;
      } else {
        row.black = move.san;
      }
    }

    res.json(moveRows);
  } catch (error) {
    console.error('Error fetching moves:', error);
    res.status(500).json({ error: 'Failed to fetch moves' });
  }
});

export { router as gamesRouter };
