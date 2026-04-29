import {useState} from 'the-react';
import type {ApartmentDetails} from '../../types';
import { Button } from '../Button/Button';
import shared from './PosterCard.module.css';
import styles from './PosterSummary.module.css';

interface PosterSummaryProps {
    poster: ApartmentDetails;
    price: string;
    views: number | null;
}

export function PosterSummary({poster, price, views}: PosterSummaryProps) {
    const [isFavorite, setIsFavorite] = useState(false);
    const [favoritesCount, setFavoritesCount] = useState(0);

    const handleFavoriteClick = () => {
        const nextIsFavorite = !isFavorite;
        setIsFavorite(nextIsFavorite);
        setFavoritesCount(nextIsFavorite ? favoritesCount + 1 : Math.max(0, favoritesCount - 1));
    };

    return (
        <section className={`${shared.card} ${styles.summaryCard}`}>
            <div className={styles.priceRow}>
                <strong className={styles.price}>{price}</strong>
                <div className={styles.favoriteWrap}>
                    <span className={styles.favoritesCount}>{favoritesCount.toString()}</span>
                    <Button
                        aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                        onClick={handleFavoriteClick}
                        type="button"
                        variant="primary"
                        shape="round"
                        liked={isFavorite}
                        icon={
                            <img
                                alt=""
                                aria-hidden="true"
                                className={styles.heartIcon}
                                draggable={false}
                                src={isFavorite ? '/svg/hearted.svg' : '/svg/heart.svg'}
                            />
                        }
                    />
                </div>
            </div>
            <div className={styles.metaCompact}>
                <span>{poster.area.toString()} м²</span>
                <span>{poster.flat.floor.toString()} этаж</span>
                <span style={{
                    'display': 'flex',
                    'gap': '6px',
                    'align-content': 'center'
                }}>
                    {views ? views.toString() : '0'}
                    <img alt="" className={styles.icon} src="/svg/view.svg"></img>
                </span>
            </div>
        </section>
    );
}
