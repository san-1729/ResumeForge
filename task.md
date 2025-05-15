# MCG Project Tasks

This document serves as a reference and planning guide for implementing new features in the MCG resume builder application.

## Feature Requirements

### 1. Change Preview as Default (Not Code)
**Description:**  
Change the default tab in the workbench panel to "Preview" instead of "Code" after resume generation.

**Implementation Plan:**
- Locate the `Workbench.client.tsx` component that handles the tab management
- Identify where the active tab is set after resume generation
- Modify the state to default to the "Preview" tab instead of "Code"
- Ensure this happens specifically after LLM completes resume generation

**Priority:** HIGH (1) - Simple change with high visibility impact

**Status:** COMPLETED ✓
- Changed default tab in the store from 'code' to 'preview'
- Added checks in `Workbench.client.tsx` to monitor artifacts and ensure preview is selected when complete
- Enhanced `useMessageParser.ts` to set preview tab when artifacts are closed
- Updated `workbench.ts` to prioritize preview tab in multiple scenarios

### 2. Landing Page Templates Section
**Description:**  
Add a templates section beneath the chat box on the landing page that displays template options for resumes. Selecting a template should update the user's session.

**Implementation Plan:**
- Add a new component `TemplateSelector.client.tsx` in `app/components/chat` directory
- Design a grid layout of template cards with Tailwind CSS
- Include template thumbnails, names, and selection state
- Add to `BaseChat.tsx` to display below example prompts
- Implement state management to track selected template
- Connect template selection to prompt/chat flow 
- Ensure templates appear only when chat hasn't started (like example prompts)

**Priority:** HIGH (2) - Core feature enhancing user experience

**Status:** COMPLETED ✓
- Created `TemplateSelector.client.tsx` component with template cards
- Implemented template store with Nanostores to track selected templates
- Added template selection section to the landing page
- Applied proper styling with dark background container and template cards 
- Added selection functionality with visual feedback and toast notifications
- Verified working in the application

### 3. LinkedIn Import Button
**Description:**  
Add a LinkedIn import button to the chat interface that appears as an option for users to import their profile data.

**Implementation Plan:**
- Add a new button component in the chat interface 
- Place it near the input area in `BaseChat.tsx`
- Style with appropriate LinkedIn branding and icons
- Add click handler (frontend only, no actual backend integration yet)
- Show toast notification on click explaining the feature is coming soon
- Ensure mobile responsiveness

**Priority:** MEDIUM (3) - UI enhancement that improves perceived functionality

**Status:** COMPLETED ✓
- Added LinkedIn import button in the chat interface next to the enhance prompt button
- Styled with LinkedIn's brand color (#0077B5) and logo icon
- Implemented toast notification "LinkedIn import feature coming soon!"
- Button appears on both landing page and in active chat
- Verified working in the application

### 4. Digital Portfolio Generation
**Description:**  
Add capability to convert a resume into a digital portfolio website, integrated into the existing UI flow.

**Implementation Plan:**
- Add a new tab or button in the workbench interface after resume generation
- Create a new component `PortfolioConverter.client.tsx` in appropriate directory
- Design UI that blends with current interface style
- Update system prompt in `prompts.ts` to include portfolio generation capabilities
- Add state tracking for portfolio mode
- Add portfolio-specific example templates
- Ensure preview displays correctly for portfolio vs resume modes

**Priority:** LOW (4) - Complex feature that builds on existing functionality

**Status:** COMPLETED ✓
- Created `PortfolioConverter.client.tsx` component with an intuitive UI
- Implemented `portfolio.ts` store to track portfolio conversion state
- Added portfolio mode toggle in the workbench header
- Updated `prompts.ts` with portfolio guidelines for the AI
- Added portfolio conversion functionality after resume generation
- Ensured smooth transition between resume and portfolio modes
- Verified working with toast notifications for user feedback

## Implementation Order and Timeline

1. **Change Preview as Default** - Quick win, immediate visual improvement ✓
2. **LinkedIn Import Button** - Simple UI enhancement ✓
3. **Landing Page Templates Section** - Core feature for template selection ✓
4. **Digital Portfolio Generation** - Complex feature building on foundation ✓

## Technical Considerations

### State Management
- Use existing Nanostores for global state (`workbenchStore`, `chatStore`)
- For new components, use local React state with hooks where appropriate
- Consider adding a new store for template management if needed

### UI/UX Design
- Follow existing Tailwind patterns and color schemes
- Maintain mobile responsiveness
- Ensure accessibility standards are maintained

### Code Organization
- Place new components in appropriate directories following project structure
- Client-side components should use `.client.tsx` extension
- Follow existing naming conventions

## Progress Tracking

- [x] Change Preview as Default
- [x] Landing Page Templates Section
- [x] LinkedIn Import Button
- [x] Digital Portfolio Generation

---

*All requested features have been successfully implemented!* 

# MCG – Master Task Board (updated 2025-05-15)

This file defines **every outstanding task** in order.  Use the checkboxes to
track progress; keep them in this file (not Jira) so contributors can PR small
changes.

> **PM Directive:** We do NOT reinvent wheels. Use Drizzle for SQL, Remix conventions for routing, Tailwind for styling. Fewer lines > clever hacks. Any new lib must be approved by PM.

> Legend:  
> ☐  = todo | ☑  = in-progress | ✓  = done

---

# Task Matrix (who does what?)

Below every task is grouped by discipline.  Read only your column at first – if
a task spans both, the interface between BE ↔ FE is spelled out.

| ID | Backend Developer Checklist (BE) | Front-End Developer Checklist (FE) |
|----|-----------------------------------|------------------------------------|
| **B-1** | **Admin flag migration** <br> ☐ create SQL migration (Drizzle + raw SQL) that adds `is_admin boolean default false` to `auth.users`. <br> ☐ generate + commit new SQL in `supabase/migrations/`. <br> ☐ seed owner via `scripts/promote-admin.js`. | n/a |
| **B-2** | **Helper functions** <br> ☐ add `public.is_admin()` SQL function. <br> ☐ export from new file `supabase/migrations/<timestamp>_admin_helpers.sql`. | n/a |
| **B-3** | **RLS patch** <br> ☐ Update policies in `20250615000000_init.sql` or new migration so `select … using (public.is_admin() OR user_id = auth.uid())`. <br> ☐ Write regression test (`vitest`) that normal user 403s. | n/a |
| **BE-API-1** | **/api/resumes/:id GET** <br> ☐ New loader in `app/routes/api.resumes.$id.ts` that returns latest HTML/CSS + meta. | **FE-S-1** consumes this endpoint when user opens a history item. |
| **BE-API-2** | **Pagination** <br> ☐ Accept `?limit&offset` on `/api/resumes`. <br> ☐ Default 20.  | **FE-S-1** handle infinite-scroll or pager buttons. |
| **BE-ADMIN-1** | Scaffold `/admin/api/resumes` etc. (CRUD). | **FE-ADMIN-1** build pages that hit those endpoints. |
| **BE-METRICS** | Create view `admin.metrics` + refresh function + Supabase scheduled task. | **FE-ADMIN-2** display graphs.
| **DX-1** | Add DEV script `scripts/expose-supabase.js` that injects `window.supabase` and docs. | Docs only.

---
## Detailed Steps (Backend Dev)

### 1. Admin Column Migration
1. `pnpm db:generate` will _not_ catch schema for **auth** schema. Create raw
   SQL under `supabase/migrations/202507010900_admin_flag.sql` containing:
   ```sql
   alter table auth.users add column if not exists is_admin boolean default false;
   ```
2. Regenerate drizzle (it will ignore auth schema but that's fine).  
3. Run `node scripts/apply-migration.js` locally to verify it applies.

### 2. Helper Function
Add to same SQL file:
```sql
create or replace function public.is_admin() returns boolean
language sql stable as $$
  select coalesce((select is_admin from auth.users where id = auth.uid()), false);
$$;
```

### 3. RLS Patch
Example for `resumes`:
```sql
create policy "admin_select" on public.resumes
  for select using ( public.is_admin() OR user_id = auth.uid() );
```
Repeat for `resume_versions`, `linkedin_profiles`, etc.

### 4. Endpoint `/api/resumes/:id` (latest)
File `app/routes/api.resumes.$id.ts`:
```ts
export async function loader({params,request}: LoaderArgs){
  const user= await requireUser(request);
  const id = params.id as string;
  const row = await db.select().from(resumes).where(eq(resumes.id,id)).limit(1);
  invariant(row.length);
  authorize(row[0].userId === user.id || user.is_admin);
  const [latest] = await db.select({html:rv.html,css:rv.css})
    .from(resumeVersions as rv)
    .where(eq(rv.resumeId,id))
    .orderBy(desc(rv.createdAt))
    .limit(1);
  return json({meta: row[0], ...latest});
}
```

Add `unstable_runtimeJS=false` export.

---
## Detailed Steps (Front-End Dev)

### FE-S-1 Sidebar History Rework
1. Create `historyStore` (Nanostore) with `{id,title,updatedAt}[]`.
2. In `Menu.client.tsx` `useEffect`, after user auth resolved:
   ```ts
   const data = await api<ResumeMeta[]>('/api/resumes');
   historyStore.set(data);
   ```
3. Render list under existing sidebar styles (`HistoryItem.tsx` clone).
4. On click item: fetch `/api/resumes/${id}`; call helper that overwrites
   WebContainer files then set `workbenchStore.resumeId`.
5. Show active state with `bg-bolt-elements-background-depth-2`.

### FE-ADMIN-1 CRUD pages
Use same Tailwind palette: sidebar width `w-60`, bg `bg-gray-800`, text `text-gray-100`.
`admin._layout.tsx` provides `<Outlet />` and handles navigation.

Resumes list table markup example:
```jsx
<table className="min-w-full text-sm">
 <thead className="bg-gray-700 text-gray-200 uppercase text-xs">
   <tr><th className="p-2">ID</th><th>Title</th><th>User</th><th>Date</th><th></th></tr>
 </thead>
 <tbody>{rows.map(r=> (
   <tr key={r.id} className="odd:bg-gray-800 hover:bg-gray-700">
     <td className="p-2 font-mono text-xs truncate w-32">{r.id}</td>
     <td>{r.title}</td>
     <td>{r.user_email}</td>
     <td>{format(r.created_at,'yyyy-MM-dd')}</td>
     <td><Form method="post" action={`/admin/api/resumes/${r.id}/delete`}>
       <button className="text-red-400 hover:text-red-200">Delete</button>
     </Form></td>
   </tr>))}
 </tbody>
</table>
```

### Graphs (FE-ADMIN-2)
1. Install `chart.js` + `react-chartjs-2` devDeps.  
2. In dashboard loader fetch `/admin/api/metrics` (to be added).  
3. Render line chart with Tailwind card wrapper.

---
### How to read Drizzle in Remix (intern quick tip)
1. `db` instance is imported from `~/lib/db.server`. Always runs only on
   server.  
2. In a route loader/action you can run `await db.select().from(table)` just
   like Django ORM queries inside a view.
3. Never import `db` into `.client.tsx`.

---
Update this file as tasks move – PRs failing to tick/untick boxes will be held.  
Happy shipping! 