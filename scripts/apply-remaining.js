import postgres from 'postgres';

const sqlText = `
create policy "resume_versions_owner" on public.resume_versions for all
  using (auth.uid() = (select user_id from public.resumes where id = resume_id));

create policy "linkedin_profiles_owner" on public.linkedin_profiles for all
  using (auth.uid() = user_id);

create policy "linkedin_profile_versions_owner" on public.linkedin_profile_versions for all
  using (auth.uid() = (select user_id from public.linkedin_profiles where id = profile_id));
`;

(async () => {
  const conn = postgres(process.env.SUPABASE_DB_URL, { ssl: 'require' });
  for (const stmt of sqlText.split(/;\s*\n/).map(s=>s.trim()).filter(Boolean)) {
    console.log('Executing statement:', stmt.slice(0,60));
    await conn.unsafe(stmt + ';');
  }
  await conn.end();
  console.log('Done');
})(); 