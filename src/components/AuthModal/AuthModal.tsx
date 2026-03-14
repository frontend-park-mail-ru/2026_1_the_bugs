import { useState, useEffect } from '@my-react/hooks';
import style from "./AuthModal.module.css";
import { authService } from '../../services/auth';
import type { ErrorResponse } from 'src/types/api';
import {
  type AuthFormState,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateLoginForm,
  validateRegisterForm,
  type ValidationResult,
  baseValidatePassword
} from './authValidation';
import {
    LOGIN_ERROR_FIELDS,
    getErrorMessage,
    getHighlightStyle,
} from './authErrors'


interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

type AuthMode = 'login' | 'register';
type LoginField = 'email' | 'password';
type RegisterField = 'email' | 'password' | 'confirmPassword';
export type AuthField = LoginField | RegisterField;


const applyValidationResult = (
  result: ValidationResult,
  setError: (error: string | null) => void,
  setFieldHighlights: (highlights: Partial<Record<AuthField, boolean>>) => void
): boolean => {
  if (!result.isValid) {
    setError(result.error);
    setFieldHighlights(result.fieldsToHighlight as Partial<Record<AuthField, boolean>>);
    return false;
  }
  setError(null);
  setFieldHighlights({});
  return true;
};

/** Модальное окно аутентификации с формами входа и регистрации. */
export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AuthFormState>({
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [fieldHighlights, setFieldHighlights] = useState<Partial<Record<AuthField, boolean>>>({});
  const [error, setError] = useState<string | null>(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setShowPassword(false);
    setShowConfirmPassword(false);
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  const clearFeedback = () => {
    setError(null);
    setFieldHighlights({});
  };
  const updateField = (field: keyof AuthFormState, value: string) => {
    setFormData({
      ...formData,
      [field]: value
    });
  };

  const toggleMode = () => {
    clearFeedback();
    setFormData({ email: '', password: '', confirmPassword: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setMode(mode === 'login' ? 'register' : 'login');
  };

  const handleAuthError = (error: ErrorResponse) => {
    const message = getErrorMessage(error.status);
    setError(message);

    if (error.data?.field) {
      setFieldHighlights({ [error.data.field]: true });
      return;
    }
    
    const fields = LOGIN_ERROR_FIELDS[error.status];
    if (fields) {
      const highlights: Partial<Record<AuthField, boolean>> = {};
      fields.forEach((f: AuthField) => { highlights[f] = true; });
      setFieldHighlights(highlights);
    }
  };

  const handleLogin = async (e: any) => {
    e.preventDefault();
    const result = validateLoginForm(formData);
    if (!applyValidationResult(result, setError, setFieldHighlights)) return;

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
      handleAuthError(error as ErrorResponse);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();
    const result = validateRegisterForm(formData);
    if (!applyValidationResult(result, setError, setFieldHighlights)) return;

    setIsLoading(true);
    setError(null);
    setFieldHighlights({});

    try {
      await authService.register({
        email: formData.email,
        password: formData.password
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      handleAuthError(error as ErrorResponse);
    } finally {
      setIsLoading(false);
    }
  };

  const isLogin = mode === 'login';

  const handleEmailInput = (e: any) => {
    const value = e.target.value;
    updateField('email', value);
    const result = validateEmail(value);
    applyValidationResult(result, setError, setFieldHighlights);
  };

  const handlePasswordInput = (e: any) => {
    const value = e.target.value;
    updateField('password', value);
    if (!isLogin){
        const result = validatePassword(value);
        applyValidationResult(result, setError, setFieldHighlights);
        if (formData.confirmPassword !== ''){
            const confirmResult = validateConfirmPassword(value, formData.confirmPassword);
            applyValidationResult(confirmResult, setError, setFieldHighlights);
        }
    }else{
      const result = baseValidatePassword(value);
      applyValidationResult(result, setError, setFieldHighlights);
    }
  };

  const handleConfirmPasswordInput = (e: any) => {
    const value = e.target.value;
    updateField('confirmPassword', value);
    const result = validateConfirmPassword(formData.password, value);
    applyValidationResult(result, setError, setFieldHighlights);
  };

  return (
    <div className="modal active">
      <div className="modal-content">
        <button className={style.close} onClick={onClose}>×</button>
        <div>
          <h2 className={style.title}>
            {isLogin ? 'Авторизация' : 'Регистрация'}
          </h2>

          <form 
            className={style.form} 
            onSubmit={isLogin ? handleLogin : handleRegister}
          >
            <div className={style.formGroups}>
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
                  onInput={handleEmailInput}
                />
              </div>

              <div className={style.group}>
                <label htmlFor="password">Пароль:</label>
                <div className={style.passwordWrapper}>
                  <input
                    className="input font2"
                    style={getHighlightStyle(fieldHighlights.password)}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    placeholder="Введите пароль"
                    required
                    value={formData.password}
                    onInput={handlePasswordInput}
                  />
                  <img
                    src="/svg/eye.svg"
                    alt="show password"
                    className={`${style.eyeIcon} ${showPassword ? style.eyeIconActive : ''}`}
                    draggable="false"
                    onMouseDown={(e: any) => e.preventDefault()}
                    onClick={(e: any) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setShowPassword(!showPassword);
                    }}
                  />
                </div>
              </div>

              {!isLogin && (
                <div className={style.group}>
                  <label htmlFor="confirmPassword">Повторите пароль:</label>
                  <div className={style.passwordWrapper}>
                    <input
                      className="input font2"
                      style={getHighlightStyle(fieldHighlights.confirmPassword)}
                      type={showConfirmPassword ? "text" : "password"}
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Повторите пароль"
                      required
                      value={formData.confirmPassword}
                      onInput={handleConfirmPasswordInput}
                    />
                    <img
                      src="/svg/eye.svg"
                      alt="show password"
                      className={`${style.eyeIcon} ${showConfirmPassword ? style.eyeIconActive : ''}`}
                      draggable="false"
                      onMouseDown={(e: any) => e.preventDefault()}
                      onClick={(e: any) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowConfirmPassword(!showConfirmPassword);
                      }}
                    />
                  </div>
                </div>
              )}
              
              <div className={style.errorOverlay}>
                {error && (<span>{error}</span>)}
              </div>
            </div>

            <button 
              type="submit" 
              className={style.primary} 
              disabled={isLoading}
              onClick={handleEmailInput}
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
