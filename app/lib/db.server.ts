import { drizzle } from 'drizzle-orm/postgres-js';
// @ts-ignore -- module provided at runtime, types bundled with package
import postgres from 'postgres';
import * as schema from '~/db/schema';

// Cloudflare recommends keeping a global for connection reuse
const client = postgres(process.env.SUPABASE_DB_URL!, {
  ssl: 'require',
});

export const db = drizzle(client, { schema }); 