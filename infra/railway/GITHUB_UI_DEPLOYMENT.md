# Deploying to Railway via GitHub UI Import

This guide covers deploying the chess app by importing your GitHub repository directly through Railway's UI (the easiest method).

## Overview

Railway's GitHub import feature automatically:
- Connects to your GitHub repository
- Detects changes and auto-deploys on push
- Manages environment variables per service
- Handles build and deployment

## Prerequisites

- GitHub repository with the chess app code
- Railway account ([sign up free](https://railway.app))
- Repository pushed to GitHub

## Step-by-Step Deployment

### 1. Create Railway Project from GitHub

1. **Log in to Railway**: Go to [railway.app](https://railway.app)

2. **New Project**: Click "New Project"

3. **Deploy from GitHub repo**:
   - Click "Deploy from GitHub repo"
   - Authorize Railway to access your GitHub (if first time)
   - Select your chess app repository

4. **⚠️ Important - Monorepo Setup**:
   Railway will detect the repository but won't automatically know it's a monorepo with 2 services. You'll need to add services manually.

### 2. Add PostgreSQL Database

**Before adding services**, add the database:

1. In your project, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will provision a Postgres instance
3. `DATABASE_URL` will be automatically available to all services

### 3. Add API Service

1. **Add Service**:
   - Click **"New"** → **"GitHub Repo"**
   - Select your chess app repo again
   - Railway creates a new service

2. **Configure Service**:
   - Click on the service
   - Go to **"Settings"** tab
   - Set **Service Name**: `api`
   - Set **Root Directory**: `apps/api`
   - Set **Watch Paths**: `apps/api/**`, `packages/shared/**`

3. **Set Environment Variables**:
   - Go to **"Variables"** tab
   - Railway auto-provides: `DATABASE_URL`, `PORT`
   - Add manually:
     ```
     CORS_ORIGIN=https://your-web-service-url.railway.app
     NODE_ENV=production
     ```
   - ⚠️ You'll update `CORS_ORIGIN` after deploying web service

4. **Verify Build Settings** (should auto-detect from `railway.toml`):
   - **Build Command**: `cd ../.. && pnpm install && pnpm -F @chess-app/shared build && pnpm -F api build && pnpm -F api db:migrate`
   - **Start Command**: `cd ../.. && pnpm -F api start`
   - **Health Check Path**: `/health`

5. **Deploy**: Click **"Deploy"** or wait for auto-deploy

6. **Get API URL**:
   - Go to **"Settings"** → **"Networking"**
   - Copy the public domain (e.g., `https://api-production-xxxx.up.railway.app`)

### 4. Add Web Service

1. **Add Service**:
   - Click **"New"** → **"GitHub Repo"**
   - Select your chess app repo again
   - Railway creates another service

2. **Configure Service**:
   - Click on the service
   - Go to **"Settings"** tab
   - Set **Service Name**: `web`
   - Set **Root Directory**: `apps/web`
   - Set **Watch Paths**: `apps/web/**`, `packages/shared/**`

3. **Set Environment Variables** (BEFORE FIRST BUILD):
   - Go to **"Variables"** tab
   - Add:
     ```
     VITE_API_URL=https://your-api-service-url.railway.app
     ```
   - ⚠️ Use the actual API URL from step 3.6
   - ⚠️ This MUST be set before building (Vite compiles it at build time)

4. **Verify Build Settings** (should auto-detect from `railway.toml`):
   - **Build Command**: `cd ../.. && pnpm install && pnpm -F @chess-app/shared build && pnpm -F web build`
   - **Static Output Directory**: `dist`

5. **Deploy**: Click **"Deploy"** or wait for auto-deploy

6. **Get Web URL**:
   - Go to **"Settings"** → **"Networking"**  
   - Copy the public domain (e.g., `https://web-production-xxxx.up.railway.app`)

### 5. Update API CORS Settings

Now that you have the web URL:

1. Go back to **API service**
2. Go to **"Variables"** tab
3. Update `CORS_ORIGIN` to the actual web URL from step 4.6
4. Railway will automatically redeploy the API service

### 6. Verify Deployment

1. **Check API Health**:
   - Visit: `https://your-api-url.railway.app/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

2. **Check Web App**:
   - Visit your web URL
   - Should see the chess game home page

3. **Test Functionality**:
   - Click "Create Game"
   - Share links should work
   - Test making moves
   - Verify real-time updates work

## Configuration Files Reference

Railway reads these config files from your repo:

### Root: `railway.json`
- Shared project settings
- Restart policies

### API: `apps/api/railway.toml`
```toml
[build]
buildCommand = "cd ../.. && pnpm install && pnpm -F @chess-app/shared build && pnpm -F api build && pnpm -F api db:migrate"

[deploy]
startCommand = "cd ../.. && pnpm -F api start"
healthcheckPath = "/health"
```

### Web: `apps/web/railway.toml`
```toml
[build]
buildCommand = "cd ../.. && pnpm install && pnpm -F @chess-app/shared build && pnpm -F web build"

[deploy]
staticPublishPath = "dist"
```

## Automatic Deployments from GitHub

Once set up, Railway automatically deploys when you push to GitHub:

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Railway detects changes**:
   - Checks watch paths for each service
   - Rebuilds only affected services
   - Deploys automatically

3. **Monitor in Railway**:
   - Go to project dashboard
   - See deployment status in real-time
   - View build logs

## Environment Variables Summary

### API Service Variables

| Variable | Type | Value |
|----------|------|-------|
| `DATABASE_URL` | Auto | Provided by Postgres plugin |
| `PORT` | Auto | Provided by Railway |
| `CORS_ORIGIN` | Manual | `https://your-web-url.railway.app` |
| `NODE_ENV` | Manual | `production` |

### Web Service Variables

| Variable | Type | Value |
|----------|------|-------|
| `VITE_API_URL` | Manual | `https://your-api-url.railway.app` |

## Monorepo Watch Paths

Setting watch paths ensures each service only rebuilds when relevant files change:

**API Service Watch Paths**:
- `apps/api/**`
- `packages/shared/**`

**Web Service Watch Paths**:
- `apps/web/**`
- `packages/shared/**`

This prevents unnecessary rebuilds when you only change one service.

## Troubleshooting

### "Build failed: Cannot find module '@chess-app/shared'"

**Cause**: Build command not running from root or shared package not built first

**Fix**: Verify Root Directory is set correctly and build command includes:
```bash
cd ../.. && pnpm install && pnpm -F @chess-app/shared build
```

### "Web app can't connect to API"

**Cause**: `VITE_API_URL` not set correctly or set after build

**Fix**:
1. Check Variables tab in web service
2. Ensure URL is correct (no trailing slash)
3. Redeploy web service to rebuild with correct URL

### "CORS error when loading web app"

**Cause**: `CORS_ORIGIN` in API doesn't match web URL

**Fix**:
1. Go to API service Variables
2. Update `CORS_ORIGIN` to exact web URL
3. API will auto-redeploy

### "Service won't start" / "Build succeeds but deploy fails"

**Cause**: Start command might be incorrect

**Fix**: Check Settings → Deploy for correct start command:
- API: `cd ../.. && pnpm -F api start`
- Web: Should be static site (no start command needed)

### "Changes not deploying"

**Cause**: Watch paths might not include changed files

**Fix**: Verify Settings → Watch Paths includes:
- `apps/api/**` or `apps/web/**` (depending on service)
- `packages/shared/**` (both services)

### "Migration errors"

**Cause**: DATABASE_URL not available during build

**Fix**: 
1. Ensure Postgres plugin is added to project
2. Verify DATABASE_URL appears in API service variables
3. Check build logs for specific migration error

## Managing Deployments

### View Logs

1. Click on service
2. Go to **"Deployments"** tab
3. Click on a deployment to see logs
4. Or go to **"Observability"** for live logs

### Rollback

1. Go to **"Deployments"** tab
2. Find a previous successful deployment
3. Click **"Redeploy"**

### Manual Redeploy

1. Go to **"Deployments"** tab
2. Click **"Redeploy"** on latest deployment
3. Or go to **"Settings"** → click **"Redeploy"**

## Adding Custom Domain

1. Go to web service
2. **"Settings"** → **"Networking"** → **"Custom Domain"**
3. Add your domain (e.g., `chess.yourdomain.com`)
4. Update DNS records as instructed
5. Update `CORS_ORIGIN` in API service to match new domain
6. Optionally add custom domain to API service too

## Cost Estimation

**Railway Free Tier**:
- $5 free credit per month
- Includes PostgreSQL database
- Good for hobby projects and testing

**Typical Usage for Chess App**:
- API: ~$3-5/month (with light traffic)
- Web: Minimal (static hosting)
- Postgres: ~$5/month
- **Total**: ~$8-10/month (beyond free tier)

**Optimization Tips**:
- Set sleep settings for inactive services
- Use smaller Postgres instance for development
- Monitor usage in Railway dashboard

## Differences from CLI Deployment

### GitHub UI Import (This Guide)
✅ Easier initial setup (click through UI)  
✅ Automatic deployments on git push  
✅ Visual service management  
✅ No CLI installation needed  
⚠️ Manual service creation for monorepos  
⚠️ Must configure watch paths manually  

### Railway CLI Deployment
✅ Direct deployment from command line  
✅ Faster for single service deploys  
✅ Better for scripting/automation  
⚠️ Requires CLI installation  
⚠️ Less visual feedback  

**Recommendation**: Use GitHub UI import for initial setup, then manage via UI or CLI as preferred.

## Next Steps

After successful deployment:

- [ ] Test full game flow in production
- [ ] Set up custom domain (optional)
- [ ] Configure GitHub Actions for testing before deploy (see [deploy.yml](../../.github/workflows/deploy.yml))
- [ ] Set up monitoring/alerts
- [ ] Configure database backups
- [ ] Add staging environment (duplicate project)

## Support Resources

- [Railway Documentation](https://docs.railway.app)
- [Railway Discord](https://discord.gg/railway)
- [Monorepo Guide](https://docs.railway.app/guides/monorepo)
- [GitHub Integration](https://docs.railway.app/guides/github)

---

**Happy Deploying!** 🚀

Your chess app will be live and automatically deploying on every push to GitHub.
