import { SupportRequestPageEntry } from "../components/SupportRequestPage/SupportRequestPage";
export function HomePage() {
    return (
        <main class="support-page">
        <section class="support-card" aria-label="Поддержка">
                <SupportRequestPageEntry />
        </section>
        </main>
    );
}