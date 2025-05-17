import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { db } from '~/lib/db.server';
import { templates } from '~/db/schema';
import { eq } from 'drizzle-orm';

export async function loader({ params }: LoaderFunctionArgs) {
  const id = params.id as string;
  const result = await db.select().from(templates).where(eq(templates.id, id)).limit(1);
  if (result.length === 0) {
    throw new Response('Not Found', { status: 404 });
  }
  return json(result[0]);
} 