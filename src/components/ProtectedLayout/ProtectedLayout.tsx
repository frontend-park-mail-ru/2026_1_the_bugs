import { AuthModal } from '../../components/AuthModal/AuthModal';
import { useNavigate } from '@my-react/router-dom/hooks';

interface LayoutProps {
    path: string;
    children: any;
    isAuthenticate: boolean;
    setIsAuthenticate: (isAuth: boolean) => void;
}

export function ProtectedLayout({ path, children, isAuthenticate, setIsAuthenticate }: LayoutProps) {
  const navigate = useNavigate();

  const onSuccess = () => {
    setIsAuthenticate(true);
    navigate(path);
  };

  const closeAuthModal = () => {
    navigate('/');
    document.body.style.overflow = '';
  };

  return (
    <div>
      {isAuthenticate ? children : <AuthModal key="AuthModalProtected" onSuccess={onSuccess} onClose={closeAuthModal} />}
    </div>
  );
}
