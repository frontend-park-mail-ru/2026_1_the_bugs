// import style from "./Layout.module.css"

export function HomePage() {
    const closeButton = document.querySelector('.support-close');
    const tags = document.querySelectorAll('.support-tag');

    closeButton?.addEventListener('click', () => {
    window.parent?.postMessage({ type: 'support-close' }, '*');
    });

    tags.forEach((tag) => {
        tag.addEventListener('click', () => {
            tags.forEach((item) => item.classList.remove('is-active'));
            tag.classList.add('is-active');
        });
    });
    return (
        <main class="support-page">
        <section class="support-card" aria-label="Поддержка">

            <h1 class="support-kicker">Поддержка</h1>

            <div class="support-brand">ДОМДЕЛИ</div>

            <p class="support-copy">
            Привет! Здесь вы можете задать
            интересующие вопросы.<br />
            Или <a class="support-link" href="#requests">посмотреть ваши обращения</a>
            </p>

            <section class="support-section" aria-labelledby="support-topic-title">
            <h2 class="support-question" id="support-topic-title">Опишите вашу проблему</h2>
            <input></input>
            </section>

            <div class="support-footer" id="requests">
            Не получили ответ на свой вопрос?<br />
            <a class="support-footer-link" href="#">Отправьте обращение</a>
            </div>
        </section>
        </main>
    );
}