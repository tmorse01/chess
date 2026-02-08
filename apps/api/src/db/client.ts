import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

/**
 * Database connection configuration
 */
const connectionString =
  process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/chess';

/**
 * Postgres client
 */
const client = postgres(connectionString);

/**
 * Drizzle ORM instance
 */
export const db = drizzle(client, { schema });

/**
 * Close database connection
 * Useful for graceful shutdown and testing
 */
export async function closeConnection() {
  await client.end();
}
