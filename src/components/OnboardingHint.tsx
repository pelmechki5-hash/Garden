import { Link } from 'wouter';
import { useI18n } from '../context/I18nContext';

export function OnboardingHint() {
  const t = useI18n();
  return (
    <aside className="onboarding-hint" role="status">
      <span className="onboarding-hint__dot" aria-hidden="true" />
      <div><strong>{t('onboardingTitle')}</strong><p>{t('onboardingText')}</p></div>
      <Link href="/new">+ {t('addDebt')}</Link>
    </aside>
  );
}
