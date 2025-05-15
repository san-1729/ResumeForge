-- Initial MCG schema

create extension if not exists "uuid-ossp";

create table public.templates (
   id uuid primary key default uuid_generate_v4(),
   slug text unique not null,
   name text,
   thumbnail_url text,
   base_html text,
   base_css text,
   created_at timestamptz default now()
);

create table public.resumes (
   id uuid primary key default uuid_generate_v4(),
   user_id uuid references auth.users(id) on delete cascade,
   template_id uuid references public.templates(id),
   title text,
   is_final boolean default false,
   created_at timestamptz default now(),
   updated_at timestamptz default now()
);

create table public.resume_versions (
   id uuid primary key default uuid_generate_v4(),
   resume_id uuid references public.resumes(id) on delete cascade,
   html text not null,
   css text not null,
   created_at timestamptz default now()
);

create table public.linkedin_profiles (
   id uuid primary key default uuid_generate_v4(),
   user_id uuid references auth.users(id) on delete cascade,
   url text unique,
   created_at timestamptz default now()
);

create table public.linkedin_profile_versions (
   id uuid primary key default uuid_generate_v4(),
   profile_id uuid references public.linkedin_profiles(id) on delete cascade,
   payload jsonb not null,
   created_at timestamptz default now()
);

-- Row Level Security
alter table public.resumes enable row level security;
alter table public.resume_versions enable row level security;
alter table public.linkedin_profiles enable row level security;
alter table public.linkedin_profile_versions enable row level security;

create policy "resumes_owner" on public.resumes for all
  using (auth.uid() = user_id);

authorize_resume_versions:
create policy "resume_versions_owner" on public.resume_versions for all
  using (auth.uid() = (select user_id from public.resumes where id = resume_id));

create policy "linkedin_profiles_owner" on public.linkedin_profiles for all
  using (auth.uid() = user_id);

create policy "linkedin_profile_versions_owner" on public.linkedin_profile_versions for all
  using (auth.uid() = (select user_id from public.linkedin_profiles where id = profile_id)); 