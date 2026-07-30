import { useState } from 'react';

type Drone = { id: number; hp: number; x: number; y: number; speed: number };
type Props = { wave: number; onComplete: (cityHealth: number) => void };

const makeDrones = (wave: number): Drone[] =>
  Array.from({ length: 5 }, (_, id) => ({
    id,
    hp: wave + 1,
    x: 8 + id * 18,
    y: 13 + (id % 3) * 18,
    speed: 4.6 + id * 0.55,
  }));

export function DefenseGame({ wave, onComplete }: Props) {
  const [drones, setDrones] = useState(() => makeDrones(wave));
  const [health, setHealth] = useState(100);
  const [shots, setShots] = useState(0);
  const [hits, setHits] = useState(0);

  const shoot = (id: number) => {
    setShots((value) => value + 1);
    setHits((value) => value + 1);
    setDrones((current) => current
      .map((drone) => drone.id === id ? { ...drone, hp: drone.hp - 1 } : drone)
      .filter((drone) => drone.hp > 0));
  };

  const missedCity = () => setHealth((value) => Math.max(0, value - 8));
  const finished = drones.length === 0 || health === 0;

  return (
    <section className="defense">
      <div className="defense__hud">
        <div><span>Прочность города</span><strong>{health}%</strong></div>
        <div><span>Осталось целей</span><strong>{drones.length}</strong></div>
        <div><span>Точность</span><strong>{shots ? Math.round(hits / shots * 100) : 100}%</strong></div>
      </div>
      <div className="defense__field" onClick={() => setShots((value) => value + 1)}>
        <div className="crosshair">＋</div>
        {drones.map((drone) => (
          <button
            aria-label={`Дрон, прочность ${drone.hp}`}
            className="drone"
            key={drone.id}
            onAnimationIteration={missedCity}
            onClick={(event) => { event.stopPropagation(); shoot(drone.id); }}
            style={{
              left: `${drone.x}%`, top: `${drone.y}%`,
              animationDuration: `${drone.speed}s`,
            }}
          >
            <i /><b>{drone.hp}</b>
          </button>
        ))}
        {finished && (
          <div className="defense__result">
            <p>{health > 0 ? 'Волна отражена' : 'Защита прорвана'}</p>
            <button onClick={(event) => { event.stopPropagation(); onComplete(health); }}>Продолжить развитие</button>
          </div>
        )}
      </div>
      <p className="defense__help">Наводи курсор и кликай по дронам. Каждый выстрел наносит 1 урон.</p>
    </section>
  );
}
