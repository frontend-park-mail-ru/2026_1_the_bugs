import { useEffect, useState } from '@my-react/hooks';
import { Hero } from '../components/Here/Here';
import { CardList } from '../components/CardList/CardList';
import { getPosters } from '../services/posters';
import { type Apartment } from '../types';
import Pagination from '../components/Pagination/Pagination';


function getPageFromUrl(): number {
  try {
      const params = new URLSearchParams(window.location.search);
      const p = parseInt(params.get('page') ?? '1', 10);
      return isNaN(p) || p < 1 ? 1 : p;
    } catch {
      return 1;
    }
}


/**
 * Главная страница приложения.
 * Отображает шапку, герой-секцию и список квартир.
 */
export function HomePage() {

  const [searchQuery, setSearchQuery] = useState('');
  const [filteredApartments, setFilteredApartments] = useState<Apartment[] | undefined>(undefined);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageSize] = useState<number>(12);
  const [page, setPage] = useState<number>(getPageFromUrl());

  const handleSearch = () => {
    // kept for future client-side search
  };

  const fetchPosters = async (pageNumber: number) => {
    const offset = (pageNumber - 1) * pageSize;
    const postersResp = await getPosters({ limit: pageSize, offset: offset });
    setFilteredApartments(postersResp.posters);
    setTotalCount(postersResp.len ?? 0);
  };

  useEffect(() => { fetchPosters(page); }, [page]);

  const handlePageChange = (p: number) => {
    setPage(p);
    try {
      const params = new URLSearchParams(window.location.search);
      params.set('page', String(p));
      const newUrl = window.location.pathname + (params.toString() ? `?${params.toString()}` : '');
      window.history.replaceState(null, '', newUrl);
    } catch {
      // ignore
    }
  };

  return (
    <div>
      <Hero key="hero"
        searchValue={searchQuery}
        onSearchInput={setSearchQuery}
        onSearch={handleSearch}
      />
      { filteredApartments && <CardList key="card_list" apartments={filteredApartments} />}

      <Pagination
        page={page}
        total={totalCount}
        pageSize={pageSize}
        onPageChange={handlePageChange}
      />
    </div>
  );
}
