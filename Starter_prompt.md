# Full Stack Chess App (MVP)

A fast-delivery, high-quality multiplayer chess web app designed for learning, testing discipline, and sharing with friends. This document is written to be handed directly to GitHub Copilot (or a human teammate) and iterated on until complete.

---

## 🎯 MVP Goal

A simple online chess app where:

- One user creates a game and gets shareable links
- A friend opens the link and joins instantly
- Moves are real-time, validated server-side
- Game state persists across refreshes
- Core end states are supported (checkmate, stalemate, resign, draw)

This is **not** about accounts, rankings, chat, or matchmaking. Speed, correctness, and test coverage come first.

---

## 🧱 Tech Stack (Optimized for Speed + Testing)

### Monorepo

- `pnpm` workspaces
- No Turborepo required for MVP

### Frontend

- React + Vite
- `react-chessboard` for board + drag/drop
- Styling: Tailwind CSS or CSS Modules
- Visual style: frosted glass container, stone/marble board, classy modern look

### Backend

- Node.js + Express
- Socket.IO for real-time updates
- Postgres (Railway managed)
- Drizzle ORM
- Chess rules: `chess.js` (server-authoritative)

### Testing

- Unit + integration: Vitest
- API tests: Supertest
- Socket tests: socket.io-client
- E2E: Playwright (multi-browser contexts)

---

## 🗂️ Repo Structure

```
chess-app/
  apps/
    web/              # Vite + React frontend
    api/              # Express + Socket.IO backend
  packages/
    shared/           # Types, zod schemas, constants
  infra/
    railway/          # Deployment notes/scripts
  pnpm-workspace.yaml
  package.json
```

---

## 🧠 Core Data Model

### Game

- `id` (uuid)
- `status`: waiting | active | ended
- `whiteToken` / `blackToken` (auth-by-link)
- `fen` (current position)
- `pgn` (optional, for replay)
- `turn` (w | b)
- `result`: white_win | black_win | draw | unknown
- `endedReason`
- timestamps

### Move

- `id`, `gameId`
- `from`, `to`, `promotion?`
- `san`
- `fenAfter`
- `createdAt`

---

## 🔌 Backend API Design

### REST Endpoints

- `POST /games`
  - Creates a new game
  - Returns game ID + join URLs

- `GET /games/:id`
  - Returns public game state (fen, status, result)

### Socket Events

**Room:** `game:{gameId}`

Client → Server

- `join_game`
- `make_move`
- `resign`
- `offer_draw`
- `accept_draw`

Server → Client

- `game_state`
- `move_rejected`

### Move Validation Flow

1. Load game from DB
2. Validate player token + turn
3. Load `fen` into chess.js
4. Apply move and ensure legality
5. Persist move + updated state
6. Broadcast new state

---

## 🎨 Frontend Pages

### `/`

- Create Game button
- Brief explanation of how it works

### `/g/:gameId`

- Chess board
- Frosted-glass info panel:
  - Player color
  - Turn indicator
  - Resign / draw buttons
  - Copy share link

### Visual Style Notes

- Frosted glass: `backdrop-filter: blur(16px)`
- Soft borders, subtle shadows
- Board colors: stone / charcoal (avoid pure black/white)
- MVP pieces: Unicode chess symbols
- Upgrade path: SVG marble-style pieces

---

## 🧪 Testing Strategy (High Coverage)

### Unit Tests

- Move validation
- Turn enforcement
- End-state detection

### API Integration Tests

- Game creation
- Invalid token behavior
- Illegal move rejection

### Socket Tests

- Two clients joining same game
- Turn-based enforcement
- Reconnect receives latest state

### E2E Tests (Playwright)

- Create game
- Join as white + black (two contexts)
- Play several moves
- Refresh mid-game
- Ensure continuity

**CI Rules**

- Coverage threshold >= 80%
- All test types run on PR

---

## 🚂 Railway Deployment

- Two services from the monorepo:
  - `apps/api`
  - `apps/web`

### API

- Add Postgres plugin
- Env: `DATABASE_URL`
- Start: `pnpm -F api start`

### Web

- Build: `pnpm -F web build`
- Serve static `dist`
- Env: `VITE_API_URL`

---

## 🧭 Milestones (Delivery Order)

1. Monorepo scaffold + test plumbing
2. Drizzle schema + migrations
3. REST: create + fetch game
4. Socket join + broadcast state
5. End-to-end move pipeline
6. Frontend board wired to sockets
7. Playwright multiplayer E2E
8. Styling pass (frosted glass + board)
9. Optional SVG piece swap

---

## 🤖 Copilot Instructions (Prompt.md)

```md
You are implementing a full-stack multiplayer chess web app MVP in a pnpm monorepo deployed to Railway.

Non-negotiables:

- Server-authoritative chess rules using chess.js
- Real-time play via Socket.IO
- High test coverage: unit, integration, socket, Playwright E2E
- MVP scope only: create game, join by link, play, refresh-safe persistence, resign, draw

Repo structure:

- apps/web (Vite + React)
- apps/api (Express + Socket.IO + Drizzle)
- packages/shared (types + schemas)

Process rules:

1. Work in small steps
2. Add tests with every feature
3. Fix failing tests immediately
4. Avoid TODOs for core flows

Definition of done:

- Tests added and passing
- Lint clean
- Feature works end-to-end

Implementation order:

1. Repo + tooling
2. DB schema
3. REST endpoints
4. Socket join
5. Move validation + persistence
6. Frontend integration
7. Playwright E2E
8. Styling

When unsure, choose the simplest correct solution.
```

---

## ✅ Outcome

A clean, test-heavy, production-style multiplayer chess app that prioritizes correctness, clarity, and learning — and is genuinely fun to share and play.
