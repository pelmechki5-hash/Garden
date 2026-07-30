import { supabase } from './supabase';
import type { Debt, DebtInput } from '../types/debt';

const PHOTO_BUCKET = 'debt-photos';
const MAX_PHOTO_SIZE = 5 * 1024 * 1024;

export function validateDebtPhoto(file: File) {
  if (!file.type.startsWith('image/')) return 'Можно прикреплять только изображения.';
  if (file.size > MAX_PHOTO_SIZE) return 'Фотография должна быть меньше 5 МБ.';
  return null;
}

export function readableDebtError(error: unknown) {
  const message = error instanceof Error ? error.message : 'Неизвестная ошибка';
  if (message.includes('row-level security')) return 'Нет доступа к этой записи. Войдите в аккаунт заново.';
  if (message.includes('Bucket not found')) return 'Хранилище фотографий пока недоступно.';
  if (message.includes('Payload too large')) return 'Фотография слишком большая.';
  if (message.includes('duplicate key')) return 'Такая запись уже существует.';
  return message;
}

export async function loadDebts() {
  const { data, error } = await supabase.from('debts').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return data as Debt[];
}

export async function saveDebt(input: DebtInput, id?: string) {
  const query = id
    ? supabase.from('debts').update({
        ...input,
        reminder_3d_sent_at: null,
        updated_at: new Date().toISOString(),
      }).eq('id', id)
    : supabase.from('debts').insert(input);
  const { data, error } = await query.select().single();
  if (error) throw error;
  return data as Debt;
}

export async function setDebtReturned(id: string) {
  const { error } = await supabase.from('debts').update({
    status: 'returned',
    updated_at: new Date().toISOString(),
  }).eq('id', id);
  if (error) throw error;
}

export async function setDebtActive(id: string) {
  const { error } = await supabase.from('debts').update({
    status: 'active',
    updated_at: new Date().toISOString(),
  }).eq('id', id);
  if (error) throw error;
}

export async function setDebtPinned(id: string, pinned: boolean) {
  const { error } = await supabase
    .from('debts')
    .update({ pinned, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function removeDebt(debt: Debt) {
  if (debt.photo_path) await supabase.storage.from(PHOTO_BUCKET).remove([debt.photo_path]);
  const { error } = await supabase.from('debts').delete().eq('id', debt.id);
  if (error) throw error;
}

export async function uploadDebtPhoto(debtId: string, file: File, previousPath?: string | null) {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) throw new Error('Сначала войдите в аккаунт');
  const extension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const path = `${userData.user.id}/${debtId}.${extension}`;
  const { error } = await supabase.storage.from(PHOTO_BUCKET).upload(path, file, { upsert: true });
  if (error) throw error;
  const { error: updateError } = await supabase.from('debts').update({ photo_path: path }).eq('id', debtId);
  if (updateError) throw updateError;
  if (previousPath && previousPath !== path) {
    await supabase.storage.from(PHOTO_BUCKET).remove([previousPath]);
  }
  return path;
}

export async function getPhotoUrl(path: string) {
  const { data, error } = await supabase.storage.from(PHOTO_BUCKET).createSignedUrl(path, 3600);
  if (error) return null;
  return data.signedUrl;
}
