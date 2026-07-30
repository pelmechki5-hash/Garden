alter table public.debts
  add column if not exists reminder_3d_sent_at timestamptz;

create index if not exists debts_due_reminder_idx
  on public.debts (due_at)
  where status = 'active' and reminder_3d_sent_at is null;
