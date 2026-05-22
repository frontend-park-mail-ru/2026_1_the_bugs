import {Switch, Router} from '@router-dom';
import { useEffect, useState } from 'the-react';
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
import { Profile } from '../components/Profile/Profile';
import type { UserResponse } from '../types';
import { apiService } from '../services/apiClass';
import { Favorites } from '../components/Favorites/Favorites';
import PostersMap from '../components/PosterMap/PosterMap';

/**
 * Общая для отображения разных страниц компонента.
 * Содержит в себе роутер и шапку (авторизация тут же).
 */
export function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [currentSearch, setCurrentSearch] = useState(window.location.search)
  const isMapPage = currentPath === '/map';
  const [isAuthenticate, setIsAuthenticate] = useState<boolean>(false);
  const [isAuthResolved, setIsAuthResolved] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserResponse | null>(null);

  useEffect(()=>{
    apiService.init()
  }, [])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const user = await authService.getMe();
        setCurrentUser(user);
        setIsAuthenticate(true);
      } finally {
        setIsAuthResolved(true);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const handler = () => {
      setCurrentPath(window.location.pathname);
      setCurrentSearch(window.location.search);
    };
    window.addEventListener('popstate', handler);
    return () => window.removeEventListener('popstate', handler);
  }, []);
  console.log("App", currentUser)

  return (
    <main className={isMapPage ? 'main mainFull' : 'main'}>
      <div className={isMapPage ? 'page pageFull' : 'page'}>
        <Switch key="root" currentPath={currentPath} >
          <Router currentPath={currentPath} path="/oauth/vk">
            <OAuthVerifyPage setIsAuthenticate={setIsAuthenticate} setCurrentUser={setCurrentUser} provider="vk" key="OAuthVerifyPageVK" />
          </Router>
          <Router currentPath={currentPath} path="/oauth/yandex">
            <OAuthVerifyPage setIsAuthenticate={setIsAuthenticate}  setCurrentUser={setCurrentUser} provider="yandex" key="OAuthVerifyPageYandex" />
          </Router>
          <Router currentPath={currentPath} path="*">
            < Layout currentPath={currentPath} isAuthResolved={isAuthResolved} isAuthenticate={isAuthenticate} setIsAuthenticate={setIsAuthenticate} currentUser={currentUser} setCurrentUser={setCurrentUser} key="Layout">
              <Switch key="main" currentPath={currentPath}>
                <Router currentPath={currentPath} path="/" currentSearch={currentSearch}>
                  <HomePage search_query="" isAuth={isAuthenticate} key="HomePage" />
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
                  <PosterPage alias="{alias}" key="PosterPage" isAuth={isAuthenticate} user={currentUser} />
                </Router>
                <Router currentPath={currentPath} path="/my-posters">
                  <ProtectedLayout path="/my-posters" isAuthenticate={isAuthenticate} setIsAuthenticate={setIsAuthenticate}>
                      <MyPosterList key="MyPosterPage" />
                  </ProtectedLayout>
                </Router>
                <Router currentPath={currentPath} path="/profile" currentSearch={currentSearch}>
                  <ProtectedLayout path="/profile" isAuthenticate={isAuthenticate} setIsAuthenticate={setIsAuthenticate} key="ProtectedLayout12">
                      <Profile alias="{alias}" setCurrentUser={setCurrentUser} key="ProfilePage" />
                  </ProtectedLayout>
                </Router>
                <Router currentPath={currentPath} path="/profile/favorites">
                  <ProtectedLayout path="/profile/favorites" isAuthenticate={isAuthenticate} setIsAuthenticate={setIsAuthenticate} key="ProtectedLayoutLikes">
                      <Favorites key="FavoritesPage" />
                  </ProtectedLayout>
                </Router>
                <Router  currentPath={currentPath} path="/map">
                  <PostersMap/>
                </Router>
              </Switch>
            </Layout>
          </Router>
        </Switch>
      </div>
    </main>
  );
}
