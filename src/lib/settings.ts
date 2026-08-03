import { supabase } from './supabase';
import { defaultSettings, type UserSettings } from '../types/settings';

export async function loadSettings() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Пользователь не найден');
  const { data, error } = await supabase
    .from('user_settings')
    .select('language, large_text, late_fee_enabled, late_fee_start, late_fee_daily, default_currency, default_due_days, ai_persona, onboarding_completed')
    .eq('user_id', userData.user.id)
    .maybeSingle();
  if (error) throw error;
  if (data) return data as UserSettings;

  const { data: created, error: createError } = await supabase
    .from('user_settings')
    .insert({ user_id: userData.user.id, ...defaultSettings })
    .select('language, large_text, late_fee_enabled, late_fee_start, late_fee_daily, default_currency, default_due_days, ai_persona, onboarding_completed')
    .single();
  if (createError) throw createError;
  return created as UserSettings;
}

export async function saveSettings(settings: UserSettings) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Пользователь не найден');
  const { error } = await supabase.from('user_settings').upsert({
    user_id: userData.user.id,
    ...settings,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
}
