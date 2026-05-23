import { useEffect, useState } from 'the-react/hooks';
import { useNavigate } from '@router-dom';
import { apiService } from '../../services/apiClass';
import { authService } from '../../services/auth';
import styles from './PromotionPaymentPage.module.css';

type PaymentStatus = 'pending' | 'waiting_for_capture' | 'succeeded' | 'canceled' | null;

const PAYMENT_ID_KEY = 'payment_id';
const POLL_INTERVAL_MS = 3000;

export function PromotionPaymentPage() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<PaymentStatus>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const paymentId = localStorage.getItem(PAYMENT_ID_KEY);
    if (!paymentId) {
      setError('Платеж не найден. Попробуйте оформить продвижение еще раз.');
      return;
    }

    let isActive = true;
    let timeoutId: number | null = null;

    const pollStatus = async () => {
      if (!isActive) return;
      setIsLoading(true);
      try {
        const token = apiService.getToken();
        const response = await authService.WithRefresh(() => apiService.post(
          '/promotions/status',
          JSON.stringify({
            payment_id: paymentId
          }),
          {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        ));
        const nextStatus = (response?.payment_status || 'pending') as PaymentStatus;
        setStatus(nextStatus);
        if (nextStatus === 'succeeded') {
          localStorage.removeItem(PAYMENT_ID_KEY);
          navigate('/my-posters');
          return;
        }
        if (nextStatus === 'canceled') {
          setError('Платеж отменен. Если произошла ошибка, попробуйте снова.');
          return;
        }
        timeoutId = window.setTimeout(pollStatus, POLL_INTERVAL_MS);
      } catch {
        setError('Не удалось проверить статус оплаты. Обновите страницу и попробуйте снова.');
      } finally {
        setIsLoading(false);
      }
    };

    pollStatus();

    return () => {
      isActive = false;
      if (timeoutId) {
        window.clearTimeout(timeoutId);
      }
    };
  }, [navigate]);

  const statusMessage = status === 'waiting_for_capture'
    ? 'Платеж обрабатывается банком. Обычно это занимает пару минут.'
    : 'Ожидаем подтверждение оплаты.';

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <div className={styles.spinner} aria-hidden="true" />
        <h2 className={styles.title}>Проверяем оплату...</h2>
        {!error && (
          <p className={styles.subtitle}>{statusMessage}</p>
        )}
        {error && (
          <p className={styles.error}>{error}</p>
        )}
        {error && (
          <button className={styles.button} type="button" onClick={() => navigate('/my-posters')}>
            К моим объявлениям
          </button>
        )}
        {!error && isLoading && (
          <p className={styles.hint}>Это окно закроется автоматически после подтверждения оплаты.</p>
        )}
      </div>
    </div>
  );
}
