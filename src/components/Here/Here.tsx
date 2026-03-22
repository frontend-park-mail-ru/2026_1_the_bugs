import { Search } from '../Search/Search';
import style from './Here.module.css';

interface HeroProps {
  searchValue: string;
  onSearchInput: (value: string) => void;
  onSearch: () => void;
}

/** Hero-секция главной страницы с заголовком и строкой поиска. */
export function Hero({ searchValue, onSearchInput, onSearch }: HeroProps) {
  console.log("Hero")
  return (
    <section className={style['hero']}>
      <h1>КОМФОРТНОЕ ЖИЛЬЁ<br />БЕЗ ПЕРЕПЛАТЫ<br />ЗА ОДИНОЧЕСТВО</h1>
      <Search key="search" value={searchValue} onInput={onSearchInput} onSearch={onSearch} />
    </section>
  );
}