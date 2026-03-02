import { useState, useEffect } from '@my-react/hooks';

import "../css/modal.css"

interface AuthModalProps {
  onClose: () => void;
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const handleOverlayClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('modal')) {
      onClose();
    }
  };

  const toggleMode = () => setIsLoginMode(!isLoginMode);

  const handleLogin = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      console.log('Login', { email: loginEmail, password: loginPassword });
      alert('Успешный вход (демо)');
      onClose();
    } catch (error: any) {
      alert('Ошибка входа: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: Event) => {
    e.preventDefault();
    if (regPassword !== regConfirm) {
      alert('Пароли не совпадают');
      return;
    }
    setIsLoading(true);
    try {
      console.log('Register', { email: regEmail, password: regPassword });
      alert('Аккаунт создан (демо)');
      onClose();
    } catch (error: any) {
      alert('Ошибка регистрации: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
        <div className="modal active" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="close-button" onClick={onClose}></button>
        <div>
          <h2 className="auth-title">{isLoginMode ? 'Авторизация' : 'Регистрация'}</h2>

          <form
            id="loginForm"
            className="auth-form"
            style={{ display: isLoginMode ? 'block' : 'none' }}
            onSubmit={handleLogin}
          >
            <div className="form-group">
              <label htmlFor="loginEmail">Email:</label>
              <input
                type="email"
                id="loginEmail"
                name="email"
                placeholder="your@email.com"
                required
                value={loginEmail}
                onInput={(e: any) => setLoginEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="loginPassword">Пароль:</label>
              <input
                type="password"
                id="loginPassword"
                name="password"
                placeholder="Введите пароль"
                required
                value={loginPassword}
                onInput={(e: any) => setLoginPassword(e.target.value)}
              />
            </div>
            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? 'Загрузка...' : 'Войти'}
            </button>
          </form>

          <form
            id="registerForm"
            className="auth-form"
            style={{ display: isLoginMode ? 'none' : 'block' }}
            onSubmit={handleRegister}
          >
            <div className="form-group">
              <label htmlFor="registerEmail">Email:</label>
              <input
                type="email"
                id="registerEmail"
                name="email"
                placeholder="your@email.com"
                required
                value={regEmail}
                onInput={(e: any) => setRegEmail(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="registerPassword">Пароль:</label>
              <input
                type="password"
                id="registerPassword"
                name="password"
                placeholder="Введите пароль"
                required
                value={regPassword}
                onInput={(e: any) => setRegPassword(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label htmlFor="registerConfirmPassword">Повторите пароль:</label>
              <input
                type="password"
                id="registerConfirmPassword"
                name="confirmPassword"
                placeholder="Повторите пароль"
                required
                value={regConfirm}
                onInput={(e: any) => setRegConfirm(e.target.value)}
              />
            </div>
            <button type="submit" className="auth-btn" disabled={isLoading}>
              {isLoading ? 'Загрузка...' : 'Создать аккаунт'}
            </button>
          </form>

          <button className="auth-toggle-btn" onClick={toggleMode} disabled={isLoading}>
            {isLoginMode ? 'Создать аккаунт' : 'Вернуться к входу'}
          </button>
        </div>
      </div>
    </div>
    </div>
    
  );
}