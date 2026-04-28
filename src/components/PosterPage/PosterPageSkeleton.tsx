
import layout from './PosterPageLayout.module.css';

export function PosterPageSkeleton() {
  return (
    <div className={layout.layout}>
      <div className={layout.leftColumn}>
        <div className={layout.skeletonGallery} />
        <div className={layout.skeletonMainInfo} />
        <div className={layout.skeletonDescription} />
        <div className={layout.skeletonParams} />
      </div>
      <aside className={layout.rightColumn}>
        <div className={layout.skeletonSummary} />
        <div className={layout.skeletonMap} />
        <div className={layout.skeletonSeller} />
        <div className={layout.skeletonCompany} />
      </aside>
    </div>
  );
}
