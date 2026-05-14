import { useState } from 'the-react';
import styles from './AdminAuth.module.css';
interface AdminAuthProps {
  onLogin: (email: string, password: string) => Promise<void>;
}

export function AdminAuth({ onLogin }: AdminAuthProps) {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: any) => {
    event.preventDefault();
    setError('');
    setLoading(true);
    try {
      await onLogin(login, password);
    } catch (err: any) {
      setError(err.message || 'Ошибка авторизации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.adminPage}>
      <section className={styles.authCard} aria-label="Авторизация администратора">
        <h1 className={styles.title}>Авторизация администратора</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label htmlFor="admin-login" className={styles.label}>Логин / Email</label>
          <input
            id="admin-login"
            type="text"
            value={login}
            onInput={(e: any) => setLogin(e.target.value)}
            className={styles.field}
            autoComplete="username"
            required
          />

          <label htmlFor="admin-password" className={styles.label}>Пароль</label>
          <input
            id="admin-password"
            type="password"
            value={password}
            onInput={(e: any) => setPassword(e.target.value)}
            className={styles.field}
            autoComplete="current-password"
            required
          />

          {error && <div className={styles.error}>{error}</div>}

          <button type="submit" className={styles.submitButton} disabled={loading || !login.trim() || !password.trim()}>
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </form>
      </section>
    </main>
  );
}