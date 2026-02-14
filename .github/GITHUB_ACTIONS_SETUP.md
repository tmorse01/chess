# GitHub Actions Secrets Setup Guide

This guide explains how to configure GitHub secrets for the automated CI/CD deployment pipeline.

## Prerequisites

- GitHub repository with the chess app code
- Railway account and project created
- Railway services deployed (API and Web)
- Railway CLI installed: `npm install -g @railway/cli`

## Required Secrets

Configure these in: `Repository → Settings → Secrets and variables → Actions → New repository secret`

### 1. RAILWAY_TOKEN

**What:** Authentication token for Railway CLI

**How to get:**

```bash
railway login
railway tokens create
```

Copy the generated token.

**Add to GitHub:**

- Name: `RAILWAY_TOKEN`
- Value: (paste token from above)

---

### 2. RAILWAY_API_SERVICE_ID

**What:** Unique identifier for your API service in Railway

**How to get:**

**Option A - From Railway Dashboard:**

1. Open your Railway project
2. Click on the API service
3. Look at the URL: `https://railway.app/project/{PROJECT_ID}/service/{SERVICE_ID}`
4. Copy the `SERVICE_ID` part

**Option B - From Railway CLI:**

```bash
cd apps/api
railway status
# Look for "Service: <service-id>"
```

**Add to GitHub:**

- Name: `RAILWAY_API_SERVICE_ID`
- Value: (paste service ID)

---

### 3. RAILWAY_WEB_SERVICE_ID

**What:** Unique identifier for your Web service in Railway

**How to get:**

Same as API service, but for the web service:

**Option A - From Railway Dashboard:**

1. Open your Railway project
2. Click on the Web service
3. Look at the URL and copy the service ID

**Option B - From Railway CLI:**

```bash
cd apps/web
railway status
```

**Add to GitHub:**

- Name: `RAILWAY_WEB_SERVICE_ID`
- Value: (paste service ID)

---

### 4. RAILWAY_API_URL

**What:** Public URL where your API is deployed

**How to get:**

**From Railway Dashboard:**

1. Click on your API service
2. Go to "Settings" tab
3. Look for "Domains" section
4. Copy the generated domain (e.g., `https://chess-api-production.up.railway.app`)

Make sure to include `https://` and no trailing slash.

**Add to GitHub:**

- Name: `RAILWAY_API_URL`
- Value: `https://your-api-service.railway.app`

---

### 5. RAILWAY_WEB_URL

**What:** Public URL where your Web app is deployed

**How to get:**

Same as API URL, but for the web service:

1. Click on your Web service in Railway dashboard
2. Go to "Settings" → "Domains"
3. Copy the generated domain

**Add to GitHub:**

- Name: `RAILWAY_WEB_URL`
- Value: `https://your-web-service.railway.app`

---

## Verification

After adding all secrets, you can verify they're configured correctly:

1. Go to: `Repository → Settings → Secrets and variables → Actions`
2. You should see 5 secrets:
   - RAILWAY_TOKEN
   - RAILWAY_API_SERVICE_ID
   - RAILWAY_WEB_SERVICE_ID
   - RAILWAY_API_URL
   - RAILWAY_WEB_URL

## Testing the CI/CD Pipeline

### Test the Test Workflow

The test workflow runs on every push automatically:

```bash
git add .
git commit -m "test: trigger CI/CD pipeline"
git push
```

Check: `Repository → Actions → Test` - workflow should run

### Test the Deploy Workflow

The deploy workflow runs **only on pushes to main**:

```bash
# Make sure you're on main branch
git checkout main
git add .
git commit -m "feat: trigger deployment"
git push origin main
```

Check: `Repository → Actions → Deploy to Railway` - workflow should run

**Manual trigger:**

1. Go to: `Repository → Actions → Deploy to Railway`
2. Click "Run workflow"
3. Select branch and click "Run workflow"

## Workflow Behavior

### Test Workflow (`.github/workflows/test.yml`)

- ✅ Runs on all branches
- ✅ Runs on pull requests to main
- ✅ Does NOT deploy anything
- ✅ Fails fast if tests don't pass
- ✅ Uploads test reports on failure

### Deploy Workflow (`.github/workflows/deploy.yml`)

- ✅ Runs only on push to `main`
- ✅ Requires test workflow to pass first
- ✅ Deploys API service first
- ✅ Waits for API health check
- ✅ Then deploys web service
- ✅ Verifies web accessibility
- ✅ Can be manually triggered

## Troubleshooting

### "Error: RAILWAY_TOKEN is not set"

- Make sure the secret name is exactly `RAILWAY_TOKEN` (case-sensitive)
- Regenerate token if expired: `railway tokens create`

### "Error: railway up failed"

- Check service IDs are correct
- Ensure Railway project exists and services are created
- Verify Railway token has correct permissions

### "API health check failed"

- API might be starting slowly (workflow waits up to 5 minutes)
- Check API logs in Railway dashboard
- Verify `/health` endpoint works locally

### "Web deployment verification failed"

- Web might be starting slowly (workflow waits 30 seconds)
- Check web build logs in Railway dashboard
- Verify `VITE_API_URL` is set correctly in Railway

### Secrets not updating

- Secrets are cached for a few minutes
- You may need to re-run the workflow after updating secrets
- Make a new commit to trigger fresh workflow run

## Security Best Practices

- ✅ Never commit secrets to repository
- ✅ Don't share Railway tokens publicly
- ✅ Rotate tokens if compromised
- ✅ Use repository secrets (not environment secrets) for private repos
- ✅ Use environment secrets for public repos with required reviewers

## Additional Configuration (Optional)

### Branch Protection Rules

To prevent deploying broken code:

1. Go to: `Repository → Settings → Branches`
2. Add rule for `main` branch
3. Enable: "Require status checks to pass before merging"
4. Select: "Run Tests" check
5. Save

Now PRs to main must pass tests before merging!

### Environments

For better control:

1. Go to: `Repository → Settings → Environments`
2. Create "production" environment
3. Add environment secrets (instead of repository secrets)
4. Configure required reviewers for manual approval

Update `.github/workflows/deploy.yml`:

```yaml
deploy:
  environment: production # Add this line
  needs: test
  # ... rest of workflow
```

---

**Setup Complete!** 🎉

Your CI/CD pipeline is now configured. Every push to `main` will automatically test and deploy your chess app to Railway.
