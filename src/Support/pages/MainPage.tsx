import { useState } from 'the-react/hooks';
import { Support } from "./Support/Support";
import { SupportRequestPageEntry } from "./SupportRequestPage/SupportRequestPage";
export function HomePage() {
    const [mode, setMode] = useState('main');

    const handleOpenRequest = () => setMode('request');
    const handleBack = () => setMode('main');

    return (
        <main class="support-page">
        <section class="support-card" aria-label="Поддержка">
            {mode === 'main' && <Support onOpenRequest={handleOpenRequest} />}
            {mode === 'request' && <SupportRequestPageEntry onBack={handleBack} />}
        </section>
        </main>
    );
}