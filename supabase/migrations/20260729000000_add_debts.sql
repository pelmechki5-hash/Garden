create table if not exists public.debts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  person_name text not null,
  item_name text not null,
  amount numeric(12, 2) check (amount is null or amount >= 0),
  currency text not null default 'KZT',
  description text not null default '',
  lent_at date not null default current_date,
  due_at date,
  status text not null default 'active' check (status in ('active', 'returned')),
  photo_path text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.debts enable row level security;

create policy "read own debts" on public.debts
  for select using (auth.uid() = user_id);
create policy "insert own debts" on public.debts
  for insert with check (auth.uid() = user_id);
create policy "update own debts" on public.debts
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own debts" on public.debts
  for delete using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('debt-photos', 'debt-photos', false)
on conflict (id) do nothing;

create policy "read own debt photos" on storage.objects
  for select using (bucket_id = 'debt-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "upload own debt photos" on storage.objects
  for insert with check (bucket_id = 'debt-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "update own debt photos" on storage.objects
  for update using (bucket_id = 'debt-photos' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "delete own debt photos" on storage.objects
  for delete using (bucket_id = 'debt-photos' and (storage.foldername(name))[1] = auth.uid()::text);
