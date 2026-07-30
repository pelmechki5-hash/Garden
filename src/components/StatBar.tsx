import type { StatKey } from '../lib/game';

const labels: Record<StatKey, { name: string; icon: string }> = {
  economy: { name: 'Экономика', icon: '₽' },
  ecology: { name: 'Экология', icon: '♧' },
  population: { name: 'Население', icon: '●' },
};

type Props = { stat: StatKey; value: number };

export function StatBar({ stat, value }: Props) {
  return (
    <div className={`stat stat--${stat}`}>
      <div className="stat__top">
        <span><i>{labels[stat].icon}</i>{labels[stat].name}</span>
        <strong>{value}</strong>
      </div>
      <div className="stat__track"><span style={{ width: `${value}%` }} /></div>
    </div>
  );
}
