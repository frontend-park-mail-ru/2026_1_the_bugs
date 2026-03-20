import { Router } from "@my-react/router-dom/Router";
import { HomePage } from '../pages/HomePage'
import { UtilityComplex } from "../pages/UtilityComplex";
import { useEffect, useState } from "@my-react/hooks";
import { Header } from "../components/Header/Header";
import { AuthModal } from '../components/AuthModal/AuthModal';
import { apiService } from '../services/apiClass';
import { authService } from '../services/auth';

/**
 * Общая для отображения разных страниц компонента.
 * Содержит в себе роутер и шапку (авторизация тут же).
 * 
 */
export function App() {
    const [currentPath, setCurrentPath] = useState(window.location.pathname);

    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [isAuthenticate, setIsAuthenticate] = useState<boolean>(apiService.isAuthenticated()); 


    useEffect(() => {
        const handler = () => setCurrentPath(window.location.pathname);
        window.addEventListener('popstate', handler);
        return () => window.removeEventListener('popstate', handler);
    }, []);

    const onLogoutClick = () =>{
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
            <Header isAutenticated={isAuthenticate} key="header" onLogoutClick={onLogoutClick} onAuthorizeClick={openAuthModal} />
            <Router key='router1' currentPath={currentPath} path="/">
                <HomePage  key='HomePage' />
            </Router>
            <Router key='router2' currentPath={currentPath} path="/company/{alias}">
                <UtilityComplex alias="{alias}" key='UtilityComplex' />
            </Router>
            {isAuthModalOpen && <AuthModal key="auth" onSuccess={()=>setIsAuthenticate(true)}onClose={closeAuthModal} />}
        </div>
    );
}