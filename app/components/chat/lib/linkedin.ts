import type { LinkedInProfile } from '~/lib/stores/linkedin';

export const formatLinkedInDataForPrompt = (profile: LinkedInProfile) =>
  [
    `Name: ${profile.fullName}`,
    `Headline: ${profile.headline}`,
    '',
    'Experience:',
    ...profile.experience.map(
      (exp) =>
        `- ${exp.title} @ ${exp.company} (${exp.startDate} – ${exp.endDate ?? 'Present'})`
    ),
    '',
    'Education:',
    ...profile.education.map(
      (edu) => `- ${edu.degree} @ ${edu.school} (${edu.year ?? '—'})`
    ),
  ].join('\n');
