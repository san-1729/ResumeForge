import type { Config } from 'drizzle-kit';

const config: any = {
  schema: './app/db/schema.ts',
  out: './supabase/migrations',
  driver: 'pg',
  dbCredentials: {
    connectionString: process.env.SUPABASE_DB_URL ?? ''
  }
};

export default config as Config; 