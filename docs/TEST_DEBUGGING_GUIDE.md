# Test Debugging Guide

## Overview

This guide documents the systematic approach to debugging failing tests, with special focus on asynchronous operations like WebSocket tests.

## General Test Debugging Process

### Step 1: Identify the Failing Test

Run the full test suite to see which tests are failing:

```bash
pnpm run test
```

Look for:

- Test timeout errors (often indicates promises that never resolve)
- Assertion failures (actual vs expected values)
- Error messages in test output

### Step 2: Isolate and Add Debug Logs

Run only the failing test with verbose output:

```bash
# For a specific test file
cd apps/api
pnpm test path/to/test-file.test.ts

# For a specific test case (by name match)
pnpm test -t "should enforce turn rules"
```

Add strategic console.log statements:

```typescript
it('should enforce turn rules', async () => {
  console.log('[TEST] Starting test');
  console.log('[TEST] GameId:', gameId);
  console.log('[TEST] Token:', token);

  const promise = new Promise((resolve) => {
    console.log('[TEST] Setting up listener');
    socket.once('event', (data) => {
      console.log('[TEST] RECEIVED event:', data);
      resolve(data);
    });
  });

  console.log('[TEST] Emitting request');
  socket.emit('action', payload);

  console.log('[TEST] Waiting for response');
  const result = await promise;
  console.log('[TEST] Got result:', result);

  expect(result).toBe(expected);
});
```

### Step 3: Add Debug Logs to Implementation

Add logs to the code being tested to understand execution flow:

```typescript
export async function validateToken(gameId: string, token: string) {
  console.log(`[validateToken] Checking gameId: ${gameId}`);
  console.log(`[validateToken] Provided token: ${token}`);

  const game = await findGame(gameId);
  console.log(`[validateToken] Found game:`, game ? 'yes' : 'no');

  if (game?.token === token) {
    console.log(`[validateToken] Token matches!`);
    return { valid: true };
  }

  console.log(`[validateToken] Token does NOT match`);
  return { valid: false };
}
```

### Step 4: Analyze and Fix

Review the debug output to identify:

- **Order of operations** - Are things happening in the expected sequence?
- **Data values** - Do the actual values match expectations?
- **Missing events** - Are events being emitted but not received?
- **Race conditions** - Is cleanup happening before operations complete?

### Step 5: Remove Debug Logs

Once fixed, remove all temporary console.log statements:

```typescript
// Remove all lines like:
console.log('[TEST] ...');
console.log('[validateToken] ...');
```

### Step 6: Verify Consistency

Run the test multiple times to ensure it passes consistently:

```bash
# Run 3 times to check for flakiness
pnpm test -t "your test name"
pnpm test -t "your test name"
pnpm test -t "your test name"

# Or run full suite
pnpm run test
```

## WebSocket Test Debugging: Special Considerations

WebSocket tests have unique challenges due to their asynchronous, event-driven nature.

### Common WebSocket Test Issues

#### Issue 1: Test Timeouts (Promise Never Resolves)

**Symptom:** Test times out at 5000ms or configured limit

**Cause:** Promise is waiting for an event that never fires (or fires with wrong name)

**Solution:** Add error handlers to promises

```typescript
// ❌ BAD - Will timeout if game_error occurs instead
const promise = new Promise((resolve) => {
  socket.once('game_state', (data) => resolve(data));
});

// ✅ GOOD - Handles both success and error cases
const promise = new Promise((resolve, reject) => {
  socket.once('game_state', (data) => resolve(data));
  socket.once('game_error', (data) => reject(new Error(`Failed: ${data.message}`)));
});
```

#### Issue 2: Invalid Token / Game Not Found

**Symptom:** Unexpected "Invalid token" or "Game not found" errors

**Causes:**

- Database record deleted before socket operation completes
- Race condition in test setup/teardown
- Tokens not matching between test and database

**Debug Steps:**

```typescript
beforeEach(async () => {
  const [game] = await db.insert(games).values({...}).returning();
  gameId = game.id;
  token = game.token;

  // Add this to see what was created
  console.log('[SETUP] Created game:', gameId);
  console.log('[SETUP] Token:', token);
});

// In your validation code
async validateToken(gameId, token) {
  console.log('[validateToken] Looking for game:', gameId);
  console.log('[validateToken] Checking token:', token);

  const game = await findById(gameId);
  console.log('[validateToken] DB white token:', game?.whiteToken);
  console.log('[validateToken] DB black token:', game?.blackToken);

  // Compare tokens...
}
```

**Solutions:**

- Don't delete database records in `afterEach` - let them accumulate in test DB
- Add delays before cleanup: `await new Promise(r => setTimeout(r, 100))`
- Use `disconnect()` instead of `close()` for sockets

#### Issue 3: Race Conditions Between Tests

**Symptom:** Tests pass individually but fail when run together

**Causes:**

- Shared server/socket instances
- Port conflicts
- Tests running in parallel

**Solutions:**

```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    testTimeout: 10000, // Increase timeout
    fileParallelism: false, // Run files sequentially
    // ... other config
  },
});

// In test file
afterEach(async () => {
  // Ensure clean disconnection
  if (socket?.connected) {
    socket.disconnect();
  }

  // Wait for socket to fully disconnect
  await new Promise((resolve) => setTimeout(resolve, 100));
});
```

#### Issue 4: Events Emitted to Wrong Socket/Room

**Symptom:** Client doesn't receive expected events

**Debug:**

```typescript
// Server side
socket.on('join_game', async (data) => {
  console.log(`[join_game] Socket ${socket.id} joining ${data.gameId}`);

  await socket.join(`game:${data.gameId}`);
  console.log(`[join_game] Socket joined room`);

  // Check room membership
  const socketsInRoom = await io.in(`game:${data.gameId}`).fetchSockets();
  console.log(`[join_game] Room now has ${socketsInRoom.length} sockets`);

  // Broadcast to room
  io.to(`game:${data.gameId}`).emit('game_state', state);
});

// Client side
it('should receive game state', async () => {
  console.log('[TEST] Socket ID:', socket.id);

  const promise = new Promise((resolve) => {
    socket.on('game_state', (data) => {
      console.log('[TEST] Received game_state:', data);
      resolve(data);
    });
  });

  console.log('[TEST] Emitting join_game');
  socket.emit('join_game', { gameId, token });

  await promise;
});
```

### WebSocket Test Best Practices

#### 1. Always Handle Both Success and Error Events

```typescript
const waitForEvent = (socket, successEvent, errorEvent = 'error') => {
  return new Promise((resolve, reject) => {
    socket.once(successEvent, resolve);
    socket.once(errorEvent, (err) => reject(new Error(err.message)));

    // Optional: timeout handler
    setTimeout(() => reject(new Error('Timeout')), 5000);
  });
};

// Usage
await waitForEvent(socket, 'game_state', 'game_error');
```

#### 2. Setup Test Server Properly

```typescript
describe('Socket.IO Tests', () => {
  let serverPort: number;
  let clientSocket: Socket;

  beforeAll(async () => {
    // Start server on random port
    await new Promise<void>((resolve) => {
      httpServer.listen(0, () => {
        serverPort = (httpServer.address() as AddressInfo).port;
        console.log(`Test server on port ${serverPort}`);
        resolve();
      });
    });
  });

  afterAll(async () => {
    io.close();
    await new Promise<void>((resolve) => {
      httpServer.close(() => resolve());
    });
  });

  beforeEach(async () => {
    // Create fresh socket for each test
    clientSocket = ioClient(`http://localhost:${serverPort}`);

    // Wait for connection
    await new Promise<void>((resolve) => {
      clientSocket.once('connect', () => resolve());
    });
  });

  afterEach(async () => {
    // Clean disconnect
    if (clientSocket?.connected) {
      clientSocket.disconnect();
    }
    await new Promise((r) => setTimeout(r, 100));
  });
});
```

#### 3. Avoid Database Cleanup in afterEach

```typescript
// ❌ BAD - Can cause "Game not found" errors
afterEach(async () => {
  if (gameId) {
    await db.delete(games).where(eq(games.id, gameId));
  }
});

// ✅ GOOD - Let test data accumulate
afterEach(async () => {
  // Just close sockets, leave DB records
  if (socket?.connected) {
    socket.disconnect();
  }
  await new Promise((r) => setTimeout(r, 100));
});
```

#### 4. Use Descriptive Test Names and Logs

```typescript
it("should reject moves when it is not the player's turn", async () => {
  console.log('[TEST:turn-rules] Starting');
  // ... test code
});

it('should handle network reconnection and resume game state', async () => {
  console.log('[TEST:reconnect] Starting');
  // ... test code
});
```

## Example: Complete Debug Session

Here's a real example of debugging a failing websocket test:

### Initial Problem

```
FAIL  should enforce turn rules via sockets
Error: Test timed out in 5000ms.
```

### Step 1: Add Debug Logs

```typescript
it('should enforce turn rules via sockets', async () => {
  console.log('[TEST] Starting turn rules test');
  console.log('[TEST] GameId:', gameId);
  console.log('[TEST] BlackToken:', blackToken);

  const rejectionPromise = new Promise((resolve) => {
    console.log('[TEST] Setting up move_rejected listener');
    blackSocket.once('move_rejected', (data) => {
      console.log('[TEST] RECEIVED move_rejected:', data);
      resolve(data);
    });
  });

  blackSocket.on('game_error', (data) => {
    console.log('[TEST] RECEIVED game_error:', data);
  });

  console.log('[TEST] Emitting join_game');
  blackSocket.emit('join_game', { gameId, token: blackToken });

  const data = await rejectionPromise;
  expect(data.reason).toBe('Not your turn');
});
```

### Step 2: Run and Observe

```bash
pnpm test -t "should enforce turn rules"
```

Output revealed:

```
[TEST] Starting turn rules test
[TEST] GameId: abc-123
[TEST] BlackToken: xyz-789
[TEST] Setting up move_rejected listener
[TEST] Emitting join_game
[TEST] RECEIVED game_error: { message: 'Invalid token' }
[join_game] Invalid token for game abc-123
```

### Step 3: Investigate Further

Added logs to token validation:

```typescript
async validateToken(gameId, token) {
  console.log('[validateToken] gameId:', gameId);
  console.log('[validateToken] provided token:', token);

  const game = await findById(gameId);
  console.log('[validateToken] DB whiteToken:', game?.whiteToken);
  console.log('[validateToken] DB blackToken:', game?.blackToken);

  // ...
}
```

Output showed:

```
[validateToken] gameId: abc-123
[validateToken] provided token: xyz-789
[validateToken] DB whiteToken: null
[validateToken] DB blackToken: null
```

### Step 4: Root Cause Found

The game was being deleted in `afterEach` before the socket operation completed!

### Step 5: Fix Applied

```typescript
// Removed aggressive cleanup
afterEach(async () => {
  if (socket?.connected) {
    socket.disconnect();
  }
  await new Promise((r) => setTimeout(r, 100));
  // No database cleanup
});
```

### Step 6: Remove Debug Logs and Verify

```bash
pnpm test -t "should enforce turn rules"
pnpm test -t "should enforce turn rules"
pnpm test -t "should enforce turn rules"
pnpm run test  # Full suite
```

All tests pass! ✅

## Quick Reference: Common Commands

```bash
# Run all tests
pnpm run test

# Run specific test file
cd apps/api
pnpm test src/sockets/game-handler.test.ts

# Run specific test by name
pnpm test -t "should enforce turn rules"

# Run with watch mode for development
pnpm test --watch

# Run only failed tests
pnpm test --only-changed

# Increase timeout for slow tests
pnpm test --test-timeout=15000
```

## Tips and Tricks

1. **Use TypeScript type checking** - Many test issues are caught by types
2. **Test serially first** - If tests fail in parallel, run them serially to isolate issues
3. **Check event names** - Typos in event names cause silent failures
4. **Verify data shape** - Log the actual data structure received
5. **Use `await`** - Don't forget to await promises, especially in beforeEach/afterEach
6. **Monitor server logs** - Sometimes the issue is server-side, not test-side
7. **Check test isolation** - Each test should work independently
8. **Use test.only()** - Focus on one test at a time during debugging

## Conclusion

Debugging tests, especially async/WebSocket tests, requires patience and systematic investigation. The key is:

1. **Add detailed logging** to understand what's happening
2. **Run tests in isolation** to eliminate interference
3. **Handle all possible outcomes** (success, error, timeout)
4. **Fix race conditions** with proper cleanup and delays
5. **Remove debug logs** after fixing
6. **Verify consistency** by running multiple times

Remember: If a test times out, it means a promise is waiting for something that never happens. Find out what event should fire and add handlers for all possible outcomes!
