import { useState, useEffect } from 'the-react/hooks';
import { Button } from '../Button/Button';
import { Filter } from '../Filter/Filter';
import { FilterMore } from '../Filter/FilterMore';
import { Modal } from '../Modal/Modal';
import style from './Search.module.css';
import type { IFilters } from 'src/types';
import { useNavigate } from '../../RouterDOM/hooks';

interface SearchProps {
  value: string;
  filters: IFilters;
  isSearchVisible?: boolean;
  onSearch: (value: string, filters: IFilters) => void;
  setFilters: (filters: IFilters) => void;
  filterMenuPlacement?: 'bottom' | 'top';
  moreFiltersFullscreen?: boolean;
  onMoreOpenChange?: (isOpen: boolean) => void;
  isMapPage?: boolean;
}

// Функция для преобразования объекта фильтров в строку запроса
const filtersToQueryString = (filters: IFilters): string => {
  const params = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        if (value.length > 0) {
          params.append(key, value.join(','));
        }
      } else {
        params.append(key, String(value));
      }
    }
  });
  
  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
};

export function Search({
  value,
  filters,
  onSearch,
  setFilters,
  filterMenuPlacement = 'bottom',
  moreFiltersFullscreen = false,
  onMoreOpenChange,
  isSearchVisible = true,
  isMapPage
}: SearchProps) {
  const [search, setSearch] = useState(value);
  const [selectedFilters, setSelectedFilters] = useState<IFilters>(filters);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setSearch(value);
  }, [value]);

  useEffect(() => {
    setSelectedFilters(filters);
  }, [filters]);

  useEffect(() => {
    onMoreOpenChange?.(isMoreOpen);
  }, [isMoreOpen, onMoreOpenChange]);

  const handleInput = (e: any) => {
    setSearch(e.target.value);
  };

  const handleSearchClick = (search: string, selectedFilters: IFilters) => {
    onSearch(search, selectedFilters);
  };

  const handleFilterApply = (nextFilters: IFilters) => {
    const mergedFilters = {
      ...selectedFilters,
      ...nextFilters,
    };
    setSelectedFilters(mergedFilters);
    const liveValue = (document.getElementById('global-search-input') as HTMLInputElement | null)?.value;
    onSearch(liveValue ?? search, mergedFilters);
  };

  const navigateWithFilters = (path: string) => {
    const query = filtersToQueryString(selectedFilters);
    navigate(`${path}${query}`);
  };

  return (
    <div className={style.searchWrap}>
      {isFilterOpen && <div className={style.menuOverlay} onClick={() => setIsFilterOpen(false)} />}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', 'justify-content': 'center', width: '100%' }}>
        {isSearchVisible ? (
          <Button
            variant="accent"
            className={style.btn}
            type="button"
            onClick={() => navigateWithFilters('/map')}
            aria-label="Карта"
            style={{ margin: '0' }}
            title="Карта"
            icon={<img src="/svg/map.svg" alt="" aria-hidden="true" draggable={false} />}
          />
        ) : (
          <Button
            variant="accent"
            className={style.btn}
            type="button"
            style={{ margin: '0' }}
            onClick={() => navigateWithFilters('/')}
            aria-label="Списком"
            title="Списком"
            icon={<img src="/svg/list.svg" alt="" aria-hidden="true" draggable={false} />}
          />
        )}
       
        <div className={style.search}>
          <input
            id="global-search-input"
            className={style.input}
            type="text"
            placeholder="Поиск по району или метро"
            value={search}
            onInput={handleInput}
            onKeyDown={(e: KeyboardEvent) => {
              if (e.key === 'Enter') {
                handleSearchClick(search, selectedFilters);
              }
            }}
          />
          <Button
            variant="accent"
            className={style.btn}
            type="button"
            aria-label="Фильтр"
            title="Фильтр"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            icon={<img src="/svg/filter.svg" alt="" aria-hidden="true" draggable={false} />}
          />
          <button
            className={`${style.btn} ${style.dark}`}
            type="button"
            aria-label="Поиск"
            title="Поиск"
            onClick={() => handleSearchClick(search, selectedFilters)}
          >
            <img 
              src="/svg/search.svg" 
              alt="" 
              aria-hidden="true" 
              draggable={false} 
            />
          </button>
        </div>
      </div>

      {isFilterOpen && (
        <div
          className={`${style.filterMenu} ${filterMenuPlacement === 'top' ? style.filterMenuTop : ''}`}
          onClick={(e: MouseEvent) => e.stopPropagation()}
        >
          <Filter
            setFilters={setFilters}
            onClose={() => setIsFilterOpen(false)}
            onApply={handleFilterApply}
            initialFilters={selectedFilters}
            isMapFilters={isMapPage}
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
        overlayClassName={moreFiltersFullscreen ? style.moreModalOverlayFullscreen : ''}
        contentClassName={`${style.moreModalContent} ${moreFiltersFullscreen ? style.moreModalContentFullscreen : ''}`.trim()}
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