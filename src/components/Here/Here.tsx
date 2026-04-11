import { Search } from '../Search/Search';
import style from './Here.module.css';
import type { IFilters } from 'src/types';

interface HeroProps {
  searchValue: string;
  filters: IFilters;
  onSearch: (value: string, filters: IFilters) => void;
}

/** Hero-секция главной страницы с заголовком и строкой поиска. */
export function Hero({ searchValue, filters, onSearch }: HeroProps) {
  console.log("Hero")
  return (
    <section className={style['hero']}>
      <h1>КОМФОРТНОЕ ЖИЛЬЁ<br />БЕЗ ПЕРЕПЛАТЫ<br />ЗА ОДИНОЧЕСТВО</h1>
      <Search key="search" value={searchValue} filters={filters} onSearch={onSearch} />
    </section>
  );
}