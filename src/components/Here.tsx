import { Search } from './Search';

interface HeroProps {
  searchValue: string;
  onSearchInput: (value: string) => void;
  onSearch: () => void;
}

export function Hero({ searchValue, onSearchInput, onSearch }: HeroProps) {
  return (
    <div>
        <section class="hero">
      <h1>КОМФОРТНОЕ ЖИЛЬЁ<br />БЕЗ ПЕРЕПЛАТЫ<br />ЗА ОДИНОЧЕСТВО</h1>
      <Search key="search" value={searchValue} onInput={onSearchInput} onSearch={onSearch} />
    </section>
    </div>
    
  );
}