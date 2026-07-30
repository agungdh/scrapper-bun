import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const scrapes = sqliteTable('scrapes', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  source: text('source').notNull(),
  chapter: text('chapter').notNull(),
  date: text('date').notNull(),
  url: text('url').notNull(),
  scraped_at: text('scraped_at').notNull(),
});
