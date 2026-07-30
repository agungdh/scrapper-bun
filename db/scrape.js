import { desc, lt } from 'drizzle-orm';
import { db } from './index.js';
import { the_bully_in_charge, one_piece } from './schema.js';

const tables = {
  'the-bully-in-charge': the_bully_in_charge,
  'one-piece': one_piece,
};

export function saveScrape(source, data) {
  const table = tables[source];
  db.insert(table).values(data).run();
}

export async function getLatestScrape(source) {
  const table = tables[source];
  return await db.select().from(table).orderBy(desc(table.id)).limit(1).get() || null;
}

export function deleteOldScrapes(source) {
  const table = tables[source];
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const result = db.delete(table).where(lt(table.scraped_at, cutoff)).run();
  const count = result.rowsAffected ?? 0;
  console.log(`[cleanup] Deleted ${count} old rows`);
  return count;
}