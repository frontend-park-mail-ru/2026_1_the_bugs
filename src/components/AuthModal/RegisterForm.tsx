import { useState, useEffect } from 'the-react/hooks';
import style from "./AuthModal.module.css";
import appStyle from "../../App/App.module.css";
import { authService } from '../../services/auth';
import type { ErrorResponse } from 'src/types/api';
import {type AuthModalChildProps, type ToggleModeType} from "./AuthModal";

import {
  type AuthFormState,
  validateEmail,
  validatePassword,
  validateConfirmPassword,
  validateRegisterForm,
  validateName,
  validatePhone,
  validateProfileForm,
  applyValidationResult
} from './authValidation';
import {
    ERROR_FIELDS,
    getErrorMessage,
    getHighlightStyle,
} from './authErrors'

export type RegisterField = 'email' | 'password' | 'confirmPassword' | 'firstname' | 'lastname' | 'phone';

export default function RegisterForm({onSuccess, onToggleMode }: AuthModalChildProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<AuthFormState>({
    email: '',
    password: '',
    confirmPassword: '',
    firstname: '',
    lastname: '',
    phone: ''
  });
  const [fieldHighlights, setFieldHighlights] = useState<Partial<Record<RegisterField, boolean>>>({});
  const [error, setError] = useState<string | null>(null);
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isFirstPage, setIsFirstPage] = useState(true);
   const [isButtonDisabled, setIsButtonDisabled] = useState(false);

  useEffect(() => {
    setShowPassword(false);
    setShowConfirmPassword(false);
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
    setFormData({ email: '', password: '', confirmPassword: '', firstname: '', lastname: '', phone: '' });
    setShowPassword(false);
    setShowConfirmPassword(false);
    onToggleMode(mode);
  };

  const nextPage = (e: any) => {
    e.preventDefault();
     if (isButtonDisabled){
        return
    }
    const result = validateRegisterForm(formData);
    if (!applyValidationResult(result, setError, setFieldHighlights)) return;

    setError(null);
    setFieldHighlights({});

    setIsFirstPage(false);
  };

  const prevPage = (e: any) => {
    e.preventDefault();
   
    setError(null);
    setFieldHighlights({});

    setIsFirstPage(true);
  }

  const handleAuthError = (error: ErrorResponse) => {
    const message = getErrorMessage(error.status);
    setError(message);

    if (error.data?.field) {
      setFieldHighlights({ [error.data.field]: true });
      return;
    }
    
    const fields = ERROR_FIELDS[error.status];
    if (fields) {
      const highlights: Partial<Record<RegisterField, boolean>> = {};
      fields.forEach((f: any) => { highlights[f as RegisterField] = true; });
      if (highlights.email || highlights.password){
        setIsFirstPage(true)
        setIsButtonDisabled(true)
      }
      setFieldHighlights(highlights);
    }
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();
    let result = validateRegisterForm(formData);
    if (!applyValidationResult(result, setError, setFieldHighlights)) return;

    result = validateProfileForm(formData);
    if (!applyValidationResult(result, setError, setFieldHighlights)) return;


    setIsLoading(true);
    setError(null);
    setFieldHighlights({});

    try {
      await authService.register({
        email: formData.email,
        password: formData.password,
        firstname: formData.firstname,
        lastname: formData.lastname,
        phone: formData.phone
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
    setIsButtonDisabled(false);
    const result = validateEmail(value);
    applyValidationResult(result, setError, setFieldHighlights);
  };

  const handlePasswordInput = (e: any) => {
    const value = e.target.value;
    updateField('password', value);
    const result = validatePassword(value);
    applyValidationResult(result, setError, setFieldHighlights);
    if (formData.confirmPassword !== ''){
        const confirmResult = validateConfirmPassword(value, formData.confirmPassword);
        applyValidationResult(confirmResult, setError, setFieldHighlights);
    }
  };

  const handleConfirmPasswordInput = (e: any) => {
    const value = e.target.value;
    updateField('confirmPassword', value);
    const result = validateConfirmPassword(formData.password, value);
    applyValidationResult(result, setError, setFieldHighlights);
  };

  const handleFirstnameInput = (e: any) => {
    const value = e.target.value;
    updateField('firstname', value);
    applyValidationResult(validateName(value, 'firstname'), setError, setFieldHighlights);
  };

  const handleLastnameInput = (e: any) => {
    const value = e.target.value;
    updateField('lastname', value);
    applyValidationResult(validateName(value, 'lastname'), setError, setFieldHighlights);
  };

  const handlePhoneInput = (e: any) => {
    const value = e.target.value;
    updateField('phone', value);
    applyValidationResult(validatePhone(value), setError, setFieldHighlights);
  };

  return (
    <div>
      <h2 className={style.title}>
        Регистрация
      </h2>

      <form 
        className={style.form} 
        onSubmit={handleRegister}
      >
        <div className={style.formGroups}>
            {
                isFirstPage && (
                    <div>
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
        </div>
                )
            }
          
          {!isFirstPage && (
            <div>
            <div className={style.group}>
                <label htmlFor="firstname">Имя:</label>
                <input
                className="input font2"
                style={getHighlightStyle(fieldHighlights.firstname)}
                type="text"
                id="firstname"
                name="firstname"
                placeholder="Имя"
                required
                value={formData.firstname}
                onInput={handleFirstnameInput}
                />
            </div>

            <div className={style.group}>
                <label htmlFor="lastname">Фамилия:</label>
                <input
                className="input font2"
                style={getHighlightStyle(fieldHighlights.lastname)}
                type="text"
                id="lastname"
                name="lastname"
                placeholder="Фамилия"
                required
                value={formData.lastname}
                onInput={handleLastnameInput}
                />
            </div>

            <div className={style.group}>
                <label htmlFor="phone">Телефон:</label>
                <input
                className="input font2"
                style={getHighlightStyle(fieldHighlights.phone)}
                type="text"
                id="phone"
                name="phone"
                placeholder="+71234567890"
                required
                value={formData.phone}
                onInput={handlePhoneInput}
                />
            </div>
            </div>
          )}

          <div className={style.errorOverlay}>
            {error && (<span>{error}</span>)}
          </div>
        </div>

        <button style={{'width':'60%'}}
          type="submit" 
          className={appStyle.primary} 
          disabled={isLoading}
        onClick={isFirstPage ? nextPage : handleRegister}
        >
          {isLoading ? 'Загрузка...' : (isFirstPage ? 'Продолжить' : 'Создать аккаунт')}
        </button>
          
      </form>
      <button style={{'width':'60%'}}
        className={appStyle.secondary} 
        onClick={isFirstPage ? ()=>{toggleMode('login')} : prevPage} 
        disabled={isLoading}
      >
        Назад
      </button>
    </div>
  );
}
