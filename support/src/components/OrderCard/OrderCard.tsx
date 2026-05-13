import { useState } from 'the-react';
import type { SupportOrder, SupportOrderStatus } from '../../types/support';
import styles from './OrderCard.module.css';

const STATUS_OPTIONS: { value: SupportOrderStatus; label: string }[] = [
  { value: 'sent', label: 'в обработке' },
  { value: 'in_progress', label: 'выполнено' },
  { value: 'finished', label: 'закрыто' },
];

interface OrderCardProps {
  order: SupportOrder;
  onStatusChange?: (id: number, status: SupportOrderStatus) => Promise<void>;
  onOpenOrder?: (id: number) => void;
}

export function OrderCard({ order, onStatusChange, onOpenOrder }: OrderCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleStatusSelect = async (status: SupportOrderStatus) => {
    if (!onStatusChange || status === order.status) { setIsOpen(false); return; }
    setSaving(true);
    setIsOpen(false);
    try {
      await onStatusChange(order.id, status);
    } finally {
      setSaving(false);
    }
  };

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
          <h3 className={styles.orderNumber}>№{order.id}</h3>
          <p className={styles.category}>{order.category_name}</p>
        </div>
        <div className={styles.date}>{formattedDate}</div>
      </div>
      <div className={styles.footer}>
        <div className={styles.statusWrapper}>
          <button
            className={`${styles.status} ${getStatusColor(order.status)} ${onStatusChange ? styles.statusClickable : ''}`}
            onClick={(e: MouseEvent) => {
              e.stopPropagation();
              onStatusChange && setIsOpen(!isOpen);
            }}
            disabled={saving}
            aria-expanded={isOpen}
          >
            {saving ? '...' : getStatusLabel(order.status)}
            {onStatusChange && <span className={styles.statusArrow}>{isOpen ? '▲' : '▼'}</span>}
          </button>
          {isOpen && (
            <div className={styles.statusDropdown}>
              {STATUS_OPTIONS.filter(o => o.value !== order.status).map(o => (
                <button
                  key={o.value}
                  className={`${styles.statusOption} ${getStatusColor(o.value)}`}
                  onClick={(e: MouseEvent) => {
                    e.stopPropagation();
                    handleStatusSelect(o.value);
                  }}
                >
                  {o.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
