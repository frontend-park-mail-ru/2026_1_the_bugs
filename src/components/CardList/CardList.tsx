import { Card } from '../Card/Card';
import type { Apartment } from '../../types';
import style from './CardList.module.css';
import { useEffect } from 'the-react/hooks';
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
  isAuth: boolean
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
  const navigate = useNavigate()
  useEffect(() => {
    if (!hasMore || isFetchingMore) return;

    let ticking = false;
    
    const handleScroll = () => {
      if (ticking) return;
      
     requestAnimationFrame(() => {
        ticking = true;
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        const newCanScroll = scrollHeight > clientHeight + 50
        const scrolledToBottom = scrollTop + clientHeight >= scrollHeight - 200;
        
        if ((newCanScroll || scrolledToBottom) && hasMore && !isFetchingMore) {
          onLoadMore();
        }
        
        ticking = false;
      });
      
      ticking = true;
    };
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasMore, isFetchingMore, onLoadMore]);

  const shouldShowSkeletons = hasMore && isFetchingMore;


  return (
    <div style={{'align-items':'center'}}>
        <section className={style.cards} style={styles}>
          {((apartments) && (apartments.length==0) && !isFetchingMore && !hideEmptyState) ? (
            <div className={style.emptyState}>
              <p className={style.emptyTitle}>Ничего не найдено</p>
              <Button variant="accent" type="button" className={style.emptyResetBtn} onClick={()=>{navigate("/")}} text="Сбросить фильтры" />
            </div>
          ): (apartments.map((apt) => {
        let isFavorite;
        if (favoritesIds) {
          isFavorite =  favoritesIds.has(apt.alias);
        }
        return (
          <Card
            key={apt.id.toString()}
            isAuth={isAuth}
            apartment={apt}
            isFavorite={isFavorite}
          />
        );
      }))}
      
        {Array.from({ length: pageSize }).map((_, i) => {
          if (shouldShowSkeletons){
            return <SkeletonCard key={`skeleton-${i}`} />
          }
        }
          
        )}
      
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