import type { SupportOrder } from '../../types/support';
import styles from './OrderCard.module.css';

interface OrderCardProps {
  order: SupportOrder;
}

export function OrderCard({ order }: OrderCardProps) {
  const formattedDate = new Date(order.created_at).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).replace(' г.', '');

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'sent':
        return 'в обработке';
      case 'in_progress':
        return 'выполнено';
      case 'finished':
        return 'закрыто';
      default:
        return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'sent':
        return styles.statusSent;
      case 'in_progress':
        return styles.statusInProgress;
      case 'finished':
        return styles.statusFinished;
      default:
        return styles.statusSent;
    }
  };

  return (
    <div className={styles.orderCard}>
      <div className={styles.header}>
        <div className={styles.info}>
          <h3 className={styles.orderNumber}>№{order.id}</h3>
          <p className={styles.category}>{order.category_name}</p>
        </div>
        <div className={styles.date}>{formattedDate}</div>
      </div>
      <div className={styles.footer}>
        <span className={`${styles.status} ${getStatusColor(order.status)}`}>
          {getStatusLabel(order.status)}
        </span>
      </div>
    </div>
  );
}
