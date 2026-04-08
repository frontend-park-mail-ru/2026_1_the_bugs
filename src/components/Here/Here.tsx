import { Search } from '../Search/Search';
import style from './Here.module.css';

interface HeroProps {
  searchValue: string;
  onSearch: (value: string) => void;
}

/** Hero-секция главной страницы с заголовком и строкой поиска. */
export function Hero({ searchValue, onSearch }: HeroProps) {
  console.log("Hero")
  return (
    <section className={style['hero']}>
      <h1>КОМФОРТНОЕ ЖИЛЬЁ<br />БЕЗ ПЕРЕПЛАТЫ<br />ЗА ОДИНОЧЕСТВО</h1>
      <Search key="search" value={searchValue} onSearch={onSearch} />
    </section>
  );
}