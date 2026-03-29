
import { useEffect, useState } from '@my-react/hooks';
import { useNavigate } from '@my-react/router-dom/hooks';
import { getMyPosters } from '../../services/posters';
import { apiService } from '../../services/apiClass';
import style from './MyPosters.module.css';
import cardStyle from '../Card/Card.module.css';

import type { MyPoster, } from '../../types';

export function MyPosterList() {
    const navigate = useNavigate();
    const [posters, setPosters] = useState<MyPoster[]>([]);
    const [menuOpen, setMenuOpen] = useState<number | null>(null);
    const [loading, setIsLoading] = useState(false);
    const [error, setMyPosterError] = useState<string | null>(null);

    const handleGetMyPosters = async () => {
        setIsLoading(true);
        try {
            const { posters } = await getMyPosters();
            setPosters(Array.isArray(posters) ? posters : []);
        } catch (error: any) {
            setMyPosterError(error?.message || 'Ошибка загрузки объявлений');
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        handleGetMyPosters();
    }, []);

    const handleDelete = async (id: number) => {
        if (!window.confirm('Удалить объявление?')) return;
        try {
            await apiService.delete(`/posters/${id}`);
            handleGetMyPosters();
        } catch (e: any) {
            alert(e?.message || 'Ошибка удаления');
        }
    };

    const handleEdit = (alias: string) => {
        navigate(`/posters/edit/${encodeURIComponent(alias)}`); // потом поменять на норм роут
    };

    // if (loading) return <div className={style.center}>Загрузка…</div>;
    // if (error) return <div className={style.error}>{error}</div>;

    // Demo card for style preview

        const anyMenuOpen =  menuOpen !== null;
    return (
        <div className={style.wrapper}>
            {anyMenuOpen && (
                <div className={style.menuOverlay} onClick={() => { setMenuOpen(null); }} />
            )}
            <h1 className={style.main}>Мои объявления</h1>
            {posters.length === 0 ? (
                <div className={style.nothing}>У вас пока нет объявлений</div>
            ) : (
                <section className={style.cardsGrid}>
                    {posters.map((apt) => {
                            return <article key={apt.id} className={cardStyle.card + ' ' + style.myCard} data-title={apt.address}>
                                <div className={cardStyle.image}>
                                    <img src={apt.avatar_url} alt="Интерьер" draggable="false" />
                                </div>
                                <div className={cardStyle.info}>
                                    <div className={cardStyle.meta}>
                                        <span className={cardStyle.location}>
                                            <img src="/svg/location.svg" alt="" aria-hidden="true" draggable="false" />
                                            {apt.address}
                                        </span>
                                        <span>{apt.area.toString()} м²</span>
                                    </div>
                                    <div className={cardStyle.footer}>
                                        <strong>{apt.price.toLocaleString()} ₽</strong>
                                    </div>
                                </div>
                                <button
                                    className={style.menuBtn + (menuOpen === apt.id ? ' ' + style.menuBtnActive : '')}
                                    aria-label="Меню"
                                    onClick={() => setMenuOpen(menuOpen === apt.id ? null : apt.id)}
                                >
                                    <span className={style.menuDots}>
                                        <img src="/svg/options.svg" alt="" aria-hidden="true" draggable="false" />
                                    </span>
                                </button>
                                {menuOpen === apt.id && (
                                    <div className={style.menuPopup}>
                                        <button
                                            className={style.menuItem}
                                            onClick={() => { setMenuOpen(null); handleEdit(apt.alias); }}
                                        >
                                            Изменить
                                        </button>
                                        <div className={style.menuSeparator} />
                                        <button
                                            className={style.menuItem + ' ' + style.menuDelete}
                                            onClick={() => { setMenuOpen(null); handleDelete(apt.id); }}
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                )}
                            </article>
                    })}
                </section>
            )}
        </div>
    );

}