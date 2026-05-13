import { useEffect, useState } from 'the-react';
import { apiService } from '../../../../src/services/apiClass';
import { useNavigate } from '../../../../src/RouterDOM';
import { ErrorView } from '../../../../src/components/Errors/Errors';
import type { SupportOrder, SupportOrdersResponse, SupportOrderStatus } from '../../types/support';
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
  const navigate = useNavigate();
  const [orders, setOrders] = useState<SupportOrder[]>(MOCK_ORDERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response: SupportOrdersResponse = await apiService.get('/support/orders');
        const loaded = response.order || [];
        setOrders(loaded.length > 0 ? loaded : MOCK_ORDERS);
      } catch (err: unknown) {
        setError(err);
        setOrders(MOCK_ORDERS);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleStatusChange = async (id: number, status: SupportOrderStatus) => {
    const updated = orders.map((o: SupportOrder) => o.id === id ? { ...o, status } : o);
    setOrders(updated);
    await apiService.put(`/support/orders/${id}`, { status }, { 'Content-Type': 'application/json' });
  };

  return (
    <main className={styles.adminPage}>
      <section className={styles.adminSection} aria-label="Админ-панель">
        <div className={styles.header}>
          <h1 className={styles.title}>Заявки в поддержку</h1>
          <p className={styles.count}>{orders.length}</p>
        </div>

        {loading && <div className={styles.loading}>Загрузка...</div>}
        <ErrorView
          error={error}
          fallbackMessage="Ошибка при загрузке заявок"
          className={styles.errorBanner}
        />

        <div className={styles.ordersList}>
          {orders.map((order) => (
            <OrderCard
              key={String(order.id)}
              order={order}
              onStatusChange={handleStatusChange}
              onOpenOrder={(id: number) => navigate(`/admin/order/${id}`)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}