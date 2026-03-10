-- Sync table: one row per user. No name, no location stored.
-- Run this in Supabase SQL Editor after creating your project.

create table if not exists public.sync (
  user_id uuid primary key references auth.users(id) on delete cascade,
  profile_json jsonb default '{}',
  sessions_json jsonb default '[]',
  updated_at timestamptz default now()
);

alter table public.sync enable row level security;

create policy "Users can read own sync"
  on public.sync for select
  using (auth.uid() = user_id);

create policy "Users can insert own sync"
  on public.sync for insert
  with check (auth.uid() = user_id);

create policy "Users can update own sync"
  on public.sync for update
  using (auth.uid() = user_id);

create policy "Users can delete own sync"
  on public.sync for delete
  using (auth.uid() = user_id);
