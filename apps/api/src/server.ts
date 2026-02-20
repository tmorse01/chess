import express, { type Request, type Response, type NextFunction, type Express } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { gamesRouter } from './routes/games.js';
import { setupGameHandlers } from './sockets/game-handler.js';

// Load environment variables
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app: Express = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3001;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    methods: ['GET', 'POST'],
  },
  transports: ['websocket', 'polling'],
});

console.log('[INIT] 🔌 Socket.IO configured');
console.log('[INIT] CORS origin:', CORS_ORIGIN);
console.log('[INIT] Transports:', ['websocket', 'polling']);

// Set up socket event handlers
setupGameHandlers(io);

// Middleware
app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes - mount under /api prefix
app.use('/api/games', gamesRouter);

// Serve static files from web app in production
if (NODE_ENV === 'production') {
  const webDistPath = path.resolve(__dirname, '../../web/dist');

  // Serve static assets
  app.use(express.static(webDistPath));

  // SPA fallback - serve index.html for all other routes
  app.get('*', (_req: Request, res: Response) => {
    res.sendFile(path.join(webDistPath, 'index.html'));
  });
} else {
  // 404 handler for development (API-only mode)
  app.use((_req: Request, res: Response) => {
    res.status(404).json({ error: 'Not found' });
  });
}

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// Start server (only if not in test mode)
if (process.env.NODE_ENV !== 'test') {
  httpServer.listen(PORT, () => {
    console.log('[INIT] ✅ API server running');
    console.log('[INIT] URL: http://localhost:' + PORT);
    console.log('[INIT] Environment:', NODE_ENV);
    console.log('[INIT] 🔌 Socket.IO ready for connections');
    console.log('[INIT] CORS origin:', CORS_ORIGIN);
  });
}

export { app, httpServer, io };
