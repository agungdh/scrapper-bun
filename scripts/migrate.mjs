import { existsSync, mkdirSync } from 'fs';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { client, db } from '../src/db/index.js';
import { join } from 'path';

const dir = join(import.meta.dirname, '..', 'data');
if (!existsSync(dir)) mkdirSync(dir, { recursive: true });

client.execute('PRAGMA journal_mode = WAL');
client.execute('PRAGMA synchronous = NORMAL');
await migrate(db, { migrationsFolder: join(import.meta.dirname, '..', 'drizzle') });

console.log('Migrations done.');