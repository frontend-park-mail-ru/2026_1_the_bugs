import { useState } from '@my-react/hooks';
import style from "./AuthModal.module.css";
import appStyle from "../../App/App.module.css";
import {type AuthModalChildProps, type ToggleModeType} from "./AuthModal";
import { authService } from '../../services/auth';
import type { ErrorResponse } from 'src/types/api';
import {
  validateEmail,
  applyValidationResult
} from './authValidation';
import {
    ERROR_FIELDS,
    getErrorMessage,
    getHighlightStyle,
} from './authErrors'

export interface RecoverFormState {
  email: string;
}

export type RecoverField = 'email';


export default function RecoverEmail({ onToggleMode }: AuthModalChildProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RecoverFormState>({
    email: '',
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
    setFormData({ email: ''});
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

  const handleSendEmail = async (e: any) => {
    e.preventDefault();
    const result = validateEmail(formData.email);
    applyValidationResult(result, setError, setFieldHighlights);
    if (!applyValidationResult(result, setError, setFieldHighlights)) return;

    setIsLoading(true);
    setError(null);
    setFieldHighlights({});

    try {
      await authService.sendCode({
        email: formData.email,
      });
      sessionStorage.setItem("email", formData.email)
      toggleMode('code_verify');
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
  return(<div>
            <h2 className={style.title}>
            Смена пароля
          </h2>

          <form 
            className={style.form} 
            onSubmit={handleSendEmail}
          >
            <div className={style.formGroups}>
              <div className={style.group}>
                <label htmlFor="email">Введите почту:</label>
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
              
              <div className={style.errorOverlay}>
                {error && (<span>{error}</span>)}
              </div>
            </div>

            <button style={{'width':'60%'}}
              type="submit" 
              className={appStyle.primary} 
              disabled={isLoading}
            >
              {isLoading ? 'Загрузка...' :  'Отправить код' }
            </button>
            
          </form>
          <button style={{'width':'60%'}}
            className={appStyle.secondary} 
            onClick={()=>toggleMode('login')} 
            disabled={isLoading}
          >
            Назад
          </button>
        </div>
        );
}