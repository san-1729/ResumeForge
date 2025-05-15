import { json } from '@remix-run/cloudflare';
import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { db } from '~/lib/db.server';
import { templates } from '~/db/schema';

export async function loader({ request }: LoaderFunctionArgs) {
  const data = await db.select().from(templates);
  return json(data);
} 