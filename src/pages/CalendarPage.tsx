import { useMemo, useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { BottomNav } from '../components/BottomNav';
import { DebtCard } from '../components/DebtCard';
import { useDebts } from '../context/DebtsContext';
import { useI18n } from '../context/I18nContext';
import { useSettings } from '../context/SettingsContext';
import { dueTone } from '../lib/date';

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function CalendarPage() {
  const { debts } = useDebts();
  const { settings } = useSettings();
  const t = useI18n();
  const [month, setMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const [selected, setSelected] = useState(() => dateKey(new Date()));
  const activeWithDueDate = debts.filter((debt) => debt.status === 'active' && debt.due_at);
  const selectedDebts = activeWithDueDate.filter((debt) => debt.due_at === selected);

  const days = useMemo(() => {
    const firstWeekday = (month.getDay() + 6) % 7;
    const gridStart = new Date(month.getFullYear(), month.getMonth(), 1 - firstWeekday);
    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      return date;
    });
  }, [month]);

  function moveMonth(offset: number) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }

  function toneForDay(key: string) {
    const tones = activeWithDueDate.filter((debt) => debt.due_at === key).map((debt) => dueTone(debt.due_at));
    if (tones.includes('overdue')) return 'overdue';
    if (tones.includes('soon')) return 'soon';
    return tones.length ? 'safe' : '';
  }

  return (
    <main className="app-shell">
      <AppHeader title={t('calendar')} subtitle={t('dueDates').toUpperCase()} />
      <section className="calendar-card">
        <header>
          <button onClick={() => moveMonth(-1)} aria-label={t('previousMonth')}>‹</button>
          <strong>{new Intl.DateTimeFormat(settings.language, { month: 'long', year: 'numeric' }).format(month)}</strong>
          <button onClick={() => moveMonth(1)} aria-label={t('nextMonth')}>›</button>
        </header>
        <div className="calendar-weekdays">
          {weekdays.map((day, index) => (
            <span key={day}>{new Intl.DateTimeFormat(settings.language, { weekday: 'short' }).format(days[index])}</span>
          ))}
        </div>
        <div className="calendar-grid">
          {days.map((date) => {
            const key = dateKey(date);
            const tone = toneForDay(key);
            return (
              <button
                key={key}
                className={`${date.getMonth() !== month.getMonth() ? 'muted' : ''} ${selected === key ? 'selected' : ''} ${tone ? `calendar-day--${tone}` : ''}`}
                onClick={() => setSelected(key)}
              >
                {date.getDate()}
                {tone && <i />}
              </button>
            );
          })}
        </div>
      </section>
      <section className="calendar-results">
        <h2>{new Intl.DateTimeFormat(settings.language, { day: 'numeric', month: 'long' }).format(new Date(`${selected}T00:00:00`))}</h2>
        <div className="debt-list">
          {selectedDebts.map((debt) => <DebtCard key={debt.id} debt={debt} feeSettings={settings} />)}
          {selectedDebts.length === 0 && <p>{t('noDebtsThisDay')}</p>}
        </div>
      </section>
      <BottomNav />
    </main>
  );
}
