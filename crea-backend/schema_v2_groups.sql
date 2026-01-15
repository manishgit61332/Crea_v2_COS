-- ==========================================
-- CREA DATABASE V2.1: TELEGRAM GROUPS
-- ==========================================

create table public.org_chats (
    id uuid default gen_random_uuid() primary key,
    organization_id uuid references public.organizations(id) not null,
    telegram_chat_id bigint not null unique,
    telegram_chat_title text,
    created_by uuid references public.profiles(id),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.org_chats enable row level security;

create policy "Users can view their org chats" on public.org_chats
  for select using (
    organization_id in (select organization_id from public.profiles where id = auth.uid())
  );
