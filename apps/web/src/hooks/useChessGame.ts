import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { toast } from 'sonner';
import type { GameStateUpdate } from '@chess-app/shared';
import { useGamePersistence } from './useGamePersistence';
import { getUserMessage, getErrorDisplayType } from '../lib/errorMessages';
import { api, getSocketUrl } from '@/lib/api-client';

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
  connectionStatus: 'connected' | 'disconnected' | 'reconnecting';
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
  const [connectionStatus, setConnectionStatus] = useState<
    'connected' | 'disconnected' | 'reconnecting'
  >('disconnected');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Persist game to localStorage for dev experience (survive restarts)
  useGamePersistence(gameId, token, playerColor || undefined);

  // Fetch game state from REST API (fallback/recovery)
  const fetchGameState = useCallback(async () => {
    try {
      console.log('[useChessGame] Fetching game state from REST API');
      const data = await api.games.getById(gameId);

      // Update state with fetched data
      setFen(data.fen);
      setTurn(data.turn);
      setStatus(data.status);
      setResult(data.result);
      setEndedReason(data.endedReason);
      setLastMove(data.lastMove || null);
      setIsLoading(false);
      setError(null);
    } catch (err) {
      console.error('[useChessGame] Failed to fetch game state:', err);
      const friendlyMessage = getUserMessage('FETCH_GAME_ERROR');
      setError(friendlyMessage);
      toast.error(friendlyMessage);
    }
  }, [gameId]);

  // Connect to socket and join game
  useEffect(() => {
    const socketUrl = getSocketUrl();
    console.log('[useChessGame] Initializing socket connection to:', socketUrl);
    console.log('[useChessGame] GameId:', gameId, 'Token:', token?.substring(0, 8) + '...');

    const newSocket = io(socketUrl, {
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => {
      console.log('[useChessGame] Socket connected, ID:', newSocket.id);
      setConnectionStatus('connected');
      setError(null);

      // Join the game room (works for both initial connection and reconnection)
      newSocket.emit('join_game', { gameId, token });

      // On reconnection, fetch latest state from REST API as backup
      if (!isLoading) {
        fetchGameState();
      }
    });

    newSocket.on('disconnect', (reason) => {
      console.log('[useChessGame] Socket disconnected. Reason:', reason);
      setConnectionStatus('reconnecting');
      toast.info('Connection lost. Reconnecting...');
    });

    newSocket.on('connect_error', () => {
      const friendlyMessage = getUserMessage('CONNECTION_ERROR');
      setError(friendlyMessage);
      toast.error(friendlyMessage);
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
      const friendlyMessage = getUserMessage(data.reason);
      toast.error(friendlyMessage);
      // Don't set error state for move rejections - they're temporary
      // Clear error after 3 seconds
      setTimeout(() => setError(null), 3000);
    });

    // Listen for game errors
    newSocket.on('error', (data: { message: string }) => {
      console.log('[useChessGame] Game error:', data.message);
      const friendlyMessage = getUserMessage(data.message);
      const displayType = getErrorDisplayType(data.message);

      if (displayType === 'toast') {
        toast.error(friendlyMessage);
      } else {
        setError(friendlyMessage);
      }
      setIsLoading(false);
    });

    // Listen for game end events
    newSocket.on('game_ended', (data: { result: string; reason: string }) => {
      console.log('[useChessGame] Game ended:', data);
      setStatus('ended');
      setResult(data.result as 'white_win' | 'black_win' | 'draw' | 'unknown');
      setEndedReason(data.reason);
    });

    // Listen for draw offers
    newSocket.on('draw_offered', (data: { offeredBy: 'w' | 'b' }) => {
      console.log('[useChessGame] Draw offered by:', data.offeredBy);
      // You could add a notification or state here to show the draw offer to the other player
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
      console.log('[useChessGame] makeMove called with:', {
        from,
        to,
        promotion,
        socketConnected: socket?.connected,
        connectionStatus,
        status,
        playerColor,
      });

      if (!socket || connectionStatus !== 'connected') {
        console.log(
          '[useChessGame] Cannot make move: not connected. Socket:',
          !!socket,
          'connectionStatus:',
          connectionStatus
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
    [socket, connectionStatus, status, gameId, token]
  );

  // Resign from the game
  const resign = useCallback(() => {
    if (!socket || connectionStatus !== 'connected') {
      setError('Not connected to server');
      return;
    }

    socket.emit('resign', { gameId, token });
  }, [socket, connectionStatus, gameId, token]);

  // Offer a draw
  const offerDraw = useCallback(() => {
    if (!socket || connectionStatus !== 'connected') {
      setError('Not connected to server');
      return;
    }

    socket.emit('offer_draw', { gameId, token });
  }, [socket, connectionStatus, gameId, token]);

  // Accept a draw offer
  const acceptDraw = useCallback(() => {
    if (!socket || connectionStatus !== 'connected') {
      setError('Not connected to server');
      return;
    }

    socket.emit('accept_draw', { gameId, token });
  }, [socket, connectionStatus, gameId, token]);

  const isPlayerTurn = playerColor === 'white' ? turn === 'w' : turn === 'b';

  console.log('[useChessGame] State summary:', {
    playerColor,
    turn,
    isPlayerTurn,
    status,
    connectionStatus,
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
    connectionStatus,
    error,
    isLoading,
    makeMove,
    resign,
    offerDraw,
    acceptDraw,
  };
}
