import { sqliteTable, text, integer, index } from 'drizzle-orm/sqlite-core';

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

export const github_tags = sqliteTable('github_tags', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  repo: text('repo').notNull(),
  tag_name: text('tag_name').notNull(),
  hash: text('hash'),
  date: text('date'),
  scraped_at: text('scraped_at').notNull(),
}, (table) => ({
  repoIdx: index('idx_github_tags_repo').on(table.repo),
}));

export const youtube_videos = sqliteTable('youtube_videos', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  channel: text('channel').notNull(),
  video_id: text('video_id').notNull(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  duration: text('duration'),
  published_at: text('published_at'),
  views: text('views'),
  scraped_at: text('scraped_at').notNull(),
}, (table) => ({
  channelIdx: index('idx_youtube_videos_channel').on(table.channel),
}));

const defineMovieTable = (name) => sqliteTable(name, {
  id: integer('id').primaryKey({ autoIncrement: true }),
  quality: text('quality').notNull(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  scraped_at: text('scraped_at').notNull(),
});

export const ghost_in_the_cell = defineMovieTable('ghost_in_the_cell');

export const one_piece_files = sqliteTable('one_piece_files', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  episode_id: integer('episode_id').notNull().references(() => one_piece.id),
  file_id: text('file_id').notNull(),
  name: text('name').notNull(),
  size: integer('size').notNull(),
  link: text('link').notNull(),
  mimetype: text('mimetype'),
  thumbnail: text('thumbnail'),
}, (table) => ({
  episodeIdx: index('idx_one_piece_files_episode_id').on(table.episode_id),
}));