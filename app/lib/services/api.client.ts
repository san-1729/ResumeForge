import { createSupabaseClient } from '~/lib/supabase/client.client';

export async function api<T = any>(path: string, init: RequestInit = {}): Promise<T> {
  const supabase = createSupabaseClient();
  if (!supabase) throw new Error('Supabase client not available');
  const { data } = await supabase.auth.getSession();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers as Record<string, string> || {}),
  };
  if (data?.session?.access_token) {
    headers['Authorization'] = `Bearer ${data.session.access_token}`;
  }
  const res = await fetch(path, {
    ...init,
    headers,
  });
  if (!res.ok) {
    throw new Error(`API ${path} failed: ${res.status}`);
  }
  return res.json();
} 