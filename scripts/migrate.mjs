import { migrate } from 'drizzle-orm/bun-sqlite/migrator';
import { db } from '../db/index.js';
import { join } from 'path';

await migrate(db, { migrationsFolder: join(import.meta.dirname, '..', 'drizzle') });

console.log('Migrations done.');