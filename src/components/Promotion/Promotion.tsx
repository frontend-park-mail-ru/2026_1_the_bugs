import styles from './Promotion.module.css';
import { PromOffer } from '../PromOffer/PromOffer';
import { useState } from 'the-react/hooks';
import { apiService } from '../../services/apiClass';
import { authService } from '../../services/auth';

export interface PromotionOffer {
    title: string;
    price: string;
    description: string;
    actionText?: string;
    badgeText?: string;
    highlight?: boolean;
    promotionCode: string;
}

interface PromotionProps {
    offers: PromotionOffer[];
    posterId: number;
}

export function Promotion({ offers, posterId }: PromotionProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeCode, setActiveCode] = useState<string | null>(null);

    const handleOfferAction = async (offer: PromotionOffer) => {
        if (isSubmitting) return;
        setIsSubmitting(true);
        setActiveCode(offer.promotionCode);
        try {
            const token = apiService.getToken();
            const response = await authService.WithRefresh(async () => apiService.post(
                '/promotions/payment',
                JSON.stringify({
                    poster_id: posterId,
                    promotion_code: offer.promotionCode
                }),
                {
                    'Authorization': `Bearer ${token}`,
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                }
            ));
            const confirmationUrl = response?.confirmation_url;
            const paymentId = response?.payment_id;
            if (paymentId) {
                localStorage.setItem('payment_id', paymentId);
            }
            if (confirmationUrl) {
                window.location.assign(confirmationUrl);
            }
        } finally {
            setIsSubmitting(false);
            setActiveCode(null);
        }
    };

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
                        onAction={() => handleOfferAction(offer)}
                        disabled={isSubmitting && activeCode === offer.promotionCode}
                    />
                ))}
            </div>
        </div>
    );
}
