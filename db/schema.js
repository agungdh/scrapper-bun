import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

function sanitize(source) {
  return source.replace(/[^a-zA-Z0-9_]/g, '_');
}

export function defineTable(source) {
  const name = sanitize(source);
  return sqliteTable(name, {
    id: integer('id').primaryKey({ autoIncrement: true }),
    chapter: integer('chapter').notNull(),
    date: text('date').notNull(),
    url: text('url').notNull(),
    scraped_at: text('scraped_at').notNull(),
  });
}

export const template = sqliteTable('template', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  chapter: integer('chapter').notNull(),
  date: text('date').notNull(),
  url: text('url').notNull(),
  scraped_at: text('scraped_at').notNull(),
});
