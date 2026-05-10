import {Switch, Router} from '@router-dom';
import { useEffect, useState } from 'the-react';
import { apiService } from '../../../src/services/apiClass';
import { HomePage } from '../pages/MainPage';
import { AdminAuth } from '../components/AdminAuth/AdminAuth.tsx';
import { AdminPage } from '../components/AdminPage/AdminPage.tsx';

/**
 * Общая для отображения разных страниц компонента.
 * Содержит в себе роутер и шапку (авторизация тут же).
 */
export function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isAdminAuth, setIsAdminAuth] = useState(false);

  useEffect(()=>{
    apiService.init()
  }, [])

  useEffect(() => {
    const handler = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);

  return (
    <main className="main">
      <div className="page">
        <Switch key="root" currentPath={currentPath} >
          <Router currentPath={currentPath} path="/admin">
            {isAdminAuth ? (
              <AdminPage key="AdminPage" />
            ) : (
              <AdminAuth key="AdminAuth" onLogin={() => setIsAdminAuth(true)} />
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