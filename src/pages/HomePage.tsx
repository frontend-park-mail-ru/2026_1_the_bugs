import { useState } from '@my-react/hooks';
import { Header } from '../components/Header';
import { Hero } from '../components/Here';
import { CardList } from '../components/CardList';
import { AuthModal } from '../components/AuthModal/AuthModal';
import { apartments } from '../data/apartments';

export function HomePage() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredApartments, setFilteredApartments] = useState(apartments);

  const handleSearch = () => {
    const filtered = apartments.filter(apt =>
      apt.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredApartments(filtered);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => {
        setIsAuthModalOpen(false)
        document.body.style.overflow = ''
    }

  return (
    <div className="page">
      <Header key="header" onProfileClick={openAuthModal} />
      <main className="main">
        <Hero key="hero"
          searchValue={searchQuery}
          onSearchInput={setSearchQuery}
          onSearch={handleSearch}
        />
        <CardList key="card_list" apartments={filteredApartments} />
      </main>
      {isAuthModalOpen && <AuthModal key="auth" onClose={closeAuthModal} />}
    </div>
  );
}