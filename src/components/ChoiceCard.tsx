import type { Choice } from '../lib/game';

const effectNames = { economy: 'Экономика', ecology: 'Экология', population: 'Население' };

type Props = { choice: Choice; onChoose: () => void };

export function ChoiceCard({ choice, onChoose }: Props) {
  return (
    <button className="choice-card" onClick={onChoose}>
      <span className="choice-card__icon">{choice.tag}</span>
      <span className="choice-card__content">
        <strong>{choice.title}</strong>
        <small>{choice.description}</small>
        <span className="effects">
          {Object.entries(choice.effects).map(([key, value]) => (
            <em className={value >= 0 ? 'positive' : 'negative'} key={key}>
              {value >= 0 ? '+' : ''}{value} {effectNames[key as keyof typeof effectNames]}
            </em>
          ))}
        </span>
      </span>
      <span className="choice-card__arrow">→</span>
    </button>
  );
}
