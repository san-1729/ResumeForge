import { createSupabaseClient } from '~/lib/supabase/client';

export async function requireUser(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) {
    throw new Response('Unauthorized', { status: 401 });
  }
  const [, token] = authHeader.split(' ');
  if (!token) {
    throw new Response('Unauthorized', { status: 401 });
  }
  const supabase = createSupabaseClient();
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data?.user) {
    throw new Response('Unauthorized', { status: 401 });
  }
  return data.user;
} 