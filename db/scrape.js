import { desc } from 'drizzle-orm';
import { db } from './index.js';
import { the_bully_in_charge } from './schema.js';

const tables = {
  'the-bully-in-charge': the_bully_in_charge,
};

export function saveScrape(source, data) {
  const table = tables[source];
  db.insert(table).values(data).run();
}

export async function getLatestScrape(source) {
  const table = tables[source];
  return await db.select().from(table).orderBy(desc(table.id)).limit(1).get() || null;
}