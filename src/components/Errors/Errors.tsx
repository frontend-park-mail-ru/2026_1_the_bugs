import error from "./Errors.module.css";

interface ErrorProps {
  errorMessage: string;
  clearError: () => void;
}

interface ErrorViewProps {
    error: unknown;
    fallbackMessage?: string;
    notFoundMessage?: string;
    className?: string;
}

const API_ERROR_TEXT = 'API error';

function extractErrorMessage(err: unknown): string | null {
    if (!err) return null;
    if (typeof err === 'string') return err;

    const typed = err as {
        message?: string;
        data?: { message?: string; details?: string };
    };

    return typed?.data?.details || typed?.data?.message || typed?.message || null;
}

function extractErrorStatus(err: unknown): number | null {
    if (!err || typeof err !== 'object') return null;
    const status = (err as { status?: unknown }).status;
    return typeof status === 'number' ? status : null;
}

function normalizeErrorMessage(err: unknown, fallbackMessage: string, notFoundMessage?: string): string {
    const status = extractErrorStatus(err);
    const message = extractErrorMessage(err);

    if (status === 404 && notFoundMessage) {
        return notFoundMessage;
    }

    if (!message || message.trim().length === 0) {
        return fallbackMessage;
    }

    if (message.trim().toLowerCase() === API_ERROR_TEXT.toLowerCase()) {
        return fallbackMessage;
    }

    return message;
}

/** Баннер-уведомление об ошибке с кнопкой закрытия. */
// export function ErrorsAlert({ errorMessage, clearError }: ErrorProps){
//     return (
//         <div 
//             className={error.banner}
//             role="alert"
//         >
//             <div className={error.icon}>⚠️</div>
//             <div className={error.text}>{errorMessage}</div>
//             <button 
//                 className={error.close}
//                 onClick={clearError}
//                 aria-label="Закрыть уведомление"
//             >
//                 &times;
//             </button>
//         </div>
//     )
// };

/** Унифицированное отображение ошибок API/клиента с нормализацией текста. */
export function ErrorView({
    error: rawError,
    fallbackMessage = 'Что-то пошло не так. Попробуйте позже',
    notFoundMessage,
    className,
}: ErrorViewProps) {
    if (!rawError) return null;

    const message = normalizeErrorMessage(rawError, fallbackMessage, notFoundMessage);

    return (
        <div className={`${error.banner} ${className || ''}`.trim()} role="alert">
            <div className={error.icon}>⚠️</div>
            <div className={error.text}>{message}</div>
        </div>
    );
}
