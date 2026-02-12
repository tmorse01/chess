/**
 * Helper functions for interacting with the Chess API
 */

export interface GameCreationResponse {
  gameId: string;
  whiteUrl: string;
  blackUrl: string;
}

/**
 * Create a new game via the REST API
 */
export async function createGame(apiUrl = 'http://localhost:4000'): Promise<GameCreationResponse> {
  const response = await fetch(`${apiUrl}/games`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`Failed to create game: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Get game state via REST API
 */
export async function getGameState(gameId: string, apiUrl = 'http://localhost:4000') {
  const response = await fetch(`${apiUrl}/games/${gameId}`);

  if (!response.ok) {
    throw new Error(`Failed to get game: ${response.statusText}`);
  }

  return await response.json();
}

/**
 * Extract gameId and token from a game URL
 */
export function parseGameUrl(url: string): { gameId: string; token: string } {
  const urlObj = new URL(url);
  const gameId = urlObj.pathname.split('/').pop() || '';
  const token = urlObj.searchParams.get('token') || '';

  return { gameId, token };
}
