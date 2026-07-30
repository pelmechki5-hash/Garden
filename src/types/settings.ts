export interface UserSettings {
  language: LanguageCode;
  large_text: boolean;
  late_fee_enabled: boolean;
  late_fee_start: number;
  late_fee_daily: number;
  default_currency: string;
  default_due_days: number;
}

export type LanguageCode = 'ru' | 'kk' | 'en' | 'tr' | 'uz' | 'ky' | 'zh' | 'de' | 'fr' | 'es';

export const defaultSettings: UserSettings = {
  language: 'ru',
  large_text: false,
  late_fee_enabled: true,
  late_fee_start: 1,
  late_fee_daily: 0.5,
  default_currency: 'KZT',
  default_due_days: 7,
};
