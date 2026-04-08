import { Card } from '../Card/Card';
import type { Apartment } from '../../types';
import style from './CardList.module.css';
import { useEffect, useState } from '@my-react/hooks';

interface CardListProps {
  apartments: Apartment[];
  isFetchingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  pageSize: number;
}

export function CardList({ 
  apartments, 
  isFetchingMore, 
  hasMore, 
  onLoadMore, 
  pageSize,
}: CardListProps) {
  useEffect(() => {
    if (!hasMore || isFetchingMore) return;

    let ticking = false;
    
    const handleScroll = () => {
      if (ticking) return;
      
     requestAnimationFrame(() => {
        ticking = true;
        const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
        console.log({ scrollTop, scrollHeight, clientHeight } )
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
    <section className={style.cards}>
      {apartments.map((apt) => (
        <Card key={apt.id.toString()} apartment={apt} />
      ))}
      
     
        {Array.from({ length: pageSize }).map((_, i) => {
          if (shouldShowSkeletons){
            return <SkeletonCard key={`skeleton-${i}`} />
          }
        }
          
        )}
      
    </section>
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