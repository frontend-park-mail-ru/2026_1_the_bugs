import { useEffect, useState } from 'the-react';
import { useNavigate } from '../../../../src/RouterDOM';
import { apiService } from '../../../../src/services/apiClass';
import { ErrorView } from '../../../../src/components/Errors/Errors';
import type { SupportOrderFull, SupportOrderPhoto } from '../../types/support';
import styles from './AdminAnswer.module.css';
import { authService } from '../../../../src/services/auth';

interface AdminAnswerProps {
    id?: string;
}


function getOrderPhotos(order: SupportOrderFull | null): SupportOrderPhoto[] {
    if (!order) return [];
    const list = order.images || [];
    return [...list].sort((a, b) => a.order - b.order);
}

export function AdminAnswer({ id }: AdminAnswerProps) {
    const navigate = useNavigate();
    const orderId = Number(id);

    const [order, setOrder] = useState<SupportOrderFull | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<unknown | null>(null);
    const [answer, setAnswer] = useState('');
    const [sending, setSending] = useState(false);
    const [sendError, setSendError] = useState<unknown | null>(null);

    useEffect(() => {
        const loadOrder = async () => {
            if (!Number.isFinite(orderId)) {
                setError(new Error('Некорректный номер заявки'));
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const response = await authService.WithRefresh(()=>{
                    const token = apiService.getToken();
                    const res = apiService.get(`/support/orders/${orderId}`, {},   {
                        'Authorization': `Bearer ${token}`,
                        'Accept': 'application/json',
                    });
                    return res
                    }
                );
                const loaded = (response?.order || response) as SupportOrderFull;
                setOrder(loaded  || null);
            } catch (err: unknown) {
                const fallback = null;
                if (fallback) {
                    setOrder(fallback);
                    setError(null);
                    return;
                }

                setError(err);
            } finally {
                setLoading(false);
            }
        };

        loadOrder();
    }, [orderId]);

    const photos = getOrderPhotos(order);
    const formattedDate = (() => {
        if (!order?.created_at) return '';
        const datePart = new Date(order.created_at).toLocaleDateString('ru-RU', {
            day: 'numeric',
            month: 'long',
        });
        const timePart = new Date(order.created_at).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit',
        });

        return `${datePart} в ${timePart}`;
    })();

    const handleSendAnswer = async () => {
        if (!order) return;
        if (!answer.trim()) {
            setSendError(new Error('Введите ответ перед отправкой'));
            return;
        }

        try {
            setSending(true);
            setSendError(null);
            const formData = new FormData();
            formData.append('answer', answer.trim());

            await authService.WithRefresh(async ()=>{
                const token = apiService.getToken();
                const res = await apiService.post(`/support/orders/${order.id}/answer`, 
                    formData, 
                    {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    }); 
                return res
            })

            navigate('/admin');
        } catch (err: unknown) {
            setSendError(err);
        } finally {
            setSending(false);
        }
    };

    return (
        <main className={styles.page}>
            <section className={styles.card} aria-label="Ответ на заявку">
                {loading && <div className={styles.loading}>Загрузка заявки...</div>}
                <ErrorView error={error} fallbackMessage="Ошибка загрузки заявки" className={styles.error} />

                {!loading && !error && order && (
                    <div>
                        <div className={styles.header}>
                            <p className={styles.id}>№{order.id.toString()}</p>
                            <p className={styles.date}>{formattedDate}</p>
                        </div>

                        <h1 className={styles.title}>{order.category_name}</h1>

                        <div className={styles.fieldGroup}>
                            <p className={styles.label}>Сообщение заявителя</p>
                            <div className={styles.readOnlyField}>{order.description}</div>
                        </div>

                        {photos.length > 0 && (
                            <div className={styles.fieldGroup}>
                                <p className={styles.label}>Фото пользователя</p>
                                <div className={styles.photoGrid}>
                                    {photos.map((photo, idx) => (
                                        <a
                                            key={`${photo.img_url}-${idx}`}
                                            href={photo.img_url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className={styles.photoLink}
                                        >
                                            <img className={styles.photo} src={photo.img_url} alt={`Фото ${idx + 1}`} />
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className={styles.fieldGroup}>
                            <label className={styles.label} htmlFor="admin-answer">Ответное сообщение</label>
                            <textarea
                                id="admin-answer"
                                className={styles.textarea}
                                placeholder="Введите ответ пользователю"
                                value={answer}
                                onInput={(e: any) => setAnswer(e.target.value)}
                                disabled={sending}
                            />
                        </div>

                        <ErrorView error={sendError} fallbackMessage="Ошибка отправки ответа" className={styles.error} />

                        <div className={styles.actions}>
                            <button
                                type="button"
                                className={styles.backButton}
                                onClick={() => navigate('/admin')}
                                disabled={sending}
                            >
                                Назад
                            </button>
                            <button
                                type="button"
                                className={styles.submitButton}
                                onClick={handleSendAnswer}
                                disabled={sending || !answer.trim()}
                            >
                                {sending ? 'Отправка...' : 'Отправить'}
                            </button>
                        </div>
                    </div>
                )}
            </section>
        </main>
    );
}
