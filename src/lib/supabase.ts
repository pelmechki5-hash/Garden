import { createClient } from '@supabase/supabase-js';

// Ключи берутся из .env локально и из Vercel → Settings → Environment Variables на проде.
function cleanEnvValue(value: string | undefined) {
  const trimmed = value?.trim() ?? '';
  const quoted = trimmed.match(/^(['"])(.*)\1$/);
  return (quoted?.[2] ?? trimmed).trim();
}

function isValidSupabaseUrl(value: string) {
  try {
    const parsed = new URL(value);
    return (parsed.protocol === 'https:' || parsed.protocol === 'http:') && Boolean(parsed.hostname);
  } catch {
    return false;
  }
}

const url = cleanEnvValue(import.meta.env.VITE_SUPABASE_URL as string | undefined);
const anonKey = cleanEnvValue(import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined);

export const isSupabaseConfigured = isValidSupabaseUrl(url) && Boolean(anonKey);

// Запасные значения позволяют показать понятную подсказку в интерфейсе вместо белого экрана.
export const supabase = createClient(
  isValidSupabaseUrl(url) ? url : 'https://not-configured.supabase.co',
  anonKey || 'not-configured',
);
