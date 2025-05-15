import postgres from 'postgres';

(async () => {
  const conn = postgres(process.env.SUPABASE_DB_URL, { ssl: 'require' });
  const result = await conn`
    insert into public.templates (slug,name)
    values ('classic','Classic')
    on conflict (slug) do update set name = excluded.name
    returning id;
  `;
  console.log(result);
  await conn.end();
})(); 