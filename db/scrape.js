import { eq, desc } from 'drizzle-orm';
import { db } from './index.js';
import { scrapes } from './schema.js';

export function saveScrape(source, data) {
  db.insert(scrapes).values({
    source,
    chapter: data.chapter,
    date: data.date,
    url: data.url,
    scraped_at: data.scraped_at,
  }).run();
}

export function getLatestScrape(source) {
  return db.select()
    .from(scrapes)
    .where(eq(scrapes.source, source))
    .orderBy(desc(scrapes.id))
    .limit(1)
    .get();
}
