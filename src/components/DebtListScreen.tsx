import { useMemo, useState } from 'react';
import { Link } from 'wouter';
import { useDebts } from '../context/DebtsContext';
import { filterAndSortDebts } from '../lib/sortDebts';
import { lateFee } from '../lib/date';
import { removeDebt, setDebtPinned } from '../lib/debts';
import { useSettings } from '../context/SettingsContext';
import type { DebtSort, DebtStatus } from '../types/debt';
import { AppHeader } from './AppHeader';
import { BottomNav } from './BottomNav';
import { DebtCard } from './DebtCard';
import { DebtFilters } from './DebtFilters';
import { EmptyState } from './EmptyState';
import { QuickMenu } from './QuickMenu';
import { useI18n } from '../context/I18nContext';
import { OnboardingHint } from './OnboardingHint';

export function DebtListScreen({ status }: { status: DebtStatus }) {
  const { debts, loading, error, refresh } = useDebts();
  const { settings, ready: settingsReady } = useSettings();
  const t = useI18n();
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<DebtSort>('date');
  const [trashHover, setTrashHover] = useState(false);
  const [burningId, setBurningId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState('');
  const visible = useMemo(
    () => filterAndSortDebts(debts.filter((debt) => debt.status === status), search, sort),
    [debts, search, sort, status],
  );
  const totals = Object.entries(visible.reduce<Record<string, number>>((result, debt) => {
    if (debt.amount !== null) result[debt.currency] = (result[debt.currency] ?? 0) + debt.amount;
    return result;
  }, {}));
  const totalFees = visible.reduce(
    (sum, debt) => sum + lateFee(debt.due_at, settings.late_fee_enabled, settings.late_fee_start, settings.late_fee_daily),
    0,
  );
  const showOnboarding = status === 'active' && settingsReady && !loading
    && debts.length === 0 && !settings.onboarding_completed;

  async function throwAway(debt: (typeof debts)[number]) {
    setBurningId(debt.id);
    setDeleteError('');
    await new Promise((resolve) => window.setTimeout(resolve, 720));
    try {
      await removeDebt(debt);
      await refresh();
    } catch {
      setDeleteError(t('deleteError'));
    } finally {
      setBurningId(null);
    }
  }

  async function togglePin(debt: (typeof debts)[number]) {
    setDeleteError('');
    try {
      await setDebtPinned(debt.id, !debt.pinned);
      await refresh();
    } catch {
      setDeleteError(t('pinError'));
    }
  }

  return (
    <main className="app-shell">
      <AppHeader
        title={status === 'active' ? t('debts') : t('history')}
        subtitle={status === 'active' ? t('activeRecords').toUpperCase() : t('returnedDebts').toUpperCase()}
        action={status === 'active' && <Link className={`add-button${showOnboarding ? ' onboarding-target' : ''}`} href="/new">+</Link>}
      />
      {showOnboarding && <OnboardingHint />}
      {status === 'active' && (
        <section className="dashboard-hero">
          <div>
            <span>{t('underControl').toUpperCase()}</span>
            <h2>{t('rememberEasy')}</h2>
            <p>{t('moneyAndThings')}</p>
            <div className="dashboard-actions">
              <Link href="/new">+ {t('add')}</Link>
              <Link href="/history">{t('history')}</Link>
            </div>
          </div>
          <img src="/images/debt-hero.png" alt="" />
        </section>
      )}
      {status === 'active' && (
        <section className="summary-grid">
          <article><span>{t('activeDebts')}</span><strong>{visible.length}</strong></article>
          <article className="summary-money">
            <span>{t('moneyLent')}</span>
            <strong>{totals.length ? totals.map(([currency, total]) => `${total.toLocaleString('ru-RU')} ${currency}`).join(' · ') : '0'}</strong>
            <small>{totalFees > 0 ? `${t('lateFee')}: ${totalFees.toLocaleString('ru-RU')} €` : t('currenciesSeparate')}</small>
          </article>
        </section>
      )}
      {status === 'active' && <QuickMenu />}
      <DebtFilters search={search} sort={sort} onSearch={setSearch} onSort={setSort} />
      <div className="status-legend" aria-label="Обозначения сроков">
        <span><i className="legend-dot legend-dot--safe" />{t('safe')}</span>
        <span><i className="legend-dot legend-dot--soon" />{t('soon')}</span>
        <span><i className="legend-dot legend-dot--overdue" />{t('overdueStatus')}</span>
      </div>
      {loading && <p className="screen-message">{t('loading')}</p>}
      {error && <p className="screen-message screen-message--error">{t(error)}</p>}
      {deleteError && <p className="screen-message screen-message--error">{deleteError}</p>}
      {!loading && !error && (
        <section className="debt-list">
          {visible.map((debt) => (
            <DebtCard
              key={debt.id}
              debt={debt}
              burning={burningId === debt.id}
              onTrash={(item) => void throwAway(item)}
              onTrashHover={setTrashHover}
              onPin={(item) => void togglePin(item)}
              feeSettings={settings}
            />
          ))}
          {visible.length === 0 && <EmptyState history={status === 'returned'} />}
        </section>
      )}
      <aside id="trash-drop" className={`trash-drop ${trashHover ? 'trash-drop--active' : ''}`} aria-label="Корзина">
        <span>🗑️</span>
        <small>{trashHover ? t('release') : t('trash')}</small>
      </aside>
      <BottomNav />
    </main>
  );
}
