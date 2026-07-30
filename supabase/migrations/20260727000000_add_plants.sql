create table public.plants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  species text not null default '',
  water_ml integer not null check (water_ml between 1 and 10000),
  next_watering_at timestamptz not null,
  repeat_minutes integer not null default 10 check (repeat_minutes between 1 and 1440),
  photo_path text,
  created_at timestamptz not null default now()
);

alter table public.plants enable row level security;

create policy "read own plants" on public.plants for select using (auth.uid() = user_id);
create policy "insert own plants" on public.plants for insert with check (auth.uid() = user_id);
create policy "update own plants" on public.plants for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "delete own plants" on public.plants for delete using (auth.uid() = user_id);

insert into storage.buckets (id, name, public)
values ('plant-photos', 'plant-photos', true)
on conflict (id) do nothing;

create policy "upload own plant photos" on storage.objects for insert to authenticated
with check (bucket_id = 'plant-photos' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "update own plant photos" on storage.objects for update to authenticated
using (bucket_id = 'plant-photos' and owner_id = auth.uid()::text);

create policy "delete own plant photos" on storage.objects for delete to authenticated
using (bucket_id = 'plant-photos' and owner_id = auth.uid()::text);
