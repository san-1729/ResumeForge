import { json } from '@remix-run/node';
import type { ActionFunctionArgs, LoaderFunctionArgs } from '@remix-run/node';
import { db } from '~/lib/db.server';
import { resumes, resumeVersions } from '~/db/schema';
import { requireUser } from '~/lib/auth.server';
import { eq, desc, sql as dsql } from 'drizzle-orm';

export async function action({ request }: ActionFunctionArgs) {
  if (request.method !== 'POST') {
    throw new Response('Method Not Allowed', { status: 405 });
  }
  const user = await requireUser(request);
  const { title, templateId, html, css } = (await request.json()) as any;

  // Insert resume
  const [resume] = await db
    .insert(resumes)
    .values({ userId: user.id, title, templateId })
    .returning();

  // Insert initial version
  await db.insert(resumeVersions).values({ resumeId: resume.id, html, css });
  return json(resume, { status: 201 });
}

// GET /api/resumes – list metadata for the authenticated user
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);
  // Select latest version timestamp via lateral join
  const rows = await db
    .select({
      id: resumes.id,
      title: resumes.title,
      updatedAt: resumes.updatedAt,
      createdAt: resumes.createdAt,
    })
    .from(resumes)
    .where(eq(resumes.userId, user.id))
    .orderBy(desc(resumes.updatedAt));

  return json(rows);
} 