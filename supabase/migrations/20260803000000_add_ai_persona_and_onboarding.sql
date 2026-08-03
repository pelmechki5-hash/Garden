alter table public.user_settings
  add column if not exists ai_persona text not null default 'seal'
    check (ai_persona in ('seal', 'human')),
  add column if not exists onboarding_completed boolean not null default false;

update public.user_settings settings
set onboarding_completed = true
where exists (
  select 1 from public.debts debt where debt.user_id = settings.user_id
);
