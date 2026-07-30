import { useEffect, useState } from 'react';
import { AppHeader } from '../components/AppHeader';
import { BottomNav } from '../components/BottomNav';
import { supabase } from '../lib/supabase';
import { useSettings } from '../context/SettingsContext';
import { currencies } from '../lib/currencies';
import { languageNames } from '../i18n/translations';
import type { LanguageCode } from '../types/settings';
import { useI18n } from '../context/I18nContext';

export function SettingsPage() {
  const [dark, setDark] = useState(document.documentElement.dataset.theme === 'dark');
  const [notificationState, setNotificationState] = useState(
    'Notification' in window ? Notification.permission : 'unsupported',
  );
  const { settings, saving, updateSettings } = useSettings();
  const t = useI18n();
  const [feeStart, setFeeStart] = useState(String(settings.late_fee_start));
  const [feeDaily, setFeeDaily] = useState(String(settings.late_fee_daily));

  useEffect(() => {
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
  }, [dark]);

  useEffect(() => {
    setFeeStart(String(settings.late_fee_start));
    setFeeDaily(String(settings.late_fee_daily));
  }, [settings.late_fee_daily, settings.late_fee_start]);

  async function enableNotifications() {
    if (!('Notification' in window)) return;
    setNotificationState(await Notification.requestPermission());
  }

  async function applyFee() {
    await updateSettings({
      late_fee_start: Math.max(0, Number(feeStart) || 0),
      late_fee_daily: Math.max(0, Number(feeDaily) || 0),
    });
  }

  return (
    <main className="app-shell">
      <AppHeader title={t('settings')} subtitle={t('app').toUpperCase()} />
      <section className="settings-group">
        <p>{t('language').toUpperCase()}</p>
        <article className="language-picker">
          <div className="settings-icon settings-icon--violet">文</div>
          <label>
            {t('language')}
            <select
              value={settings.language}
              onChange={(event) => void updateSettings({ language: event.target.value as LanguageCode })}
            >
              {(Object.entries(languageNames) as [LanguageCode, string][]).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))}
            </select>
          </label>
        </article>
      </section>
      <section className="settings-group">
        <p>{t('appearance').toUpperCase()}</p>
        <article className="settings-card">
          <div className="settings-icon settings-icon--violet">☾</div>
          <div><strong>{t('darkTheme')}</strong><span>{t('comfortableEvening')}</span></div>
          <button className={`theme-toggle ${dark ? 'active' : ''}`} onClick={() => setDark(!dark)} aria-label="Переключить тему"><span /></button>
        </article>
        <article className="settings-card">
          <div className="settings-icon settings-icon--coral">Aa</div>
          <div><strong>{t('largeText')}</strong><span>{t('increaseLabels')}</span></div>
          <button className={`theme-toggle ${settings.large_text ? 'active' : ''}`} onClick={() => void updateSettings({ large_text: !settings.large_text })} aria-label="Переключить крупный текст"><span /></button>
        </article>
      </section>
      <section className="settings-group">
        <p>{t('reminders').toUpperCase()}</p>
        <article className="settings-card">
          <div className="settings-icon settings-icon--yellow">♢</div>
          <div><strong>{t('notifications')}</strong><span>{notificationState === 'granted' ? t('notificationsAllowed') : t('remindDue')}</span></div>
          <button className="settings-action" onClick={() => void enableNotifications()} disabled={notificationState === 'granted'}>
            {notificationState === 'granted' ? t('done') : t('enable')}
          </button>
        </article>
        <article className="settings-card">
          <div className="settings-icon settings-icon--mint">€</div>
          <div><strong>{t('lateFee')}</strong><span>{t('calculateAutomatically')}</span></div>
          <button className={`theme-toggle ${settings.late_fee_enabled ? 'active' : ''}`} onClick={() => void updateSettings({ late_fee_enabled: !settings.late_fee_enabled })} aria-label="Переключить штраф"><span /></button>
        </article>
        {settings.late_fee_enabled && (
          <article className="fee-editor">
            <label>{t('firstDay')}<input type="number" min="0" step="0.5" value={feeStart} onChange={(event) => setFeeStart(event.target.value)} /><span>€</span></label>
            <label>{t('everyNext')}<input type="number" min="0" step="0.5" value={feeDaily} onChange={(event) => setFeeDaily(event.target.value)} /><span>€</span></label>
            <button onClick={() => void applyFee()} disabled={saving}>{saving ? t('loading') : t('saveFee')}</button>
            <button className="fee-reset" onClick={() => { setFeeStart('1'); setFeeDaily('0.5'); void updateSettings({ late_fee_start: 1, late_fee_daily: 0.5 }); }}>{t('reset')}</button>
          </article>
        )}
      </section>
      <section className="settings-group">
        <p>{t('defaultDebt').toUpperCase()}</p>
        <article className="defaults-editor">
          <label>
            {t('defaultCurrency')}
            <select value={settings.default_currency} onChange={(event) => void updateSettings({ default_currency: event.target.value })}>
              {currencies.map((currency) => <option key={currency.code} value={currency.code}>{currency.code}</option>)}
            </select>
          </label>
          <label>
            {t('defaultDue')}
            <select value={settings.default_due_days} onChange={(event) => void updateSettings({ default_due_days: Number(event.target.value) })}>
              <option value="0">{t('noDue')}</option>
              <option value="3">{t('days3')}</option>
              <option value="7">{t('week')}</option>
              <option value="14">{t('weeks2')}</option>
              <option value="30">{t('month')}</option>
            </select>
          </label>
        </article>
      </section>
      <button className="signout-button" onClick={() => void supabase.auth.signOut()}>{t('signOut')}</button>
      <BottomNav />
    </main>
  );
}
