
import { useEffect, useState } from '@my-react/hooks';
import styles from './Pagination.module.css';

type Props = {
  page: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
};


function Pagination ({ page, total, pageSize, onPageChange }: Props) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const [isSmall, setIsSmall] = useState<boolean>(window.innerWidth <= 480);

  useEffect(() => {
    const onResize = () => {
      try { setIsSmall(window.innerWidth <= 480); } catch {}
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const go = (p: number) => {
    const np = Math.min(Math.max(1, p), totalPages);
    if (np !== page) onPageChange(np);
  };

  const buildPages = (): Array<number | '...'> => {
    if (isSmall) {
      if (totalPages <= 5) return Array.from({ length: totalPages }, (_, i) => i + 1);
      if (page <= 3) return [1, 2, 3, '...', totalPages];
      if (page >= totalPages - 2) return [1, '...', totalPages - 2, totalPages - 1, totalPages];
      return [1, '...', page, '...', totalPages];
    }

    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);

    const pages: Array<number | '...'> = [];
    if (page <= 4) {
      pages.push(1, 2, 3, 4, 5, '...', totalPages);
      return pages;
    }
    if (page >= totalPages - 3) {
      pages.push(1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      return pages;
    }

    pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
    return pages;
  };

  const pages = buildPages();

  return (
    <div className={styles.container}>
      <button className={styles.prevNext} onClick={() => go(page - 1)} disabled={page <= 1} aria-label="previous">◀</button>

      <div className={styles.pages}>
        {pages.map((p, idx) => (
          p === '...'
            ? <span key={`e-${idx}`} className={styles.ellipsis}>…</span>
            : (
              <button
                key={p}
                className={`${styles.btn} ${p === page ? styles.active : ''}`}
                onClick={() => go(p as number)}
                aria-current={p === page ? 'page' : undefined}
              >{p.toString()}</button>
            )
        ))}
      </div>

      <button className={styles.prevNext} onClick={() => go(page + 1)} disabled={page >= totalPages} aria-label="next">▶</button>
    </div>
  );
};

export default Pagination;
