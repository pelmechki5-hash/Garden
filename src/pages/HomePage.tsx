import { Link } from 'wouter';
import '../welcome.css';

export function HomePage() {
  return (
    <main className="welcome-page">
      <nav className="welcome-nav">
        <span className="welcome-logo">NEW PROJECT</span>
        <Link href="/register">Регистрация</Link>
      </nav>

      <section className="welcome-hero">
        <p className="welcome-hero__label">ДОБРО ПОЖАЛОВАТЬ</p>
        <h1>Здесь начинается<br />твоя новая история.</h1>
        <p className="welcome-hero__text">
          Создай аккаунт, чтобы первым узнать о запуске нашей новой игры.
        </p>
        <Link className="welcome-button" href="/register">
          Зарегистрироваться <span>→</span>
        </Link>
      </section>

      <p className="welcome-footer">НОВЫЙ ПРОЕКТ · 2026</p>
    </main>
  );
}
