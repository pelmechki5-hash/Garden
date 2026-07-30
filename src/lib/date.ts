const DAY_MS = 86_400_000;

export function dueTone(dueAt: string | null) {
  if (!dueAt) return 'safe';
  const days = Math.ceil((new Date(`${dueAt}T23:59:59`).getTime() - Date.now()) / DAY_MS);
  if (days < 0) return 'overdue';
  if (days <= 3) return 'soon';
  return 'safe';
}

export function daysUntilDue(dueAt: string | null) {
  if (!dueAt) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(`${dueAt}T00:00:00`);
  return Math.round((due.getTime() - today.getTime()) / DAY_MS);
}

interface DueLabels {
  noDue: string;
  overdue: (days: number) => string;
  today: string;
  left: (days: number) => string;
}

export function dueLabel(dueAt: string | null, labels: DueLabels) {
  const days = daysUntilDue(dueAt);
  if (days === null) return labels.noDue;
  if (days < 0) return labels.overdue(Math.abs(days));
  if (days === 0) return labels.today;
  return labels.left(days);
}

export function lateFee(dueAt: string | null, enabled = true, start = 1, daily = 0.5) {
  const days = daysUntilDue(dueAt);
  if (!enabled || days === null || days >= 0) return 0;
  return Number(start) + (Math.abs(days) - 1) * Number(daily);
}

export function formatDate(date: string | null, locale = 'ru', empty = '—') {
  if (!date) return empty;
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' })
    .format(new Date(`${date}T00:00:00`));
}
