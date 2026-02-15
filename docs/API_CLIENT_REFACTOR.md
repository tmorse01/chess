# API Client Refactoring Summary

## Overview

Centralized all API URL references and replaced fetch() calls with a reusable axios-based API client.

## Changes Made

### 1. Created Centralized API Client

**File:** [apps/web/src/lib/api-client.ts](apps/web/src/lib/api-client.ts)

- ✅ Installed axios as dependency
- ✅ Created `apiClient` instance with automatic base URL detection:
  - **Production**: `/api` (same domain)
  - **Development**: `http://localhost:4000` (or `VITE_API_URL`)
- ✅ Created `getSocketUrl()` helper for Socket.IO connections
- ✅ Created type-safe `api` object with endpoint methods:
  - `api.games.create()` - Create new game
  - `api.games.getById(gameId)` - Get game state
  - `api.games.getMoves(gameId)` - Get move history

### 2. Updated All Components to Use API Client

**Files Updated:**

- [apps/web/src/pages/Home.tsx](apps/web/src/pages/Home.tsx)
- [apps/web/src/hooks/useChessGame.ts](apps/web/src/hooks/useChessGame.ts)
- [apps/web/src/components/MoveHistory.tsx](apps/web/src/components/MoveHistory.tsx)
- [apps/web/src/components/GameInfo.tsx](apps/web/src/components/GameInfo.tsx)

**Changes:**

- ❌ Removed scattered `API_URL` and `API_BASE` constants
- ❌ Replaced all `fetch()` calls with `api.*` methods
- ✅ Cleaner, more maintainable code
- ✅ Automatic error handling from axios
- ✅ Type safety with TypeScript

### 3. Updated Tests

**File:** [apps/web/src/pages/Home.test.tsx](apps/web/src/pages/Home.test.tsx)

- ❌ Removed `global.fetch` mocking
- ✅ Added `vi.mock('@/lib/api-client')` for axios mocking
- ✅ All 5 tests passing

## Benefits

### Before (Scattered everywhere):

```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
const API_BASE = import.meta.env.PROD ? '/api' : API_URL;

const response = await fetch(`${API_BASE}/games`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
});
if (!response.ok) throw new Error('Failed');
const data = await response.json();
```

### After (Clean & centralized):

```typescript
import { api } from '@/lib/api-client';

const data = await api.games.create();
```

### Key Improvements:

✅ **Single source of truth** - API configuration in one place  
✅ **Type safety** - Full TypeScript support  
✅ **Cleaner code** - No repetitive fetch boilerplate  
✅ **Better error handling** - Axios automatic error handling  
✅ **Easier testing** - Mock one module instead of many  
✅ **Maintainability** - Change API logic in one place

## Configuration

### Environment Variables

```bash
# Development (optional, defaults to localhost:4000)
VITE_API_URL=http://localhost:4000

# Production (automatic, no config needed)
# API routes are at /api relative to deployed domain
```

### Socket.IO URLs

- **Production**: Same origin (`window.location.origin`)
- **Development**: `VITE_API_URL` or `http://localhost:4000`

## Testing

All tests passing:

```
✓ src/pages/Home.test.tsx (5)
  ✓ should render the home page with create game button
  ✓ should show loading state when creating a game
  ✓ should display game links after successful creation
  ✓ should display error message on failed creation
  ✓ should allow creating another game
```

## Future Enhancements

- Add request/response interceptors for logging
- Add retry logic for failed requests
- Add request cancellation support
- Add loading/error state helpers
- Add API response caching
