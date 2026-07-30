import { desc, eq, lt, max } from 'drizzle-orm';
import { db } from './index.js';
import { the_bully_in_charge, one_piece, one_piece_files } from './schema.js';

const tables = {
  'the-bully-in-charge': the_bully_in_charge,
  'one-piece': one_piece,
};

export async function saveScrape(source, data) {
  const table = tables[source];
  await db.insert(table).values(data).run();
  const row = await db.select({ id: max(table.id) }).from(table).get()
  return row?.id
}

export async function saveEpisodeWithFiles(episode, files) {
  return await db.transaction(async (tx) => {
    await tx.insert(one_piece).values(episode).run();
    const row = await tx.select({ id: max(one_piece.id) }).from(one_piece).get()
    if (row?.id && files?.length) {
      const values = files.map(f => ({
        episode_id: row.id,
        file_id: f.id,
        name: f.name,
        size: f.size,
        link: f.link,
        mimetype: f.mimetype,
        thumbnail: f.thumbnail,
      }))
      await tx.insert(one_piece_files).values(values).run()
    }
    return row?.id
  })
}

export async function getLatestScrape(source) {
  const table = tables[source];
  return await db.select().from(table).orderBy(desc(table.id)).limit(1).get() || null;
}

export async function getLatestOnePieceWithFiles() {
  const episode = await db.select().from(one_piece).orderBy(desc(one_piece.id)).limit(1).get()
  if (!episode) return null
  const files = await db.select().from(one_piece_files).where(eq(one_piece_files.episode_id, episode.id)).all()
  return { ...episode, files }
}

export async function deleteOldScrapes(source) {
  const table = tables[source];
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const result = await db.delete(table).where(lt(table.scraped_at, cutoff)).run();
  const count = result.rowsAffected ?? 0;
  console.log(`[cleanup] ${source}: deleted ${count} old rows`);
  return count;
}

export async function deleteAllOldScrapes() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  let total = 0;

  // one_piece: transaction delete parent + child
  const oldIds = (await db.select({ id: one_piece.id }).from(one_piece).where(lt(one_piece.scraped_at, cutoff)).all()).map(r => r.id)
  if (oldIds.length) {
    await db.transaction(async (tx) => {
      for (const id of oldIds) {
        await tx.delete(one_piece_files).where(eq(one_piece_files.episode_id, id)).run()
      }
      const result = await tx.delete(one_piece).where(lt(one_piece.scraped_at, cutoff)).run()
      total += result.rowsAffected ?? 0
    })
  }

  // other tables
  for (const [name, table] of Object.entries(tables)) {
    if (table === one_piece) continue
    const result = await db.delete(table).where(lt(table.scraped_at, cutoff)).run();
    total += result.rowsAffected ?? 0;
  }

  console.log(`[cleanup] deleted ${total} old rows across ${Object.keys(tables).length + 1} tables`);
  return total;
}