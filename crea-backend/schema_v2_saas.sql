-- ==========================================
-- CREA DATABASE V2: SAAS MULTI-TENANCY
-- ==========================================

-- 1. Organizations Table (The "Hive")
create table public.organizations (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  join_code text unique, -- Simple mechanism for now
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.organizations enable row level security;

-- 2. Update Profiles (Users belong to Orgs)
alter table public.profiles 
add column organization_id uuid references public.organizations(id),
add column role text default 'member'; -- 'owner', 'member'

-- RLS: Users can view their own org info
create policy "Users can view their own organization" on public.organizations
  for select using (
    id in (select organization_id from public.profiles where id = auth.uid())
  );

-- 3. Projects (Owned by Org, Visible to Members)
alter table public.projects
add column organization_id uuid references public.organizations(id);

-- Migration: If you have existing data, this would need a default value, 
-- but for MVP restart we assume clean slate or manual fix.

create policy "Users can view org projects" on public.projects
  for select using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );
  
create policy "Users can create org projects" on public.projects
  for insert with check (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

-- 4. Tasks (Owned by Org, Assigned to User)
alter table public.tasks
add column organization_id uuid references public.organizations(id),
add column assigned_to uuid references public.profiles(id);

create policy "Users can view org tasks" on public.tasks
  for select using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

create policy "Users can update org tasks" on public.tasks
  for update using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );

-- 5. Decisions (The Corporate Ledger)
alter table public.decisions
add column organization_id uuid references public.organizations(id);

-- 6. Memory Fragments (Shared Hive Mind)
-- This is critical: "Hive Mind" means accessing shared vectors.
alter table public.memory_fragments
add column organization_id uuid references public.organizations(id),
add column privacy_level text default 'org'; -- 'personal', 'org'

create policy "Users can view shared org memory" on public.memory_fragments
  for select using (
    (privacy_level = 'org' and organization_id in (select organization_id from public.profiles where id = auth.uid()))
    OR
    (privacy_level = 'personal' and user_id = auth.uid())
  );

-- RPC Function Update for Hive Mind Search
-- We need to update the matching function to fallback to searching the ORG if not found personally, 
-- or search both.
drop function if exists public.match_memory_fragments;

create or replace function public.match_memory_fragments (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_user_id uuid,
  filter_org_id uuid
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float,
  privacy_level text
)
language plpgsql
as $$
begin
  return query
  select
    public.memory_fragments.id,
    public.memory_fragments.content,
    public.memory_fragments.metadata,
    1 - (public.memory_fragments.embedding <=> query_embedding) as similarity,
    public.memory_fragments.privacy_level
  from public.memory_fragments
  where 
  (
    (public.memory_fragments.privacy_level = 'personal' and public.memory_fragments.user_id = filter_user_id)
    OR
    (public.memory_fragments.privacy_level = 'org' and public.memory_fragments.organization_id = filter_org_id)
  )
  and 1 - (public.memory_fragments.embedding <=> query_embedding) > match_threshold
  order by public.memory_fragments.embedding <=> query_embedding
  limit match_count;
end;
$$;
