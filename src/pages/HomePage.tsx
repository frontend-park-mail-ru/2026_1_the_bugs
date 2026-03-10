import { useEffect, useState } from '@my-react/hooks';
import { Header } from '../components/Header/Header';
import { Hero } from '../components/Here/Here';
import { CardList } from '../components/CardList/CardList';
import { AuthModal } from '../components/AuthModal/AuthModal';
import { getPosters } from '../services/posters';
import { type Apartment } from '../types';
import { apiService } from '../services/apiClass';
import { authService } from '../services/auth';


/**
 * Главная страница приложения.
 * Отображает шапку, герой-секцию, список квартир и модальное окно авторизации.
 */
export function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAuthenticate, setIsAuthenticate] = useState<boolean>(apiService.isAuthenticated()); 
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
  const onProfileClick = () =>{
    setIsAuthenticate(false)
    authService.logout()
  }
  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => {
        setIsAuthModalOpen(false)
        document.body.style.overflow = ''
    }

  return (
    <div className="page">
      <Header isAutenticated={isAuthenticate} key="header" onProfileClick={onProfileClick} onAuthorizeClick={openAuthModal} />
      <main className="main">
        <Hero key="hero"
          searchValue={searchQuery}
          onSearchInput={setSearchQuery}
          onSearch={handleSearch}
        />
        { filteredApartments && <CardList key="card_list" apartments={filteredApartments} />}
      </main>
      {isAuthModalOpen && <AuthModal key="auth" onSuccess={()=>setIsAuthenticate(true)}onClose={closeAuthModal} />}
    </div>
  );
}