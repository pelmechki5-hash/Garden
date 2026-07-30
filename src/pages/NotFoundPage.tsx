import { Link } from 'wouter';

export function NotFoundPage() {
  return (
    <main className="app-shell">
      <section className="empty-state">
        <span>404</span>
        <h2>Такой страницы нет</h2>
        <p><Link href="/">Вернуться к долгам</Link></p>
      </section>
    </main>
  );
}
