type Props = { step: number; ecology: number };

export function CityScene({ step, ecology }: Props) {
  const stage = step < 2 ? 'Деревня' : step < 4 ? 'Растущий город' : 'Большой город';
  return (
    <section className="game-scene" style={{ backgroundPosition: `${Math.min(step * 17, 68)}% center` }}>
      <div className="scene-label"><span>Год {step === 0 ? 1 : step * 3}</span><strong>{stage}</strong></div>
      <div className={`scene-condition ${ecology < 45 ? 'scene-condition--smog' : ''}`} />
    </section>
  );
}
