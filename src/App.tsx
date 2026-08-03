import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Route, Switch } from 'wouter';
import { DebtsProvider } from './context/DebtsContext';
import { SettingsProvider } from './context/SettingsContext';
import { I18nProvider } from './context/I18nContext';
import { isSupabaseConfigured, supabase } from './lib/supabase';
import { AuthPage } from './pages/AuthPage';
import { DebtDetailPage } from './pages/DebtDetailPage';
import { DebtFormPage } from './pages/DebtFormPage';
import { DebtsPage } from './pages/DebtsPage';
import { HistoryPage } from './pages/HistoryPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { SettingsPage } from './pages/SettingsPage';
import { SupabaseSetupMessage } from './components/SupabaseSetupMessage';
import { BlacklistPage } from './pages/BlacklistPage';
import { OverduePage } from './pages/OverduePage';
import { StatsPage } from './pages/StatsPage';
import { CalendarPage } from './pages/CalendarPage';
import { AiChatPage } from './pages/AiChatPage';

export default function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => setSession(nextSession));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!isSupabaseConfigured) return <main className="setup-page"><SupabaseSetupMessage /></main>;
  if (loading) return <main className="loading-screen"><span>D</span><p>…</p></main>;
  return (
    <SettingsProvider userId={session?.user.id}>
      <I18nProvider>
        {!session ? <AuthPage /> : (
          <DebtsProvider>
            <Switch>
              <Route path="/" component={DebtsPage} />
              <Route path="/history" component={HistoryPage} />
              <Route path="/new" component={DebtFormPage} />
              <Route path="/edit/:id" component={DebtFormPage} />
              <Route path="/debt/:id" component={DebtDetailPage} />
              <Route path="/settings" component={SettingsPage} />
              <Route path="/blacklist" component={BlacklistPage} />
              <Route path="/overdue" component={OverduePage} />
              <Route path="/stats" component={StatsPage} />
              <Route path="/calendar" component={CalendarPage} />
              <Route path="/ai" component={AiChatPage} />
              <Route component={NotFoundPage} />
            </Switch>
          </DebtsProvider>
        )}
      </I18nProvider>
    </SettingsProvider>
  );
}
