import { AuthModal } from '../../components/AuthModal/AuthModal';
import { useNavigate } from '@router-dom';

interface LayoutProps {
    path: string;
    children: any;
    isAuthenticate: boolean;
    setIsAuthenticate: (isAuth: boolean) => void;
    [key: string]: any;
}

export function ProtectedLayout({ path, children, isAuthenticate, setIsAuthenticate, ...passthrough }: LayoutProps) {
  const navigate = useNavigate();

  const onSuccess = () => {
    setIsAuthenticate(true);
    navigate(path);
  };

  const closeAuthModal = () => {
    navigate('/');
    document.body.style.overflow = '';
  };

  if (isAuthenticate && children?.type === 'component') {
    children.props = {
      ...children.props,
      ...passthrough,
    };
  }

  return (
    <div>
      {isAuthenticate ? children : <AuthModal key="AuthModalProtected" onSuccess={onSuccess} onClose={closeAuthModal} />}
    </div>
  );
}
