import { pgTable, uuid, varchar, timestamp, text } from 'drizzle-orm/pg-core';

/**
 * Games table - stores the core game state
 */
export const games = pgTable('games', {
  id: uuid('id').primaryKey().defaultRandom(),
  status: varchar('status', { length: 20 }).notNull().default('waiting'),
  whiteToken: uuid('white_token').notNull().defaultRandom(),
  blackToken: uuid('black_token').notNull().defaultRandom(),
  fen: text('fen').notNull().default('rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1'),
  pgn: text('pgn'),
  turn: varchar('turn', { length: 1 }).notNull().default('w'),
  result: varchar('result', { length: 20 }).notNull().default('unknown'),
  endedReason: varchar('ended_reason', { length: 30 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

/**
 * Moves table - stores the move history for each game
 */
export const moves = pgTable('moves', {
  id: uuid('id').primaryKey().defaultRandom(),
  gameId: uuid('game_id')
    .notNull()
    .references(() => games.id, { onDelete: 'cascade' }),
  from: varchar('from', { length: 2 }).notNull(),
  to: varchar('to', { length: 2 }).notNull(),
  promotion: varchar('promotion', { length: 1 }),
  san: varchar('san', { length: 10 }).notNull(),
  fenAfter: text('fen_after').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

export type Game = typeof games.$inferSelect;
export type NewGame = typeof games.$inferInsert;
export type Move = typeof moves.$inferSelect;
export type NewMove = typeof moves.$inferInsert;
