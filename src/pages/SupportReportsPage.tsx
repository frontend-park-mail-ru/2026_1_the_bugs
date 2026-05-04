import { useEffect, useState } from 'the-react/hooks';
import styles from './SupportReportsPage.module.css';
import { getSupportOrders, type SupportOrder } from '../services/supports.ts';

interface TicketItem {
  id: string;
  date: string;
  title: string;
  status: string;
}

const formatCreatedAt = (value?: string): string => {
  if (!value) return '-';

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;

  const date = parsed.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
  });
  const time = parsed.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return `${date} в ${time}`;
};

const mapOrderToTicket = (order: SupportOrder): TicketItem => ({
  id: String(order.id),
  date: formatCreatedAt(order.created_at),
  title: order.category_name || 'Без категории',
  status: order.status || 'Без статуса',
});

export function SupportReportsPage() {
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const orders = await getSupportOrders();
        if (!isMounted) return;
        setTickets(orders.map(mapOrderToTicket));
      } catch {
        if (!isMounted) return;
        setError('Не удалось загрузить обращения');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadOrders();

    return () => {
      isMounted = false;
    };
  }, []);

  if (isLoading) {
    return (
      <section className={styles.page}>
        <p className={styles.placeholder}>Загрузка обращений...</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className={styles.page}>
        <p className={styles.placeholder}>{error}</p>
      </section>
    );
  }

  if (tickets.length === 0) {
    return (
      <section className={styles.page}>
        <p className={styles.placeholder}>Обращений пока нет</p>
      </section>
    );
  }

  return (
    <section className={styles.page}>
      <div className={styles.list}>
        {tickets.map((ticket) => (
          <a key={ticket.id} href={`/support/reports/${ticket.id}`} className={styles.cardLink}>
            <article className={styles.card}>
              <div className={styles.metaRow}>
                <p className={styles.number}>№{ticket.id}</p>
                <p className={styles.date}>{ticket.date}</p>
              </div>

              <h2 className={styles.title}>{ticket.title}</h2>
              <span className={styles.status}>{ticket.status}</span>
            </article>
          </a>
        ))}
      </div>
    </section>
  );
}
