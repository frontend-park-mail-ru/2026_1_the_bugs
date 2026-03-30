import { useEffect, useState } from '@my-react/hooks';
import { Hero } from '../components/Here/Here';
import { CardList } from '../components/CardList/CardList';
import { getPosters } from '../services/posters';
import { type Apartment } from '../types';


/**
 * Главная страница приложения.
 * Отображает шапку, герой-секцию и список квартир.
 */
export function HomePage() {
  console.log("HomePage")
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredApartments, setFilteredApartments] = useState<Apartment[] | undefined>(undefined);


  const handleSearch = () => {
    // const filtered = apartments.filter(apt =>
    //   apt.address.toLowerCase().includes(searchQuery.toLowerCase())
    // );
    // setFilteredApartments(filtered);
  };
  const handelPostersList = async() =>{
    const postersResp = await getPosters({limit: 20, offset: 0})
    setFilteredApartments(postersResp.posters);
    
  }
  useEffect(
    ()=>{handelPostersList()}, []
  )

  return (
    <div>
      <Hero key="hero"
        searchValue={searchQuery}
        onSearchInput={setSearchQuery}
        onSearch={handleSearch}
      />
      { filteredApartments && <CardList key="card_list" apartments={filteredApartments} />}
    </div>
  );
}
