import { createContext, useContext, type ReactNode } from 'react';
import { useSettings } from './SettingsContext';
import { translations, type TranslationKey } from '../i18n/translations';

type Translate = (key: TranslationKey, values?: Record<string, string | number>) => string;
const I18nContext = createContext<Translate>((key) => key);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { settings } = useSettings();
  const t: Translate = (key, values) => {
    let text = translations[settings.language][key];
    for (const [name, value] of Object.entries(values ?? {})) {
      text = text.replace(`{${name}}`, String(value));
    }
    return text;
  };
  return <I18nContext.Provider value={t}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  return useContext(I18nContext);
}
