/**
 * Maps error codes and messages to user-friendly error descriptions
 */

export const ERROR_MESSAGES = {
  INVALID_MOVE: "That move isn't legal. Try a different piece!",
  NOT_YOUR_TURN: "Hold on! It's not your turn yet.",
  TOKEN_INVALID: 'Your game link has expired. Please create a new game.',
  GAME_NOT_FOUND: "This game doesn't exist. Check your link and try again.",
  GAME_ENDED: 'This game has already ended.',
  CONNECTION_ERROR: 'Connection problem. Retrying...',
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNKNOWN_ERROR: 'Something went wrong. Please try again.',
} as const;

/**
 * Get a user-friendly error message for a given error code or message
 * @param errorCode - The error code or raw error message
 * @returns A user-friendly error message
 */
export function getUserMessage(errorCode?: string | null): string {
  if (!errorCode) {
    return ERROR_MESSAGES.UNKNOWN_ERROR;
  }

  // Check if the error code matches a known error key
  const upperCode = errorCode.toUpperCase().replace(/\s+/g, '_');
  if (upperCode in ERROR_MESSAGES) {
    return ERROR_MESSAGES[upperCode as keyof typeof ERROR_MESSAGES];
  }

  // Pattern matching for common error patterns
  if (errorCode.toLowerCase().includes('invalid move')) {
    return ERROR_MESSAGES.INVALID_MOVE;
  }
  if (errorCode.toLowerCase().includes('not your turn')) {
    return ERROR_MESSAGES.NOT_YOUR_TURN;
  }
  if (errorCode.toLowerCase().includes('token')) {
    return ERROR_MESSAGES.TOKEN_INVALID;
  }
  if (errorCode.toLowerCase().includes('not found')) {
    return ERROR_MESSAGES.GAME_NOT_FOUND;
  }
  if (errorCode.toLowerCase().includes('ended')) {
    return ERROR_MESSAGES.GAME_ENDED;
  }
  if (
    errorCode.toLowerCase().includes('connection') ||
    errorCode.toLowerCase().includes('connect')
  ) {
    return ERROR_MESSAGES.CONNECTION_ERROR;
  }
  if (errorCode.toLowerCase().includes('network')) {
    return ERROR_MESSAGES.NETWORK_ERROR;
  }

  // Return the original error if no pattern matches (might already be user-friendly)
  return errorCode;
}

/**
 * Determine if an error should be shown as a toast (non-blocking) or alert (blocking)
 * @param errorCode - The error code or message
 * @returns 'toast' for temporary errors, 'alert' for critical errors
 */
export function getErrorDisplayType(errorCode?: string | null): 'toast' | 'alert' {
  if (!errorCode) return 'alert';

  const lowerCode = errorCode.toLowerCase();

  // Non-blocking errors (use toast)
  const toastPatterns = [
    'invalid move',
    'not your turn',
    'connection',
    'reconnecting',
    'copied',
    'success',
  ];

  if (toastPatterns.some((pattern) => lowerCode.includes(pattern))) {
    return 'toast';
  }

  // Critical/blocking errors (use alert)
  return 'alert';
}
