# Plan: Full-Stack Chess App Implementation Phases

Starting from an empty workspace, this plan builds the chess app incrementally with testing at each phase. Each phase delivers working, tested functionality before moving forward. The sequence ensures infrastructure → backend → frontend → integration → deployment, with tests validating each layer.

**Steps**

## Phase 1: Foundation & Tooling (Day 1)

1. Initialize pnpm workspace with root package.json and pnpm-workspace.yaml
2. Create monorepo structure: apps/web/, apps/api/, packages/shared/
3. Add shared configs: .gitignore, tsconfig.base.json, ESLint/Prettier
4. Set up TypeScript in all workspaces with proper references
5. Install core dependencies: Express, React, Socket.IO, Drizzle, chess.js, Zod
6. Configure Vitest in apps/api/ and packages/shared/
7. Create packages/shared/src/types.ts with `Game` and `Move` types
8. Write first test: validate shared types compile

**Verification:** `pnpm install` succeeds, `pnpm test` runs (even with 1 dummy test), TypeScript compiles across workspaces

---

## Phase 2: Database & Schema (Day 1-2)

1. Set up Drizzle config in apps/api/drizzle.config.ts
2. Create apps/api/src/db/schema.ts with `games` and `moves` tables matching spec
3. Add Zod schemas in packages/shared/src/schemas.ts for validation
4. Write migration script to create tables
5. Create apps/api/src/db/client.ts for connection
6. Add unit tests for schema validation (Zod schemas parse correctly)
7. Test local Postgres connection (Docker or local install)

**Verification:** Migration runs successfully, tables exist, can query empty tables, schema tests pass

---

## Phase 3: REST API - Game Management (Day 2)

1. Set up Express server in apps/api/src/server.ts
2. Create apps/api/src/routes/games.ts
3. Implement `POST /games` endpoint:
   - Generate game ID (uuid)
   - Create white/black tokens (uuid)
   - Store initial game state (FEN: starting position)
   - Return game ID + white/black join URLs
4. Implement `GET /games/:id` endpoint (public game state)
5. Add Supertest integration tests:
   - Create game returns valid tokens
   - Fetch game returns correct initial state
   - Invalid game ID returns 404
6. Add error handling middleware

**Verification:** `pnpm -F api test` passes all REST endpoint tests, can create and fetch games via curl/Postman

---

## Phase 4: Chess Logic Layer (Day 2-3)

1. Create apps/api/src/services/chess-service.ts
2. Wrap chess.js with validation logic:
   - `validateMove(gameId, token, from, to, promotion?)`
   - `applyMove()` - validates legality, updates DB
   - `detectGameEnd()` - checkmate, stalemate, draw
3. Add comprehensive unit tests:
   - Legal moves succeed
   - Illegal moves rejected
   - Turn enforcement (white can't move on black's turn)
   - Token validation
   - Checkmate detection
   - Stalemate detection
   - Promotion handling
4. Create apps/api/src/repositories/game-repo.ts for DB operations

**Verification:** 80%+ test coverage on chess-service, all edge cases covered (en passant, castling, promotion)

---

## Phase 5: Socket.IO Real-Time Layer (Day 3)

1. Add Socket.IO server to apps/api/src/server.ts
2. Create apps/api/src/sockets/game-handler.ts
3. Implement socket events:
   - `join_game` - validates token, adds to room `game:{id}`
   - `make_move` - calls chess-service, broadcasts `game_state`
   - `resign` - updates game status, broadcasts result
   - `offer_draw`, `accept_draw` - draw negotiation
4. Add socket integration tests using socket.io-client:
   - Two clients join same game
   - Move by white propagates to black
   - Turn enforcement via sockets
   - Invalid move emits `move_rejected`
   - Reconnect receives current state
5. Persist moves to `moves` table with SAN notation

**Verification:** Socket tests pass, two concurrent clients can play a full game, state persists across disconnects

---

## Phase 6: Frontend Foundation (Day 4)

1. Set up Vite + React in apps/web/
2. Configure Tailwind CSS in apps/web/tailwind.config.js
3. Create routing structure (React Router):
   - apps/web/src/pages/Home.tsx - `/`
   - apps/web/src/pages/Game.tsx - `/g/:gameId`
4. Build Home page:
   - "Create Game" button
   - Calls `POST /games`
   - Displays white/black share links
5. Add environment config for API URL (apps/web/.env)
6. Style with frosted glass container (backdrop-filter blur)
7. Add basic component tests with Vitest + React Testing Library

**Verification:** `pnpm -F web dev` runs, can create game and see share links, styling looks clean

---

## Phase 7: Interactive Chess Board (Day 4-5)

1. Install and configure `react-chessboard` in apps/web/
2. Create apps/web/src/components/ChessBoard.tsx
3. Implement Socket.IO client in apps/web/src/hooks/useChessGame.ts:
   - Connect with token from URL
   - Emit `join_game`
   - Listen for `game_state` updates
   - Emit `make_move` on piece drop
4. Add board state management:
   - Display current FEN
   - Highlight player color
   - Disable moves when not player's turn
   - Show loading/error states
5. Build info panel:
   - Current turn indicator
   - Player color display
   - Copy share link button
   - Resign/Draw offer buttons
6. Style board with stone/marble colors (avoid pure black/white)

**Verification:** Can join game via link, make moves that update in real-time, board state persists on refresh

---

## Phase 8: Game End States (Day 5)

1. Add end-game UI in apps/web/src/components/GameResult.tsx
2. Handle all end states:
   - Checkmate (winner display)
   - Stalemate (draw message)
   - Resignation (winner by resignation)
   - Draw by agreement
3. Disable board interaction when game ended
4. Add "New Game" button on end screen
5. Update backend to emit end-game events properly
6. Add tests for resignation and draw flows

**Verification:** All end states display correctly, can't make moves after game ends, UI clearly shows outcome

---

## Phase 9: E2E Testing with Playwright (Day 6)

1. Install Playwright in root workspace
2. Create tests/e2e/game-flow.spec.ts
3. Write comprehensive E2E scenarios:
   - Create game as white
   - Open black link in second browser context
   - Play 5-10 moves alternating turns
   - Verify both boards stay in sync
   - Refresh one player mid-game
   - Verify state persists
   - Complete game with checkmate
   - Verify end state shown to both players
4. Add tests/e2e/edge-cases.spec.ts:
   - Illegal move rejection
   - Turn enforcement
   - Draw offer/accept flow
   - Resignation
5. Configure CI to run all test suites

**Verification:** All Playwright tests pass, 80%+ total coverage, tests catch regressions

---

## Phase 10: Polish & Error Handling (Day 6-7)

1. Add loading states throughout frontend
2. Implement error boundaries in React
3. Add reconnection logic for Socket.IO
4. Display user-friendly error messages
5. Add move history display (optional enhancement)
6. Fine-tune frosted glass styling
7. Test on mobile viewport (responsive design)
8. Add basic accessibility (ARIA labels, keyboard nav)

**Verification:** App handles disconnects gracefully, errors don't crash UI, works on mobile Chrome

---

## Phase 11: Railway Deployment (Day 7)

1. Create infra/railway/api.Dockerfile for backend
2. Create infra/railway/web.Dockerfile for frontend
3. Set up Railway project with Postgres plugin
4. Configure environment variables:
   - API: `DATABASE_URL`, `PORT`, `CORS_ORIGIN`
   - Web: `VITE_API_URL`
5. Deploy API service first
6. Deploy Web service pointing to API URL
7. Run migrations on Railway Postgres
8. Test production deployment end-to-end
9. Document deployment process in infra/railway/README.md

**Verification:** App fully functional on Railway, can share public URLs, database persists games

---

## Overall Verification

After each phase:

- Run `pnpm test` (all tests must pass)
- Run `pnpm lint` (no errors)
- Manually test the new feature works end-to-end

Final verification:

- Playwright E2E suite passes (full game flow)
- Can create game, share link, play from two devices
- Game persists across refresh
- All end states work (checkmate, stalemate, resign, draw)
- 80%+ test coverage across codebase
- Deploys successfully to Railway

## Key Decisions

- Starting fully from scratch - no existing code to integrate
- Using Docker for local Postgres (or Railway Postgres from day 1 if preferred)
- Token-based auth built into game creation (no separate auth service needed for MVP)
- Tests written alongside each feature, not as a separate phase
- Frosted glass styling using Tailwind utilities + custom CSS where needed

---

This phased approach ensures working software at each step with test coverage preventing regressions.
