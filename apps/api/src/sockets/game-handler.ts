import { Server, Socket } from 'socket.io';
import { chessService } from '../services/chess-service.js';
import { gameRepository } from '../repositories/game-repo.js';

interface JoinGameData {
  gameId: string;
  token: string;
}

interface MakeMoveData {
  gameId: string;
  token: string;
  from: string;
  to: string;
  promotion?: string;
}

interface ResignData {
  gameId: string;
  token: string;
}

interface DrawData {
  gameId: string;
  token: string;
  action: 'offer' | 'accept';
}

/**
 * Set up Socket.IO event handlers for chess games
 */
export function setupGameHandlers(io: Server): void {
  io.on('connection', (socket: Socket) => {
    console.log('Client connected:', socket.id);

    /**
     * Join a game room
     * Validates token and adds socket to room for real-time updates
     */
    socket.on('join_game', async (data: JoinGameData) => {
      try {
        const { gameId, token } = data;

        // Validate token
        const tokenValidation = await gameRepository.validateToken(gameId, token);
        if (!tokenValidation.valid) {
          socket.emit('error', { message: 'Invalid token' });
          return;
        }

        // Join the game room
        const roomName = `game:${gameId}`;
        await socket.join(roomName);

        console.log(`Socket ${socket.id} joined room ${roomName} as ${tokenValidation.color}`);

        // Get current game state and send to player
        const game = await gameRepository.findById(gameId);
        if (game) {
          socket.emit('game_state', {
            fen: game.fen,
            turn: game.turn,
            status: game.status,
            result: game.result,
            endedReason: game.endedReason,
            pgn: game.pgn,
            playerColor: tokenValidation.color,
          });
        }

        // Notify room that a player joined
        io.to(roomName).emit('player_joined', {
          playerColor: tokenValidation.color,
        });
      } catch (error) {
        console.error('Error in join_game:', error);
        socket.emit('error', { message: 'Failed to join game' });
      }
    });

    /**
     * Make a move in the game
     * Validates move, updates state, and broadcasts to all players in the room
     */
    socket.on('make_move', async (data: MakeMoveData) => {
      try {
        const { gameId, token, from, to, promotion } = data;

        // Apply the move using chess service
        const result = await chessService.applyMove({
          gameId,
          token,
          from,
          to,
          promotion,
        });

        if (!result.success) {
          // Send rejection only to the player who made the move
          socket.emit('move_rejected', {
            error: result.error,
            from,
            to,
          });
          return;
        }

        // Broadcast updated game state to all players in the room
        const roomName = `game:${gameId}`;
        io.to(roomName).emit('game_state', {
          fen: result.fen,
          turn: result.turn,
          lastMove: {
            from,
            to,
            san: result.san,
          },
          status: result.gameEnded ? 'ended' : 'active',
          result: result.result,
          endedReason: result.endedReason,
        });

        // If game ended, emit specific event
        if (result.gameEnded) {
          io.to(roomName).emit('game_ended', {
            result: result.result,
            reason: result.endedReason,
          });
        }
      } catch (error) {
        console.error('Error in make_move:', error);
        socket.emit('error', { message: 'Failed to make move' });
      }
    });

    /**
     * Player resigns from the game
     * Updates game status and broadcasts result to all players
     */
    socket.on('resign', async (data: ResignData) => {
      try {
        const { gameId, token } = data;

        const result = await chessService.resign(gameId, token);

        if (!result.success) {
          socket.emit('error', { message: result.error });
          return;
        }

        // Get final game state
        const game = await gameRepository.findById(gameId);

        // Broadcast game end to all players in the room
        const roomName = `game:${gameId}`;
        io.to(roomName).emit('game_state', {
          fen: game?.fen,
          turn: game?.turn,
          status: 'ended',
          result: result.result,
          endedReason: result.endedReason,
        });

        io.to(roomName).emit('game_ended', {
          result: result.result,
          reason: result.endedReason,
        });
      } catch (error) {
        console.error('Error in resign:', error);
        socket.emit('error', { message: 'Failed to resign' });
      }
    });

    /**
     * Offer or accept a draw
     * Handles draw negotiation between players
     */
    socket.on('offer_draw', async (data: DrawData) => {
      try {
        const { gameId, token } = data;

        // Validate token to get player color
        const tokenValidation = await gameRepository.validateToken(gameId, token);
        if (!tokenValidation.valid) {
          socket.emit('error', { message: 'Invalid token' });
          return;
        }

        const result = await chessService.handleDraw(gameId, token, 'offer');

        if (!result.success) {
          socket.emit('error', { message: result.error });
          return;
        }

        // Broadcast draw offer to all players in the room
        const roomName = `game:${gameId}`;
        io.to(roomName).emit('draw_offered', {
          offeredBy: tokenValidation.color,
        });
      } catch (error) {
        console.error('Error in offer_draw:', error);
        socket.emit('error', { message: 'Failed to offer draw' });
      }
    });

    /**
     * Accept a draw offer
     * Ends the game as a draw
     */
    socket.on('accept_draw', async (data: DrawData) => {
      try {
        const { gameId, token } = data;

        const result = await chessService.handleDraw(gameId, token, 'accept');

        if (!result.success) {
          socket.emit('error', { message: result.error });
          return;
        }

        // Get final game state
        const game = await gameRepository.findById(gameId);

        // Broadcast game end to all players in the room
        const roomName = `game:${gameId}`;
        io.to(roomName).emit('game_state', {
          fen: game?.fen,
          turn: game?.turn,
          status: 'ended',
          result: 'draw',
          endedReason: 'draw_agreement',
        });

        io.to(roomName).emit('game_ended', {
          result: 'draw',
          reason: 'draw_agreement',
        });
      } catch (error) {
        console.error('Error in accept_draw:', error);
        socket.emit('error', { message: 'Failed to accept draw' });
      }
    });

    /**
     * Handle client disconnect
     */
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
}
