import type { Plant } from '../lib/plants';
import { plantPhotoUrl } from '../lib/plants';

type Props = { plant: Plant; onWater: () => void; onSnooze: () => void };

function wateringLabel(date: string) {
  const target = new Date(date);
  const diff = target.getTime() - Date.now();
  if (diff <= 0) return 'Пора поливать';
  if (diff < 3_600_000) return `Через ${Math.max(1, Math.ceil(diff / 60_000))} мин`;
  if (target.toDateString() === new Date().toDateString()) {
    return `Сегодня в ${target.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}`;
  }
  return target.toLocaleString('ru', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

export function PlantCard({ plant, onWater, onSnooze }: Props) {
  const due = new Date(plant.next_watering_at).getTime() <= Date.now();
  return (
    <article className={`plant-card ${due ? 'plant-card--due' : ''}`}>
      <img src={plantPhotoUrl(plant.photo_path)} alt={plant.name} />
      <div className="plant-card__body">
        <div className="plant-card__top">
          <div><h3>{plant.name}</h3><p>{plant.species}</p></div>
          <span className={`status ${due ? 'status--due' : ''}`}>{wateringLabel(plant.next_watering_at)}</span>
        </div>
        <div className="water-line"><span>💧</span><strong>{plant.water_ml} мл</strong><span>за один полив</span></div>
        <div className="card-actions">
          <button className="primary" onClick={onWater}>✓ Полито</button>
          <button className="secondary" onClick={onSnooze}>Отложить {plant.repeat_minutes} мин</button>
        </div>
      </div>
    </article>
  );
}
