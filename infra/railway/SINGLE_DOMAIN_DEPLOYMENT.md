# Single Domain Railway Deployment Guide

This guide explains how to deploy your chess app monorepo to Railway with:

- **Root domain** (`https://chess-app.up.railway.app/`) → Web app
- **API path** (`https://chess-app.up.railway.app/api`) → API endpoints

## Architecture

```
┌─────────────────────────────────────────┐
│  Railway Service (Single Node)          │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │  Express Server (Port 3001)        │ │
│  │                                    │ │
│  │  /api/*  → API Routes             │ │
│  │  /*      → Static Web App (SPA)   │ │
│  │                                    │ │
│  │  Socket.IO on same server          │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## How It Works

1. **Express Server** serves both API and web app
2. **API routes** are mounted under `/api` prefix
3. **Static files** from `apps/web/dist` are served at root
4. **Socket.IO** runs on the same server (same origin)
5. **Production mode** automatically enables static file serving

## Railway Configuration

### 1. Create Railway Service

In Railway dashboard:

1. Click **"New Project"** → Import from GitHub
2. Select your repository
3. Railway will create a single service

### 2. Set Environment Variables

In your Railway service settings, add these variables:

```bash
# Database (from Railway Postgres plugin)
DATABASE_URL=postgresql://...  # Auto-populated if you add Postgres

# Node Environment
NODE_ENV=production

# CORS Origin (your custom domain)
CORS_ORIGIN=https://chess-app.up.railway.app

# Port (Railway provides this automatically)
PORT=${{PORT}}
```

**Important:** Do NOT set `VITE_API_URL` in Railway. The web app uses `/api` in production.

### 3. Configure Custom Domain

1. In Railway service settings, go to **"Settings"** → **"Domains"**
2. Click **"Custom Domain"**
3. Add: `chess-app.up.railway.app`
4. Update your DNS provider with Railway's CNAME record

### 4. Deploy

Railway will automatically:

1. Run `nixpacks.toml` build commands
2. Build shared package, web app, and API
3. Run database migrations
4. Start the Express server

The start command from `nixpacks.toml`:

```bash
pnpm --filter @chess-app/api run db:migrate && pnpm --filter @chess-app/api start
```

## What Changed in Code

### 1. Express Server (`apps/api/src/server.ts`)

- API routes now mounted at `/api` prefix:

  ```typescript
  app.use('/api/games', gamesRouter);
  ```

- Static file serving in production:
  ```typescript
  if (NODE_ENV === 'production') {
    app.use(express.static(webDistPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(webDistPath, 'index.html'));
    });
  }
  ```

### 2. Web App API Calls

All files updated to use `/api` prefix in production:

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API_BASE = import.meta.env.PROD ? '/api' : API_URL;

// Use API_BASE for all fetch calls
fetch(`${API_BASE}/games`);
```

Files changed:

- `apps/web/src/pages/Home.tsx`
- `apps/web/src/hooks/useChessGame.ts`
- `apps/web/src/components/MoveHistory.tsx`
- `apps/web/src/components/GameInfo.tsx`

### 3. Socket.IO Connection

In production, Socket.IO uses same origin (no separate URL):

```typescript
const SOCKET_URL = import.meta.env.PROD ? window.location.origin : API_URL;
io(SOCKET_URL);
```

## Local Development

Local development works as before with separate ports:

1. **API Server**: `http://localhost:4000`

   ```bash
   pnpm --filter @chess-app/api dev
   ```

2. **Web App**: `http://localhost:5173`
   ```bash
   pnpm --filter @chess-app/web dev
   ```

The web app uses `VITE_API_URL` environment variable in development:

```bash
# apps/web/.env.local
VITE_API_URL=http://localhost:4000
```

## Testing Production Build Locally

To test the production setup locally:

1. Build all packages:

   ```bash
   pnpm --filter @chess-app/shared build
   pnpm --filter @chess-app/web build
   pnpm --filter @chess-app/api build
   ```

2. Set environment variables:

   ```bash
   $env:NODE_ENV="production"
   $env:CORS_ORIGIN="http://localhost:3001"
   ```

3. Start API server (serves web app too):

   ```bash
   pnpm --filter @chess-app/api start
   ```

4. Visit: `http://localhost:3001`

## Verifying Deployment

After deployment, verify:

1. **Root domain loads web app**:
   - Visit: `https://chess-app.up.railway.app/`
   - Should show chess game homepage

2. **API works**:
   - Visit: `https://chess-app.up.railway.app/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

3. **Create game works**:
   - Click "Create New Game" on homepage
   - Check browser Network tab for `/api/games` POST request

4. **Socket.IO connects**:
   - Join a game
   - Check browser console for "Socket connected" messages

## Troubleshooting

### CORS Errors

If you see CORS errors:

- Ensure `CORS_ORIGIN` matches your custom domain exactly
- Check Railway environment variables

### 404 on API Calls

If `/api/games` returns 404:

- Check Express routes are mounted at `/api` prefix
- Verify build succeeded (check Railway logs)

### Static Files Not Found

If root domain shows 404:

- Verify `apps/web/dist` folder exists after build
- Check Railway build logs for "Web dist not found"
- Ensure `NODE_ENV=production` is set

### Socket.IO Connection Fails

If Socket.IO can't connect:

- Check that CORS_ORIGIN includes your domain
- Verify WebSocket transport is working
- Check Railway logs for connection errors

## Benefits of Single Domain Setup

✅ **No CORS issues** - Same origin for API and web app  
✅ **Simplified deployment** - One service to manage  
✅ **Lower cost** - Single Railway service instead of two  
✅ **Better performance** - No cross-domain requests  
✅ **Easier SSL** - Single certificate for everything  
✅ **Simpler routing** - Clear URL structure

## Alternative: Multiple Services

If you prefer separate services (costs more):

1. Deploy API service separately
2. Deploy Web service as static site
3. Set `VITE_API_URL` to API domain in web service
4. Configure CORS on API to allow web domain

This single domain approach is recommended for most deployments.
