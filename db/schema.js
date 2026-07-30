import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

const defineTable = (name) => sqliteTable(name, {
  id: integer('id').primaryKey({ autoIncrement: true }),
  chapter: integer('chapter').notNull(),
  date: text('date').notNull(),
  url: text('url').notNull(),
  scraped_at: text('scraped_at').notNull(),
});

export const the_bully_in_charge = defineTable('the_bully_in_charge');

const defineAnimeTable = (name) => sqliteTable(name, {
  id: integer('id').primaryKey({ autoIncrement: true }),
  episode: integer('episode').notNull(),
  title: text('title').notNull(),
  date: text('date').notNull(),
  url: text('url').notNull(),
  download_url: text('download_url').notNull(),
  files: text('files'),
  scraped_at: text('scraped_at').notNull(),
});

export const one_piece = defineAnimeTable('one_piece');