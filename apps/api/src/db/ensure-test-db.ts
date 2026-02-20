/**
 * Ensures the test database exists (for e2e). Connects to the default
 * postgres database and creates the DB from DATABASE_URL if missing.
 * Run with: pnpm -F api db:ensure-test
 */
import postgres from 'postgres';

const url = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/chess_test';
const parsed = new URL(url);
const dbName = parsed.pathname.slice(1) || 'chess_test';

// Connect to the default 'postgres' database to create the target DB
const adminUrl = url.replace(/\/[^/]+$/, '/postgres');
const sql = postgres(adminUrl, { max: 1 });

async function ensureDb() {
  const exists = await sql`
    SELECT 1 FROM pg_database WHERE datname = ${dbName}
  `;
  if (exists.length === 0) {
    const safeName = '"' + dbName.replace(/"/g, '""') + '"';
    await sql.unsafe(`CREATE DATABASE ${safeName}`);
    console.log(`Created database: ${dbName}`);
  }
}

ensureDb()
  .then(() => sql.end())
  .catch((err) => {
    console.error('db:ensure-test failed:', err);
    process.exit(1);
  });
