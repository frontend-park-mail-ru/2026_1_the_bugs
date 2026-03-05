import style from './Search.module.css';

interface SearchProps {
  value: string;
  onInput: (value: string) => void;
  onSearch: () => void;
}

export function Search({ value, onInput, onSearch }: SearchProps) {
  return (
    <div className={style.search}>
      <input
        className={style.input}
        type="text"
        placeholder="Поиск по району или метро"
        value={value}
        onInput={(e: any) => onInput(e.target.value)}
      />
      <button className={`${style.btn} ${style.accent}`} type="button" aria-label="Фильтр">
        <img src="/svg/filter.svg" alt="" aria-hidden="true" />
      </button>
      <button
        className={`${style.btn} ${style.dark}`}
        type="button"
        aria-label="Поиск"
        onClick={onSearch}
      >
        <img src="/svg/search.svg" alt="" aria-hidden="true" />
      </button>
    </div>
  );
}