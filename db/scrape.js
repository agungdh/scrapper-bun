import { desc, eq } from 'drizzle-orm';
import { db } from './index.js';
import { scrapes } from './schema.js';

export function saveScrape(source, data) {
  db.insert(scrapes).values({ source, ...data }).run();
}

export function getLatestScrape(source) {
  const rows = db.select().from(scrapes).where(eq(scrapes.source, source)).orderBy(desc(scrapes.id)).limit(1).get();
  return rows || null;
}