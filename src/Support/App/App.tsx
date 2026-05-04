import {Switch, Router} from '@router-dom';
import { useEffect, useState } from 'the-react';
import { authService } from '../../services/auth';
import type { UserResponse } from '../../types';
import { apiService } from '../../services/apiClass';
import { HomePage } from '../pages/MainPage';
import SupportLoginForm from "../components/SupportLoginForm.tsx";
import {SupportReportsPage} from "../../pages/SupportReportsPage.tsx";

/**
 * Общая для отображения разных страниц компонента.
 * Содержит в себе роутер и шапку (авторизация тут же).
 */
export function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [currentSearch, setCurrentSearch] = useState(window.location.search)
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

  return (
    <main className="main">
      <div className="page">
             <SupportReportsPage key="ReportsPage" />
      </div>
    </main>
  );
}