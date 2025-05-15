---
description: 
globs: 
alwaysApply: false
---
# MCG Admin Panel – Design & Implementation Guide  (draft 2025-05-15)

This document is the single source of truth for the upcoming **Admin Panel**.  
It describes the goals, DB changes, API surface, Remix routes, UI wireframes, and rollout plan.

> Audience: any contributor; especially new interns. Read this top-to-bottom before touching admin code.

---
## 0. Why an Admin Panel?

* View all user-generated resumes & LinkedIn imports.
* Moderate or delete inappropriate content.
* View user accounts, promote/demote admins.
* Basic analytics (counts, latest activity).
* Self-service operations (re-run migrations, flush templates, etc.).

The panel MUST live behind authentication and the `is_admin` flag.  
Performance is not critical; clarity and safety are.

---
## 1. Authentication & RLS changes

### 1.1 `is_admin` column
```sql
alter table auth.users add column if not exists is_admin boolean default false;
-- Promote initial admin (replace with your uid)
update auth.users set is_admin = true where email = 'sanchaythalnerkar@gmail.com';
```

### 1.2 RLS helper function (optional)
```sql
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce((select is_admin from auth.users where id = auth.uid()), false);
$$;
```
### 1.3 Policy patch example
```sql
alter table public.resumes enable row level security;
create policy "admin_resume_read" on public.resumes
  for select using ( public.is_admin() or user_id = auth.uid() );
```
Repeat for every table.

---
## 2. API namespace

All admin routes live under `/admin/api/*` and are server-only Remix routes.
They check `requireAdmin(request)` which extends `requireUser`.

| Route                             | Method | Description                      |
|-----------------------------------|--------|----------------------------------|
| `/admin/api/resumes`              | GET    | List all resumes (paginated)     |
| `/admin/api/resumes/:id/delete`   | POST   | Hard-delete resume + versions     |
| `/admin/api/users`                | GET    | List auth.users (email, created) |
| `/admin/api/users/:id/toggle-admin`| POST  | Flip `is_admin` flag              |
| `/admin/api/templates/refresh`    | POST   | Re-seed template catalogue        |

All routes run under service-role key automatically (Workers env) so they can bypass RLS.

---
## 3. Remix route structure
```text
app/routes/
  admin._layout.tsx           # shared sidebar/header
  admin._index.tsx            # dashboard metrics
  admin.resumes._index.tsx    # list table
  admin.resumes.$id.tsx       # detail view
  admin.users._index.tsx      # user list
  admin.users.$id.tsx         # user detail (toggle admin)
  admin.api.*.ts              # server actions (see §2)
```
File naming uses Remix v2 flat-routes with dots: `admin.resumes.$id.tsx`.

### 3.1 Loader/auth wrapper
```ts
export async function loader({request}: LoaderArgs) {
  const user = await requireAdmin(request); // throws 403 if not admin
  // fetch data
}
```

### 3.2 `requireAdmin`
```ts
export async function requireAdmin(request: Request) {
  const user = await requireUser(request);
  if (!user.raw_user_meta_data?.is_admin) throw new Response('Forbidden', {status:403});
  return user;
}
```

---
## 4. Front-end using Radix + Tailwind (crud-style)

* Sidebar links: Dashboard, Resumes, LinkedIn, Users, Settings.
* Tables built with `<table>` + sticky header, sortable columns.
* Detail page shows JSON payload in `<pre>` plus action buttons.

No client JS apart from Remix's default – data loads via loaders, form submits use `<Form method="post">`.

---
## 5. Analytics metrics (phase 2)

* Total users, new users last 7 days.
* Resumes generated per day.
* LinkedIn imports per day.
* Stored as materialized view `admin.metrics` refreshed every 10 minutes via Supabase scheduled task.

---
## 6. Roll-out plan

1. **Migration** – add `is_admin`, function `is_admin()`, policy patches.
2. **Route scaffolding** – layout + requireAdmin + empty pages (gray boxes).
3. **Resumes list/detail** (CRUD).
4. LinkedIn list.
5. User list & toggle admin.
6. Metrics dashboard.
7. Styling polish.

Feature-flag via `ENABLE_ADMIN` env to keep hidden until ready.

---
## 7. For the intern – how to work on admin features

* **Locate code**: all admin UI lives in `app/routes/admin.*`. Loader/server logic is collocated.
* **DB access**: use `db` drizzle client – no need to write raw SQL except for advanced queries.
* **Add a new endpoint?**
  1. Create a file `admin.api.<thing>.ts` with `action`.
  2. Call it from UI with `<Form method="post" action="/admin/api/thing">`.
* **Styling**: follow existing Tailwind classes; see `components/ui/Dialog.tsx` for modal patterns.

---
This doc will evolve; update each section as tasks land.  Until merged into main, treat as source-controlled WIP.
