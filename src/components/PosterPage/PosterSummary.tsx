import {useState} from 'the-react';
import type {ApartmentDetails} from '../../types';
import { Button } from '../Button/Button';
import shared from './PosterCard.module.css';
import styles from './PosterSummary.module.css';


interface PosterSummaryProps {
    poster: ApartmentDetails;
    price: string;
    views: number | null;
    isFavorite: boolean | null;
    countFavorites: number | null;
    onLikeToggle?: (alias: string, isLike: boolean) => void;
    setFavoritesCount: (count: number) => void;
    setIsFavorite: (isFavorite: boolean) => void;
    isAuth: boolean;
}

function formatCount(count: number | null) {
    if (count === null) return '0';

    if (count >= 1000000) {
        return (count / 1000000).toFixed(1).replace('.0', '') + 'M';
    }
    if (count >= 1000) {
        return (count / 1000).toFixed(1).replace('.0', '') + 'K';
    }
    return count ? count.toString() : '0';
}

export function PosterSummary({poster, price, views, isFavorite, countFavorites, onLikeToggle, setFavoritesCount, setIsFavorite, isAuth}: PosterSummaryProps) {

    const handleFavoriteClick = (isFavorite: boolean) => {
        const nextIsFavorite = !isFavorite;
        setIsFavorite(nextIsFavorite);
        setFavoritesCount(nextIsFavorite ? (countFavorites || 0) + 1 : Math.max(0, (countFavorites || 0) - 1));
        onLikeToggle?.(poster.alias, nextIsFavorite);
    };

    return (
        <section className={`${shared.card} ${styles.summaryCard}`}>
            <div className={styles.priceRow}>
                <strong className={styles.price}>{price}</strong>
                <div className={styles.favoriteWrap}>
                    <span className={styles.favoritesCount}>{formatCount(countFavorites)}</span>
                    <Button
                            aria-label={isFavorite ? 'Убрать из избранного' : 'Добавить в избранное'}
                            onClick={() => handleFavoriteClick(isFavorite as boolean)}
                            type="button"
                            variant="primary"
                            shape="round"
                        liked={isFavorite as boolean && isAuth}
                        disabled={!isAuth}
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
                    {formatCount(views)} просмотров
                    {/* <img alt="" className={styles.icon} src="/svg/view.svg"></img> */}
                </span>
            </div>
        </section>
    );
}
