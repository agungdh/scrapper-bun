import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';

const client = createClient({ url: 'file:./data/scrapper.db' });
const db = drizzle(client);

export { client, db };