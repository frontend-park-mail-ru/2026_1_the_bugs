interface SearchProps {
  value: string;
  onInput: (value: string) => void;
  onSearch: () => void;
}

export function Search({ value, onInput, onSearch }: SearchProps) {
  return (
    <div className="search">
      <input
        className="search__input"
        type="text"
        placeholder="Поиск по району или метро"
        value={value}
        onInput={(e: any) => onInput(e.target.value)}
      />
      <button className="search__filter" type="button" aria-label="Фильтр">
        <svg viewBox="0 0 24 24">
          <path d="M4 6h16M7 12h10M10 18h4" />
        </svg>
      </button>
      <button
        className="search__go"
        type="button"
        aria-label="Поиск"
        onClick={onSearch}
      >
        <svg viewBox="0 0 24 24">
          <path d="M10.5 18a7.5 7.5 0 1 1 5.3-2.2L20 20" />
        </svg>
      </button>
    </div>
  );
}