alter table public.user_settings
  add column if not exists language text not null default 'ru'
  check (language in ('ru', 'kk', 'en', 'tr', 'uz', 'ky', 'zh', 'de', 'fr', 'es'));
