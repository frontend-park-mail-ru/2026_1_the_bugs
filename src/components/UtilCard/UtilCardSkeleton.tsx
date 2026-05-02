import style from './UtilCard.module.css';

export function UtilCardSkeleton() {
  return (
    <div className={style.wrapper}>
      <div className={style.skeletonGallery} />
      <div className={style.content}>
        <article className={style.skeletonDescriptionCard} />
        <aside className={style.sideInfo}>
          <div className={style.skeletonSideCard} />
          <div className={style.skeletonSideCard} />
        </aside>
      </div>
      <div className={style.skeletonMap} />
    </div>
  );
}
