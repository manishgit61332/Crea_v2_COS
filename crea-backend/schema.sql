-- Enable the pgvector extension to work with embedding vectors
create extension if not exists vector;

-- Create an Enum for Task Status
create type task_status as enum ('Backlog', 'Next', 'Doing', 'Done');

-- 1. PROFILES (Identity & Operating System)
-- This table extends the default auth.users table in Supabase
create table public.profiles (
  id uuid references auth.users not null primary key,
  full_name text,
  timezone text default 'UTC',
  telegram_id bigint unique, -- Link to Telegram User ID
  
  -- The "Operating System" Bucket (Bucket #2)
  -- Stores structured rules: work hours, approval chains, tone preferences
  operating_system jsonb default '{}'::jsonb,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Profiles
alter table public.profiles enable row level security;

create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles
  for insert with check (auth.uid() = id);

-- 2. PROJECTS (Vision & Projects)
-- Buckets #3 (Vision) and #4 (Projects) live here.
create table public.projects (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  
  title text not null,
  description text, -- "Vision" details can go here or in specific 'Vision' type projects
  
  status text default 'Active',
  deadline timestamp with time zone,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Projects
alter table public.projects enable row level security;

create policy "Users can view own projects" on public.projects
  for select using (auth.uid() = user_id);
create policy "Users can insert own projects" on public.projects
  for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on public.projects
  for update using (auth.uid() = user_id);
create policy "Users can delete own projects" on public.projects
  for delete using (auth.uid() = user_id);


-- 3. TASKS (Bucket #5)
-- Strict state machine for atomic units of work
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  project_id uuid references public.projects(id), -- Optional: a task might not belong to a project
  
  title text not null,
  description text,
  
  status task_status default 'Backlog',
  priority text default 'Medium', -- High, Medium, Low
  
  due_date timestamp with time zone,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Tasks
alter table public.tasks enable row level security;

create policy "Users can view own tasks" on public.tasks
  for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on public.tasks
  for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks
  for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on public.tasks
  for delete using (auth.uid() = user_id);


-- 4. DECISIONS (Bucket #7)
-- The "Anti-Hallucination" Ledger of agreed choices.
-- Immutable log (mostly) - should be treated as high-value context.
create table public.decisions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  project_id uuid references public.projects(id),
  
  decision_text text not null, -- "We decided to launch on Friday"
  context text, -- "Because the client agreed to the MVP scope"
  
  committed_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Decisions
alter table public.decisions enable row level security;

create policy "Users can view own decisions" on public.decisions
  for select using (auth.uid() = user_id);
create policy "Users can insert own decisions" on public.decisions
  for insert with check (auth.uid() = user_id);
-- Decisions generally shouldn't be deleted/edited if they are an immutable ledger, 
-- but users might make mistakes.
create policy "Users can update own decisions" on public.decisions
  for update using (auth.uid() = user_id);


-- 5. CALENDAR EVENTS (Bucket #6)
-- Hard landscape of time
create table public.calendar_events (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  
  title text not null,
  start_at timestamp with time zone not null,
  end_at timestamp with time zone not null,
  
  location text,
  description text,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Calendar
alter table public.calendar_events enable row level security;

create policy "Users can view own calendar" on public.calendar_events
  for select using (auth.uid() = user_id);
create policy "Users can insert own calendar" on public.calendar_events
  for insert with check (auth.uid() = user_id);
create policy "Users can update own calendar" on public.calendar_events
  for update using (auth.uid() = user_id);
create policy "Users can delete own calendar" on public.calendar_events
  for delete using (auth.uid() = user_id);


-- 6. MEMORY FRAGMENTS (Bucket #1 - Identity / Unstructured)
-- Stores vector embeddings for semantic search.
create table public.memory_fragments (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) not null,
  
  content text not null, -- The raw text chunk
  metadata jsonb default '{}'::jsonb, -- distinct source, tags, conversation_id
  
  -- OpenAI text-embedding-3-small produces 1536 dimensions
  embedding vector(1536),
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for Memory Fragments
alter table public.memory_fragments enable row level security;

create policy "Users can view own memories" on public.memory_fragments
  for select using (auth.uid() = user_id);
create policy "Users can insert own memories" on public.memory_fragments
  for insert with check (auth.uid() = user_id);
create policy "Users can update own memories" on public.memory_fragments
  for update using (auth.uid() = user_id);
create policy "Users can delete own memories" on public.memory_fragments
  for delete using (auth.uid() = user_id);


-- Function to update 'updated_at' column
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = now();
    return new;
end;
$$ language 'plpgsql';

create trigger update_tasks_updated_at
before update on public.tasks
for each row execute procedure update_updated_at_column();

-- RPC Function for Vector Search
create or replace function public.match_memory_fragments (
  query_embedding vector(1536),
  match_threshold float,
  match_count int,
  filter_user_id uuid
)
returns table (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    public.memory_fragments.id,
    public.memory_fragments.content,
    public.memory_fragments.metadata,
    1 - (public.memory_fragments.embedding <=> query_embedding) as similarity
  from public.memory_fragments
  where public.memory_fragments.user_id = filter_user_id
  and 1 - (public.memory_fragments.embedding <=> query_embedding) > match_threshold
  order by public.memory_fragments.embedding <=> query_embedding
  limit match_count;
end;
$$;

