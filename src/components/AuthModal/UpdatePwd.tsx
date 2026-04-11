import { useState } from 'the-react/hooks';
import style from "./AuthModal.module.css";
import {type AuthModalChildProps, type ToggleModeType} from "./AuthModal";
import { authService } from '../../services/auth';
import type { ErrorResponse } from 'src/types/api';
import {
  applyValidationResult,
  validateConfirmPassword,
  validatePassword
} from './authValidation';
import {
    ERROR_FIELDS,
    getErrorMessage,
    getHighlightStyle,
} from './authErrors'

export interface RecoverFormState {
  password: string;
  confirmPassword: string;
}

export type RecoverField = 'password' | 'confirmPassword';


export default function UpdatePwd({ onToggleMode }: AuthModalChildProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<RecoverFormState>({
    password: '',
    confirmPassword: ''
  });
  const [fieldHighlights, setFieldHighlights] = useState<Partial<Record<RecoverField, boolean>>>({});
  const [error, setError] = useState<string | null>(null);
  

  const clearFeedback = () => {
    setError(null);
    setFieldHighlights({});
  };
  const updateField = (field: keyof RecoverFormState, value: string) => {
      setFormData({
        ...formData,
        [field]: value
      });
    };
  const toggleMode = (mode: ToggleModeType) => {
    clearFeedback();
    onToggleMode(mode);
  };

   const handleError = (error: ErrorResponse) => {
      const message = getErrorMessage(error.status);
      setError(message);
  
      if (error.data?.field) {
        setFieldHighlights({ [error.data.field]: true });
        return;
      }
      
      const fields = ERROR_FIELDS[error.status];
      if (fields) {
        const highlights: Partial<Record<RecoverField, boolean>> = {};
        fields.forEach((f: any) => { highlights[f as RecoverField] = true; });
        setFieldHighlights(highlights);
      }
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
  

  const handleUpdatePwd = async (e: any) => {
      e.preventDefault();
      let result = validateConfirmPassword(formData.password, formData.confirmPassword);
      if (!applyValidationResult(result, setError, setFieldHighlights)) return;
  
      result = validatePassword(formData.password);
      if (!applyValidationResult(result, setError, setFieldHighlights)) return;
  
  
      setIsLoading(true);
      setError(null);
      setFieldHighlights({});
  
      try {
        await authService.resetPwd(
          formData.password,
        );
        toggleMode('login');
      } catch (error: any) {
        handleError(error as ErrorResponse);
      } finally {
        setIsLoading(false);
      }
    };

  return(<div>
            <h2 className={style.title}>
            Смена пароля
          </h2>

          <form 
            className={style.form} 
            onSubmit={handleUpdatePwd}
          >
            <div className={style.formGroups}>
               <div className={style.group}>
                <label htmlFor="password">Новый пароль:</label>
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
              <div className={style.errorOverlay}>
                {error && (<span>{error}</span>)}
              </div>
            </div>
            <button variant='accent'
              style={{'width':'60%'}}
              type="submit" 
              disabled={isLoading}
            >
              {isLoading ? 'Загрузка...' :  'Подтвердить' }
            </button>
            
          </form>
        </div>
        );
}

