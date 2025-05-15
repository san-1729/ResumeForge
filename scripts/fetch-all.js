import postgres from 'postgres';

const userId = process.argv[2];
if (!userId) {
  console.error('Usage: node scripts/fetch-all.js <userId>');
  process.exit(1);
}

(async () => {
  const url = process.env.SUPABASE_DB_URL;
  if (!url) {
    console.error('SUPABASE_DB_URL missing');
    process.exit(1);
  }
  const sql = postgres(url,{ssl:'require'});

  const resumes = await sql`select id,title,created_at,updated_at from public.resumes where user_id=${userId}`;
  console.log('Resumes for user', userId, resumes);

  if (resumes.length){
    const ids = resumes.map(r=>r.id);
    const versions = await sql`select resume_id, count(*) as version_count from public.resume_versions where resume_id = any(${ids}) group by resume_id`;
    console.log('Version counts', versions);
  }

  const profiles = await sql`select id,url from public.linkedin_profiles where user_id=${userId}`;
  console.log('LinkedIn profiles', profiles);

  await sql.end();
})(); 