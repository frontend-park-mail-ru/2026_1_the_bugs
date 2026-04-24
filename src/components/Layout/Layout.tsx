import { Header } from '../../components/Header/Header';
import { AuthModal } from '../../components/AuthModal/AuthModal';
import { useState } from "the-react/hooks";
import { authService } from '../../services/auth';
import type { UserResponse } from 'src/types';

interface LayoutProps {
  children: any;
  currentPath: string;
  isAuthResolved: boolean;
  isAuthenticate: boolean;
  setIsAuthenticate: (isAuth: boolean) => void;
  currentUser?: UserResponse | null;
}

export function Layout({ children, currentPath, isAuthResolved, isAuthenticate, setIsAuthenticate, currentUser }: LayoutProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); 
  const isMapPage = currentPath === '/map';

  const onLogoutClick = () => {
    setIsAuthenticate(false);
    authService.logout();
    // window.location.href = '/';
  };

  const onSuccess = () => {
    setIsAuthenticate(true);
    closeAuthModal();
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <div>
      <Header 
        currentPath={currentPath}
        currentUser={currentUser}
        isAuthResolved={isAuthResolved}
        isAutenticated={isAuthenticate} 
        onLogoutClick={onLogoutClick} 
        onAuthorizeClick={openAuthModal} 
        isMapPage={isMapPage}
        key="Header"
      />
      {children}
      {isAuthModalOpen && (
        <AuthModal key="AuthModal" onSuccess={onSuccess} onClose={closeAuthModal} />
      )}
    </div>
  );
}
