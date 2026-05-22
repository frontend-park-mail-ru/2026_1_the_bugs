import { Header } from '../../components/Header/Header';
import { AuthModal } from '../../components/AuthModal/AuthModal';
import { useState } from "the-react/hooks";
import { authService } from '../../services/auth';
import type { UserResponse } from 'src/types';
import style from "./Layout.module.css"
import { Modal } from '../Modal/Modal';
import { SUPPORT_URL } from '../../config';

interface LayoutProps {
  children: any;
  currentPath: string;
  isAuthResolved: boolean;
  isAuthenticate: boolean;
  setIsAuthenticate: (isAuth: boolean) => void;
  currentUser?: UserResponse | null;
}

export function Layout({ children, currentPath, isAuthResolved, isAuthenticate, setIsAuthenticate, currentUser}: LayoutProps) {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false); 
  const [isSupportOpen, setIsSupportOpen] = useState<boolean>(false);
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
    <div className={style.layout}>
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
      <div className={style.supportLayer}>
        {isAuthenticate && (
           <div className={style.supportDock}>
            {isSupportOpen  &&!isMapPage && (
              <div className={style.supportFrameWrap}>
               <Modal isOpen={isSupportOpen} onClose={() => setIsSupportOpen(false)} contentStyle={{'overflow': 'hidden', 'max-height': '760px', 'margin-top':'100px'}}>
                  <iframe
                  src={SUPPORT_URL}
                  title="Поддержка"
                  className={style.supportFrame}
                  sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-downloads"
                />
            </Modal>
            </div>
            )}
             {!isMapPage &&(
               <button 
              className={`${style.button} ${style.round} ${style.accent}`}
              style={{ marginRight: '5px', marginBottom: '10px' }}
              type="button" 
              aria-label="Поддержка" 
              onClick={() => setIsSupportOpen(!isSupportOpen)}
            >
              <img src="/svg/message.svg" alt="Поддержка" aria-hidden="true" draggable="false" />
            </button>
             )}
           
        </div>
        )}
       
      </div>
      {children}
      {isAuthModalOpen && (
        <AuthModal key="AuthModal" onSuccess={onSuccess} onClose={closeAuthModal} />
      )}
    </div>
  );
}
