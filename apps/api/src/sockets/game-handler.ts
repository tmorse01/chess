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
        console.log(`[join_game] Socket ${socket.id} attempting to join game ${gameId}`);

        // Validate token
        const tokenValidation = await gameRepository.validateToken(gameId, token);
        if (!tokenValidation.valid) {
          console.log(`[join_game] Invalid token for game ${gameId}`);
          socket.emit('game_error', { message: 'Invalid token' });
          return;
        }
        console.log(
          `[join_game] Token validated for game ${gameId}, player color: ${tokenValidation.color}`
        );

        // Join the game room
        const roomName = `game:${gameId}`;
        await socket.join(roomName);

        console.log(
          `[join_game] Socket ${socket.id} joined room ${roomName} as ${tokenValidation.color}`
        );

        // Get current game state and send to player
        const game = await gameRepository.findById(gameId);
        console.log(
          `[join_game] Game retrieved:`,
          game ? `status=${game.status}, turn=${game.turn}` : 'null'
        );

        if (game) {
          const gameStatePayload = {
            fen: game.fen,
            turn: game.turn,
            status: game.status,
            result: game.result,
            endedReason: game.endedReason,
            pgn: game.pgn,
            playerColor: tokenValidation.color,
          };
          console.log(`[join_game] Emitting game_state to socket ${socket.id}:`, gameStatePayload);
          socket.emit('game_state', gameStatePayload);

          // Also emit player_color for the useChessGame hook
          const colorName = tokenValidation.color === 'w' ? 'white' : 'black';
          console.log(`[join_game] Emitting player_color: ${colorName} to socket ${socket.id}`);
          socket.emit('player_color', colorName);
        }

        // Notify room that a player joined
        console.log(`[join_game] Broadcasting player_joined to room ${roomName}`);
        io.to(roomName).emit('player_joined', {
          playerColor: tokenValidation.color,
        });

        // Check if both players are now connected
        const socketsInRoom = await io.in(roomName).fetchSockets();
        console.log(`[join_game] Room ${roomName} now has ${socketsInRoom.length} sockets`);

        // If 2 players are connected and game is still waiting, activate it
        if (socketsInRoom.length >= 2 && game && game.status === 'waiting') {
          console.log(`[join_game] Both players connected! Updating game status to 'active'`);
          const updatedGame = await gameRepository.updateGameState(gameId, { status: 'active' });

          if (updatedGame) {
            // Broadcast the updated status to all players in the room
            const updatedGameState = {
              gameId: updatedGame.id,
              fen: updatedGame.fen,
              turn: updatedGame.turn,
              status: updatedGame.status,
              result: updatedGame.result,
              endedReason: updatedGame.endedReason,
            };
            console.log(
              `[join_game] Broadcasting updated game_state with status='active':`,
              updatedGameState
            );
            io.to(roomName).emit('game_state', updatedGameState);
          }
        }
      } catch (error) {
        console.error('Error in join_game:', error);
        socket.emit('game_error', { message: 'Failed to join game' });
      }
    });

    /**
     * Make a move in the game
     * Validates move, updates state, and broadcasts to all players in the room
     */
    socket.on('make_move', async (data: MakeMoveData) => {
      try {
        const { gameId, token, from, to, promotion } = data;
        console.log(`[make_move] Socket ${socket.id} attempting move: ${from}->${to} in game ${gameId}`);

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
          console.log(`[make_move] Move rejected: ${result.error}`);
          socket.emit('move_rejected', {
            reason: result.error || 'Invalid move',
          });
          return;
        }
        
        console.log(`[make_move] Move successful, broadcasting updated state`);

        // Broadcast updated game state to all players in the room
        const roomName = `game:${gameId}`;
        const gameStateUpdate = {
          gameId,
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
        };
        console.log(`[make_move] Broadcasting game_state to room ${roomName}:`, gameStateUpdate);
        io.to(roomName).emit('game_state', gameStateUpdate);

        // If game ended, emit specific event
        if (result.gameEnded) {
          io.to(roomName).emit('game_ended', {
            result: result.result,
            reason: result.endedReason,
          });
        }
      } catch (error) {
        console.error('Error in make_move:', error);
        socket.emit('game_error', { message: 'Failed to make move' });
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
          socket.emit('game_error', { message: result.error });
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
        socket.emit('game_error', { message: 'Failed to resign' });
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
          socket.emit('game_error', { message: 'Invalid token' });
          return;
        }

        const result = await chessService.handleDraw(gameId, token, 'offer');

        if (!result.success) {
          socket.emit('game_error', { message: result.error });
          return;
        }

        // Broadcast draw offer to all players in the room
        const roomName = `game:${gameId}`;
        io.to(roomName).emit('draw_offered', {
          offeredBy: tokenValidation.color,
        });
      } catch (error) {
        console.error('Error in offer_draw:', error);
        socket.emit('game_error', { message: 'Failed to offer draw' });
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
          socket.emit('game_error', { message: result.error });
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
        socket.emit('game_error', { message: 'Failed to accept draw' });
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
