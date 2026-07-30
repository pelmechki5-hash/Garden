import { AppHeader } from '../components/AppHeader';
import { DebtCard } from '../components/DebtCard';
import { EmptyState } from '../components/EmptyState';
import { useDebts } from '../context/DebtsContext';
import { useSettings } from '../context/SettingsContext';
import { daysUntilDue } from '../lib/date';
import { useI18n } from '../context/I18nContext';

export function OverduePage() {
  const { debts, loading } = useDebts();
  const { settings } = useSettings();
  const t = useI18n();
  const overdue = debts.filter((debt) => debt.status === 'active' && (daysUntilDue(debt.due_at) ?? 0) < 0);

  return (
    <main className="app-shell app-shell--detail">
      <AppHeader title={t('overdue')} subtitle={t('overdueStatus').toUpperCase()} backHref="/" />
      <section className="alert-banner"><span>!</span><div><strong>{t('overdueCount', { count: overdue.length })}</strong><p>{t('overdueHint')}</p></div></section>
      {loading && <p className="screen-message">{t('loading')}</p>}
      <section className="debt-list">
        {overdue.map((debt) => <DebtCard key={debt.id} debt={debt} feeSettings={settings} />)}
        {!loading && overdue.length === 0 && <EmptyState />}
      </section>
    </main>
  );
}
