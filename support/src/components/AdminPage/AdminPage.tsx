import { useEffect, useState } from 'the-react';
import { apiService } from '../../../../src/services/apiClass';
import { authService } from '../../../../src/services/auth';
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
  const [orders, setOrders] = useState<SupportOrder[]>(MOCK_ORDERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response: SupportOrdersResponse = await authService.WithRefresh(()=>{
            const token = apiService.getToken();
            let res = apiService.get('/support/orders', {},   {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
            });
            return res
          }
        )
        const loaded = response.orders || [];
        setOrders(loaded.length > 0 ? loaded : MOCK_ORDERS);
      } catch (err: unknown) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  const handleStatusChange = async (id: number, status: SupportOrderStatus) => {
    const updated = orders.map((o: SupportOrder) => o.id === id ? { ...o, status } : o);
    setOrders(updated);
    await authService.WithRefresh(()=>{
      const token = apiService.getToken();
      return apiService.put(`/support/orders/${id}`, { status }, { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, });
    });
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
            />
          ))}
        </div>
      </section>
    </main>
  );
}