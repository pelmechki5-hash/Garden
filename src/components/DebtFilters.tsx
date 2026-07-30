import type { DebtSort } from '../types/debt';
import { useI18n } from '../context/I18nContext';

interface DebtFiltersProps {
  search: string;
  sort: DebtSort;
  onSearch: (value: string) => void;
  onSort: (value: DebtSort) => void;
}

export function DebtFilters({ search, sort, onSearch, onSort }: DebtFiltersProps) {
  const t = useI18n();
  return (
    <div className="debt-filters">
      <label className="search-field">
        <span>⌕</span>
        <input
          id="debt-search"
          value={search}
          onChange={(event) => onSearch(event.target.value)}
          placeholder={t('searchName')}
        />
      </label>
      <select value={sort} onChange={(event) => onSort(event.target.value as DebtSort)} aria-label="Sort">
        <option value="date">{t('sortDate')}</option>
        <option value="amount">{t('sortAmount')}</option>
        <option value="name">{t('sortName')}</option>
        <option value="due">{t('sortDue')}</option>
      </select>
    </div>
  );
}
