import { json } from '@remix-run/node';
import type { ActionFunctionArgs } from '@remix-run/node';
import { db } from '~/lib/db.server';
import { resumeVersions, resumes } from '~/db/schema';
import { requireUser } from '~/lib/auth.server';
import { eq } from 'drizzle-orm';

export async function action({ request, params }: ActionFunctionArgs) {
  if (request.method !== 'POST') throw new Response('Method Not Allowed', { status: 405 });
  const user = await requireUser(request);
  const resumeId = params.id as string;
  // Ensure resume belongs to user
  const check = await db.select({ userId: resumes.userId }).from(resumes).where(eq(resumes.id, resumeId)).limit(1);
  if (check.length === 0 || check[0].userId !== user.id) {
    throw new Response('Forbidden', { status: 403 });
  }
  const { html, css } = (await request.json()) as any;
  const [version] = await db.insert(resumeVersions).values({ resumeId, html, css }).returning();
  return json(version, { status: 201 });
} 