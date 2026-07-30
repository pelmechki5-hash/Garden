import { Link } from 'wouter';
import { useI18n } from '../context/I18nContext';

export function QuickMenu() {
  const t = useI18n();
  return (
    <section className="quick-menu">
      <div className="quick-menu__title">
        <div><span>{t('quickAccess').toUpperCase()}</span><h2>{t('whatDo')}</h2></div>
        <img src="/images/borrowed-items.png" alt="" />
      </div>
      <div className="quick-menu__grid">
        <Link href="/new"><i>＋</i><span>{t('newDebt')}</span></Link>
        <Link href="/overdue"><i>!</i><span>{t('overdue')}</span></Link>
        <Link href="/stats"><i>↗</i><span>{t('statistics')}</span></Link>
        <Link href="/blacklist"><i>⊘</i><span>{t('blacklist')}</span></Link>
      </div>
    </section>
  );
}
