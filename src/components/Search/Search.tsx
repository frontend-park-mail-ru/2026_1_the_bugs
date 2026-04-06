import { useState } from '@my-react/hooks';
import style from './Search.module.css';

interface SearchProps {
  value: string;
  onSearch: (value: string) => void;
}

export function Search({ value, onSearch }: SearchProps) {
  const [search, setSearch] = useState(value)

  const handleInput = (e: any) => {
    setSearch(e.target.value);
  };

  const handleSearchClick = () => {
    onSearch(search);
  };

  return (
    <div className={style.search}>
      <input
        className={style.input}
        type="text"
        placeholder="Поиск по району или метро"
        value={search}
        onInput={handleInput}  // ✅ onChange вместо onInput!
      />
      <button 
        className={`${style.btn} ${style.accent}`} 
        type="button" 
        aria-label="Фильтр"
        title="Фильтр"
      >
        <img src="/svg/filter.svg" alt="" aria-hidden="true" draggable={false}/>
      </button>
      <button
        className={`${style.btn} ${style.dark}`}
        type="button"
        aria-label="Поиск"
        title="Поиск"
        onClick={handleSearchClick}
      >
        <img src="/svg/search.svg" alt="" aria-hidden="true" draggable={false}/>
      </button>
    </div>
  );
}