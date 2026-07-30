import { Link } from 'wouter';

interface AppHeaderProps {
  title: string;
  subtitle?: string;
  backHref?: string;
  action?: React.ReactNode;
}

export function AppHeader({ title, subtitle, backHref, action }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div>
        {backHref && <Link className="back-button" href={backHref} aria-label="Назад">‹</Link>}
        <div>
          {subtitle && <p>{subtitle}</p>}
          <h1>{title}</h1>
        </div>
      </div>
      {action}
    </header>
  );
}
