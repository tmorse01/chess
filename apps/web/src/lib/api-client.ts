import axios from 'axios';
import type { CreateGameResponse, GameStateUpdate } from '@chess-app/shared';

/**
 * Centralized API client configuration
 * In production: API is at /api on same domain
 * In development: API is at separate port (default: 4000)
 */
const API_BASE_URL = import.meta.env.PROD
  ? '/api'
  : import.meta.env.VITE_API_URL || 'http://localhost:4000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Socket.IO URL configuration
 * In production: Same origin (no separate URL)
 * In development: Separate socket server (Socket.IO runs at root, not at /api)
 */
export const getSocketUrl = (): string => {
  if (import.meta.env.PROD) {
    return window.location.origin;
  }
  // Remove /api from the URL - Socket.IO is served at the root of the API server, not under /api
  // REST API calls use /api prefix, but Socket.IO connects to the root
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
  const socketUrl = apiUrl.replace(/\/api\/?$/, '');
  console.log('[Socket] Connecting to:', socketUrl);
  return socketUrl;
};

/**
 * API endpoints
 */
export const api = {
  games: {
    /**
     * Create a new game
     */
    create: async (): Promise<CreateGameResponse> => {
      const { data } = await apiClient.post<CreateGameResponse>('/games');
      return data;
    },

    /**
     * Get game state by ID
     */
    getById: async (gameId: string): Promise<GameStateUpdate> => {
      const { data } = await apiClient.get<GameStateUpdate>(`/games/${gameId}`);
      return data;
    },

    /**
     * Get move history for a game
     */
    getMoves: async (
      gameId: string
    ): Promise<Array<{ moveNumber: number; white: string | null; black: string | null }>> => {
      const { data } = await apiClient.get(`/games/${gameId}/moves`);
      return data;
    },
  },
};
