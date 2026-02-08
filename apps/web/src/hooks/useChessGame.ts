import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GameStateUpdate } from '@chess-app/shared';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';

interface UseChessGameOptions {
  gameId: string;
  token: string;
}

interface UseChessGameReturn {
  fen: string;
  turn: 'w' | 'b';
  status: 'waiting' | 'active' | 'ended';
  result: 'white_win' | 'black_win' | 'draw' | 'unknown';
  endedReason: string | null;
  playerColor: 'white' | 'black' | null;
  isPlayerTurn: boolean;
  lastMove: { from: string; to: string; san: string } | null;
  isConnected: boolean;
  error: string | null;
  isLoading: boolean;
  makeMove: (from: string, to: string, promotion?: string) => void;
  resign: () => void;
  offerDraw: () => void;
  acceptDraw: () => void;
}

export function useChessGame({ gameId, token }: UseChessGameOptions): UseChessGameReturn {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [fen, setFen] = useState('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1');
  const [turn, setTurn] = useState<'w' | 'b'>('w');
  const [status, setStatus] = useState<'waiting' | 'active' | 'ended'>('waiting');
  const [result, setResult] = useState<'white_win' | 'black_win' | 'draw' | 'unknown'>('unknown');
  const [endedReason, setEndedReason] = useState<string | null>(null);
  const [playerColor, setPlayerColor] = useState<'white' | 'black' | null>(null);
  const [lastMove, setLastMove] = useState<{ from: string; to: string; san: string } | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Connect to socket and join game
  useEffect(() => {
    console.log('[useChessGame] Initializing socket connection to:', API_URL);
    console.log('[useChessGame] GameId:', gameId, 'Token:', token?.substring(0, 8) + '...');

    const newSocket = io(API_URL, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('[useChessGame] Socket connected, ID:', newSocket.id);
      setIsConnected(true);
      setError(null);

      // Join the game room
      newSocket.emit('join_game', { gameId, token });
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[useChessGame] Socket disconnected. Reason:', reason);
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      setError(`Connection error: ${err.message}`);
      setIsLoading(false);
    });

    // Listen for game state updates
    newSocket.on('game_state', (data: GameStateUpdate) => {
      console.log('[useChessGame] Received game_state:', data);
      setFen(data.fen);
      setTurn(data.turn);
      setStatus(data.status);
      setResult(data.result);
      setEndedReason(data.endedReason);
      setLastMove(data.lastMove || null);
      setIsLoading(false);
      setError(null);
    });

    // Listen for player color assignment
    newSocket.on('player_color', (color: 'white' | 'black') => {
      console.log('[useChessGame] Received player_color:', color);
      setPlayerColor(color);
    });

    // Listen for move rejection
    newSocket.on('move_rejected', (data: { reason: string }) => {
      console.log('[useChessGame] Move rejected:', data.reason);
      setError(data.reason);
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    });

    // Listen for game errors
    newSocket.on('game_error', (data: { message: string }) => {
      console.log('[useChessGame] Game error:', data.message);
      setError(data.message);
      setIsLoading(false);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.close();
    };
  }, [gameId, token]);

  // Make a move
  const makeMove = useCallback(
    (from: string, to: string, promotion?: string) => {
      console.log('[useChessGame] makeMove called:', {
        from,
        to,
        promotion,
        isConnected,
        socketConnected: socket?.connected,
        status,
        playerColor,
      });

      if (!socket || !isConnected) {
        console.log(
          '[useChessGame] Cannot make move: not connected. Socket:',
          !!socket,
          'isConnected:',
          isConnected,
          'socket.connected:',
          socket?.connected
        );
        setError('Not connected to server');
        return;
      }

      if (status === 'ended') {
        console.log('[useChessGame] Cannot make move: game has ended');
        setError('Game has ended');
        return;
      }

      console.log('[useChessGame] Emitting make_move event');
      socket.emit('make_move', {
        gameId,
        token,
        from,
        to,
        promotion,
      });
    },
    [socket, isConnected, status, gameId, token]
  );

  // Resign from the game
  const resign = useCallback(() => {
    if (!socket || !isConnected) {
      setError('Not connected to server');
      return;
    }

    socket.emit('resign', { gameId, token });
  }, [socket, isConnected, gameId, token]);

  // Offer a draw
  const offerDraw = useCallback(() => {
    if (!socket || !isConnected) {
      setError('Not connected to server');
      return;
    }

    socket.emit('offer_draw', { gameId, token });
  }, [socket, isConnected, gameId, token]);

  // Accept a draw offer
  const acceptDraw = useCallback(() => {
    if (!socket || !isConnected) {
      setError('Not connected to server');
      return;
    }

    socket.emit('accept_draw', { gameId, token });
  }, [socket, isConnected, gameId, token]);

  const isPlayerTurn = playerColor === 'white' ? turn === 'w' : turn === 'b';

  console.log('[useChessGame] State summary:', {
    playerColor,
    turn,
    isPlayerTurn,
    status,
    isConnected,
    isLoading,
  });

  return {
    fen,
    turn,
    status,
    result,
    endedReason,
    playerColor,
    isPlayerTurn,
    lastMove,
    isConnected,
    error,
    isLoading,
    makeMove,
    resign,
    offerDraw,
    acceptDraw,
  };
}
