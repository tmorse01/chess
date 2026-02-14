import { describe, it, expect } from 'vitest';
import { getUserMessage, getErrorDisplayType, ERROR_MESSAGES } from './errorMessages';

describe('errorMessages', () => {
  describe('getUserMessage', () => {
    it('returns unknown error message for null/undefined', () => {
      expect(getUserMessage(null)).toBe(ERROR_MESSAGES.UNKNOWN_ERROR);
      expect(getUserMessage(undefined)).toBe(ERROR_MESSAGES.UNKNOWN_ERROR);
    });

    it('matches exact error codes', () => {
      expect(getUserMessage('INVALID_MOVE')).toBe(ERROR_MESSAGES.INVALID_MOVE);
      expect(getUserMessage('NOT_YOUR_TURN')).toBe(ERROR_MESSAGES.NOT_YOUR_TURN);
      expect(getUserMessage('TOKEN_INVALID')).toBe(ERROR_MESSAGES.TOKEN_INVALID);
      expect(getUserMessage('GAME_NOT_FOUND')).toBe(ERROR_MESSAGES.GAME_NOT_FOUND);
    });

    it('matches error codes with different casing', () => {
      expect(getUserMessage('invalid_move')).toBe(ERROR_MESSAGES.INVALID_MOVE);
      expect(getUserMessage('not your turn')).toBe(ERROR_MESSAGES.NOT_YOUR_TURN);
      expect(getUserMessage('Token Invalid')).toBe(ERROR_MESSAGES.TOKEN_INVALID);
    });

    it('matches error patterns in messages', () => {
      expect(getUserMessage('That is an invalid move!')).toBe(ERROR_MESSAGES.INVALID_MOVE);
      expect(getUserMessage("It's not your turn")).toBe(ERROR_MESSAGES.NOT_YOUR_TURN);
      expect(getUserMessage('Token verification failed')).toBe(ERROR_MESSAGES.TOKEN_INVALID);
      expect(getUserMessage('Game not found in database')).toBe(ERROR_MESSAGES.GAME_NOT_FOUND);
      expect(getUserMessage('Game ended by resignation')).toBe(ERROR_MESSAGES.GAME_ENDED);
      expect(getUserMessage('Connection lost')).toBe(ERROR_MESSAGES.CONNECTION_ERROR);
      expect(getUserMessage('Network timeout')).toBe(ERROR_MESSAGES.NETWORK_ERROR);
    });

    it('returns original message if no pattern matches', () => {
      const customMessage = 'This is a custom error message';
      expect(getUserMessage(customMessage)).toBe(customMessage);
    });
  });

  describe('getErrorDisplayType', () => {
    it('returns alert for null/undefined', () => {
      expect(getErrorDisplayType(null)).toBe('alert');
      expect(getErrorDisplayType(undefined)).toBe('alert');
    });

    it('returns toast for non-blocking errors', () => {
      expect(getErrorDisplayType('invalid move')).toBe('toast');
      expect(getErrorDisplayType('not your turn')).toBe('toast');
      expect(getErrorDisplayType('connection error')).toBe('toast');
      expect(getErrorDisplayType('reconnecting...')).toBe('toast');
      expect(getErrorDisplayType('Copied to clipboard')).toBe('toast');
      expect(getErrorDisplayType('Success!')).toBe('toast');
    });

    it('returns alert for critical/blocking errors', () => {
      expect(getErrorDisplayType('token invalid')).toBe('alert');
      expect(getErrorDisplayType('game not found')).toBe('alert');
      expect(getErrorDisplayType('game ended')).toBe('alert');
      expect(getErrorDisplayType('unknown error')).toBe('alert');
    });
  });

  describe('ERROR_MESSAGES constant', () => {
    it('contains all expected error codes', () => {
      expect(ERROR_MESSAGES).toHaveProperty('INVALID_MOVE');
      expect(ERROR_MESSAGES).toHaveProperty('NOT_YOUR_TURN');
      expect(ERROR_MESSAGES).toHaveProperty('TOKEN_INVALID');
      expect(ERROR_MESSAGES).toHaveProperty('GAME_NOT_FOUND');
      expect(ERROR_MESSAGES).toHaveProperty('GAME_ENDED');
      expect(ERROR_MESSAGES).toHaveProperty('CONNECTION_ERROR');
      expect(ERROR_MESSAGES).toHaveProperty('NETWORK_ERROR');
      expect(ERROR_MESSAGES).toHaveProperty('UNKNOWN_ERROR');
    });

    it('all messages are user-friendly strings', () => {
      Object.values(ERROR_MESSAGES).forEach((message) => {
        expect(typeof message).toBe('string');
        expect(message.length).toBeGreaterThan(0);
        expect(message).not.toMatch(/[A-Z_]{3,}/); // No all-caps error codes
      });
    });
  });
});
