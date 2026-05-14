import { Switch, Router } from '@router-dom';
import { useEffect, useState } from 'the-react';
import { authService } from '../../../src/services/auth';
import { apiService } from '../../../src/services/apiClass.ts';
import { HomePage } from '../pages/MainPage';
import { AdminAuth } from '../components/AdminAuth/AdminAuth.tsx';
import { AdminPage } from '../components/AdminPage/AdminPage.tsx';
import { AdminAnswer } from '../components/AdminAnswer/AdminAnswer.tsx';

export function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isAdminAuth, setIsAdminAuth] = useState(false);

  useEffect(() => {
    apiService.init();
  }, []);

  useEffect(() => {
    const handler = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  // Обработчик логина
  const handleAdminLogin = async (email: string, password: string) => {
    await authService.login({ email, password });
    setIsAdminAuth(true);
  };

  return (
    <main className="main">
      <div className="page">
        <Switch key="root" currentPath={currentPath} >
          <Router currentPath={currentPath} path="/admin/order/{id}">
            {isAdminAuth ? (
              <AdminAnswer key="AdminAnswer" />
            ) : (
              <AdminAuth key="AdminAuthOrder" onLogin={handleAdminLogin} />
            )}
          </Router>
          <Router currentPath={currentPath} path="/admin">
            {isAdminAuth ? (
              <AdminPage key="AdminPage" />
            ) : (
              <AdminAuth key="AdminAuth" onLogin={handleAdminLogin} />
            )}
          </Router>
          <Router currentPath={currentPath} path="/">
            <HomePage key="HomePage" />
          </Router>
        </Switch>
      </div>
    </main>
  );
}