import { desc, eq, inArray, lt } from 'drizzle-orm';
import { db } from './index.js';
import { the_bully_in_charge, one_piece, one_piece_files } from './schema.js';

const tables = {
  'the-bully-in-charge': the_bully_in_charge,
  'one-piece': one_piece,
};

export async function saveScrape(source, data) {
  const table = tables[source];
  const existing = await db.select().from(table).where(eq(table.chapter, data.chapter)).get();
  if (existing) return existing.id;
  const result = await db.insert(table).values(data).run();
  return Number(result.lastInsertRowid);
}

export async function saveEpisodeWithFiles(episode, files) {
  const existing = await db.select().from(one_piece).where(eq(one_piece.episode, episode.episode)).get();
  if (existing) return existing.id;
  return await db.transaction(async (tx) => {
    const result = await tx.insert(one_piece).values(episode).run();
    const episodeId = Number(result.lastInsertRowid);
    if (files?.length) {
      const values = files.map(f => ({
        episode_id: episodeId,
        file_id: f.id,
        name: f.name,
        size: f.size,
        link: f.link,
        mimetype: f.mimetype,
        thumbnail: f.thumbnail,
      }))
      await tx.insert(one_piece_files).values(values).run();
    }
    return episodeId;
  });
}

export async function getLatestScrape(source) {
  const table = tables[source];
  return await db.select().from(table).orderBy(desc(table.id)).limit(1).get() || null;
}

export async function getLatestOnePieceWithFiles() {
  const episode = await db.select().from(one_piece).orderBy(desc(one_piece.id)).limit(1).get();
  if (!episode) return null;
  const files = await db.select().from(one_piece_files).where(eq(one_piece_files.episode_id, episode.id)).all();
  return { ...episode, files };
}

export async function deleteAllOldScrapes() {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  let total = 0;

  const oldIds = (await db.select({ id: one_piece.id }).from(one_piece).where(lt(one_piece.scraped_at, cutoff)).all()).map(r => r.id);
  if (oldIds.length) {
    await db.transaction(async (tx) => {
      await tx.delete(one_piece_files).where(inArray(one_piece_files.episode_id, oldIds)).run();
      const result = await tx.delete(one_piece).where(lt(one_piece.scraped_at, cutoff)).run();
      total += result.rowsAffected ?? 0;
    });
  }

  for (const [name, table] of Object.entries(tables)) {
    if (table === one_piece) continue;
    const result = await db.delete(table).where(lt(table.scraped_at, cutoff)).run();
    total += result.rowsAffected ?? 0;
  }

  console.log(`[cleanup] deleted ${total} old rows`);
  return total;
}
