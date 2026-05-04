import { useEffect } from 'the-react/hooks';
import { useNavigate } from '@router-dom';

interface SupportProtectedLayoutProps {
  children: any;
  isAuthenticate: boolean;
  isAuthResolved: boolean;
  redirectPath?: string;
}

export function SupportProtectedLayout({
  children,
  isAuthenticate,
  isAuthResolved,
  redirectPath = '/support/login',
}: SupportProtectedLayoutProps) {
  const navigate = useNavigate();
  const targetPath = redirectPath || '/support/login';

  useEffect(() => {
    if (isAuthResolved && !isAuthenticate) {
      navigate(targetPath);
    }
  }, [isAuthResolved, isAuthenticate, targetPath]);

  if (!isAuthResolved) {
    return <div style={{ padding: '24px' }}>Проверяем авторизацию...</div>;
  }

  if (!isAuthenticate) {
    return null;
  }

  return <div>{children}</div>;
}
