import { json } from '@remix-run/node';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { db } from '~/lib/db.server';
import { templates } from '~/db/schema';

export async function loader({ request }: LoaderFunctionArgs) {
  const data = await db.select().from(templates);
  return json(data);
} 