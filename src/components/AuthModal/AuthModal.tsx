import { useState, useEffect } from '@my-react/hooks';
import style from "./AuthModal.module.css";
import { authService } from '../../services/auth';
import type { ErrorResponse } from 'src/types/api';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type AuthMode = 'login' | 'register';
type LoginField = 'email' | 'password';
type RegisterField = 'email' | 'password' | 'confirmPassword';
type AuthField = LoginField | RegisterField;

interface AuthFormState {
  email: string;
  password: string;
  confirmPassword: string;
}

const ERROR_MESSAGES: Record<number, string> = {
  400: 'Ошибка валидации поля',
  401: 'Введен неверный email или пароль',
  404: 'Пользователь не найден',
  409: 'Пользователь с таким email уже существует',
  429: 'Слишком много попыток. Попробуйте через минуту',
  500: 'Ошибка сервера. Попробуйте позже'
};

const LOGIN_ERROR_FIELDS: Partial<Record<number, LoginField[]>> = {
  400: ['email'],
  401: ['email', 'password'],
  404: ['email'],
  409: ['email'],
  429: ['password']
};

const getErrorMessage = (status: number): string => 
  ERROR_MESSAGES[status] || 'Что-то пошло не так';

const getHighlightStyle = (isHighlighted?: boolean) => 
  isHighlighted ? {
    border: '1px solid #ff4d4f',
    boxShadow: '0 0 0 2px rgba(255, 77, 79, 0.25)'
  } : undefined;

export function AuthModal({ onClose,onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AuthFormState>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [fieldHighlights, setFieldHighlights] = useState<Partial<Record<AuthField, boolean>>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const clearFeedback = () => {
    setError(null);
    setFieldHighlights({});
  };

  const clearFieldHighlight = (field: AuthField) => {
    setFieldHighlights({
      ...fieldHighlights,
      [field]: false
    });
  };

  const updateField = (field: keyof AuthFormState, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
    
    if (fieldHighlights[field]) {
      setFieldHighlights({
        ...fieldHighlights,
        [field]: false
      });
    }
    
    if (error) {
      setError(null);
    }
  };

  const handleOverlayClick = (e: any) => {
    if ((e.target as HTMLElement).classList.contains('modal')) {
      onClose();
    }
  };

  const toggleMode = () => {
    clearFeedback();
    setFormData({ email: '', password: '', confirmPassword: '' });
    setMode(mode === 'login' ? 'register' : 'login');
  };

  const validateRegister = (): boolean => {
    if (formData.password !== formData.confirmPassword) {
      setError('Пароли не совпадают!');
      setFieldHighlights({ 
        password: true, 
        confirmPassword: true 
      });
      return false;
    }
    if (formData.password.length < 8) {
      setError('Пароль должен быть минимум 8 символов');
      setFieldHighlights({ 
        password: true, 
        confirmPassword: true 
      });
      return false;
    }
    return true;
  };

  const handleAuthError = (error: ErrorResponse, mode: AuthMode) => {
    const message = getErrorMessage(error.status);
    setError(message);

    if (error.data?.field) {
      setFieldHighlights({ [error.data.field]: true });
      return;
    }
    const fields = LOGIN_ERROR_FIELDS[error.status];
    if (fields) {
      const highlights: Partial<Record<AuthField, boolean>> = {};
      fields.forEach(f => { highlights[f] = true; });
      setFieldHighlights(highlights);
    }
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldHighlights({});

    try {
      await authService.login({
        email: formData.email,
        password: formData.password
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      handleAuthError(error as ErrorResponse, 'login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();
    setError(null);
    setFieldHighlights({});

    if (!validateRegister()) {
      return;
    }

    setIsLoading(true);
    try {
      await authService.register({
        email: formData.email,
        password: formData.password
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      handleAuthError(error as ErrorResponse, 'register');
    } finally {
      setIsLoading(false);
    }
  };

  const isLogin = mode === 'login';

  return (
    <div className="modal active" onClick={handleOverlayClick}>
      <div className="modal-content">
        <button className={style.close} onClick={onClose}>&times;</button>
        <div>
          <h2 className={style.title}>
            {isLogin ? 'Авторизация' : 'Регистрация'}
          </h2>

          <form 
            className={style.form} 
            onSubmit={isLogin ? handleLogin : handleRegister}
          >
            <div className={style.formGroups}>
  {/* Email поле */}
  <div className={style.group}>
    <label htmlFor="email">Email:</label>
    <input
      className="input font2"
      style={getHighlightStyle(fieldHighlights.email)}
      type="email"
      id="email"
      name="email"
      placeholder="your@email.com"
      required
      value={formData.email}
      onChange={(e: any) => updateField('email', e.target.value)}
    />
  </div>

  {/* Password поле */}
  <div className={style.group}>
    <label htmlFor="password">Пароль:</label>
    <input
      className="input font2"
      style={getHighlightStyle(fieldHighlights.password)}
      type="password"
      id="password"
      name="password"
      placeholder="Введите пароль"
      required
      value={formData.password}
      onChange={(e: any) => updateField('password', e.target.value)}
    />
  </div>

  {/* Confirm Password (только для register) */}
  {!isLogin && (
    <div className={style.group}>
      <label htmlFor="confirmPassword">Повторите пароль:</label>
      <input
        className="input font2"
        style={getHighlightStyle(fieldHighlights.confirmPassword)}
        type="password"
        id="confirmPassword"
        name="confirmPassword"
        placeholder="Повторите пароль"
        required
        value={formData.confirmPassword}
        onChange={(e: any) => updateField('confirmPassword', e.target.value)}
      />
    </div>
  )}

  {/* Ошибка поверх последнего поля */}
  
    <div className={style.errorOverlay}>
      {error && (<span>{error}</span>)}
    </div>
  
</div>

<button 
  type="submit" 
  className={style.primary} 
  disabled={isLoading}
>
  {isLoading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Создать аккаунт')}
</button>

          </form>

          <button 
            className={style.secondary} 
            onClick={toggleMode} 
            disabled={isLoading}
          >
            {isLogin ? 'Создать аккаунт' : 'Вернуться к входу'}
          </button>
        </div>
      </div>
    </div>
  );
}