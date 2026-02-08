# Phase 2: Database & Schema Setup

## Prerequisites

- PostgreSQL installed locally OR Docker for running Postgres in a container
- pnpm installed
- Node.js 20+

## Quick Start with Docker

The easiest way to get started is using Docker for PostgreSQL:

```powershell
# Run PostgreSQL in Docker
docker run --name chess-postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_USER=postgres `
  -e POSTGRES_DB=chess `
  -p 5432:5432 `
  -d postgres:16-alpine

# Verify it's running
docker ps
```

## Local Postgres Setup (Alternative)

If you prefer installing PostgreSQL locally:

1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Install with default settings (port 5432)
3. Create a database named `chess`

```sql
CREATE DATABASE chess;
```

## Environment Configuration

1. Copy the example environment file:

```powershell
cd apps/api
cp .env.example .env
```

2. Update `.env` with your database credentials if different from defaults

## Running Migrations

1. Generate migration files from schema:

```powershell
pnpm -F api db:generate
```

2. Apply migrations to database:

```powershell
pnpm -F api db:migrate
```

3. Verify tables were created:

```powershell
# Connect to Postgres
docker exec -it chess-postgres psql -U postgres -d chess

# List tables
\dt

# Describe tables
\d games
\d moves

# Exit
\q
```

## Running Tests

```powershell
# Run all tests (from project root)
pnpm test

# Run only shared package tests
pnpm -F @chess-app/shared test

# Run API tests
pnpm -F api test
```

## Database Schema

### Games Table

- `id` (uuid, primary key)
- `status` (varchar) - 'waiting' | 'active' | 'ended'
- `white_token` (uuid) - authentication token for white player
- `black_token` (uuid) - authentication token for black player
- `fen` (text) - current board position in FEN notation
- `pgn` (text, nullable) - full game in PGN format
- `turn` (varchar) - 'w' | 'b'
- `result` (varchar) - 'white_win' | 'black_win' | 'draw' | 'unknown'
- `ended_reason` (varchar, nullable) - 'checkmate' | 'stalemate' | 'resignation' | 'draw_agreement' | 'timeout'
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Moves Table

- `id` (uuid, primary key)
- `game_id` (uuid, foreign key → games.id, cascade delete)
- `from` (varchar) - starting square (e.g., 'e2')
- `to` (varchar) - ending square (e.g., 'e4')
- `promotion` (varchar, optional) - piece to promote to ('q', 'r', 'b', 'n')
- `san` (varchar) - move in Standard Algebraic Notation (e.g., 'e4', 'Nf3')
- `fen_after` (text) - board position after this move
- `created_at` (timestamp)

## Verification Checklist

- [x] Drizzle config created
- [x] Database schema defined with games and moves tables
- [x] Zod validation schemas working
- [x] Database client connection configured
- [x] Migration script created
- [x] Unit tests pass for schema validation
- [ ] PostgreSQL running (Docker or local)
- [ ] Migrations applied successfully
- [ ] Tables visible in database
- [ ] Can query empty tables

## Troubleshooting

### Connection Refused

If you get "connection refused" errors:

1. Check PostgreSQL is running: `docker ps` or check Windows Services
2. Verify port 5432 is not in use by another app
3. Check DATABASE_URL in `.env` matches your setup

### Migration Errors

If migrations fail:

1. Ensure database exists: `docker exec -it chess-postgres psql -U postgres -l`
2. Check user has permissions
3. Try resetting: drop the database and recreate it

### Docker Issues on Windows

Make sure Docker Desktop is running and using WSL2 backend for best performance.

## Next Steps

Once Phase 2 is complete and verified, proceed to Phase 3: REST API - Game Management
