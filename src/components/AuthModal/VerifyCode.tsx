import { useEffect, useState } from '@my-react/hooks';
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
  const [tick, setTick] = useState<number>(60);
  const [isSendActive, setIsSendActive] = useState<boolean>(false)
  const [sendEmail, setSendEmail] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let currentTick = 60;
    
    const interval = setInterval(() => {
      currentTick -= 1;
      setTick(currentTick);
      
      if (currentTick <= 0) {
        clearInterval(interval);
        setIsSendActive(true);
      }
    }, 1000);
    
    setIsSendActive(false);
    
    return () => clearInterval(interval);
  }, [sendEmail]);


  const clearFeedback = () => {
    setError(null);
    setIsLoading(false);
    setFieldHighlights({});
  };

  const toggleMode = (mode: ToggleModeType) => {
    clearFeedback();
    setFormData({ code: ''});
    onToggleMode(mode);
  };

  const handleError = (error: ErrorResponse) => {
    if (error.status == 429){
      setError(`Слишком много попыток попробуйте через ${tick} cек`);
    }else{
      setError("Неверный код");
    }
    setFieldHighlights({ ['code']: true });
  };

  const handleVerifyCode = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldHighlights({});

    try {
      await authService.verifyCode(formData.code);
      sessionStorage.removeItem("email")
      toggleMode('update_pwd');
    } catch (error: any) {
      handleError(error as ErrorResponse);
    } finally {
      setIsLoading(false);
    }
  };
  const handleSendEmail = async (e: any) => {
      e.preventDefault();
      const email = sessionStorage.getItem("email")
      if (email === null){
        toggleMode('recover')
        return
      }
  
      setIsLoading(true);
      setError(null);
      setFieldHighlights({});
  
      try {
        await authService.sendCode({
          email: email,
        });
        setSendEmail(true)
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
              type="submit" 
              className={style.secondary} 
              disabled={!isSendActive }
              onClick={handleSendEmail}
            >
              {!isSendActive ? `Отправить ${tick} сек.` :  'Отправить еще раз' }
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
                  Изменить почту
                </a>
            </div>
        </div>
        );
}