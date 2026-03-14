import { useEffect, useState } from '@my-react/hooks';
import { authService } from '../../services/auth';
import type { IOAuthFlow } from 'src/types/api';
import { useNavigate } from '@my-react/router-dom/hooks';
import style from './OAuthVerifyPage.module.css';

export function OAuthVerifyPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null); // ✅ Новое состояние
  const navigate = useNavigate();

  const handleOAuthVerify = async () => {
    const params = new URLSearchParams(window.location.search);
    const flow: IOAuthFlow = {
      code: params.get('code') || '',
      deviceID: params.get('device_id') || '',
      state: params.get('state') || '',
      codeVerifier: params.get('code_verifier') || '',
    };
    
    console.log('OAuth flow:', flow);
    
    if (!flow.code || !flow.deviceID) {
      setErrorMessage('Отсутствуют параметры авторизации');
      setIsError(true);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsSuccess(false);
    setIsError(false);
    setErrorMessage(null);

    try {
      await authService.loginFromVK(flow);
      setIsSuccess(true);
      setTimeout(() => navigate('/'), 2000);
    } catch (err: any) {
      console.error('OAuth VK error:', err);
      const errorMsg = err?.message || err?.response?.data?.message || 'Неизвестная ошибка авторизации';
      setErrorMessage(errorMsg);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleOAuthVerify();
  }, []);

  if (isLoading) {
    return (
      <div className="page">
        <div className={style.verifyContainer}>
          <div className={style.card}>
            <div className={style.spinner} />
            <h2 className={style.title}>Проверяем авторизацию VK...</h2>
            <p className={style.subtitle}>Подождите несколько секунд</p>
          </div>
        </div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="page">
        <div className={style.verifyContainer}>
          <div className={style.card}>
            <div className={style.successIcon}>✓</div>
            <h2 className={style.title}>Авторизация успешна!</h2>
            <p className={style.subtitle}>Перенаправляем на главную...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className={style.verifyContainer}>
        <div className={style.card}>
          <div className={style.errorIcon}>⚠️</div>
          <h2 className={style.title}>Ошибка авторизации</h2>
          {errorMessage && (
            <div className={style.errorMessage}>
              {errorMessage}
            </div>
          )}
          <p className={style.subtitle}>
            {errorMessage ? 'Исправьте ошибку и попробуйте снова' : 'Не удалось войти через VK'}
          </p>
          <div className={style.buttonGroup}>
            <button 
              className={style.retryButton} 
              onClick={handleOAuthVerify}
            >
              Попробовать снова
            </button>
            <button 
              className={style.backButton} 
              onClick={() => navigate('/')}
            >
              К форме входа
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
