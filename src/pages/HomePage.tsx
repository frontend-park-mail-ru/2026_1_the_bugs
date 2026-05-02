import { useEffect, useState } from 'the-react/hooks';
import { Hero } from '../components/Here/Here';
import { CardList } from '../components/CardList/CardList';
import { getPosters, getFavorites } from '../services/posters';
import { type Apartment, type IFilters} from '../types';
import { useNavigate } from '@router-dom';

 const updatePageSize = () => {
      const width = window.innerWidth;
      if (width >= 2400){
        return 20;
      }
      if (width >= 1400) {
        return (12);
      } else if (width >= 1000) {
        return(9);
      } else if (width >= 768) {
        return(6);
      } else {
        return(4);
      }
};

interface Props{
  search_query: string;
  isAuth: boolean
}

const parseNum = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const num = Number(value);
  return Number.isFinite(num) ? num : undefined;
};

const parseBool = (value: string | null): boolean | undefined => {
  if (value === 'true') return true;
  if (value === 'false') return false;
  return undefined;
};

const parseFiltersFromSearch = (params: URLSearchParams): IFilters => {
  const facilities = params.get('facilities')
    ?.split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    category: params.get('category') || undefined,
    room_count: parseNum(params.get('room_count')),
    min_price: parseNum(params.get('min_price')),
    max_price: parseNum(params.get('max_price')),
    min_square: parseNum(params.get('min_square')),
    max_square: parseNum(params.get('max_square')),
    min_flat_floor: parseNum(params.get('min_flat_floor')),
    max_flat_floor: parseNum(params.get('max_flat_floor')),
    min_building_floor: parseNum(params.get('min_building_floor')),
    max_building_floor: parseNum(params.get('max_building_floor')),
    facilities: facilities && facilities.length > 0 ? facilities : undefined,
    not_first_floor: parseBool(params.get('not_first_floor')),
    not_last_floor: parseBool(params.get('not_last_floor')),
  };
};

const syncQueryParams = (searchVal: string, filters: IFilters): string => {
  const params = new URLSearchParams();

  if (searchVal) params.set('search_query', searchVal);
  if (filters.category) params.set('category', filters.category);
  if (filters.room_count != null) params.set('room_count', String(filters.room_count));
  if (filters.min_price != null) params.set('min_price', String(filters.min_price));
  if (filters.max_price != null) params.set('max_price', String(filters.max_price));
  if (filters.min_square != null) params.set('min_square', String(filters.min_square));
  if (filters.max_square != null) params.set('max_square', String(filters.max_square));
  if (filters.min_flat_floor != null) params.set('min_flat_floor', String(filters.min_flat_floor));
  if (filters.max_flat_floor != null) params.set('max_flat_floor', String(filters.max_flat_floor));
  if (filters.min_building_floor != null) params.set('min_building_floor', String(filters.min_building_floor));
  if (filters.max_building_floor != null) params.set('max_building_floor', String(filters.max_building_floor));
  if (filters.facilities && filters.facilities.length > 0) params.set('facilities', filters.facilities.join(','));
  if (filters.not_first_floor) params.set('not_first_floor', 'true');
  if (filters.not_last_floor) params.set('not_last_floor', 'true');

  return params.toString();
};

export function HomePage({search_query, isAuth}: Props) {
  const initialParams = new URLSearchParams(window.location.search);
  const initialSearch = initialParams.get('search_query') || search_query || '';
  const initialFilters = parseFiltersFromSearch(initialParams);

  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [filters, setFilters] = useState<IFilters>(initialFilters);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [pageSize] = useState(updatePageSize());
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [favoriteAliases, setFavoriteAliases] = useState<Set<string>>(new Set());

  const [isFavoritesLoading, setIsFavoritesLoading] = useState(true);

    useEffect(() => {
        const f = async () => {
            try {
                const res = await getFavorites();
                setFavoriteAliases(new Set(res.posters.map(f => f.alias)));
            } finally {
                setIsFavoritesLoading(false);
            }
        };
        f();
    }, []);


  const fetchData = async (searchVal: string, currentFilters: IFilters, append = false) => {
    if (isLoading || !hasMore) return;
    
    setIsLoading(true);
    setIsFetchingMore(true);
    const offset = append ? apartments.length : 0;
    
    try {
      const postersResp = await getPosters({ 
        limit: pageSize, 
        offset, 
        search: searchVal,
        ...currentFilters,
      });

      const newApartments = append 
        ? [...apartments, ...postersResp.posters] 
        : postersResp.posters;
        
      
      setApartments(newApartments);
      setHasMore((newApartments.length < (postersResp.len || 0)) && postersResp.posters.length > 0);
    }catch{
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

    const handleSearch = (searchVal: string, nextFilters: IFilters) => {
      setSearchQuery(searchVal);
      setFilters(nextFilters);
      const query = syncQueryParams(searchVal, nextFilters);
      navigate(`${window.location.pathname}${query ? `?${query}` : ''}`)
      setApartments([]);
      setHasMore(true);
    };

  useEffect(() => {
    fetchData(searchQuery, filters, false);
  }, [searchQuery, filters]);

  return (
    <div>
      <Hero 
        setFilters={setFilters}
        searchValue={searchQuery}
        filters={filters}
        onSearch={handleSearch}
      />
      
      <CardList
        pageSize={pageSize}
        apartments={apartments}
        isFetchingMore={isFetchingMore}
        hasMore={hasMore}
        isAuth={isAuth}
        onLoadMore={() => fetchData(searchQuery, filters, true)}
        favoritesIds={isFavoritesLoading ? undefined : favoriteAliases} 
      />
    </div>
  );
}