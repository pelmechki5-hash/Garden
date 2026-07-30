alter table public.user_settings
  add column if not exists default_currency text not null default 'KZT',
  add column if not exists default_due_days integer not null default 7
    check (default_due_days between 0 and 365);

create table if not exists public.blacklist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  person_name text not null,
  reason text not null default '',
  created_at timestamptz not null default now()
);

alter table public.blacklist enable row level security;

create policy "read own blacklist" on public.blacklist
  for select using (auth.uid() = user_id);
create policy "insert own blacklist" on public.blacklist
  for insert with check (auth.uid() = user_id);
create policy "update own blacklist" on public.blacklist
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own blacklist" on public.blacklist
  for delete using (auth.uid() = user_id);
