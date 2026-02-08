import { Chess } from 'chess.js';
import { gameRepository, GameRepository } from '../repositories/game-repo.js';

export interface MoveRequest {
  gameId: string;
  token: string;
  from: string;
  to: string;
  promotion?: string;
}

export interface MoveResult {
  success: boolean;
  error?: string;
  fen?: string;
  san?: string;
  gameEnded?: boolean;
  result?: string;
  endedReason?: string;
  turn?: 'w' | 'b';
}

/**
 * Chess service - handles game logic, move validation, and game state management
 */
export class ChessService {
  constructor(private gameRepo: GameRepository = gameRepository) {}

  /**
   * Validate and apply a move to a game
   */
  async applyMove(moveRequest: MoveRequest): Promise<MoveResult> {
    const { gameId, token, from, to, promotion } = moveRequest;

    // 1. Validate token and get player color
    const tokenValidation = await this.gameRepo.validateToken(gameId, token);
    if (!tokenValidation.valid || !tokenValidation.color) {
      return { success: false, error: 'Invalid token' };
    }

    const playerColor = tokenValidation.color;

    // 2. Get current game state
    const game = await this.gameRepo.findById(gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    // 3. Check if game is still active
    if (game.status === 'ended') {
      return { success: false, error: 'Game has ended' };
    }

    // 4. Check if it's the player's turn
    if (game.turn !== playerColor) {
      return { success: false, error: 'Not your turn' };
    }

    // 5. Validate move using chess.js
    const chess = new Chess(game.fen);

    try {
      const move = chess.move({
        from,
        to,
        promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined,
      });

      if (!move) {
        return { success: false, error: 'Illegal move' };
      }

      // 6. Get updated state
      const newFen = chess.fen();
      const newTurn = chess.turn() as 'w' | 'b';
      const san = move.san;

      // 7. Detect game end
      const gameEndState = this.detectGameEnd(chess);

      // 8. Update database
      await this.gameRepo.updateGameState(gameId, {
        fen: newFen,
        turn: newTurn,
        status: gameEndState.ended ? 'ended' : 'active',
        result: gameEndState.result,
        endedReason: gameEndState.reason,
        pgn: chess.pgn(),
      });

      // 9. Record the move
      await this.gameRepo.recordMove({
        gameId,
        from,
        to,
        promotion,
        san,
        fenAfter: newFen,
      });

      return {
        success: true,
        fen: newFen,
        san,
        turn: newTurn,
        gameEnded: gameEndState.ended,
        result: gameEndState.result,
        endedReason: gameEndState.reason,
      };
    } catch (error) {
      return { success: false, error: 'Invalid move format' };
    }
  }

  /**
   * Validate a move without applying it
   */
  async validateMove(moveRequest: MoveRequest): Promise<MoveResult> {
    const { gameId, token, from, to, promotion } = moveRequest;

    // Validate token
    const tokenValidation = await this.gameRepo.validateToken(gameId, token);
    if (!tokenValidation.valid || !tokenValidation.color) {
      return { success: false, error: 'Invalid token' };
    }

    const playerColor = tokenValidation.color;

    // Get current game state
    const game = await this.gameRepo.findById(gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    // Check if game is still active
    if (game.status === 'ended') {
      return { success: false, error: 'Game has ended' };
    }

    // Check turn
    if (game.turn !== playerColor) {
      return { success: false, error: 'Not your turn' };
    }

    // Validate move using chess.js (without applying)
    const chess = new Chess(game.fen);

    try {
      const move = chess.move({
        from,
        to,
        promotion: promotion as 'q' | 'r' | 'b' | 'n' | undefined,
      });

      if (!move) {
        return { success: false, error: 'Illegal move' };
      }

      return { success: true };
    } catch (error) {
      return { success: false, error: 'Invalid move format' };
    }
  }

  /**
   * Detect if the game has ended and why
   */
  detectGameEnd(chess: Chess): {
    ended: boolean;
    result?: string;
    reason?: string;
  } {
    if (chess.isCheckmate()) {
      // The side to move has been checkmated
      const winner = chess.turn() === 'w' ? 'black_win' : 'white_win';
      return {
        ended: true,
        result: winner,
        reason: 'checkmate',
      };
    }

    if (chess.isStalemate()) {
      return {
        ended: true,
        result: 'draw',
        reason: 'stalemate',
      };
    }

    if (chess.isThreefoldRepetition()) {
      return {
        ended: true,
        result: 'draw',
        reason: 'draw_agreement', // Approximation - could be automatic
      };
    }

    if (chess.isInsufficientMaterial()) {
      return {
        ended: true,
        result: 'draw',
        reason: 'draw_agreement',
      };
    }

    if (chess.isDraw()) {
      // Catches 50-move rule and other draws
      return {
        ended: true,
        result: 'draw',
        reason: 'draw_agreement',
      };
    }

    return { ended: false };
  }

  /**
   * Handle player resignation
   */
  async resign(gameId: string, token: string): Promise<MoveResult> {
    const tokenValidation = await this.gameRepo.validateToken(gameId, token);
    if (!tokenValidation.valid || !tokenValidation.color) {
      return { success: false, error: 'Invalid token' };
    }

    const game = await this.gameRepo.findById(gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    if (game.status === 'ended') {
      return { success: false, error: 'Game has already ended' };
    }

    // The player who resigned loses
    const result = tokenValidation.color === 'w' ? 'black_win' : 'white_win';

    await this.gameRepo.updateGameState(gameId, {
      status: 'ended',
      result,
      endedReason: 'resignation',
    });

    return {
      success: true,
      gameEnded: true,
      result,
      endedReason: 'resignation',
    };
  }

  /**
   * Offer or accept a draw
   */
  async handleDraw(gameId: string, token: string, action: 'offer' | 'accept'): Promise<MoveResult> {
    const tokenValidation = await this.gameRepo.validateToken(gameId, token);
    if (!tokenValidation.valid) {
      return { success: false, error: 'Invalid token' };
    }

    const game = await this.gameRepo.findById(gameId);
    if (!game) {
      return { success: false, error: 'Game not found' };
    }

    if (game.status === 'ended') {
      return { success: false, error: 'Game has already ended' };
    }

    if (action === 'accept') {
      // Accept draw offer (in real app, would check if there's an outstanding offer)
      await this.gameRepo.updateGameState(gameId, {
        status: 'ended',
        result: 'draw',
        endedReason: 'draw_agreement',
      });

      return {
        success: true,
        gameEnded: true,
        result: 'draw',
        endedReason: 'draw_agreement',
      };
    }

    // For 'offer', just return success (would store offer in real app)
    return { success: true };
  }
}

export const chessService = new ChessService();
