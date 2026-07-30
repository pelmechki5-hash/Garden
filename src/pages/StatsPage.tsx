import { AppHeader } from '../components/AppHeader';
import { useDebts } from '../context/DebtsContext';
import { useSettings } from '../context/SettingsContext';
import { lateFee } from '../lib/date';
import { useI18n } from '../context/I18nContext';

export function StatsPage() {
  const { debts } = useDebts();
  const { settings } = useSettings();
  const t = useI18n();
  const active = debts.filter((debt) => debt.status === 'active');
  const returned = debts.filter((debt) => debt.status === 'returned');
  const things = active.filter((debt) => debt.amount === null);
  const completion = debts.length ? Math.round((returned.length / debts.length) * 100) : 0;
  const fees = active.reduce(
    (sum, debt) => sum + lateFee(debt.due_at, settings.late_fee_enabled, settings.late_fee_start, settings.late_fee_daily),
    0,
  );

  return (
    <main className="app-shell app-shell--detail">
      <AppHeader title={t('statistics')} subtitle={t('underControl').toUpperCase()} backHref="/" />
      <section className="stats-hero"><strong>{completion}%</strong><span>{t('returnedPercent')}</span><div><i style={{ width: `${completion}%` }} /></div></section>
      <section className="stats-grid">
        <article><span>📌</span><strong>{active.length}</strong><small>{t('active')}</small></article>
        <article><span>✅</span><strong>{returned.length}</strong><small>{t('returned')}</small></article>
        <article><span>📦</span><strong>{things.length}</strong><small>{t('thingsLent')}</small></article>
        <article><span>🔥</span><strong>{fees.toLocaleString(settings.language)} €</strong><small>{t('fees')}</small></article>
      </section>
    </main>
  );
}
