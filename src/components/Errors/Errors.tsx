import error from "./Errors.module.css";

interface ErrorProps {
  errorMessage: string;
  clearError: () => void;
}

/** Баннер-уведомление об ошибке с кнопкой закрытия. */
export function ErrorsAlert({ errorMessage, clearError }: ErrorProps){
    return (
        <div 
            className={error.banner}
            role="alert"
        >
            <div className={error.icon}>⚠️</div>
            <div className={error.text}>{errorMessage}</div>
            <button 
                className={error.close}
                onClick={clearError}
                aria-label="Закрыть уведомление"
            >
                &times;
            </button>
        </div>
    )
};
