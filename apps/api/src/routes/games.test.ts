import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../server.js';
import { db, closeConnection } from '../db/client.js';
import { games } from '../db/schema.js';

describe('REST API - Game Management', () => {
  // Clean up test data after all tests
  afterAll(async () => {
    // Delete all test games
    await db.delete(games);
    await closeConnection();
  });

  describe('POST /games', () => {
    it('should create a new game with valid tokens and URLs', async () => {
      const response = await request(app).post('/games').expect('Content-Type', /json/).expect(201);

      expect(response.body).toHaveProperty('gameId');
      expect(response.body).toHaveProperty('whiteUrl');
      expect(response.body).toHaveProperty('blackUrl');

      // Validate UUIDs
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      expect(response.body.gameId).toMatch(uuidRegex);

      // Validate URLs contain game ID and different tokens
      expect(response.body.whiteUrl).toContain(response.body.gameId);
      expect(response.body.blackUrl).toContain(response.body.gameId);
      expect(response.body.whiteUrl).toContain('token=');
      expect(response.body.blackUrl).toContain('token=');
      expect(response.body.whiteUrl).not.toBe(response.body.blackUrl);
    });

    it('should create a game with correct initial state in database', async () => {
      const response = await request(app).post('/games').expect(201);

      const gameId = response.body.gameId;

      // Fetch the game from database
      const gameResponse = await request(app).get(`/games/${gameId}`).expect(200);

      expect(gameResponse.body).toMatchObject({
        id: gameId,
        status: 'waiting',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        turn: 'w',
        result: 'unknown',
      });
      expect(gameResponse.body.pgn).toBeNull();
      expect(gameResponse.body.endedReason).toBeNull();
    });

    it('should create multiple unique games', async () => {
      const response1 = await request(app).post('/games').expect(201);
      const response2 = await request(app).post('/games').expect(201);

      expect(response1.body.gameId).not.toBe(response2.body.gameId);
      expect(response1.body.whiteUrl).not.toBe(response2.body.whiteUrl);
    });
  });

  describe('GET /games/:id', () => {
    let testGameId: string;

    beforeAll(async () => {
      // Create a test game
      const response = await request(app).post('/games').expect(201);
      testGameId = response.body.gameId;
    });

    it('should return game state for valid game ID', async () => {
      const response = await request(app)
        .get(`/games/${testGameId}`)
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testGameId,
        status: 'waiting',
        fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
        turn: 'w',
        result: 'unknown',
      });

      // Should NOT return tokens (security)
      expect(response.body).not.toHaveProperty('whiteToken');
      expect(response.body).not.toHaveProperty('blackToken');

      // Should have timestamps
      expect(response.body).toHaveProperty('createdAt');
      expect(response.body).toHaveProperty('updatedAt');
    });

    it('should return 404 for non-existent game ID', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      const response = await request(app)
        .get(`/games/${fakeId}`)
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Game not found');
    });

    it('should return 400 for invalid game ID format', async () => {
      const response = await request(app)
        .get('/games/invalid-id')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Invalid game ID format');
    });

    it('should return 400 for malformed UUID', async () => {
      const response = await request(app)
        .get('/games/123-456-789')
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Health check', () => {
    it('should return server health status', async () => {
      const response = await request(app).get('/health').expect('Content-Type', /json/).expect(200);

      expect(response.body).toMatchObject({
        status: 'ok',
      });
      expect(response.body).toHaveProperty('timestamp');
    });
  });

  describe('404 handling', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toBe('Not found');
    });
  });
});
