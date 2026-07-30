import { supabase } from './supabase';

export type Plant = {
  id: string;
  user_id: string;
  name: string;
  species: string;
  water_ml: number;
  next_watering_at: string;
  repeat_minutes: number;
  photo_path: string | null;
};

export type NewPlant = Omit<Plant, 'id' | 'user_id' | 'photo_path'> & {
  photo?: File;
};

export async function loadPlants() {
  const { data, error } = await supabase
    .from('plants')
    .select('*')
    .order('next_watering_at');
  if (error) throw error;
  return data as Plant[];
}

export async function createPlant(userId: string, plant: NewPlant) {
  let photoPath: string | null = null;
  if (plant.photo) {
    photoPath = `${userId}/${crypto.randomUUID()}-${plant.photo.name}`;
    const { error } = await supabase.storage.from('plant-photos').upload(photoPath, plant.photo);
    if (error) throw error;
  }
  const { photo: _photo, ...values } = plant;
  const { data, error } = await supabase
    .from('plants')
    .insert({ ...values, user_id: userId, photo_path: photoPath })
    .select()
    .single();
  if (error) throw error;
  return data as Plant;
}

export async function updateWatering(plant: Plant, minutes: number) {
  const next = new Date(Date.now() + minutes * 60_000).toISOString();
  const { data, error } = await supabase
    .from('plants')
    .update({ next_watering_at: next })
    .eq('id', plant.id)
    .select()
    .single();
  if (error) throw error;
  return data as Plant;
}

export function plantPhotoUrl(path: string | null) {
  if (!path) return '/plants-hero.png';
  return supabase.storage.from('plant-photos').getPublicUrl(path).data.publicUrl;
}
