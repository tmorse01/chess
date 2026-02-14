# Railway Deployment Guide

This guide explains how to deploy the Chess App to Railway with automatic CI/CD via GitHub Actions.

## Architecture

- **API Service**: Node.js Express + Socket.IO server (apps/api/)
- **Web Service**: Static site built with Vite (apps/web/)
- **Database**: Railway Postgres plugin

## Deployment Methods

Choose your preferred method:

### 🎯 **[Recommended] GitHub UI Import**
**Best for**: Most users, automatic deployments on push

See **[GITHUB_UI_DEPLOYMENT.md](./GITHUB_UI_DEPLOYMENT.md)** for step-by-step instructions.

- ✅ Easiest setup (click through UI)
- ✅ Automatic deployments on git push
- ✅ Visual service management
- ✅ No CLI needed

### 🔧 **Railway CLI Deployment**
**Best for**: Automation, scripting, CI/CD pipelines

See below for Railway CLI instructions.

- ✅ Direct deployment from command line
- ✅ Scriptable/automatable
- ⚠️ Requires CLI installation

---

## Prerequisites (CLI Method)

1. [Railway account](https://railway.app) (free tier available)
2. Railway CLI installed: `npm install -g @railway/cli`
3. GitHub repository with the chess app code (for auto-deploy)
4. Railway project created (or create during this process)

## Initial Deployment

### 1. Create Railway Project

```bash
# Login to Railway
railway login

# Create new project (or link existing)
railway init
```

### 2. Add Postgres Database

In Railway dashboard:

1. Click "New" → "Database" → "Add PostgreSQL"
2. Database will auto-provision and `DATABASE_URL` will be available

### 3. Deploy API Service

Railway configuration is in `apps/api/railway.toml`.

**Required Environment Variables:**

```bash
# Automatically provided by Railway:
DATABASE_URL=postgresql://...  # Auto-set by Postgres plugin
PORT=3000                       # Auto-set by Railway

# You must set these:
CORS_ORIGIN=https://your-web-app.railway.app
NODE_ENV=production
```

**Set environment variables:**

```bash
# Via CLI
railway variables set CORS_ORIGIN=https://your-web-app.railway.app
railway variables set NODE_ENV=production

# Or via Railway dashboard: Project → Variables
```

**Deploy:**

```bash
cd apps/api
railway up
```

**Build process:**

1. Installs pnpm and Node 20
2. Installs all workspace dependencies
3. Builds shared package
4. Builds API TypeScript to `dist/`
5. Runs database migrations automatically
6. Starts server with `pnpm -F api start`

**Health Check:**

- Endpoint: `/health`
- Returns: `{ status: 'ok', timestamp: '...' }`
- Railway monitors this endpoint for service health

### 4. Deploy Web Service

Railway configuration is in `apps/web/railway.toml`.

**Required Environment Variables:**

```bash
# Must be set BEFORE build (Vite compiles these at build time):
VITE_API_URL=https://your-api-service.railway.app
```

**Important:** Get your API service URL first:

```bash
# In Railway dashboard, copy the API service URL
# Example: https://chess-api-production.up.railway.app
```

**Set environment variables:**

```bash
railway variables set VITE_API_URL=https://your-api-service.railway.app
```

**Deploy:**

```bash
cd apps/web
railway up
```

**Build process:**

1. Installs pnpm and Node 20
2. Installs all workspace dependencies
3. Builds shared package
4. Builds web app with Vite to `dist/`
5. Railway serves static files from `dist/`

### 5. Update CORS

After deploying web service, update API's `CORS_ORIGIN`:

```bash
# Get the web service URL from Railway dashboard
railway variables set CORS_ORIGIN=https://your-actual-web-url.railway.app

# Redeploy API service to pick up new CORS setting
railway up --service api
```

## GitHub Actions CI/CD

Automated testing and deployment via GitHub Actions.

### Setup

1. **Get Railway Token:**

   ```bash
   railway tokens create
   ```

2. **Add to GitHub Secrets:**
   - Go to: `Repository → Settings → Secrets and variables → Actions`
   - Add secret: `RAILWAY_TOKEN` = (token from step 1)

3. **Configure Railway Project/Service IDs:**
   - Get project ID: Check Railway dashboard URL or use `railway status`
   - Add secrets:
     - `RAILWAY_PROJECT_ID`
     - `RAILWAY_API_SERVICE_ID`
     - `RAILWAY_WEB_SERVICE_ID`
     - `RAILWAY_API_URL` (e.g., `https://api.railway.app`)
     - `RAILWAY_WEB_URL` (e.g., `https://web.railway.app`)

### Workflows

#### Test Workflow (`.github/workflows/test.yml`)

**Triggers:**

- Push to any branch
- Pull requests to `main`

**Steps:**

1. Checkout code
2. Install pnpm and dependencies
3. Run linters
4. Run unit tests (all workspaces)
5. Run E2E tests (Playwright)
6. Upload test reports on failure

#### Deploy Workflow (`.github/workflows/deploy.yml`)

**Triggers:**

- Push to `main` branch (after tests pass)

**Steps:**

1. Deploy API service
2. Wait for health check
3. Deploy web service
4. Verify deployment

**Manual trigger:**

```bash
# Via GitHub UI: Actions → Deploy to Railway → Run workflow
```

## Environment Variables Reference

### API Service

| Variable       | Required       | Description                | Example                               |
| -------------- | -------------- | -------------------------- | ------------------------------------- |
| `DATABASE_URL` | ✅ Auto        | Postgres connection string | `postgresql://user:pass@host:5432/db` |
| `PORT`         | ✅ Auto        | Server port                | `3000`                                |
| `CORS_ORIGIN`  | ✅ Manual      | Web app URL for CORS       | `https://chess-web.railway.app`       |
| `NODE_ENV`     | ⚠️ Recommended | Environment mode           | `production`                          |

### Web Service

| Variable       | Required  | Description                  | Example                         |
| -------------- | --------- | ---------------------------- | ------------------------------- |
| `VITE_API_URL` | ✅ Manual | API service URL (build-time) | `https://chess-api.railway.app` |

⚠️ **Important:** `VITE_*` variables are compiled into the build. If you change `VITE_API_URL`, you must redeploy the web service.

## Database Migrations

Migrations run automatically during API deployment via the build command:

```bash
pnpm -F api db:migrate
```

This executes `apps/api/src/db/migrate.ts` which:

- Loads environment variables
- Connects to `DATABASE_URL`
- Runs SQL files from `apps/api/drizzle/` in order
- Is idempotent (safe to run multiple times)

**Manual migration** (if needed):

```bash
railway run pnpm -F api db:migrate
```

## Monorepo Considerations

The app uses pnpm workspaces with:

- `apps/api` - API service
- `apps/web` - Web service
- `packages/shared` - Shared types/schemas

**Key points:**

- Build commands run from repository root (`cd ../..`)
- Shared package must be built before API/web
- All workspace dependencies resolve via pnpm workspace protocol
- Railway builds from service subdirectory but uses root context

## Troubleshooting

### Build Fails: "Cannot find package '@chess-app/shared'"

**Cause:** Shared package not built before API/web
**Fix:** Build command includes `pnpm -F @chess-app/shared build` first

### Runtime Error: "CORS policy error"

**Cause:** `CORS_ORIGIN` doesn't match web app URL
**Fix:**

```bash
railway variables set CORS_ORIGIN=https://actual-web-url.railway.app
railway up --service api
```

### Web App Can't Connect to API

**Cause:** `VITE_API_URL` incorrect or not set before build
**Fix:**

```bash
railway variables set VITE_API_URL=https://actual-api-url.railway.app
railway up --service web  # Rebuild required
```

### Database Connection Error

**Cause:** `DATABASE_URL` not set or Postgres plugin not added
**Fix:** Add Postgres plugin in Railway dashboard, it auto-sets `DATABASE_URL`

### Migrations Don't Run

**Cause:** Migration script fails during build
**Fix:** Check build logs for errors, ensure `DATABASE_URL` is valid

```bash
# Manually run migrations
railway run pnpm -F api db:migrate
```

### Health Check Failing

**Cause:** Server not starting on `$PORT` or `/health` endpoint broken
**Fix:** Check logs with `railway logs --service api`

## Monitoring

**View logs:**

```bash
# API logs
railway logs --service api

# Web logs (build logs, since it's static)
railway logs --service web
```

**View metrics:**

- Railway dashboard → Service → Metrics
- Shows CPU, memory, network usage

## Cost Optimization

**Free Tier Limits:**

- $5 free credit/month
- Includes Postgres database
- Automatic sleep after inactivity (configurable)

**Tips:**

- Use Railway's starter plan for low-traffic apps
- API service uses minimal resources (~50MB RAM)
- Web service is static (no runtime cost after build)
- Database size should stay small for chess games

## Local Testing of Production Build

Before deploying, test production builds locally:

```bash
# Build everything
pnpm build

# Test API production build
cd apps/api
DATABASE_URL=postgresql://localhost:5432/chess pnpm start

# Test web production build with preview server
cd apps/web
pnpm preview
```

## Rollback Strategy

**Via Railway Dashboard:**

1. Go to service → Deployments
2. Click "Rollback" on previous successful deployment

**Via CLI:**

```bash
railway rollback
```

## Next Steps

- [ ] Set up custom domain (Railway supports this)
- [ ] Add monitoring/alerting (Railway integrates with Datadog, etc.)
- [ ] Configure automatic backups for Postgres
- [ ] Add staging environment (duplicate Railway project)
- [ ] Set up log aggregation (Railway → external service)

## Resources

- [Railway Docs](https://docs.railway.app)
- [Nixpacks Configuration](https://nixpacks.com/docs/configuration/file)
- [Railway CLI Reference](https://docs.railway.app/develop/cli)
