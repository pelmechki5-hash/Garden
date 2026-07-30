import { useState } from 'react';
import { Link } from 'wouter';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseSetupMessage } from './SupabaseSetupMessage';

export function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordAgain, setPasswordAgain] = useState('');
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isSupabaseConfigured) return <SupabaseSetupMessage />;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage('');
    setIsSuccess(false);

    if (password !== passwordAgain) {
      setMessage('Пароли не совпадают.');
      return;
    }

    setIsSubmitting(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: window.location.origin },
    });
    setIsSubmitting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setIsSuccess(true);
    setMessage(
      data.session
        ? 'Аккаунт создан. Добро пожаловать!'
        : 'Аккаунт создан. Подтверди email по ссылке в письме.',
    );
  }

  return (
    <section className="register-card">
      <p className="register-card__label">ДОБРО ПОЖАЛОВАТЬ</p>
      <h1>Создай аккаунт</h1>
      <p className="register-card__intro">
        Зарегистрируйся, чтобы стать частью нашего нового проекта.
      </p>

      <form className="register-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@example.com"
            autoComplete="email"
            required
          />
        </label>
        <label>
          Пароль
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Минимум 6 символов"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>
        <label>
          Повтори пароль
          <input
            type="password"
            value={passwordAgain}
            onChange={(event) => setPasswordAgain(event.target.value)}
            placeholder="Ещё раз тот же пароль"
            autoComplete="new-password"
            minLength={6}
            required
          />
        </label>

        {message && (
          <p className={isSuccess ? 'register-message register-message--success' : 'register-message'}>
            {message}
          </p>
        )}
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
        </button>
      </form>

      <Link className="register-card__back" href="/">← Вернуться на главную</Link>
    </section>
  );
}
