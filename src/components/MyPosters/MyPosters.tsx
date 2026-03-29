
import { useEffect, useState } from '@my-react/hooks';
import { useNavigate } from '@my-react/router-dom/hooks';
import { getMyPosters } from '../../services/posters';
import { apiService } from '../../services/apiClass';
import type { Apartment } from '../../types';
import style from './MyPosters.module.css';
import cardStyle from '../Card/Card.module.css';


export function MyPosterList() {
    const navigate = useNavigate();
    const [posters, setPosters] = useState<Apartment[]>([]);
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

    const [demoMenuOpen, setDemoMenuOpen] = useState(false);
    const demoApt: Apartment = {
        id: 99999,
        alias: 'demo-alias',
        metro: 'Демо-метро',
        address: 'г. Москва, ул. Пример, д. 1',
        area: 42,
        price: 12345678,
        rating: 8.7,
        beds: 2,
        imageUrl: '/svg/location.svg', // demo image, replace as needed
    };

    const anyMenuOpen = demoMenuOpen || menuOpen !== null;
    return (
        <div className={style.wrapper}>
            {anyMenuOpen && (
                <div className={style.menuOverlay} onClick={() => { setDemoMenuOpen(false); setMenuOpen(null); }} />
            )}
            <h1 className={style.main}>Мои объявления</h1>

                {/* Demo card */}
            <div>
                <article className={cardStyle.card + ' ' + style.myCard} data-title={demoApt.metro}>
                    <div className={cardStyle.image}>
                        <img src={demoApt.imageUrl} alt="Интерьер" draggable="false" />
                    </div>
                    <div className={cardStyle.info}>
                        <div className={cardStyle.meta}>
                            <span className={cardStyle.location}>
                                <img src="/svg/location.svg" alt="" aria-hidden="true" draggable="false" />
                                {demoApt.address}
                            </span>
                            <span>{demoApt.area.toString()} м²</span>
                        </div>
                        <div className={cardStyle.footer}>
                            {demoApt?.beds && (
                                <span className={cardStyle.beds} style={{ marginLeft: '2px' }}>
                                    <img src="/svg/beds.svg" alt="" aria-hidden="true" draggable="false" />
                                    {demoApt.beds.toString()}
                                </span>
                            )}
                            <strong>{demoApt.price.toLocaleString()} ₽</strong>
                        </div>
                    </div>
                    <button
                        className={style.menuBtn + (demoMenuOpen ? ' ' + style.menuBtnActive : '')}
                        aria-label="Меню"
                        onClick={() => setDemoMenuOpen(demoMenuOpen ? false : true)}
                    >
                        <span className={style.menuDots}>
                            <img src="/svg/options.svg" alt="" aria-hidden="true" draggable="false" />
                        </span>
                    </button>
                    {demoMenuOpen && (
                        <div className={style.menuPopup}>
                            <button
                                className={style.menuItem}
                                onClick={() => { setDemoMenuOpen(false); alert('Демо: Изменить'); }}
                            >
                                Изменить
                            </button>
                            <div className={style.menuSeparator} />
                            <button
                                className={style.menuItem + ' ' + style.menuDelete}
                                onClick={() => { setDemoMenuOpen(false); alert('Демо: Удалить'); }}
                            >
                                Удалить
                            </button>
                        </div>
                    )}
                </article>
            </div>



            {posters.length === 0 ? (
                <div className={style.nothing}>У вас пока нет объявлений</div>
            ) : (
                <section className={style.cardsGrid}>
                    {posters.map((apt) => {
                            <article key={apt.id} className={cardStyle.card + ' ' + style.myCard} data-title={apt.metro}>
                                <div className={cardStyle.image}>
                                    <img src={apt.imageUrl} alt="Интерьер" draggable="false" />
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
                                        {apt?.beds && (
                                            <span className={cardStyle.beds}>
                                                <img src="/svg/beds.svg" alt="" aria-hidden="true" draggable="false" />
                                                {apt.beds.toString()}
                                            </span>
                                        )}
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