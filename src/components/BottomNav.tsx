import { Link, useLocation } from 'wouter';
import { useI18n } from '../context/I18nContext';

export function BottomNav() {
  const [location] = useLocation();
  const t = useI18n();
  return (
    <nav className="bottom-nav">
      <Link className={location === '/' ? 'active' : ''} href="/">
        <span>⌂</span>{t('active')}
      </Link>
      <Link className={location === '/history' ? 'active' : ''} href="/history">
        <span>✓</span>{t('history')}
      </Link>
      <Link className={location === '/calendar' ? 'active' : ''} href="/calendar">
        <span>▦</span>{t('calendar')}
      </Link>
      <Link className={location === '/settings' ? 'active' : ''} href="/settings">
        <span>☼</span>{t('settings')}
      </Link>
    </nav>
  );
}
