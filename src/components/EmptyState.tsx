import { useI18n } from '../context/I18nContext';

export function EmptyState({ history = false }: { history?: boolean }) {
  const t = useI18n();
  return (
    <section className="empty-state">
      <span>{history ? '✓' : '○'}</span>
      <h2>{history ? t('emptyHistory') : t('emptyActive')}</h2>
      <p>{history ? t('emptyHistoryHint') : t('emptyActiveHint')}</p>
    </section>
  );
}
