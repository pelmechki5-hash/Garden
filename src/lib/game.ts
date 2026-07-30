export type StatKey = 'economy' | 'ecology' | 'population';
export type Stats = Record<StatKey, number>;

export type Choice = {
  title: string;
  description: string;
  effects: Partial<Stats>;
  tag: string;
};

export type Event = {
  year: number;
  title: string;
  description: string;
  choices: [Choice, Choice, Choice];
};

export const initialStats: Stats = { economy: 38, ecology: 70, population: 45 };

export const events: Event[] = [
  {
    year: 1, title: 'Первые инвестиции',
    description: 'Купец предлагает вложить деньги в развитие деревни. С чего начнём?',
    choices: [
      { tag: 'ПРОМ', title: 'Открыть лесопилку', description: 'Рабочие места и быстрый доход, но лес станет реже.', effects: { economy: 22, ecology: -18, population: 8 } },
      { tag: 'ЭКО', title: 'Создать экоферму', description: 'Чистые продукты и спокойный, устойчивый рост.', effects: { economy: 10, ecology: 12, population: 6 } },
      { tag: 'ЛЮДИ', title: 'Рынок ремесленников', description: 'Местный бизнес укрепит сообщество.', effects: { economy: 12, ecology: 3, population: 12 } },
    ],
  },
  {
    year: 3, title: 'Городу нужна энергия',
    description: 'Новых домов становится больше. Жителям необходим надёжный источник энергии.',
    choices: [
      { tag: 'ПРОМ', title: 'Угольная станция', description: 'Дёшево и мощно, но воздух станет грязнее.', effects: { economy: 20, ecology: -24, population: 10 } },
      { tag: 'ЭКО', title: 'Солнечные панели', description: 'Дороже сейчас, зато чище в будущем.', effects: { economy: -7, ecology: 22, population: 8 } },
      { tag: 'БАЛАНС', title: 'Малая гидростанция', description: 'Стабильная энергия с умеренным влиянием.', effects: { economy: 9, ecology: 6, population: 9 } },
    ],
  },
  {
    year: 6, title: 'Транспортный выбор',
    description: 'На дорогах пробки. Городской совет ждёт твоего решения.',
    choices: [
      { tag: 'АВТО', title: 'Расширить шоссе', description: 'Бизнес ускорится, но машин станет ещё больше.', effects: { economy: 18, ecology: -16, population: 7 } },
      { tag: 'ЭКО', title: 'Запустить трамвай', description: 'Удобный транспорт сделает город комфортнее.', effects: { economy: 5, ecology: 15, population: 18 } },
      { tag: 'ТЕХНО', title: 'Умные автобусы', description: 'Гибкие маршруты и современные остановки.', effects: { economy: 10, ecology: 7, population: 13 } },
    ],
  },
  {
    year: 10, title: 'Свободная территория',
    description: 'В центре остался большой участок земли. Что на нём появится?',
    choices: [
      { tag: 'БИЗНЕС', title: 'Деловой квартал', description: 'Небоскрёбы привлекут компании и новых жителей.', effects: { economy: 24, ecology: -12, population: 16 } },
      { tag: 'ПАРК', title: 'Большой парк', description: 'Зелёное сердце города для отдыха и чистого воздуха.', effects: { economy: 2, ecology: 25, population: 14 } },
      { tag: 'ЖИЛЬЁ', title: 'Доступные дома', description: 'Новый район поможет молодым семьям.', effects: { economy: 7, ecology: -4, population: 24 } },
    ],
  },
  {
    year: 15, title: 'Город будущего',
    description: 'Последний большой проект определит, каким тебя запомнят.',
    choices: [
      { tag: 'ТЕХНО', title: 'Технополис', description: 'Ставка на инновации, производство и быстрый рост.', effects: { economy: 25, ecology: -8, population: 12 } },
      { tag: 'ЭКО', title: 'Нулевые отходы', description: 'Переработка и зелёные районы для всех.', effects: { economy: 8, ecology: 25, population: 14 } },
      { tag: 'НАУКА', title: 'Университет', description: 'Образование даст эффект всем сферам города.', effects: { economy: 14, ecology: 9, population: 17 } },
    ],
  },
];

export function applyEffects(stats: Stats, effects: Partial<Stats>): Stats {
  return {
    economy: clamp(stats.economy + (effects.economy ?? 0)),
    ecology: clamp(stats.ecology + (effects.ecology ?? 0)),
    population: clamp(stats.population + (effects.population ?? 0)),
  };
}

const clamp = (value: number) => Math.max(0, Math.min(100, value));
