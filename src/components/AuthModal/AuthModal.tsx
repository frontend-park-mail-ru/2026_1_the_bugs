import { useState, useEffect } from '@my-react/hooks';

import style from "./AuthModal.module.css"

import { authService } from '../../services/auth';
import type { ErrorResponse } from 'src/types/api';


interface AuthModalProps {
  onClose: () => void;
}

type LoginField = 'email' | 'password';
type RegisterField = 'email' | 'password' | 'confirmPassword';

const loginErrorFieldByStatus: Partial<Record<number, LoginField>> = {
  400: 'email',
  401: 'email',
  409: 'password',
  429: 'password'
};

const getErrorMessage = (status: number): string => {
  const messages: Record<number, string> = {
    400: 'Неверный email или пароль',
    401: 'Пользователь не авторизован',
    409: 'Пользователь c таким email уже существует',
    404: 'Пользователь не найден',
    429: 'Слишком много попыток. Попробуйте через минуту',
    500: 'Ошибка сервера. Попробуйте позже'
  };
  return messages[status] || 'Что-то пошло не так';
}

const getHighlightStyle = (isHighlighted?: boolean) => {
  if (!isHighlighted) {
    return undefined;
  }

  return {
    border: '1px solid #ff4d4f',
    boxShadow: '0 0 0 2px rgba(255, 77, 79, 0.25)'
  };
};

const errorWrapperStyle = {
  height: '30px',
  color: 'red',
  textAlign: 'center' as const,
  fontWeight: 'bold',
  fontSize: '14px'
};

const errorTextStyle = {
  fontFamily: 'Zen Kaku Gothic Antique, system-ui, sans-serif'
};


export function AuthModal({ onClose }: AuthModalProps) {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [loginFieldHighlights, setLoginFieldHighlights] = useState<Partial<Record<LoginField, boolean>>>({});
  const [registerFieldHighlights, setRegisterFieldHighlights] = useState<Partial<Record<RegisterField, boolean>>>({});

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const clearFeedback = () => {
    setError(null);
    setLoginFieldHighlights({});
    setRegisterFieldHighlights({});
  };

  const clearLoginHighlight = (field: LoginField) => {
    setLoginFieldHighlights({ ...loginFieldHighlights, [field]: undefined });
  };

  const clearRegisterHighlight = (field: RegisterField) => {
    setRegisterFieldHighlights({ ...registerFieldHighlights, [field]: undefined });
  };

  const handleOverlayClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('modal')) {
      onClose();
    }
  };

  const toggleMode = () => {
    clearFeedback();
    setIsLoginMode(!isLoginMode);
  };

  const handleLogin = async (e: Event) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setLoginFieldHighlights({});
    try {
        await authService.login({
            "email": loginEmail,
            "password": loginPassword
        });

        onClose();
    } catch (error: any) {
        const e = error as ErrorResponse
        const msg = getErrorMessage(e.status)
        const field = loginErrorFieldByStatus[e.status]
        setError(msg)
        if (field) {
          setLoginFieldHighlights({ [field]: true });
        }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: Event) => {
    e.preventDefault();
    setError(null);
    setRegisterFieldHighlights({});
    if (regPassword !== regConfirm) {
      setError("Пароли не совпадают!")
      setRegisterFieldHighlights({ password: true, confirmPassword: true });
      return;
    }
    if (regPassword.length < 8){
        setError("Пароль должен быть как минимум 8 символов")
        setRegisterFieldHighlights({ password: true, confirmPassword: true });
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
      setError(getErrorMessage(e.status))
      if (e.status === 409) {
        setRegisterFieldHighlights({ email: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal active" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className={style.close} onClick={onClose}>&times;</button>
        <div>
          <h2 className={style.title}>{isLoginMode ? 'Авторизация' : 'Регистрация'}</h2>

          <form
            id="loginForm"
            className={style.form}
            style={{ display: isLoginMode ? 'block' : 'none' }}
            onSubmit={handleLogin}
          >
            <div className={style.group}>
              <label htmlFor="loginEmail">Email:</label>
              <input
                className="input font2"
                style={getHighlightStyle(loginFieldHighlights.email)}
                type="email"
                id="loginEmail"
                name="email"
                placeholder="your@email.com"
                required
                value={loginEmail}
                onInput={(e: any) => {
                  setLoginEmail(e.target.value);
                  if (loginFieldHighlights.email) {
                    clearLoginHighlight('email');
                  }
                }}
              />
            </div>
            <div className={style.group}>
              <label htmlFor="loginPassword">Пароль:</label>
              <input
                className="input font2"
                style={getHighlightStyle(loginFieldHighlights.password)}
                type="password"
                id="loginPassword"
                name="password"
                placeholder="Введите пароль"
                required
                value={loginPassword}
                onInput={(e: any) => {
                  setLoginPassword(e.target.value);
                  if (loginFieldHighlights.password) {
                    clearLoginHighlight('password');
                  }
                }}
              />
            </div>

            <div style={errorWrapperStyle}>
              {error && (
                <span style={errorTextStyle}>{error}</span>
              )}
            </div>

            <button type="submit" className={style.primary} disabled={isLoading}>
              {isLoading ? 'Загрузка...' : 'Войти'}
            </button>
          </form>

          <form
            id="registerForm"
            className={style.form}
            style={{ display: isLoginMode ? 'none' : 'block' }}
            onSubmit={handleRegister}
          >
            <div className={style.group}>
              <label htmlFor="registerEmail">Email:</label>
              <input
                className="input font2"
                style={getHighlightStyle(registerFieldHighlights.email)}
                type="email"
                id="registerEmail"
                name="email"
                placeholder="your@email.com"
                required
                value={regEmail}
                onInput={(e: any) => {
                  setRegEmail(e.target.value);
                  if (registerFieldHighlights.email) {
                    clearRegisterHighlight('email');
                  }
                  if (error) {
                    setError(null);
                  }
                }}
              />
            </div>
            <div className={style.group}>
              <label htmlFor="registerPassword">Пароль:</label>
              <input
                className="input font2"
                style={getHighlightStyle(registerFieldHighlights.password)}
                type="password"
                id="registerPassword"
                name="password"
                placeholder="Введите пароль"
                required
                value={regPassword}
                onInput={(e: any) => {
                  setRegPassword(e.target.value);
                  if (registerFieldHighlights.password) {
                    clearRegisterHighlight('password');
                  }
                  if (error) {
                    setError(null);
                  }
                }}
              />
            </div>
            <div className={style.group}>
              <label htmlFor="registerConfirmPassword">Повторите пароль:</label>
              <input
                className="input font2"
                style={getHighlightStyle(registerFieldHighlights.confirmPassword)}
                type="password"
                id="registerConfirmPassword"
                name="confirmPassword"
                placeholder="Повторите пароль"
                required
                value={regConfirm}
                onInput={(e: any) => {
                  setRegConfirm(e.target.value);
                  if (registerFieldHighlights.confirmPassword) {
                    clearRegisterHighlight('confirmPassword');
                  }
                  if (error) {
                    setError(null);
                  }
                }}
              />
            </div>
              <div style={errorWrapperStyle}>
              {error && (
                <span style={errorTextStyle}>{error}</span>
              )}
            </div>
            <button type="submit" className={style.primary} disabled={isLoading}>
              {isLoading ? 'Загрузка...' : 'Создать аккаунт'}
            </button>
          </form>

          <button className={style.secondary} onClick={toggleMode} disabled={isLoading}>
            {isLoginMode ? 'Создать аккаунт' : 'Вернуться к входу'}
          </button>
        </div>
      </div>
    </div>
    
  );
}