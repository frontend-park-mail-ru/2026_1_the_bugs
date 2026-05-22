import { Card } from '../Card/Card';
import type { Apartment } from '../../types';
import style from './CardList.module.css';
import { useEffect, useState } from 'the-react/hooks';
import { Button } from '../Button/Button';
import { useNavigate } from '@router-dom';

interface CardListProps {
  apartments: Apartment[];
  isFetchingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  pageSize: number;
  styles?: Record<string, any>;
  favoritesIds?: Set<number | string>;
  hideEmptyState?: boolean;
  isAuth: boolean;
}

export function CardList(props: CardListProps) {
  const {
    apartments,
    isFetchingMore,
    hasMore,
    onLoadMore,
    pageSize,
    styles,
    favoritesIds,
    hideEmptyState,
    isAuth,
  } = props;

  const navigate = useNavigate();
  const [lock] = useState({ current: false });
  const cardsCount = apartments.length;
  const hasLoadedInitialCards = cardsCount > 0;
  const [hasUserScrolled, setHasUserScrolled] = useState(false);

  useEffect(() => {
    const markScrolled = () => {
      const doc = document.documentElement;
      const scrollTop = window.pageYOffset || doc.scrollTop;
      if (scrollTop > 24 && !hasUserScrolled) {
        setHasUserScrolled(true);
      }
    };

    window.addEventListener('scroll', markScrolled, { passive: true });
    return () => window.removeEventListener('scroll', markScrolled);
  }, [hasUserScrolled]);

  useEffect(() => {
    if (!hasMore || !hasLoadedInitialCards || !hasUserScrolled) return;

    const sentinel = document.getElementById('cardlist-sentinel');
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting && !isFetchingMore && !lock.current) {
          lock.current = true;
          onLoadMore();
        }
      },
      { rootMargin: '300px' },
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isFetchingMore, hasLoadedInitialCards, hasUserScrolled, cardsCount, onLoadMore]);

  useEffect(() => {
    if (!hasMore || !hasLoadedInitialCards || !hasUserScrolled) return;

    const checkNearBottom = () => {
      if (isFetchingMore || lock.current || !hasMore) return;

      const doc = document.documentElement;
      const scrollTop = window.pageYOffset || doc.scrollTop;
      const viewportHeight = window.innerHeight || doc.clientHeight;
      const fullHeight = doc.scrollHeight;

      if (scrollTop + viewportHeight >= fullHeight - 300) {
        lock.current = true;
        onLoadMore();
      }
    };

    window.addEventListener('scroll', checkNearBottom, { passive: true });
    window.addEventListener('resize', checkNearBottom);

    return () => {
      window.removeEventListener('scroll', checkNearBottom);
      window.removeEventListener('resize', checkNearBottom);
    };
  }, [hasMore, isFetchingMore, hasLoadedInitialCards, hasUserScrolled, cardsCount, onLoadMore]);

  useEffect(() => {
    if (!isFetchingMore) {
      lock.current = false;
    }
  }, [isFetchingMore]);

  const shouldShowSkeletons = hasMore && isFetchingMore;

  return (
    <div style={{ alignItems: 'center' }}>
      <section className={style.cards} style={styles}>
        {apartments.length === 0 && !isFetchingMore && !hideEmptyState ? (
          <div className={style.emptyState}>
            <p className={style.emptyTitle}>Ничего не найдено</p>
            <Button
              variant="accent"
              type="button"
              className={style.emptyResetBtn}
              onClick={() => {
                navigate('/');
              }}
              text="Сбросить фильтры"
            />
          </div>
        ) : (
          apartments.map((apt) => {
            let isFavorite;
            if (favoritesIds) {
              isFavorite = favoritesIds.has(apt.alias);
            }

            return (
              <Card
                key={apt.id.toString()}
                isAuth={isAuth}
                apartment={apt}
                isFavorite={isFavorite}
              />
            );
          })
        )}

        {shouldShowSkeletons &&
          Array.from({ length: pageSize }).map((_, i) => (
            <SkeletonCard key={`skeleton-${i}`} />
          ))}

        <div id="cardlist-sentinel" style={{ height: '1px' }} />
      </section>
    </div>
  );
}

function SkeletonCard() {
  return (
    <article className={style.skeletonCard}>
      <div className={style.skeletonImage}>
        <div className={style.shimmer}></div>
      </div>
      <div className={style.skeletonInfo}>
        <div className={style.skeletonMeta}>
          <div className={style.skeletonLine}></div>
          <div className={style.skeletonLineSmall}></div>
        </div>
        <div className={style.skeletonFooter}>
          <div className={style.skeletonLine}></div>
          <div className={style.skeletonLine}></div>
          <div className={style.skeletonLine}></div>
          <div className={style.skeletonPrice}></div>
        </div>
      </div>
    </article>
  );
}