import { useEffect, useState } from 'the-react/hooks';
import { EditPosterForm } from '../../components/PosterForm/EditPosterForm/EditPosterForm';
import styles from './EditPosterPage.module.css';
import { getMyPosterByAlias } from '../../services/posters';
import type { ApartmentDetails } from '../../types';
import layout from '../../components/PosterPage/PosterPageLayout.module.css';
import { useNavigate } from '@router-dom';
import { ErrorView } from '../../components/Errors/Errors';

interface EditPosterProp{
    alias: string
}

export function EditPosterPage({alias}:EditPosterProp) {
    const [poster, setPoster] = useState<ApartmentDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown>(null);

    useEffect(() => {
        const loadPoster = async () => {
          try {
            const data = await getMyPosterByAlias(alias);
            setPoster(data);
          } catch (e: any) {
            setError(e);
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
        mainContent = (
          <ErrorView
            error={error}
            fallbackMessage="Не удалось загрузить объявление"
            notFoundMessage="Объявление не найдено"
            className={layout.status}
          />
        );
    } else if (!poster) {
        mainContent = (
          <ErrorView
            error="Объявление не найдено"
            fallbackMessage="Не удалось загрузить объявление"
            notFoundMessage="Объявление не найдено"
            className={layout.status}
          />
        );
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


