import { useEffect, useState } from 'the-react';
import { apiService } from '../../../../src/services/apiClass';
import { authService } from '../../../../src/services/auth';
import { useNavigate } from '../../../../src/RouterDOM';
import { ErrorView } from '../../../../src/components/Errors/Errors';
import type { SupportOrder, SupportOrdersResponse, SupportOrderStatus } from '../../types/support';
import { OrderCard } from '../OrderCard/OrderCard';
import styles from './AdminPage.module.css';

export function AdminPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<SupportOrder[]>([]);
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
        const loaded = response.order || [];
        setOrders(loaded.length > 0 ? loaded : []);
      } catch (err: unknown) {
        setError(err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

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
              onOpenOrder={(id: number) => navigate(`/admin/order/${id}`)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}