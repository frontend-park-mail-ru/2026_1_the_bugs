import { useEffect, useState } from '@my-react/hooks';
import { Hero } from '../components/Here/Here';
import { CardList } from '../components/CardList/CardList';
import { getPosters } from '../services/posters';
import { type Apartment } from '../types';
import { useNavigate } from '@my-react/router-dom/hooks';

 const updatePageSize = () => {
      console.log(window.innerWidth)
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
}

export function HomePage({search_query}: Props) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState(search_query);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pageSize, setPageSize] = useState(updatePageSize());
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const fetchData = async (searchVal: string = '', append = false) => {
    if (isLoading || (!append && apartments.length > 0)) return;
    
    setIsLoading(true);
    setIsFetchingMore(true);
    const offset = append ? apartments.length : 0;
    console.log(`Fetching offset ${offset}, search: "${searchVal}"`);
    
    try {
      if (!hasMore){
        return
      }
      const postersResp = await getPosters({ 
        limit: pageSize, 
        offset, 
        search: searchVal 
      });
      if (postersResp.posters.length == 0){
        setHasMore(false)
        return
      }

      const newApartments = append 
        ? [...apartments, ...postersResp.posters] 
        : postersResp.posters;
        
      
      setApartments(newApartments);
      setTotalCount(postersResp.len || 0);
      setHasMore(true);
    }catch{
      setHasMore(false);
    } finally {
      setIsLoading(false);
      setIsFetchingMore(false);
    }
  };

    const handleSearch = (searchVal: string) => {
    setSearchQuery(searchVal);
    
    const params = new URLSearchParams(window.location.search);
    if (searchVal) {
      params.set('search_query', searchVal);
    } else {
      params.delete('search_query');
    }
    navigate(`${window.location.pathname}?${params.toString()}`)
    setApartments([]);
    setHasMore(true);
    fetchData(searchVal, false);
  };

  useEffect(() => {
    fetchData(searchQuery, false);
  }, [searchQuery]);

  return (
    <div>
      <Hero 
        searchValue={searchQuery}
        onSearch={handleSearch}
      />
      
      <CardList
        pageSize={pageSize}
        apartments={apartments} 
        isFetchingMore={isFetchingMore}
        hasMore={hasMore}
        onLoadMore={() => fetchData(searchQuery, true)}
      />
    </div>
  );
}