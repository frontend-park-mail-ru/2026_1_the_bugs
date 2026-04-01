import { Router, Switch } from '@my-react/router-dom/Router';
import { useEffect, useState } from '@my-react/hooks';
import { HomePage } from '../pages/HomePage';
import { UtilityComplex } from '../pages/UtilityComplex';
import { OAuthVerifyPage } from '../pages/OAuthVerifyPage/OAuthVerifyPage';
import { PosterPage } from '../pages/PosterPage';
import { CreatePosterPage } from '../pages/CreatePosterPage/CreatePosterPage';
import { Layout } from '../components/Layout/Layout';
import { MyPosterList } from '../components/MyPosters/MyPosters';
import { EditPosterPage } from '../pages/EditPosterPage/EditPosterPage';
import { ProtectedLayout } from '../components/ProtectedLayout/ProtectedLayout';
import { authService } from '../services/auth';

/**
 * Общая для отображения разных страниц компонента.
 * Содержит в себе роутер и шапку (авторизация тут же).
 */
export function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [isAuthenticate, setIsAuthenticate] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      const auth = await authService.isAuthenticated();
      setIsAuthenticate(auth);
    };
    checkAuth();
  }, []);

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
        <Switch key="root" currentPath={currentPath}>
          <Router currentPath={currentPath} path="/oauth/vk">
            <OAuthVerifyPage setIsAuthenticate={setIsAuthenticate} provider="vk" key="OAuthVerifyPageVK" />
          </Router>
          <Router currentPath={currentPath} path="/oauth/yandex">
            <OAuthVerifyPage setIsAuthenticate={setIsAuthenticate} provider="yandex" key="OAuthVerifyPageYandex" />
          </Router>
          <Router currentPath={currentPath} path="*">
            < Layout isAuthenticate={isAuthenticate} setIsAuthenticate={setIsAuthenticate} key="Layout">
              <Switch key="main" currentPath={currentPath}>
                <Router currentPath={currentPath} path="/">
                  <HomePage key="HomePage" />
                </Router>
                <Router currentPath={currentPath} path="/company/{alias}">
                  <UtilityComplex alias="{alias}" key="CompanyPage" />
                </Router>
                <Router currentPath={currentPath} path="/posters/create">
                  <ProtectedLayout path="/posters/create" isAuthenticate={isAuthenticate} setIsAuthenticate={setIsAuthenticate} key="ProtectedLayout">
                      <CreatePosterPage key="CreatePosterPage" />
                  </ProtectedLayout>
                </Router>
                <Router currentPath={currentPath} path="/posters/{alias}/edit">
                  <EditPosterPage alias="{alias}" key="EditPosterPage" />
                </Router>
                <Router currentPath={currentPath} path="/posters/{alias}">
                  <PosterPage alias="{alias}" key="PosterPage" />
                </Router>
                <Router currentPath={currentPath} path="/my-posters">
                  <ProtectedLayout path="/my-posters" isAuthenticate={isAuthenticate} setIsAuthenticate={setIsAuthenticate}>
                      <MyPosterList key="MyPosterPage" />
                  </ProtectedLayout>
                </Router>
              </Switch>
            </Layout>
          </Router>
        </Switch>
      </div>
    </main>
  );
}