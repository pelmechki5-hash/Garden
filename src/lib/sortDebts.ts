import type { Debt, DebtSort } from '../types/debt';

export function filterAndSortDebts(debts: Debt[], search: string, sort: DebtSort) {
  const query = search.trim().toLocaleLowerCase('ru');
  return debts
    .filter((debt) => debt.person_name.toLocaleLowerCase('ru').includes(query))
    .sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      if (sort === 'name') return a.person_name.localeCompare(b.person_name, 'ru');
      if (sort === 'amount') return (b.amount ?? 0) - (a.amount ?? 0);
      if (sort === 'due') return (a.due_at ?? '9999').localeCompare(b.due_at ?? '9999');
      return b.lent_at.localeCompare(a.lent_at);
    });
}
