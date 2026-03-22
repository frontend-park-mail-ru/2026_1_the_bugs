import { useEffect, useState } from '@my-react/hooks';
import { Hero } from '../components/Here/Here';
import { CardList } from '../components/CardList/CardList';
import { getPosters } from '../services/posters';
import { type Apartment } from '../types';
import { authService } from '../services/auth';


/**
 * Главная страница приложения.
 * Отображает шапку, герой-секцию и список квартир.
 */
export function HomePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticate, setIsAuthenticate] = useState<boolean>(authService.isAuthenticated()); 
  const [filteredApartments, setFilteredApartments] = useState<Apartment[] | undefined>(undefined);


  const handleSearch = () => {
    // const filtered = apartments.filter(apt =>
    //   apt.address.toLowerCase().includes(searchQuery.toLowerCase())
    // );
    // setFilteredApartments(filtered);
  };
  const handelPostersList = async() =>{
    const postersResp = await getPosters({limit: 12, offset: 0})
    setFilteredApartments(postersResp.posters);
    
  }
  useEffect(
    ()=>{handelPostersList()}, []
  )


  const navigate = useNavigate();

  return (
    <main className="main">
      <button type="button" onClick={() => navigate('/company/stroigroup')}>
          Вернуться utility
      </button>
      <Hero key="hero"
        searchValue={searchQuery}
        onSearchInput={setSearchQuery}
        onSearch={handleSearch}
      />
      { filteredApartments && <CardList key="card_list" apartments={filteredApartments} />}
    </main>
  );
}
