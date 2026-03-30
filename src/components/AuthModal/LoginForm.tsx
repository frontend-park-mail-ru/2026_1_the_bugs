import { useState, useEffect } from '@my-react/hooks';
import style from "./AuthModal.module.css";
import {type AuthModalChildProps, type ToggleModeType} from "./AuthModal";
import { authService } from '../../services/auth';
import type { ErrorResponse } from 'src/types/api';
import {
  validateEmail,
  validateLoginForm,
  baseValidatePassword,
  applyValidationResult
} from './authValidation';
import {
    ERROR_FIELDS,
    getErrorMessage,
    getHighlightStyle,
} from './authErrors'
import OAuthYandexButton from '../OAuth/YandexID/YandexID';

export interface AuthFormState {
  email: string;
  password: string;
}

export type LoginField = 'email' | 'password';


export default function LoginForm({ onSuccess, onToggleMode }: AuthModalChildProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AuthFormState>({
    email: '',
    password: '',
  });
  const [fieldHighlights, setFieldHighlights] = useState<Partial<Record<LoginField, boolean>>>({});
  const [error, setError] = useState<string | null>(null);
  
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setShowPassword(false);
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

  const toggleMode = (mode: ToggleModeType) => {
    clearFeedback();
    setFormData({ email: '', password: ''});
    setShowPassword(false);
    onToggleMode(mode);
  };

  const handleAuthError = (error: ErrorResponse) => {
    const message = getErrorMessage(error.status);
    setError(message);

    if (error.data?.field) {
      setFieldHighlights({ [error.data.field]: true });
      return;
    }
    
    const fields = ERROR_FIELDS[error.status];
    if (fields) {
      const highlights: Partial<Record<string, boolean>> = {};
      fields.forEach((f: string) => { highlights[f] = true; });
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
    } catch (error: any) {
      handleAuthError(error as ErrorResponse);
    } finally {
      setIsLoading(false);
    }
  };



  const handleEmailInput = (e: any) => {
    const value = e.target.value;
    updateField('email', value);
    const result = validateEmail(value);
    applyValidationResult(result, setError, setFieldHighlights);
  };

  const handlePasswordInput = (e: any) => {
    const value = e.target.value;
    updateField('password', value);
    const result = baseValidatePassword(value);
    applyValidationResult(result, setError, setFieldHighlights);
  };

    return (
        <div>
            <h2 className={style.title}>
            Авторизация
          </h2>

          <form 
            className={style.form} 
            onSubmit={handleLogin}
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

              
              <div className={style.errorOverlay}>
                {error && (<span>{error}</span>)}
              </div>
            </div>

            <button 
              type="submit" 
              className={style.primary} 
              disabled={isLoading}
            >
              {isLoading ? 'Загрузка...' :  'Войти' }
            </button>
         
          </form>
          <button 
            className={style.secondary} 
            onClick={()=>toggleMode('register')} 
            disabled={isLoading}
          >
            Создать аккаунт
          </button>

           <div style={{ textAlign: 'center', margin: '10px 0' }}>
                <a
                  href="#"
                  onClick={(e: any) => {
                    e.preventDefault();
                    if (!isLoading) toggleMode('recover');
                  }}
                  style={{
                    color: '#000',
                    textDecoration: 'underline',
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    pointerEvents: isLoading ? 'none' : 'auto',
                    fontSize: '14px'
                  }}
                >
                  ЗАБЫЛИ ПАРОЛЬ?
                </a>
            </div>
         <div className={style.oauthDivider}>
            <div className={style.dividerLine} />
            <span className={style.dividerText}>ИЛИ</span>
            <div className={style.dividerLine} />
          </div>

          <div className={style.oauthContainer}>
              <OAuthYandexButton key="yandex" />
          </div>
        </div>
    );
}