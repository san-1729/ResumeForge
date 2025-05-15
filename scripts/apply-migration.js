import fs from 'fs';
import path from 'path';
import postgres from 'postgres';

function loadEnv() {
  if (process.env.SUPABASE_DB_URL) return;
  const envPath = path.resolve('.env.local');
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\n/);
  for (const line of lines) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
    if (m) {
      const [, key, val] = m;
      if (!process.env[key]) process.env[key] = val.trim();
    }
  }
}

async function main() {
  loadEnv();
  if (!process.env.SUPABASE_DB_URL) {
    console.error('SUPABASE_DB_URL not found in env');
    process.exit(1);
  }
  const conn = postgres(process.env.SUPABASE_DB_URL, { ssl: 'require' });
  const sqlFile = path.resolve('supabase/migrations/20250615000000_init.sql');
  const content = fs.readFileSync(sqlFile, 'utf8');
  const statements = content.split(/;\s*\n/).map(s => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    console.log('Executing:', stmt.slice(0, 80).replace(/\n/g, ' '));
    await conn.unsafe(stmt + ';');
  }
  await conn.end();
  console.log('Migration applied successfully');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
}); 