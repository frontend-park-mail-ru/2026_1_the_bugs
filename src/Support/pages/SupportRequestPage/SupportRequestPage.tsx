

import { useState, useEffect } from "the-react";
import { apiService } from "../../../services/apiClass";
import { authService } from "../../../services/auth";
import styles from './SupportRequestPage.module.css';
import uploadStyles from './SupportUpload.module.css';


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

export function SupportRequestPageEntry({ onBack }: { onBack: () => void }) {
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
        <div className={styles["support-request-page"]}>
            {iframeWarning && (
                <div style={{background: '#fff3cd', color: '#856404', border: '1px solid #ffeeba', padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 15}}>
                    {iframeWarning}
                </div>
            )}
            <div className={styles["support-request-card"]}>
                <button type="button" onClick={onBack} style={{ marginBottom: 16 }}>Назад</button>
                <h2 className={styles["support-request-title"]}>Новое обращение</h2>
                <form className={styles["support-request-form"]} onSubmit={(e: any) => { e.preventDefault(); handleSend(); }}>
                    <div className={styles["support-request-field"]} style={{ marginBottom: 16 }}>
                        <label htmlFor="support-category" className={styles["support-request-label"]}>
                            Тема обращения
                        </label>
                        <select
                            id="support-category"
                            className={styles["support-request-select"]}
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
                    <textarea
                        className={styles["support-request-textarea"]}
                        value={message}
                        onInput={(e: any) => setMessage(e.target.value)}
                        disabled={loading}
                        placeholder="Опишите вашу проблему..."
                        required
                    />
                    <div
                        className={uploadStyles.uploadBox + (isDragActive ? ' ' + uploadStyles.uploadBoxDragActive : '')}
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className={uploadStyles.uploadControls}>
                            <input
                                type="file"
                                accept="image/jpeg,image/png"
                                multiple
                                className={uploadStyles.fileInput}
                                disabled={loading}
                                onChange={handlePhotoInput}
                            />
                            <label className={uploadStyles.uploadButton}>
                                Загрузить фото
                                <input
                                    type="file"
                                    accept="image/jpeg,image/png"
                                    multiple
                                    className={uploadStyles.fileInput}
                                    disabled={loading}
                                    onChange={handlePhotoInput}
                                />
                            </label>
                            <span className={uploadStyles.uploadHint}>или перетащите JPEG, PNG до 10 Мб</span>
                        </div>
                        {images.length > 0 && (
                            <div className={uploadStyles.photoThumbGrid}>
                                {images.map((img, idx) => (
                                    <div key={img.previewUrl} className={uploadStyles.photoThumb} style={{ position: 'relative' }}>
                                        <img src={img.previewUrl} alt={`preview-${idx}`} />
                                        <div style={{
                                            position: 'absolute',
                                            inset: 0,
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            justifyContent: 'flex-end',
                                            pointerEvents: 'none',
                                        }}>
                                            <button
                                                type="button"
                                                className={uploadStyles.photoRemoveButton}
                                                style={{
                                                    margin: 8,
                                                    position: 'relative',
                                                    zIndex: 2,
                                                    background: '#fff',
                                                    border: 'none',
                                                    borderRadius: '50%',
                                                    width: 28,
                                                    height: 28,
                                                    fontSize: 18,
                                                    fontWeight: 700,
                                                    color: '#111',
                                                    boxShadow: '0 0 8px 0 rgba(0,0,0,0.10)',
                                                    pointerEvents: 'auto',
                                                    cursor: 'pointer',
                                                }}
                                                onClick={() => removePhoto(idx)}
                                                aria-label="Удалить фото"
                                            >
                                            &times;
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={loading || !categoryId || !message.trim()}
                    >
                        {loading ? "Отправка..." : "Отправить"}
                    </button>
                </form>
                {error && <div className={styles["support-request-error"]}>{error}</div>}
                {success && <div className={styles["support-request-success"]}>Обращение отправлено!</div>}
            </div>
        </div>
    );
}