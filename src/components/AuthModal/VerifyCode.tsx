import { useState } from '@my-react/hooks';
import style from "./AuthModal.module.css";
import {type AuthModalChildProps, type ToggleModeType} from "./AuthModal";
import { authService } from '../../services/auth';
import type { ErrorResponse } from 'src/types/api';

import {
    getErrorMessage,
    getHighlightStyle,
} from './authErrors'

export interface RecoverFormState {
  code: string;
}

export type RecoverField = 'code';


export default function VerifyCode({onToggleMode }: AuthModalChildProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RecoverFormState>({
    code: '',
  });
  const [fieldHighlights, setFieldHighlights] = useState<Partial<Record<RecoverField, boolean>>>({});
  const [error, setError] = useState<string | null>(null);
  

  const clearFeedback = () => {
    setError(null);
    setFieldHighlights({});
  };

  const toggleMode = (mode: ToggleModeType) => {
    clearFeedback();
    setFormData({ code: ''});
    onToggleMode(mode);
  };

  const handleError = (error: ErrorResponse) => {
    setError("Неверный код");
    setFieldHighlights({ ['code']: true });
  };

  const handleVerifyCode = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldHighlights({});

    try {
      await authService.verifyCode(formData.code);
      toggleMode('update_pwd');
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
            onSubmit={handleVerifyCode}
          >
            <div className={style.formGroups}>
              <div className={style.group}>
                <label htmlFor="text">Введите код из письма: </label>
                <input
                  className="input font2"
                  style={getHighlightStyle(fieldHighlights.code)}
                  type="text"
                  id="text"
                  name="text"
                  placeholder="Введите код из письма"
                  required
                  value={formData.code}
                  onInput={(e: any)=>setFormData({['code']: e.target.value})}
                />
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
              {isLoading ? 'Загрузка...' :  'Подтвердить' }
            </button>
            
          </form>
          <button 
            className={style.secondary} 
            onClick={()=>toggleMode('recover')} 
            disabled={isLoading}
          >
            Назад
          </button>
        </div>
        );
}