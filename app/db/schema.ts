import { pgTable, uuid, text, jsonb, timestamp, boolean } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').primaryKey(),
});

export const templates = pgTable('templates', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').unique(),
  name: text('name'),
  thumbnailUrl: text('thumbnail_url'),
  baseHtml: text('base_html'),
  baseCss: text('base_css'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const resumes = pgTable('resumes', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  templateId: uuid('template_id').references(() => templates.id),
  title: text('title'),
  isFinal: boolean('is_final').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const resumeVersions = pgTable('resume_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  resumeId: uuid('resume_id').references(() => resumes.id),
  html: text('html').notNull(),
  css: text('css').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const linkedinProfiles = pgTable('linkedin_profiles', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id').references(() => users.id),
  url: text('url').unique(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const linkedinProfileVersions = pgTable('linkedin_profile_versions', {
  id: uuid('id').primaryKey().defaultRandom(),
  profileId: uuid('profile_id').references(() => linkedinProfiles.id),
  payload: jsonb('payload').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
}); 