import { useState } from 'the-react';
import type { SupportOrder, SupportOrderStatus } from '../../types/support';
import styles from './OrderCard.module.css';

interface OrderCardProps {
  order: SupportOrder;
  onOpenOrder?: (id: number) => void;
}

export function OrderCard({ order,  onOpenOrder }: OrderCardProps) {
  const [saving, setSaving] = useState(false);


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
    <div
      className={styles.orderCard}
      role={onOpenOrder ? 'button' : undefined}
      tabIndex={onOpenOrder ? 0 : undefined}
      onClick={() => onOpenOrder?.(order.id)}
      onKeyDown={(e: KeyboardEvent) => {
        if (!onOpenOrder) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpenOrder(order.id);
        }
      }}
    >
      <div className={styles.header}>
        <div className={styles.info}>
          <h3 className={styles.orderNumber}>№{order.id.toString()}</h3>
          <p className={styles.category}>{order.category_name}</p>
        </div>
        <div className={styles.date}>{formattedDate}</div>
      </div>
      <div className={styles.footer}>
        <div className={styles.statusWrapper}>
          <button
            className={`${styles.status} ${getStatusColor(order.status)} ${styles.statusClickable}`}
            disabled={saving}
          >
            {saving ? '...' : getStatusLabel(order.status)}
            <span className={styles.statusArrow}></span>
          </button>
        </div>
      </div>
    </div>
  );
}
