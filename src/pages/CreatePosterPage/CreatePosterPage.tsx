import { CreatePosterForm } from '../../components/CreatePosterForm/CreatePosterForm';
import styles from './CreatePosterPage.module.css';

export function CreatePosterPage() {
  return (
    <div className={`main ${styles.main}`}>
      <section className={styles.header}>
        <h1 className={styles.title}>Новое объявление</h1>
      </section>
      <CreatePosterForm />
    </div>
  );
}


