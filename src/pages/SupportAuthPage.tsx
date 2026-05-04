import { useEffect, useState } from 'the-react/hooks';
import { useNavigate } from '@router-dom';
import type { ToggleModeType } from '../components/AuthModal/AuthModal.tsx';
import styles from './SupportAuthPage.module.css';
import SupportLoginForm from "../Support/components/SupportLoginForm.tsx";

interface SupportAuthPageProps {
  isAuthenticate: boolean;
  setIsAuthenticate: (isAuth: boolean) => void;
  next?: string;
}

const getRedirectPath = (next?: string): string => {
  if (!next || !next.startsWith('/support')) {
    return '/support/reports';
  }
  return next;
};

export function SupportAuthPage({ isAuthenticate, setIsAuthenticate, next }: SupportAuthPageProps) {
  const navigate = useNavigate();
  const [mode, setMode] = useState<ToggleModeType>('login');

  const redirectPath = getRedirectPath(next);

  useEffect(() => {
    if (isAuthenticate) {
      navigate(redirectPath);
    }
  }, [isAuthenticate, redirectPath]);

  const onSuccess = () => {
    setIsAuthenticate(true);
    navigate(redirectPath);
  };

  return (
    <section className={styles.page}>
      <article className={styles.card}>
        <h1 className={styles.kicker}>Support</h1>
        <p className={styles.caption}>Войдите, чтобы открыть обращения поддержки</p>


        <SupportLoginForm key="support-login" onSuccess={onSuccess} onToggleMode={setMode} />

      </article>
    </section>
  );
}

