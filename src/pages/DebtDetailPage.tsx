import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';
import { AppHeader } from '../components/AppHeader';
import { DebtPhoto } from '../components/DebtPhoto';
import { useDebts } from '../context/DebtsContext';
import { dueLabel, formatDate, lateFee } from '../lib/date';
import { removeDebt, setDebtActive, setDebtReturned } from '../lib/debts';
import { useSettings } from '../context/SettingsContext';
import { useI18n } from '../context/I18nContext';

export function DebtDetailPage({ params }: { params: { id: string } }) {
  const [, navigate] = useLocation();
  const { debts, loading, refresh } = useDebts();
  const { settings } = useSettings();
  const t = useI18n();
  const [busy, setBusy] = useState(false);
  const [celebrating, setCelebrating] = useState(false);
  const [canUndo, setCanUndo] = useState(false);
  const debt = debts.find((item) => item.id === params.id);

  if (loading) return <main className="app-shell"><p className="screen-message">{t('recordLoading')}</p></main>;
  if (!debt) return <main className="app-shell"><AppHeader title={t('debtNotFound')} backHref="/" /></main>;
  const fee = debt.status === 'active'
    ? lateFee(debt.due_at, settings.late_fee_enabled, settings.late_fee_start, settings.late_fee_daily)
    : 0;

  useEffect(() => {
    if (!canUndo) return;
    const timer = window.setTimeout(() => setCanUndo(false), 7000);
    return () => window.clearTimeout(timer);
  }, [canUndo]);

  async function markReturned() {
    try {
      setBusy(true);
      await setDebtReturned(debt!.id);
      await refresh();
      setCelebrating(true);
      setCanUndo(true);
      window.setTimeout(() => setCelebrating(false), 1100);
    } finally {
      setBusy(false);
    }
  }

  async function undoReturned() {
    setBusy(true);
    try {
      await setDebtActive(debt!.id);
      await refresh();
      setCanUndo(false);
    } finally {
      setBusy(false);
    }
  }

  async function deleteDebt() {
    if (!window.confirm(t('confirmDelete'))) return;
    setBusy(true);
    try {
      await removeDebt(debt!);
      await refresh();
      navigate(debt!.status === 'active' ? '/' : '/history');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="app-shell app-shell--detail">
      {celebrating && (
        <div className="return-celebration" aria-hidden="true">
          <span>●</span><span>★</span><span>●</span><span>◆</span><span>★</span>
          <strong>✓</strong>
        </div>
      )}
      <AppHeader title={t('debtCard')} backHref={debt.status === 'active' ? '/' : '/history'} />
      {canUndo && (
        <aside className="undo-banner" role="status">
          <span>✓</span>
          <div><strong>{t('debtReturnedSuccess')}</strong><small>{debt.person_name}</small></div>
          <button onClick={() => void undoReturned()} disabled={busy}>{t('undo')}</button>
        </aside>
      )}
      <section className="debt-detail">
        <DebtPhoto path={debt.photo_path} name={debt.person_name} />
        <p className={`status-pill status-pill--${debt.status}`}>{debt.status === 'active' ? t('active') : t('returned')}</p>
        <h2>{debt.person_name}</h2>
        <p className="detail-item">{debt.item_name}</p>
        {debt.amount !== null && <strong className="detail-amount">{debt.amount.toLocaleString('ru-RU')} {debt.currency}</strong>}
        {fee > 0 && <p className="detail-fee">{t('lateFee')}: <strong>{fee.toLocaleString(settings.language)} €</strong></p>}
        <dl>
          <div><dt>{t('lent')}</dt><dd>{formatDate(debt.lent_at, settings.language, t('notSpecified'))}</dd></div>
          <div><dt>{t('dueDate')}</dt><dd>{formatDate(debt.due_at, settings.language, t('notSpecified'))}</dd></div>
          <div><dt>{t('untilEnd')}</dt><dd>{debt.status === 'active' ? dueLabel(debt.due_at, {
            noDue: t('noDue'),
            overdue: (days) => t('overdueDays', { days }),
            today: t('dueToday'),
            left: (days) => t('daysLeft', { days }),
          }) : t('closed')}</dd></div>
          <div><dt>{t('comment')}</dt><dd>{debt.description || t('noComment')}</dd></div>
        </dl>
      </section>
      <div className="detail-actions">
        <Link className="secondary-button" href={`/edit/${debt.id}`}>{t('edit')}</Link>
        {debt.status === 'active' && <button className="primary-button" onClick={markReturned} disabled={busy}>{t('markReturned')}</button>}
        <button className="danger-button" onClick={deleteDebt} disabled={busy}>{t('deleteRecord')}</button>
      </div>
    </main>
  );
}
