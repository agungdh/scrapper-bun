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
  scraped_at: text('scraped_at').notNull(),
});

export const one_piece = defineAnimeTable('one_piece');

export const one_piece_files = sqliteTable('one_piece_files', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  episode_id: integer('episode_id').notNull(),
  file_id: text('file_id').notNull(),
  name: text('name').notNull(),
  size: integer('size').notNull(),
  link: text('link').notNull(),
  mimetype: text('mimetype'),
  thumbnail: text('thumbnail'),
});