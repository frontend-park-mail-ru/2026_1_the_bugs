import styles from './PromOffer.module.css';
import { Button } from '../Button/Button';

interface PromOfferProps {
    title: string;
    price: string;
    description: string;
    actionText?: string;
    badgeText?: string;
    highlight?: boolean;
    onAction?: () => void;
    disabled?: boolean;
}

export function PromOffer({
    title,
    price,
    description,
    actionText = 'Попробовать',
    badgeText,
    highlight = false,
    onAction,
    disabled = false
}: PromOfferProps) {
    return (
        <div className={`${styles.card} ${highlight ? styles.cardHighlight : ''}`.trim()}>
            <div className={styles.cardHeader}>
                <span className={styles.title}>{title}</span>
                {badgeText ? <span className={styles.badge}>{badgeText}</span> : null}
            </div>
            <div className={styles.price}>{price}</div>
            <p className={styles.description}>{description}</p>
            <Button
                variant="accent"
                className={styles.action}
                text={actionText}
                onClick={onAction}
                disabled={disabled}
            />
        </div>
    );
}
