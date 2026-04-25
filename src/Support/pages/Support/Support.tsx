import { useState } from "the-react";
import styles from "./Support.module.css";

export function Support({ onOpenRequest }: { onOpenRequest: () => void }) {
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [answer, setAnswer] = useState<string | null>(null);

    const handleSend = async () => {
        if (!message.trim()) return;
        setLoading(true);
        setError(null);
        setAnswer(null);
        try {
            const formData = new FormData();
            formData.append("user_prompt", message);
            const res = await fetch("/support/agent-response", {
                method: "POST",
                body: formData,
                credentials: 'include',
            });
            if (!res.ok) throw new Error("Ошибка отправки");
            const data = await res.json();
            setAnswer(data.answer || "Нет ответа от агента.");
            setMessage("");
        } catch (e: any) {
            setError(e.message || "Ошибка");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h1 className="support-kicker">Поддержка</h1>

            <div className="support-brand">ДОМДЕЛИ</div>

            <p className="support-copy">
                Привет! Здесь вы можете задать
                интересующие вопросы.<br />
                Или <a className="support-link" href="#requests">посмотреть ваши обращения</a>
            </p>

                <section className={"support-section " + styles["support-section"]} aria-labelledby="support-topic-title">
                <h2 className="support-question" id="support-topic-title">Опишите вашу проблему</h2>
                <input
                    value={message}
                    onChange={(e: any) => setMessage(e.target.value)}
                    disabled={loading}
                    placeholder="Введите сообщение..."
                    onKeyDown={(e: any) => { if (e.key === 'Enter' && !loading && message.trim()) { e.preventDefault(); handleSend(); } }}
                />
                <button
                    className={styles["support-button"]}
                    style={{ marginTop: 12 }}
                    onClick={handleSend}
                    disabled={loading || !message.trim()}
                >
                    {loading ? "Отправка..." : "Отправить"}
                </button>
                {answer && <div style={{ color: "#222", marginTop: 12, background: "#f6f6f6", borderRadius: 8, padding: 12, border: "1px solid #eee" }}>{answer}</div>}
                {error && <div style={{ color: "red", marginTop: 8 }}>{error}</div>}
            </section>

            <div className="support-footer" id="requests">
                Не получили ответ на свой вопрос?<br />
                <a className="support-footer-link" onClick={onOpenRequest}>Отправьте обращение</a>
            </div>
        </div>
    );
}