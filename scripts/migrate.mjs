import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync, readdirSync, readFileSync } from 'fs';
import { dirname, join } from 'path';

const DB_PATH = process.env.DB_PATH || './data/scrapper.db';

const dir = dirname(DB_PATH);
if (!existsSync(dir)) {
  mkdirSync(dir, { recursive: true });
}

const sqlite = new Database(DB_PATH);
sqlite.exec('PRAGMA journal_mode = WAL');

sqlite.exec(`CREATE TABLE IF NOT EXISTS _drizzle_migrations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  hash TEXT NOT NULL,
  created_at TEXT NOT NULL
)`);

const migrationsDir = join(import.meta.dirname, '..', 'drizzle');
const files = readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

for (const file of files) {
  const sql = readFileSync(join(migrationsDir, file), 'utf-8');
  const hash = `${file}:${sql.length}`;

  const existing = sqlite.query('SELECT id FROM _drizzle_migrations WHERE hash = ?').get(hash);
  if (!existing) {
    console.log(`Applying migration: ${file}`);
    sqlite.exec(sql);
    sqlite.run('INSERT INTO _drizzle_migrations (hash, created_at) VALUES (?, ?)', [hash, new Date().toISOString()]);
  }
}

console.log('Migrations done.');
