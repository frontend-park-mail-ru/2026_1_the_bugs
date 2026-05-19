
import { useEffect, useState } from 'the-react/hooks';
import { useNavigate } from '@router-dom';
import { deletePosterByAlias, getMyPosters } from '../../services/posters';
import style from './MyPosters.module.css';
import cardStyle from '../Card/Card.module.css';

import type { MyPoster, } from '../../types';
import { Button } from '../Button/Button';

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

    const handleDelete = async (alias: string) => {
        await deletePosterByAlias(alias)
        await handleGetMyPosters();
    };

    const handleEdit = (alias: string) => {
        navigate(`/posters/${encodeURIComponent(alias)}/edit`);
    };

    if (loading) return (
        <div className={style.wrapper}>
            <h1 className={style.main}>Мои объявления</h1>
            <button
                style={{'display':'flex', 'margin':'0 auto', 'padding': '10px', 'background-color': 'var(--accent)','color': 'white'}}
                aria-label="Создать объявление"
                onClick={() => {
                    navigate('/posters/create');
                }}
              >
                + Создать новое объявление
              </button>
            <div className={style.center}>Загрузка…</div>
        </div>
    
);
    if (error) return <div className={style.error}>{error}</div>;

        const anyMenuOpen =  menuOpen !== null;
    return (
        <div className={style.wrapper}>
            {anyMenuOpen && (
                <div className={style.menuOverlay} onClick={() => { setMenuOpen(null); }} />
            )}
            <h1 className={style.main}>Мои объявления</h1>
            <button
                style={{'display':'flex', 'margin':'0 auto', 'padding': '10px', 'background-color': 'var(--accent)','color': 'white'}}
                aria-label="Создать объявление"
                onClick={() => {
                    navigate('/posters/create');
                }}
              >
                + Создать новое объявление
              </button>
            {posters.length === 0 ? (
                <div className={style.nothing}>У вас пока нет объявлений</div>
            ) : (
                <section className={style.cardsGrid}>
                    {posters.map((apt) => {
                        const isMenuOpen = menuOpen === apt.id;
                        return (
                            <article
                                key={apt.id}
                                className={cardStyle.card + ' ' + style.myCard}
                                data-title={apt.address}
                                onClick={() => navigate(`/posters/${encodeURIComponent(apt.alias)}`)}
                            >
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
                                        <span>{apt.category.name}</span>
                                        <strong>{apt.price.toLocaleString()} ₽</strong>
                                    </div>
                                </div>
                                <button
                                    id="ButtonMenu"
                                    variant="none"
                                    key="ButtonMenu"
                                    className={style.menuBtn + (isMenuOpen ? ' ' + style.menuBtnActive : '')}
                                    aria-label="Меню"
                                    onClick={(e:MouseEvent) => {
                                        e.stopPropagation();
                                        setMenuOpen(isMenuOpen ? null : apt.id);
                                    }}
                                    style={{'position': 'absolute'}}
                                >
                                    <span className={style.menuDots}>
                                        <img src="/svg/options.svg" alt="" aria-hidden="true" draggable="false" />
                                    </span>
                                </button>
                                {isMenuOpen && (
                                    <div className={style.menuPopup}>
                                        <Button
                                            variant="menu"
                                            className="fontHero"
                                            text="Изменить"
                                            key="ButtonEdit"
                                            onClick={(e:MouseEvent) => {
                                                e.stopPropagation();
                                                setMenuOpen(null);
                                                handleEdit(apt.alias);
                                            }}
                                        />
                                        <div className={style.menuSeparator} />
                                        <Button
                                            variant="menu"
                                            className={`fontHero ${style.menuItemDelete}`}
                                            text="Удалить"
                                            key="ButtonDell"
                                            onClick={(e:MouseEvent) => {
                                                e.stopPropagation();
                                                setMenuOpen(null);
                                                handleDelete(apt.alias);
                                            }}
                                        />
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </section>
            )}
        </div>
    );

}