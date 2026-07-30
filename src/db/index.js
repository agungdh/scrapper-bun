import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { DB_PATH } from '../config.js';

const client = createClient({ url: `file:${DB_PATH}` });
client.execute('PRAGMA foreign_keys = ON');
client.execute('PRAGMA journal_mode = WAL');
client.execute('PRAGMA synchronous = NORMAL');
const db = drizzle(client);

export { client, db };
