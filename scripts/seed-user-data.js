import postgres from 'postgres';

(async()=>{
 const userId = 'ae2ab57d-ceb3-482e-b943-efb95a0b2a23';
 const templateId = '52f18db0-9483-4c3b-81e7-a29569f2b165';
 const sql = postgres(process.env.SUPABASE_DB_URL,{ssl:'require'});
 // insert resume
 const [resume] = await sql`insert into public.resumes (user_id,template_id,title) values (${userId},${templateId},'Demo Resume') returning id`;
 await sql`insert into public.resume_versions (resume_id,html,css) values (${resume.id},'<html><h1>Demo</h1></html>','h1{color:red}')`;
 // LinkedIn profile
 const [{id:profileId}] = await sql`insert into public.linkedin_profiles (user_id,url) values (${userId},'https://linkedin.com/in/demo') on conflict (url) do update set user_id=excluded.user_id returning id`;
 await sql`insert into public.linkedin_profile_versions (profile_id,payload) values (${profileId}, ${sql.json({full_name:'Demo User',headline:'Engineer'})})`;
 console.log('Seeded');
 await sql.end();
})(); 