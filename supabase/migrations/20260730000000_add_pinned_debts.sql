alter table public.debts
  add column if not exists pinned boolean not null default false;
