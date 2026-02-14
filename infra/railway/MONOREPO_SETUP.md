# Railway Monorepo Configuration

This document explains the monorepo setup for Railway deployment and how the configuration files work together.

## Monorepo Structure

```
chess/
├── apps/
│   ├── api/              # Backend service
│   │   └── railway.toml  # API service config
│   └── web/              # Frontend service
│       └── railway.toml  # Web service config
├── packages/
│   └── shared/           # Shared code (must build first)
└── railway.json          # Root project config
```

## How Railway Detects Services (GitHub Import)

When importing from GitHub via Railway UI, Railway does NOT automatically detect multiple services in a monorepo. You must:

1. **Import the repository** (creates one project)
2. **Manually add each service** pointing to its root directory
3. **Configure watch paths** so services only rebuild when relevant files change

## Service Configuration

### API Service (`apps/api/railway.toml`)

```toml
[build]
builder = "NIXPACKS"
buildCommand = "cd ../.. && pnpm install && pnpm -F @chess-app/shared build && pnpm -F api build && pnpm -F api db:migrate"

[deploy]
startCommand = "cd ../.. && pnpm -F api start"
healthcheckPath = "/health"
healthcheckTimeout = 100
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[nixpacks]
nixPkgs = ["nodejs-20_x", "pnpm"]
```

**Key Points**:
- `cd ../..` - Navigate to repo root (Railway starts in `apps/api/`)
- Builds shared package first (dependency)
- Runs migrations automatically
- Health check at `/health` endpoint

### Web Service (`apps/web/railway.toml`)

```toml
[build]
builder = "NIXPACKS"
buildCommand = "cd ../.. && pnpm install && pnpm -F @chess-app/shared build && pnpm -F web build"

[deploy]
staticPublishPath = "dist"

[nixpacks]
nixPkgs = ["nodejs-20_x", "pnpm"]
```

**Key Points**:
- `cd ../..` - Navigate to repo root
- Builds shared package first
- Static site (no start command)
- Serves from `dist/` directory

## Railway UI Configuration

When adding services via GitHub UI, configure:

### API Service Settings
- **Service Name**: `api`
- **Root Directory**: `apps/api`
- **Watch Paths**: 
  - `apps/api/**`
  - `packages/shared/**`

### Web Service Settings
- **Service Name**: `web`
- **Root Directory**: `apps/web`
- **Watch Paths**: 
  - `apps/web/**`
  - `packages/shared/**`

## Why Watch Paths Matter

Watch paths tell Railway which file changes should trigger a rebuild:

```
Change in apps/api/src/server.ts
→ Only rebuilds API service ✅

Change in apps/web/src/App.tsx
→ Only rebuilds Web service ✅

Change in packages/shared/src/types.ts
→ Rebuilds BOTH services ✅
```

Without watch paths, Railway rebuilds ALL services on ANY change. ❌

## Build Order Dependency

**Critical**: The shared package MUST build before other services:

```bash
# ✅ Correct order
pnpm -F @chess-app/shared build    # 1. Build shared
pnpm -F api build                   # 2. API can import from shared
pnpm -F web build                   # 3. Web can import from shared

# ❌ Wrong - will fail
pnpm -F api build                   # Error: Cannot find @chess-app/shared
```

Both `railway.toml` files ensure correct build order.

## Environment Variables

### API Service
```env
# Auto-provided by Railway:
DATABASE_URL=postgresql://...
PORT=3001

# Must set manually:
CORS_ORIGIN=https://your-web-url.railway.app
NODE_ENV=production
```

### Web Service
```env
# Must set manually BEFORE build:
VITE_API_URL=https://your-api-url.railway.app
```

⚠️ **Important**: `VITE_*` variables are compiled at build time. Set before first deploy!

## Common Issues

### Issue: "Cannot find package '@chess-app/shared'"

**Cause**: Build command didn't build shared package first

**Fix**: Verify build command includes:
```bash
pnpm -F @chess-app/shared build
```

### Issue: "Both services rebuild on any change"

**Cause**: Watch paths not configured

**Fix**: Set watch paths in Railway UI:
- API: `apps/api/**`, `packages/shared/**`
- Web: `apps/web/**`, `packages/shared/**`

### Issue: "Build command not found"

**Cause**: Railway not reading `railway.toml`

**Fix**: Ensure:
1. File is named exactly `railway.toml` (not `.toml` or `Railway.toml`)
2. File is in service root directory (`apps/api/` or `apps/web/`)
3. Root Directory setting in Railway UI is correct

### Issue: "pnpm: command not found"

**Cause**: Nixpacks not installing pnpm

**Fix**: Ensure `railway.toml` has:
```toml
[nixpacks]
nixPkgs = ["nodejs-20_x", "pnpm"]
```

## Testing Locally

Test the Railway build commands locally:

```bash
# From repo root

# Test API build
cd apps/api
bash -c "cd ../.. && pnpm install && pnpm -F @chess-app/shared build && pnpm -F api build"

# Test Web build  
cd apps/web
bash -c "cd ../.. && pnpm install && pnpm -F @chess-app/shared build && pnpm -F web build"
```

## Project Structure Best Practices

### ✅ Do This
- Keep service configs in service directories (`apps/api/railway.toml`)
- Use pnpm workspace filters (`-F api`, `-F @chess-app/shared`)
- Build shared dependencies first
- Use relative paths to navigate to root (`cd ../..`)

### ❌ Don't Do This
- Put all config in root (Railway can't detect services)
- Use absolute paths (breaks in Railway environment)
- Build services before shared packages
- Commit `node_modules/` or `.env` files

## Alternative: Railway CLI

If you prefer CLI over UI, you can deploy services directly:

```bash
# Deploy API
cd apps/api
railway up

# Deploy Web
cd apps/web
railway up
```

The `railway.toml` files work for both methods.

## Monorepo with Multiple Apps

This setup easily extends to more services:

```
apps/
├── api/           # Service 1
├── web/           # Service 2  
├── admin/         # Service 3 (add railway.toml)
└── worker/        # Service 4 (add railway.toml)
```

Each service needs:
1. Its own `railway.toml`
2. Manual creation in Railway UI
3. Proper watch paths configured
4. Build commands that navigate to root first

## Further Reading

- [Railway Monorepo Documentation](https://docs.railway.app/guides/monorepo)
- [Railway TOML Reference](https://docs.railway.app/reference/config-as-code)
- [Nixpacks Documentation](https://nixpacks.com/docs)
- [pnpm Workspaces](https://pnpm.io/workspaces)

---

**Summary**: Railway doesn't auto-detect monorepo services when importing from GitHub. You must manually add each service with the correct root directory and watch paths. The `railway.toml` files handle the rest!
