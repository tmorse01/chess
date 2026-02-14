# Phase 11 Complete: Railway Deployment

**Status:** ✅ Complete  
**Date:** February 14, 2026

## Overview

Phase 11 implements complete production deployment infrastructure for Railway with automated CI/CD via GitHub Actions. The app can now be deployed to production with automatic testing, migrations, and health checks.

## Implementation Summary

### 1. Railway Configuration Files

**API Service** ([apps/api/railway.toml](../apps/api/railway.toml)):

- Nixpacks builder with Node 20 and pnpm
- Build command: Install dependencies → Build shared → Build API → Run migrations
- Start command: `pnpm -F api start`
- Health check: `/health` endpoint
- Automatic restart on failure

**Web Service** ([apps/web/railway.toml](../apps/web/railway.toml)):

- Nixpacks builder with Node 20 and pnpm
- Build command: Install dependencies → Build shared → Build web
- Static site deployment from `dist/` folder
- No runtime server needed (Vite static build)

### 2. Deployment Documentation

**Comprehensive Guide** ([infra/railway/README.md](../infra/railway/README.md)):

- Step-by-step Railway deployment instructions
- Environment variable configuration
- GitHub Actions CI/CD setup
- Troubleshooting guide
- Monorepo considerations
- Health check and monitoring setup
- Cost optimization tips

### 3. GitHub Actions CI/CD Pipelines

**Test Workflow** ([.github/workflows/test.yml](../.github/workflows/test.yml)):

- Triggers: All pushes and PRs to main
- Spins up PostgreSQL service container
- Installs dependencies with pnpm
- Runs linters across all workspaces
- Builds shared package, API, and web
- Executes database migrations
- Runs unit tests with coverage
- Installs Playwright browsers
- Runs E2E test suite
- Uploads test reports on failure

**Deploy Workflow** ([.github/workflows/deploy.yml](../.github/workflows/deploy.yml)):

- Triggers: Push to main (after tests pass)
- Manual trigger available via workflow_dispatch
- Deploys API service first
- Waits for API health check (30 attempts, 10s intervals)
- Deploys web service
- Verifies web accessibility
- Generates deployment summary

### 4. Production Environment Templates

**API Environment** ([apps/api/.env.production.example](../apps/api/.env.production.example)):

```env
DATABASE_URL=postgresql://...    # Auto from Railway Postgres
PORT=3000                         # Auto from Railway
CORS_ORIGIN=https://...          # Manual - web app URL
NODE_ENV=production               # Manual - recommended
```

**Web Environment** ([apps/web/.env.production.example](../apps/web/.env.production.example)):

```env
VITE_API_URL=https://...         # Manual - API service URL (build-time!)
```

### 5. Enhanced Development Configuration

**Updated Local `.env` Files**:

- Added production deployment notes
- Clarified Railway auto-provided variables
- Linked to production templates

**Root Package.json** ([package.json](../package.json)):

- Added `build:prod` script for production builds
- Sets `NODE_ENV=production` during build

**Root Railway Config** ([railway.json](../railway.json)):

- Shared Railway configuration
- Nixpacks builder specification
- Restart policy configuration

## Key Features

### Monorepo Support

- ✅ Build commands run from repository root
- ✅ Shared package built before services
- ✅ Workspace dependencies properly resolved
- ✅ Both services reference correct paths

### Automatic Database Migrations

- ✅ Migrations run during API build process
- ✅ Idempotent (safe to run multiple times)
- ✅ Fail-fast on migration errors
- ✅ No manual intervention required

### Health Checks & Monitoring

- ✅ API `/health` endpoint configured
- ✅ Railway monitors endpoint automatically
- ✅ Automatic restart on failures (max 10 retries)
- ✅ Deploy workflow verifies health before proceeding

### CI/CD Integration

- ✅ Automated testing on every push
- ✅ Tests must pass before deployment allowed
- ✅ E2E tests run in CI environment
- ✅ Automatic deployment to Railway on main branch
- ✅ Deployment status in GitHub UI

### Static Site Optimization

- ✅ Web service is fully static (no Node runtime needed)
- ✅ Vite optimizes build for production
- ✅ Railway serves static files efficiently
- ✅ Low resource usage and cost

## Architecture Decisions

### Why Railway Nixpacks Instead of Dockerfiles?

- **Simpler configuration**: Less boilerplate than Dockerfile
- **Automatic optimization**: Railway optimizes build automatically
- **Easier maintenance**: No Docker expertise required
- **Faster iteration**: Changes via TOML files, not rebuilding images

### Why Static Site for Web Service?

- **No server needed**: Vite builds static HTML/CSS/JS
- **Lower cost**: No runtime resource usage
- **Faster serving**: Railway CDN for static files
- **Security**: No server attack surface

### Why Migrations in Build Command?

- **Automatic setup**: No manual database initialization
- **Always in sync**: Schema matches deployed code
- **Safe**: Idempotent migrations prevent issues
- **Simple**: One-step deployment process

### Why CI/CD with GitHub Actions?

- **Quality gate**: Prevents broken code from deploying
- **Transparency**: Test results visible in PRs
- **Automation**: Deployment on merge to main
- **Cost**: Free for public repos, generous free tier

## Deployment Workflow

### Initial Setup (One-time)

1. Create Railway project
2. Add PostgreSQL plugin
3. Deploy API service
4. Copy API URL
5. Deploy web service with `VITE_API_URL` set
6. Update API's `CORS_ORIGIN` to web URL
7. Configure GitHub secrets for CI/CD

### Subsequent Deployments (Automatic)

1. Push code to feature branch → Tests run automatically
2. Create PR to main → Tests run again
3. Merge PR → Deploy workflow triggers
4. API deploys → Migrations run → Health check passes
5. Web deploys → Verification passes
6. Done! 🎉

## Environment Variables

### API Service (Railway Dashboard)

| Variable     | Source                 | Example                         |
| ------------ | ---------------------- | ------------------------------- |
| DATABASE_URL | Auto (Postgres plugin) | `postgresql://...`              |
| PORT         | Auto (Railway)         | `3000`                          |
| CORS_ORIGIN  | Manual                 | `https://chess-web.railway.app` |
| NODE_ENV     | Manual                 | `production`                    |

### Web Service (Railway Dashboard)

| Variable     | Source                 | Example                         |
| ------------ | ---------------------- | ------------------------------- |
| VITE_API_URL | Manual (before build!) | `https://chess-api.railway.app` |

⚠️ **Critical**: `VITE_*` variables are **compiled at build time**. Changing them requires redeploying.

## GitHub Secrets (Required for CI/CD)

Configure in: `Repository → Settings → Secrets and variables → Actions`

| Secret Name            | Description       | How to Get              |
| ---------------------- | ----------------- | ----------------------- |
| RAILWAY_TOKEN          | Railway API token | `railway tokens create` |
| RAILWAY_API_SERVICE_ID | API service ID    | Railway dashboard URL   |
| RAILWAY_WEB_SERVICE_ID | Web service ID    | Railway dashboard URL   |
| RAILWAY_API_URL        | Deployed API URL  | Railway dashboard       |
| RAILWAY_WEB_URL        | Deployed web URL  | Railway dashboard       |

## Verification Checklist

### ✅ Configuration Files Created

- [x] `apps/api/railway.toml` - API service config
- [x] `apps/web/railway.toml` - Web service config
- [x] `infra/railway/README.md` - Deployment documentation
- [x] `.github/workflows/test.yml` - Test pipeline
- [x] `.github/workflows/deploy.yml` - Deploy pipeline
- [x] `apps/api/.env.production.example` - API production template
- [x] `apps/web/.env.production.example` - Web production template
- [x] `railway.json` - Root Railway config

### ✅ Package Scripts Updated

- [x] Root `package.json` has `build:prod` script
- [x] Local `.env.example` files have production notes

### ✅ Documentation Updated

- [x] Main `README.md` includes deployment section
- [x] Phase 11 marked complete in README
- [x] Railway deployment guide comprehensive
- [x] GitHub Actions setup documented

### ⏳ Pending Manual Steps (Not in Scope)

- [ ] Create Railway account
- [ ] Deploy to Railway (optional)
- [ ] Configure GitHub secrets (if using CI/CD)
- [ ] Test production deployment end-to-end

## Testing Recommendations

Before production deployment:

1. **Test builds locally:**

   ```bash
   pnpm build:prod
   ```

2. **Test API production mode:**

   ```bash
   cd apps/api
   DATABASE_URL=postgresql://localhost:5432/chess pnpm start
   ```

3. **Test web production build:**

   ```bash
   cd apps/web
   pnpm preview
   ```

4. **Verify migrations:**

   ```bash
   pnpm -F api db:migrate
   ```

5. **Run full test suite:**
   ```bash
   pnpm test:all
   ```

## Next Steps (Post-Deployment)

After deploying to Railway:

1. **Set up custom domain** (if desired)
   - Railway supports custom domains
   - Update `CORS_ORIGIN` after changing domain

2. **Configure monitoring**
   - Railway provides basic metrics
   - Consider external monitoring (Datadog, etc.)

3. **Set up database backups**
   - Railway Postgres includes backups
   - Configure retention policy

4. **Create staging environment**
   - Duplicate Railway project
   - Use separate GitHub branch

5. **Optimize costs**
   - Monitor Railway usage
   - Adjust sleep settings if needed

## Troubleshooting

Common issues and solutions documented in [infra/railway/README.md](../infra/railway/README.md):

- Build failures (missing shared package)
- CORS errors (mismatched origins)
- API connection failures (wrong VITE_API_URL)
- Database connection errors (missing plugin)
- Migration failures (DATABASE_URL issues)
- Health check failures (port configuration)

## Success Metrics

Phase 11 is considered complete when:

- ✅ Railway configuration files exist and are valid
- ✅ Deployment documentation is comprehensive
- ✅ GitHub Actions workflows are implemented
- ✅ Environment templates are created
- ✅ Package scripts support production builds
- ✅ Main README includes deployment information
- ✅ All configuration uses nixpacks (not Dockerfiles)
- ✅ Migrations run automatically during deployment
- ✅ CI/CD pipeline prevents broken deployments

**All criteria met!** ✅

## Notes

- **No actual Railway deployment performed**: Configuration ready but deployment is optional
- **GitHub Actions ready**: Workflows configured but require GitHub secrets to run
- **Fully documented**: Complete guide enables anyone to deploy successfully
- **Production-ready**: All best practices followed for Railway deployment

---

**Phase 11 Complete!** 🚀

The chess app is now fully configured for production deployment on Railway with automated CI/CD. All 11 phases of the implementation plan are complete.
