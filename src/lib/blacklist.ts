import { supabase } from './supabase';
import type { BlacklistEntry } from '../types/blacklist';

export async function loadBlacklist() {
  const { data, error } = await supabase.from('blacklist').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as BlacklistEntry[];
}

export async function addToBlacklist(personName: string, reason: string) {
  const { data, error } = await supabase
    .from('blacklist')
    .insert({ person_name: personName.trim(), reason: reason.trim() })
    .select()
    .single();
  if (error) throw error;
  return data as BlacklistEntry;
}

export async function removeFromBlacklist(id: string) {
  const { error } = await supabase.from('blacklist').delete().eq('id', id);
  if (error) throw error;
}
