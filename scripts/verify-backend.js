import postgres from 'postgres';

(async () => {
  if (!process.env.SUPABASE_DB_URL) {
    console.error('SUPABASE_DB_URL not set');
    process.exit(1);
  }
  const sql = postgres(process.env.SUPABASE_DB_URL, { ssl: 'require' });
  const resumes = await sql`select id,title,created_at from public.resumes order by created_at desc limit 5`;
  const versionCount = await sql`select count(*) as count from public.resume_versions`;
  console.log('Recent resumes:', resumes);
  console.log('Total resume_versions:', versionCount[0].count);
  await sql.end();
})(); 