import { Router, Switch } from '@my-react/router-dom/Router';
import { useEffect, useState } from '@my-react/hooks';
import { HomePage } from '../pages/HomePage';
import { UtilityComplex } from '../pages/UtilityComplex';
import { OAuthVerifyPage } from '../pages/OAuthVerifyPage/OAuthVerifyPage';
import { PosterPage } from '../pages/PosterPage';
import { CreatePosterPage } from '../pages/CreatePosterPage/CreatePosterPage';
import { Layout } from '../components/Layout/Layout';

/**
 * Общая для отображения разных страниц компонента.
 * Содержит в себе роутер и шапку (авторизация тут же).
 */
export function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

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
            <OAuthVerifyPage provider="vk" key="OAuthVerifyPageVK" />
          </Router>
          <Router currentPath={currentPath} path="/oauth/yandex">
            <OAuthVerifyPage provider="yandex" key="OAuthVerifyPageYandex" />
          </Router>
          <Router currentPath={currentPath} path="*">
            <Layout>
              <Switch key="main" currentPath={currentPath}>
                <Router currentPath={currentPath} path="/">
                  <HomePage key="HomePage" />
                </Router>
                <Router currentPath={currentPath} path="/company/{alias}">
                  <UtilityComplex alias="{alias}" key="CompanyPage" />
                </Router>
                <Router currentPath={currentPath} path="/posters/create">
                  <CreatePosterPage key="CreatePosterPage" />
                </Router>
                <Router currentPath={currentPath} path="/posters/{alias}">
                  <PosterPage alias="{alias}" key="PosterPage" />
                </Router>
              </Switch>
            </Layout>
          </Router>
        </Switch>
      </div>
    </main>
  );
}