import shared from './PosterCard.module.css';
import styles from './PosterDescription.module.css';

interface PosterDescriptionProps {
  description: string;
}

export function PosterDescription({ description }: PosterDescriptionProps) {
  return (
    <article className={shared.card}>
      <p className={styles.description}>{description}</p>
    </article>
  );
}

