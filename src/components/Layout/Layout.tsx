import { Header } from '../../components/Header/Header';
import { AuthModal } from '../../components/AuthModal/AuthModal';
import { useState } from "@my-react/hooks";
import { authService } from '../../services/auth';

interface LayoutProps {
  children: any;
}

export function Layout({ children }: LayoutProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isAuthenticate, setIsAuthenticate] = useState<boolean>(authService.isAuthenticated()); 

  const onLogoutClick = () => {
    setIsAuthenticate(false);
    authService.logout();
  };

  const onSuccess = () => {
    setIsAuthenticate(true);
  };

  const openAuthModal = () => setIsAuthModalOpen(true);
  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
    document.body.style.overflow = '';
  };

  return (
    <div>
      <Header 
        isAutenticated={isAuthenticate} 
        onLogoutClick={onLogoutClick} 
        onAuthorizeClick={openAuthModal} 
        key="Header"
      />
      {children}
      {isAuthModalOpen && (
        <AuthModal key="AuthModal" onSuccess={onSuccess} onClose={closeAuthModal} />
      )}
    </div>
  );
}
