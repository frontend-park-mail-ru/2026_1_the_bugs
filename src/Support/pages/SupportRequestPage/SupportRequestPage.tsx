

import { useState, useEffect } from "the-react";
import { apiService } from "../../../services/apiClass";
import { authService } from "../../../services/auth";
import { Button } from '../../../components/Button/Button';
import styles from './SupportRequestPage.module.css';
import posterStyles from '../../../components/PosterForm/PosterForm.module.css';
import errorStyles from '../../../components/Errors/Errors.module.css';


const SUPPORT_CATEGORIES = [
    { id: 1, label: "Публикация объявлений" },
    { id: 2, label: "Поиск и фильтры" },
    { id: 3, label: "Личный кабинет и Аккаунт" },
    { id: 4, label: "Финансы и Платные услуги" },
    { id: 5, label: "Взаимодействие с покупателями" },
    { id: 6, label: "Взаимодействие с арендаторами" },
    { id: 7, label: "Модерация и Безопасность" },
    { id: 8, label: "Технические сбои" },
];

export function SupportRequestPageEntry() {
    // Проверка авторизации и origin для iframe
    const [iframeWarning, setIframeWarning] = useState<string | null>(null);
    useEffect(() => {
        // Проверяем origin
        const parentOrigin = window.parent === window ? window.location.origin : document.referrer.split('/').slice(0, 3).join('/');
        const myOrigin = window.location.origin;
        const token = localStorage.getItem('authToken');
        if (parentOrigin !== myOrigin) {
            setIframeWarning(`ВНИМАНИЕ: origin iframe (${myOrigin}) не совпадает с родителем (${parentOrigin}). Авторизация работать не будет.`);
        } else if (!token) {
            setIframeWarning('ВНИМАНИЕ: Вы не авторизованы. Войдите на основном сайте, затем перезагрузите поддержку.');
        } else {
            setIframeWarning(null);
        }
    }, []);
    // Синхронизация размеров с родителем (iframe)
    useEffect(() => {
        const sendSize = () => {
            const height = document.body.scrollHeight;
            window.parent.postMessage({ type: "support-iframe-resize", height }, "*");
        };
        sendSize();
        window.addEventListener("resize", sendSize);
        return () => window.removeEventListener("resize", sendSize);
    }, []);
    const [categoryId, setCategoryId] = useState<number | "">("");
    const [message, setMessage] = useState("");
    const [images, setImages] = useState<{ file: File; previewUrl: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [isDragActive, setIsDragActive] = useState(false);

    const openPhotoDialog = () => {
        const input = document.getElementById('support-photo-upload') as HTMLInputElement | null;
        input?.click();
    };

    // Добавление файлов
    const appendPhotos = (files: File[]) => {
        const valid = files.filter(f => (f.type === 'image/jpeg' || f.type === 'image/png') && f.size <= 10 * 1024 * 1024);
        if (!valid.length) return;
        const uploaded = valid.map(file => ({ file, previewUrl: URL.createObjectURL(file) }));
        setImages(images.concat(uploaded));
    };

    // input[type=file]
    const handlePhotoInput = (e: any) => {
        const files = Array.from(e.target.files || []) as File[];
        appendPhotos(files);
        e.target.value = '';
    };

    // Drag & drop
    const handleDragEnter = (e: any) => { e.preventDefault(); setIsDragActive(true); };
    const handleDragOver = (e: any) => { e.preventDefault(); setIsDragActive(true); };
    const handleDragLeave = (e: any) => { e.preventDefault(); setIsDragActive(false); };
    const handleDrop = (e: any) => {
        e.preventDefault(); setIsDragActive(false);
        const files = Array.from(e.dataTransfer?.files || []) as File[];
        appendPhotos(files);
    };

    // Удаление фото
    const removePhoto = (index: number) => {
        setImages(images.filter((_, i) => i !== index));
    };

    // Отправка
    const handleSend = async () => {
        if (!categoryId || !message.trim()) {
            setError("Выберите тему и опишите проблему");
            return;
        }
        if (!images.length) {
            setError("Добавьте хотя бы один скриншот");
            return;
        }
        setLoading(true);
        setError(null);
        setSuccess(false);
        const formData = new FormData();
        formData.append("category_id", String(categoryId));
        formData.append("description", message);
        images.forEach(({ file }, idx) => {
            formData.append(`photos.${idx}.file`, file);
            formData.append(`photos.${idx}.order`, String(idx));
        });
        try {
            await authService.WithRefresh(async () => {
                    const token = apiService.getToken();
            
                    await apiService.post(
                        '/support/orders',
                        formData,
                        {
                            'Authorization': `Bearer ${token}`,
                            'Accept': 'application/json',
                        },
                    );
            });
            setSuccess(true);
            setMessage("");
            setImages([]);
            setCategoryId("");
        } catch (e: any) {
            if (e.status === 401) {
                setError("Авторизация истекла. Войдите заново.");
                return;
            }
            setError(e.message || "Ошибка");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className={styles.supportRequestPage}>
            {iframeWarning && (
                <div className={`${errorStyles.banner} ${errorStyles.show} ${styles.banner}`}>
                    <span className={errorStyles.icon}>!</span>
                    <div className={errorStyles.text}>{iframeWarning}</div>
                </div>
            )}
            <div className={styles.headerRow}>
                <h2 className={`fontHero ${styles.title}`}>Поддержка</h2>
            </div>

            <form className={styles.form} onSubmit={(e: any) => { e.preventDefault(); handleSend(); }}>
                <div className={styles.section}>
                    <div className={posterStyles.group}>
                        <label htmlFor="support-category" className={`fontHero ${posterStyles.label}`}>Тема обращения</label>
                        <select
                            id="support-category"
                            className={`fontHero ${posterStyles.select} ${styles.field}`}
                            value={categoryId}
                            onChange={(e: any) => setCategoryId(e.target.value ? Number(e.target.value) : "")}
                            disabled={loading}
                            required
                        >
                            <option value="">Выберите тему...</option>
                            {SUPPORT_CATEGORIES.map(cat => (
                                <option key={cat.id} value={cat.id}>{cat.label}</option>
                            ))}
                        </select>
                    </div>

                    <div className={posterStyles.group}>
                        <label htmlFor="support-message" className={`fontHero ${posterStyles.label}`}>Описание проблемы</label>
                        <textarea
                            id="support-message"
                            className={`fontHero ${posterStyles.textarea} ${styles.messageField}`}
                            value={message}
                            onInput={(e: any) => setMessage(e.target.value)}
                            disabled={loading}
                            placeholder="Расскажите, что произошло, на каком шаге возникла проблема и что вы ожидали увидеть"
                            required
                        />
                    </div>
                </div>

                <div className={styles.section}>
                    <h3 className={`fontHero ${posterStyles.sectionTitle}`}>Скриншоты</h3>
                    <div
                        className={`${posterStyles.uploadBox} ${styles.uploadBox} ${isDragActive ? posterStyles.uploadBoxDragActive : ''}`}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className={`${posterStyles.uploadControls} ${styles.uploadControls}`}>
                            <input
                                id="support-photo-upload"
                                type="file"
                                accept="image/jpeg,image/png"
                                multiple
                                className={posterStyles.fileInput}
                                disabled={loading}
                                onChange={handlePhotoInput}
                            />
                            <button
                                type="button"
                                className={posterStyles.uploadButton}
                                onClick={openPhotoDialog}
                            >
                                Загрузите фото
                            </button>
                            <span className={`fontHero ${posterStyles.uploadHint}`}>или перетащите JPEG, PNG до 10 МБ каждый</span>
                        </div>

                        {images.length > 0 && (
                            <div className={posterStyles.photoThumbGrid}>
                                {images.map((img, idx) => (
                                    <div key={img.previewUrl} className={posterStyles.photoThumb}>
                                        <div className={posterStyles.photoOverlay}>
                                            <span className={posterStyles.photoOverlayText}>Снимок #{idx + 1}</span>
                                            <button
                                                type="button"
                                                className={posterStyles.photoRemoveButton}
                                                onClick={() => removePhoto(idx)}
                                                aria-label="Удалить фото"
                                            >
                                                x
                                            </button>
                                        </div>
                                        <img src={img.previewUrl} alt={`preview-${idx}`} draggable="false" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.actions}>
                    <Button
                        type="submit"
                        variant="accent"
                        className={`${posterStyles.button} ${posterStyles.buttonPrimary} ${styles.actionButton}`}
                        disabled={loading || !categoryId || !message.trim() || !images.length}
                    >
                        {loading ? "Отправка..." : "Отправить"}
                    </Button>
                </div>
            </form>

            {error && (
                <div className={`${errorStyles.banner} ${errorStyles.show} ${styles.banner}`}>
                    <span className={errorStyles.icon}>!</span>
                    <div className={errorStyles.text}>{error}</div>
                </div>
            )}
            {success && (
                <div className={`fontHero ${styles.successMessage}`}>Обращение отправлено.</div>
            )}
        </section>
    );
}