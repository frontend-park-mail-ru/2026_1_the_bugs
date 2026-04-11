import { useEffect, useState } from '@my-react/hooks';
import { Filter } from '../Filter/Filter';
import { FilterMore } from '../Filter/FilterMore';
import { Modal } from '../Modal/Modal';
import style from './Search.module.css';
import type { IFilters } from 'src/types';

interface SearchProps {
  value: string;
  filters: IFilters;
  onSearch: (value: string, filters: IFilters) => void;
}

export function Search({ value, filters, onSearch }: SearchProps) {
  const [search, setSearch] = useState(value);
  const [selectedFilters, setSelectedFilters] = useState<IFilters>(filters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    setSelectedFilters(filters);
  }, [filters]);

  const handleInput = (e: any) => {
    setSearch(e.target.value);
  };

  const handleSearchClick = () => {
    onSearch(search, selectedFilters);
  };

  const handleFilterApply = (nextFilters: IFilters) => {
    const mergedFilters = {
      ...selectedFilters,
      ...nextFilters,
    };
    setSelectedFilters(mergedFilters);
    onSearch(search, mergedFilters);
  };

  return (
    <div className={style.searchWrap}>
      {isFilterOpen && <div className={style.menuOverlay} onClick={() => setIsFilterOpen(false)} />}

      <div className={style.search}>
        <input
          className={style.input}
          type="text"
          placeholder="Поиск по району или метро"
          value={search}
          onInput={handleInput}
          onKeyDown={(e: KeyboardEvent) => {
            if (e.key === 'Enter') {
              handleSearchClick();
            }
          }}
        />
        <button
          className={`${style.btn} ${style.accent}`}
          type="button"
          aria-label="Фильтр"
          title="Фильтр"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <img src="/svg/filter.svg" alt="" aria-hidden="true" draggable={false} />
        </button>
        <button
          className={`${style.btn} ${style.dark}`}
          type="button"
          aria-label="Поиск"
          title="Поиск"
          onClick={handleSearchClick}
        >
          <img src="/svg/search.svg" alt="" aria-hidden="true" draggable={false} />
        </button>
      </div>

      {isFilterOpen && (
        <div className={style.filterMenu} onClick={(e: MouseEvent) => e.stopPropagation()}>
          <Filter
            onClose={() => setIsFilterOpen(false)}
            onApply={handleFilterApply}
            initialFilters={selectedFilters}
            onOpenMore={() => {
              setIsFilterOpen(false);
              setIsMoreOpen(true);
            }}
          />
        </div>
      )}

      <Modal
        isOpen={isMoreOpen}
        onClose={() => setIsMoreOpen(false)}
        contentClassName={style.moreModalContent}
      >
        <FilterMore
          onClose={() => setIsMoreOpen(false)}
          onApply={handleFilterApply}
          initialFilters={selectedFilters}
        />
      </Modal>
    </div>
  );
}