import { Search } from '../Search/Search';
import style from './Here.module.css';
import type { IFilters } from 'src/types';

interface HeroProps {
  searchValue: string;
  filters: IFilters;
  onSearch: (value: string, filters: IFilters) => void;
  setFilters: (f: IFilters)=>void;
}

/** Hero-секция главной страницы с заголовком и строкой поиска. */
export function Hero({ searchValue, filters, onSearch, setFilters }: HeroProps) {
  console.log("Hero")
  return (
    <section className={style['hero']}>
      <h1>КОМФОРТНОЕ ЖИЛЬЁ<br />БЕЗ ПЕРЕПЛАТЫ<br />ЗА ОДИНОЧЕСТВО</h1>
      <Search selectedFilters={filters}  key="search" value={searchValue} filters={filters} setFilters={setFilters}onSearch={onSearch} />
    </section>
  );
}