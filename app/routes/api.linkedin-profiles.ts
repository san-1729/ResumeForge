import { json } from '@remix-run/cloudflare';
import type { LoaderFunctionArgs } from '@remix-run/cloudflare';
import { db } from '~/lib/db.server';
import { linkedinProfiles, linkedinProfileVersions } from '~/db/schema';
import { requireUser } from '~/lib/auth.server';
import { eq, desc } from 'drizzle-orm';

// GET /api/linkedin-profiles – list profiles (latest version embedded)
export async function loader({ request }: LoaderFunctionArgs) {
  const user = await requireUser(request);

  // Fetch profiles with latest version json (payload) using subquery
  const profiles = await db
    .select({
      id: linkedinProfiles.id,
      url: linkedinProfiles.url,
      createdAt: linkedinProfiles.createdAt,
    })
    .from(linkedinProfiles)
    .where(eq(linkedinProfiles.userId, user.id))
    .orderBy(desc(linkedinProfiles.createdAt));

  // Attach latest payload per profile
  const result = [];
  for (const p of profiles) {
    const [latest] = await db
      .select({ payload: linkedinProfileVersions.payload })
      .from(linkedinProfileVersions)
      .where(eq(linkedinProfileVersions.profileId, p.id))
      .orderBy(desc(linkedinProfileVersions.createdAt))
      .limit(1);
    result.push({ ...p, payload: latest?.payload || null });
  }

  return json(result);
} 