import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadDebts } from '../lib/debts';
import type { Debt } from '../types/debt';
import type { TranslationKey } from '../i18n/translations';

interface DebtsContextValue {
  debts: Debt[];
  loading: boolean;
  error: TranslationKey | '';
  refresh: () => Promise<void>;
}

const DebtsContext = createContext<DebtsContextValue | null>(null);

export function DebtsProvider({ children }: { children: ReactNode }) {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<TranslationKey | ''>('');

  async function refresh() {
    setLoading(true);
    setError('');
    try {
      setDebts(await loadDebts());
    } catch {
      setError('loadError');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void refresh(); }, []);

  return (
    <DebtsContext.Provider value={{ debts, loading, error, refresh }}>
      {children}
    </DebtsContext.Provider>
  );
}

export function useDebts() {
  const context = useContext(DebtsContext);
  if (!context) throw new Error('useDebts должен использоваться внутри DebtsProvider');
  return context;
}
