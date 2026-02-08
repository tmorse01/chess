# Full-Stack Chess Application

A real-time multiplayer chess game built with React, Express, Socket.IO, and PostgreSQL.

## 🎯 Features

- ✅ Real-time multiplayer chess gameplay
- ✅ Interactive drag-and-drop chess board
- ✅ Token-based game authentication
- ✅ Live move synchronization
- ✅ Turn enforcement
- ✅ Connection status tracking
- ✅ Responsive design with frosted glass UI
- ✅ Comprehensive test coverage

## 📦 Tech Stack

### Frontend (`apps/web`)

- React 18
- TypeScript
- Vite
- React Router
- Socket.IO Client
- react-chessboard
- Tailwind CSS
- Vitest + React Testing Library

### Backend (`apps/api`)

- Node.js + Express
- TypeScript
- Socket.IO
- PostgreSQL
- Drizzle ORM
- chess.js
- Vitest

### Shared (`packages/shared`)

- Shared TypeScript types
- Zod validation schemas

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or 20+
- pnpm (recommended) or npm
- PostgreSQL 16+ (Docker recommended)
- Docker (optional, for database)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd chess
   ```

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Set up PostgreSQL database**

   Using Docker (recommended):

   ```powershell
   docker run --name chess-postgres `
     -e POSTGRES_PASSWORD=postgres `
     -e POSTGRES_USER=postgres `
     -e POSTGRES_DB=chess `
     -p 5432:5432 `
     -d postgres:16-alpine
   ```

4. **Configure environment variables**

   Create `apps/api/.env`:

   ```env
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/chess
   PORT=4000
   CORS_ORIGIN=http://localhost:5173
   ```

   Create `apps/web/.env`:

   ```env
   VITE_API_URL=http://localhost:4000
   ```

5. **Run database migrations**
   ```bash
   cd apps/api
   pnpm db:push
   ```

### Running the Application

#### Development Mode

**Terminal 1 - Backend:**

```bash
cd apps/api
pnpm dev
```

API will run on `http://localhost:4000`

**Terminal 2 - Frontend:**

```bash
cd apps/web
pnpm dev
```

Web app will run on `http://localhost:5173`

#### Running Tests

**All tests:**

```bash
pnpm test
```

**Backend tests only:**

```bash
pnpm -F api test
```

**Frontend tests only:**

```bash
pnpm -F web test
```

**Watch mode:**

```bash
pnpm -F web test:watch
```

## 🎮 How to Play

1. **Create a game:**
   - Navigate to `http://localhost:5173`
   - Click "Create New Game"
   - You'll receive two URLs: one for White, one for Black

2. **Join as players:**
   - Open the White URL in one browser
   - Open the Black URL in another browser (or incognito window)

3. **Play chess:**
   - Drag and drop pieces to make moves
   - Moves update in real-time for both players
   - Turn enforcement prevents moving out of turn

4. **Game controls:**
   - Copy share link to invite opponent
   - Offer draw to propose a draw
   - Resign to end the game

## 📁 Project Structure

```
chess/
├── apps/
│   ├── api/                    # Backend Express + Socket.IO server
│   │   ├── drizzle/           # Database migrations
│   │   ├── src/
│   │   │   ├── db/            # Database client, schema, migrations
│   │   │   ├── repositories/  # Data access layer
│   │   │   ├── routes/        # REST API endpoints
│   │   │   ├── services/      # Business logic
│   │   │   ├── sockets/       # Socket.IO event handlers
│   │   │   └── server.ts      # Server entry point
│   │   └── package.json
│   │
│   └── web/                    # Frontend React app
│       ├── src/
│       │   ├── components/    # Reusable React components
│       │   ├── hooks/         # Custom React hooks
│       │   ├── pages/         # Page components
│       │   ├── test/          # Test utilities
│       │   ├── App.tsx        # App router
│       │   └── main.tsx       # Entry point
│       └── package.json
│
├── packages/
│   └── shared/                # Shared types and schemas
│       ├── src/
│       │   ├── types.ts       # TypeScript type definitions
│       │   └── schemas.ts     # Zod validation schemas
│       └── package.json
│
├── docs/                      # Phase completion documentation
├── package.json               # Root package.json
├── pnpm-workspace.yaml        # pnpm workspace config
└── tsconfig.base.json         # Base TypeScript config
```

## 🔌 API Endpoints

### REST API

- `GET /health` - Health check
- `POST /games` - Create new game
- `GET /games/:id` - Get game state

### Socket.IO Events

**Client → Server:**

- `join_game` - Join game room
- `make_move` - Submit move
- `resign` - Resign from game
- `offer_draw` - Propose draw
- `accept_draw` - Accept draw offer

**Server → Client:**

- `game_state` - Updated game state
- `player_color` - Assigned color
- `move_rejected` - Invalid move
- `game_error` - Error occurred

## 🧪 Testing Strategy

- **Unit Tests:** Individual component and service tests
- **Integration Tests:** API endpoint tests with Supertest
- **Socket Tests:** Socket.IO integration tests
- **Component Tests:** React component tests with Testing Library

### Test Coverage

- Backend: 80%+ coverage on chess logic and services
- Frontend: All components and pages tested
- Integration: Full game flow tested

## 📝 Development Workflow

### Making Changes

1. Create feature branch
2. Make changes with tests
3. Run tests: `pnpm test`
4. Run linter: `pnpm lint` (if configured)
5. Commit and push
6. Create pull request

### Database Changes

1. Update schema in `apps/api/src/db/schema.ts`
2. Generate migration: `pnpm db:generate`
3. Apply migration: `pnpm db:push`
4. Update types in `packages/shared/src/types.ts`

## 🐛 Troubleshooting

**Database connection issues:**

- Verify PostgreSQL is running: `docker ps`
- Check DATABASE_URL in `.env`
- Ensure migrations have run: `pnpm db:push`

**Socket connection fails:**

- Check CORS_ORIGIN in API `.env`
- Verify VITE_API_URL in web `.env`
- Ensure backend is running on correct port

**Tests failing:**

- Clear node_modules: `rm -rf node_modules && pnpm install`
- Check for stale processes: Stop all dev servers
- Verify database is accessible for API tests

**Port conflicts:**

- Change PORT in `apps/api/.env`
- Update VITE_API_URL in `apps/web/.env` to match

## 🚧 Current Status

### ✅ Completed Phases

- **Phase 1:** Foundation & Tooling
- **Phase 2:** Database & Schema
- **Phase 3:** REST API - Game Management
- **Phase 4:** Chess Logic Layer
- **Phase 5:** Socket.IO Real-Time Layer
- **Phase 6:** Frontend Foundation
- **Phase 7:** Interactive Chess Board ⭐ (Current)

### 🔜 Upcoming Phases

- **Phase 8:** Game End States
- **Phase 9:** E2E Testing with Playwright
- **Phase 10:** Polish & Error Handling
- **Phase 11:** Railway Deployment

## 📚 Documentation

Detailed phase documentation available in `/docs`:

- [Phase 2 Complete](./docs/PHASE_2_COMPLETE.md)
- [Phase 3 Complete](./docs/PHASE_3_COMPLETE.md)
- [Phase 4 Complete](./docs/PHASE_4_COMPLETE.md)
- [Phase 5 Complete](./docs/PHASE_5_COMPLETE.md)
- [Phase 7 Complete](./docs/PHASE_7_COMPLETE.md)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Add tests for new features
4. Ensure all tests pass
5. Submit pull request

## 📄 License

[Add license information]

## 🙏 Acknowledgments

- chess.js for chess logic
- react-chessboard for the interactive board component
- Socket.IO for real-time communication
- Tailwind CSS for styling

---

**Built with ❤️ using modern web technologies**
