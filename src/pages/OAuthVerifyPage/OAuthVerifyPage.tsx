import { useEffect, useState } from '@my-react/hooks';
import { authService } from '../../services/auth';
import type { IOAuthFlow } from 'src/types/api';
import { useNavigate } from '@my-react/router-dom/hooks';
import style from './OAuthVerifyPage.module.css';

interface IOAuthVerifyProps {
  provider: 'vk' | 'yandex';
}

export function OAuthVerifyPage({ provider }: IOAuthVerifyProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleOAuthVerify = async () => {
    const params = new URLSearchParams(window.location.search);
    const flow = {
      code: params.get('code') || '',
      device_id: params.get('device_id') || '',
      state: params.get('state') || '',
    } as IOAuthFlow;
    if (!flow.code) {
      setErrorMessage('Отсутствует код авторизации');
      setIsLoading(false);
      return;
    }
    let codeVerifier: string | null = null;
    switch (provider) {
      case 'vk':
        codeVerifier = localStorage.getItem("vk_code_verifier")
        localStorage.removeItem("vk_code_verifier")
        if (!codeVerifier){
          setErrorMessage('Отсутствуют параметр codeVerifier');
          setIsLoading(false);
          return;
        }
        flow.code_verifier = codeVerifier;
        console.log('OAuth flow:', flow);
        break;
      case 'yandex':
        console.log('Yandex OAuth params:', Object.fromEntries(params.entries()));

        codeVerifier = localStorage.getItem("yandex_code_verifier")
        localStorage.removeItem("yandex_code_verifier")
        if (!codeVerifier){
          setErrorMessage('Отсутствуют параметр codeVerifier');
          setIsLoading(false);
          return;
        }
        flow.code_verifier = codeVerifier;
        break;
    }
    
    try {
      switch (provider) {
        case 'vk':
          await authService.loginFromVK(flow);
          break;
        case 'yandex':
          await authService.loginFromYandex(flow);
          break;
      }
      setIsSuccess(true);
      setTimeout(() => navigate('/'), 1200);
    } catch (err: any) {
      console.error('OAuth error:', err);
      const errorMsg = err?.message || err?.response?.data?.message || 'Неизвестная ошибка авторизации';
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    handleOAuthVerify();
  }, []);

  if (isLoading) {
    return (
        <div className={style.verifyContainer}>
          <div className={style.card}>
            <div className={style.spinner} />
            <h2 className={style.title}>Проверяем авторизацию...</h2>
            <p className={style.subtitle}>Подождите несколько секунд</p>
          </div>
        </div>
    );
  }

  if (isSuccess) {
    return (
        <div className={style.verifyContainer}>
          <div className={style.card}>
            <div className={style.successIcon}>✓</div>
            <h2 className={style.title}>Авторизация успешна!</h2>
            <p className={style.subtitle}>Перенаправляем на главную...</p>
          </div>
        </div>
    );
  }

  return (
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
  );
}
