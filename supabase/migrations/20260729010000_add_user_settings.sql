create table if not exists public.user_settings (
  user_id uuid primary key default auth.uid() references auth.users (id) on delete cascade,
  large_text boolean not null default false,
  late_fee_enabled boolean not null default true,
  late_fee_start numeric(8, 2) not null default 1 check (late_fee_start >= 0),
  late_fee_daily numeric(8, 2) not null default 0.5 check (late_fee_daily >= 0),
  updated_at timestamptz not null default now()
);

alter table public.user_settings enable row level security;

create policy "read own settings" on public.user_settings
  for select using (auth.uid() = user_id);
create policy "insert own settings" on public.user_settings
  for insert with check (auth.uid() = user_id);
create policy "update own settings" on public.user_settings
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
