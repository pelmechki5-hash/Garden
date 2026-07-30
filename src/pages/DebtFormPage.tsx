import { AppHeader } from '../components/AppHeader';
import { DebtForm } from '../components/DebtForm';
import { useDebts } from '../context/DebtsContext';
import { useI18n } from '../context/I18nContext';

export function DebtFormPage({ params }: { params: { id?: string } }) {
  const { debts, loading, refresh } = useDebts();
  const t = useI18n();
  const debt = params.id ? debts.find((item) => item.id === params.id) : undefined;
  if (loading) return <main className="app-shell"><p className="screen-message">{t('formLoading')}</p></main>;
  if (params.id && !debt) return <main className="app-shell"><AppHeader title={t('debtNotFound')} backHref="/" /></main>;
  return (
    <main className="app-shell app-shell--form">
      <AppHeader title={debt ? t('edit') : t('newDebt')} backHref={debt ? `/debt/${debt.id}` : '/'} />
      <DebtForm debt={debt} onSaved={refresh} />
    </main>
  );
}
