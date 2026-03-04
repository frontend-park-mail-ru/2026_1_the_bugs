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
        <img src="/svg/filter.svg" alt="" aria-hidden="true"  />
      </button>
      <button
        className="search__go"
        type="button"
        aria-label="Поиск"
        onClick={onSearch}
      >
        <img src="/svg/search.svg" alt="" aria-hidden="true" />
      </button>
    </div>
  );
}