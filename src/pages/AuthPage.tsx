import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useI18n } from '../context/I18nContext';

export function AuthPage() {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const t = useI18n();

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage('');
    const { data, error } = mode === 'signin'
      ? await supabase.auth.signInWithPassword({ email, password })
      : await supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.origin } });
    setBusy(false);
    if (error) return setMessage(error.message);
    if (mode === 'signup' && !data.session) setMessage(t('checkEmail'));
  }

  async function continueWithGoogle() {
    setBusy(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setMessage(
        error.message.toLowerCase().includes('provider')
          ? 'Вход через Google пока не включён в настройках Supabase.'
          : error.message,
      );
      setBusy(false);
    }
  }

  return (
    <main className="auth-page">
      <section className="auth-intro">
        <div className="auth-logo">D</div>
        <p>{t('personalAccounting').toUpperCase()}</p>
        <h1>{t('authHero')}</h1>
        <img src="/images/debt-hero.png" alt="" />
      </section>
      <section className="auth-card">
        <p className="auth-card__label">{(mode === 'signin' ? t('welcomeBack') : t('newAccount')).toUpperCase()}</p>
        <h2>{mode === 'signin' ? t('signInTitle') : t('registration')}</h2>
        <button className="google-button" type="button" onClick={() => void continueWithGoogle()} disabled={busy}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.4a4.6 4.6 0 0 1-2 3v2.5h3.3c1.9-1.8 2.9-4.4 2.9-7.4Z" />
            <path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.5c-.9.6-2.1 1-3.4 1a5.9 5.9 0 0 1-5.5-4.1H3.1v2.6A10 10 0 0 0 12 22Z" />
            <path fill="#FBBC05" d="M6.5 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9.1L6.5 14Z" />
            <path fill="#EA4335" d="M12 5.9c1.5 0 2.8.5 3.8 1.5l2.9-2.8A9.7 9.7 0 0 0 3.1 7.5l3.4 2.6A5.9 5.9 0 0 1 12 5.9Z" />
          </svg>
          {t('continueGoogle')}
        </button>
        <div className="auth-divider"><span>{t('emailDivider')}</span></div>
        <form onSubmit={submit}>
          <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required /></label>
          <label>{t('password')}<input type="password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} required /></label>
          {message && <p className="form-message">{message}</p>}
          <button className="primary-button" disabled={busy}>{busy ? t('wait') : mode === 'signin' ? t('signIn') : t('createAccount')}</button>
        </form>
        <button className="auth-switch" onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMessage(''); }}>
          {mode === 'signin' ? t('noAccount') : t('hasAccount')}
        </button>
      </section>
    </main>
  );
}
