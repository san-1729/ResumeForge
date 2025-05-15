import postgres from 'postgres';
(async()=>{
 const url=process.env.SUPABASE_DB_URL;
 if(!url){console.error('missing db url');process.exit(1);} 
 const sql=postgres(url,{ssl:'require'});
 const users= await sql`select id,email from auth.users limit 20`;
 console.log(users);
 await sql.end();
})(); 