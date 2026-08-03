import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { loadSettings, saveSettings } from '../lib/settings';
import { defaultSettings, type UserSettings } from '../types/settings';

interface SettingsContextValue {
  settings: UserSettings;
  saving: boolean;
  ready: boolean;
  updateSettings: (changes: Partial<UserSettings>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children, userId }: { children: ReactNode; userId?: string }) {
  const [settings, setSettings] = useState(defaultSettings);
  const [saving, setSaving] = useState(false);
  const [ready, setReady] = useState(!userId);

  useEffect(() => {
    if (!userId) {
      setReady(true);
      return;
    }
    setReady(false);
    void loadSettings().then(setSettings).catch(() => undefined).finally(() => setReady(true));
  }, [userId]);

  useEffect(() => {
    document.documentElement.dataset.textSize = settings.large_text ? 'large' : 'normal';
  }, [settings.large_text]);

  async function updateSettings(changes: Partial<UserSettings>) {
    const next = { ...settings, ...changes };
    setSettings(next);
    setSaving(true);
    try {
      await saveSettings(next);
    } finally {
      setSaving(false);
    }
  }

  return <SettingsContext.Provider value={{ settings, saving, ready, updateSettings }}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings должен использоваться внутри SettingsProvider');
  return context;
}
