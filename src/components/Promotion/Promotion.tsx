import styles from './Promotion.module.css';
import { PromOffer } from '../PromOffer/PromOffer';

export interface PromotionOffer {
    title: string;
    price: string;
    description: string;
    actionText?: string;
    badgeText?: string;
    highlight?: boolean;
}

interface PromotionProps {
    offers: PromotionOffer[];
}

export function Promotion({ offers }: PromotionProps) {
    return (
        <div className={styles.wrapper}>
            <div className={styles.header}>
                <h2 className={styles.title}>Продвижение объявлений</h2>
                <p className={styles.subtitle}>
                    Ваше объявление поднимется выше в поиске и получит больше просмотров.
                </p>
            </div>
            <div className={styles.grid}>
                {offers.map((offer) => (
                    <PromOffer
                        key={offer.title}
                        title={offer.title}
                        price={offer.price}
                        description={offer.description}
                        actionText={offer.actionText}
                        badgeText={offer.badgeText}
                        highlight={offer.highlight}
                    />
                ))}
            </div>
        </div>
    );
}

