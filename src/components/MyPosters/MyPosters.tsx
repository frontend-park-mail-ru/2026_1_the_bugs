
import { useEffect, useState } from '@my-react/hooks';
import { useNavigate } from '@my-react/router-dom/hooks';
import { getMyPosters } from '../../services/posters';
import { apiService } from '../../services/apiClass';
import type { Apartment } from '../../types';

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
        navigate(`/posters/edit/${encodeURIComponent(alias)}`);
    };

    if (loading) return <div style={{textAlign: 'center', marginTop: 40}}>Загрузка…</div>;
    if (error) return <div style={{textAlign: 'center', color: '#e00', marginTop: 40}}>{error}</div>;

    return (
        <div>
            <h1 style={{textAlign: 'center', margin: '32px 0 24px'}}>Мои объявления</h1>
            {posters.length === 0 ? (
                <div style={{textAlign: 'center', color: '#888', marginTop: 40}}>У вас пока нет объявлений</div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: 24,
                    justifyContent: 'center',
                    margin: '0 auto',
                    maxWidth: 1200
                }}>
                    {posters.map((apt) => (
                        <div key={apt.id} style={{position: 'relative', border: '1px solid #eee', borderRadius: 12, padding: 16, background: '#fff'}}>
                            <div style={{marginBottom: 8, fontWeight: 600}}>{apt.address}</div>
                            <div style={{color: '#888', marginBottom: 8}}>{apt.metro}</div>
                            <div style={{fontWeight: 700, marginBottom: 8}}>{apt.price?.toLocaleString()} ₽</div>
                            <button
                                style={{
                                    position: 'absolute',
                                    top: 16,
                                    right: 16,
                                    background: 'rgba(255,255,255,0.95)',
                                    borderRadius: '50%',
                                    width: 36,
                                    height: 36,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                    border: 'none',
                                    cursor: 'pointer',
                                    zIndex: 2
                                }}
                                aria-label="Меню"
                                onClick={() => setMenuOpen(menuOpen === apt.id ? null : apt.id)}
                            >
                                <span style={{fontSize: 24, fontWeight: 700}}>⋮</span>
                            </button>
                            {menuOpen === apt.id && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: 56,
                                        right: 16,
                                        background: '#fff',
                                        borderRadius: 16,
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                        padding: '12px 0',
                                        minWidth: 140,
                                        zIndex: 10,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'stretch',
                                    }}
                                >
                                    <button
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: '10px 20px',
                                            textAlign: 'left',
                                            fontSize: 15,
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => { setMenuOpen(null); handleEdit(apt.alias); }}
                                    >
                                        Изменить
                                    </button>
                                    <button
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            padding: '10px 20px',
                                            textAlign: 'left',
                                            color: '#e00',
                                            fontSize: 15,
                                            cursor: 'pointer',
                                        }}
                                        onClick={() => { setMenuOpen(null); handleDelete(apt.id); }}
                                    >
                                        Удалить
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}