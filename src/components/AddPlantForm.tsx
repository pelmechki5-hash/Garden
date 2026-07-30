import { useState } from 'react';
import type { NewPlant, Plant } from '../lib/plants';
import { createPlant } from '../lib/plants';

type Props = { userId: string; onAdded: (plant: Plant) => void; onClose: () => void };

export function AddPlantForm({ userId, onAdded, onClose }: Props) {
  const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 16);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    const form = new FormData(event.currentTarget);
    const photo = form.get('photo');
    const plant: NewPlant = {
      name: String(form.get('name')),
      species: String(form.get('species')),
      water_ml: Number(form.get('water_ml')),
      next_watering_at: new Date(String(form.get('next_watering_at'))).toISOString(),
      repeat_minutes: Number(form.get('repeat_minutes')),
      photo: photo instanceof File && photo.size > 0 ? photo : undefined,
    };
    try {
      onAdded(await createPlant(userId, plant));
      onClose();
    } catch {
      setError('Не получилось сохранить растение. Попробуй ещё раз.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <button className="icon-button modal-close" onClick={onClose} aria-label="Закрыть">×</button>
        <p className="eyebrow">Новое растение</p>
        <h2>Кого добавим?</h2>
        <form className="plant-form" onSubmit={submit}>
          <label>Имя<input name="name" placeholder="Например, Монти" required /></label>
          <label>Вид<input name="species" placeholder="Монстера" required /></label>
          <div className="form-grid">
            <label>Воды, мл<input name="water_ml" type="number" min="10" defaultValue="200" required /></label>
            <label>Повтор через
              <select name="repeat_minutes" defaultValue="10">
                <option value="5">5 минут</option><option value="10">10 минут</option>
                <option value="30">30 минут</option><option value="60">1 час</option>
              </select>
            </label>
          </div>
          <label>Первый полив<input name="next_watering_at" type="datetime-local" defaultValue={tomorrow} required /></label>
          <label>Фотография<input name="photo" type="file" accept="image/*" /></label>
          {error && <p className="error">{error}</p>}
          <button className="primary wide" disabled={busy}>{busy ? 'Сохраняем…' : 'Добавить растение'}</button>
        </form>
      </section>
    </div>
  );
}
