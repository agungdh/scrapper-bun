import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

const client = createClient({ url: 'file:./data/scrapper.db' });
client.execute('PRAGMA foreign_keys = ON');
const db = drizzle(client);

export { client, db };