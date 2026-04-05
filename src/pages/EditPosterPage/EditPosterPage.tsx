import { useEffect, useState } from '@my-react/hooks';
import { EditPosterForm } from '../../components/PosterForm/EditPosterForm/EditPosterForm';
import styles from './EditPosterPage.module.css';
import { getMyPosterByAlias } from '../../services/posters';
import type { ApartmentDetails } from '../../types';
import layout from '../../components/PosterPage/PosterPageLayout.module.css';

interface EditPosterProp{
    alias: string
}

export function EditPosterPage({alias}:EditPosterProp) {
    const [poster, setPoster] = useState<ApartmentDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadPoster = async () => {
          try {
            const data = await getMyPosterByAlias(alias);
            setPoster(data);
          } catch (e: any) {
            setError('Не удалось загрузить объявление');
          } finally {
            setLoading(false);
          }
        };
    
        loadPoster();
      }, [alias]);

    let mainContent;

    if (loading) {
        mainContent = <div className={layout.status}>Загрузка объявления...</div>;
    } else if (error) {
        mainContent = <div className={layout.status}>Ошибка: {error}</div>;
    } else if (!poster) {
        mainContent = <div className={layout.status}>Объявление не найдено</div>;
    } else {
        mainContent = (
            <div>
             <section className={styles.header}>
                <h1 className={styles.title}>Редактирование объявления</h1>
            </section>

            <EditPosterForm poster={poster}/>
            </div>
        );
    }
    return (
      <div className={`main ${layout.main}`}>
        {mainContent}
      </div>
  );
}


