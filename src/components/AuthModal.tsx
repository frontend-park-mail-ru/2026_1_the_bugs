import { useState, useEffect } from '@my-react/hooks';

import "../css/modal.css"
import "../css/errors.css"
import { authService } from '../services/api';
import { type ErrorAlert } from '../types';
import type { ErrorResponse } from 'src/types/api';


interface AuthModalProps {
  onClose: () => void;
}

const getErrorMessage = (status: number): string => {
  const messages: Record<number, string> = {
    400: 'Неверный email или пароль',
    401: 'Пользователь не авторизован',
    404: 'Пользователь не найден',
    429: 'Слишком много попыток. Попробуйте через минуту',
    500: 'Ошибка сервера. Попробуйте позже'
  };
  return messages[status] || 'Что-то пошло не так';
}

export function AuthModal({ onClose }: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');

  const [error, setError] = useState<ErrorAlert | undefined>(undefined) 

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const clearError = () => {
    setError(undefined);
  };

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
        await authService.login({
            "email": loginEmail,
            "password": loginPassword
        });

        onClose();
    } catch (error: any) {
        const e = error as ErrorResponse
        console.log(e.status)
        const msg = getErrorMessage(e.status)
        console.log(msg)
        setError({message: msg})
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: Event) => {
    e.preventDefault();
    if (regPassword !== regConfirm) {
      setError({message: "Пароли не совпадают!"})
      return;
    }
    if (regPassword.length < 8){
        setError({message: "Пароль должен быть как минимум 8 символов"})
        return;
    }
    setIsLoading(true);
    try {
      await authService.register({
            "email": regEmail,
            "password": regPassword
        });
      onClose();
    } catch (error: any) {
      const e = error as ErrorResponse
      setError({message: getErrorMessage(e.status)})
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal active" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className="close-button" onClick={onClose}>&times;</button>
        <div>
          {error && (
            <div 
              className={`error-banner ${error ? 'show' : ''}`}
              role="alert"
            >
              <div className="error-icon">⚠️</div>
              <div className="error-text">{error.message}</div>
              <button 
                className="error-close"
                onClick={clearError}
                aria-label="Закрыть уведомление"
              >
                 ×
              </button>
            </div>
          )}
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
                className="font2"
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
                className="font2"
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
                className="font2"
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
                className="font2"
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
                className="font2"
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
    
  );
}