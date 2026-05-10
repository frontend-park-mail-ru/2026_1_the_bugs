import { useState } from 'the-react';
import styles from './AdminAuth.module.css';

interface AdminAuthProps {
  onLogin: () => void;
}

export function AdminAuth({ onLogin }: AdminAuthProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event: any) => {
    event.preventDefault();
    onLogin();
  };

  return (
    <main className={styles.adminPage}>
      <section className={styles.authCard} aria-label="Авторизация администратора">
        <h1 className={styles.title}>Авторизация</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="admin-login" className={styles.label}>Логин</label>
          <input
            id="admin-login"
            type="text"
            value={login}
            onInput={(event: any) => setLogin(event.target.value)}
            className={styles.field}
            autoComplete="username"
            required
          />

          <label htmlFor="admin-password" className={styles.label}>Пароль</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onInput={(event: any) => setPassword(event.target.value)}
            className={styles.field}
            autoComplete="current-password"
            required
          />

          <button type="submit" className={styles.submitButton} disabled={!login.trim() || !password.trim()}>
            Войти
          </button>
        </form>
      </section>
    </main>
  );
}
