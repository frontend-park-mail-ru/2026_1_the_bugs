import { useEffect, useState } from 'the-react';
import { apiService } from '../../../../src/services/apiClass';
import { ErrorView } from '../../../../src/components/Errors/Errors';
import type { SupportOrder, SupportOrdersResponse } from '../../types/support';
import { OrderCard } from '../OrderCard/OrderCard';
import styles from './AdminPage.module.css';

const MOCK_ORDERS: SupportOrder[] = [
  {
    id: 8643352,
    category_name: 'Личный кабинет и аккаунт',
    status: 'sent',
    created_at: '2026-04-21T23:12:00+03:00',
  },
];

export function AdminPage() {
  const [orders, setOrders] = useState<SupportOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response: SupportOrdersResponse = await apiService.get('/support/orders');
        setOrders(response.orders || []);
      } catch (err: unknown) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const displayOrders = orders.length > 0 ? orders : MOCK_ORDERS;

  return (
    <main className={styles.adminPage}>
      <section className={styles.adminSection} aria-label="Админ-панель">
        <div className={styles.header}>
          <h1 className={styles.title}>Заявки в поддержку</h1>
          <p className={styles.count}>{displayOrders.length}</p>
        </div>

        {loading && <div className={styles.loading}>Загрузка...</div>}
        <ErrorView
          error={error}
          fallbackMessage="Ошибка при загрузке заявок"
          className={styles.errorBanner}
        />

        <div className={styles.ordersList}>
          {displayOrders.map((order) => (
            <OrderCard key={String(order.id)} order={order} />
          ))}
        </div>
      </section>
    </main>
  );
}