import styles from "./Errors.module.css"

interface ErrorProps {
  errorMessage: string;
  clearError: () => void;
}

export function ErrorsAlert({ errorMessage, clearError }: ErrorProps){
    return (
        <div 
            className={ styles.error }
            role="alert"
        >
            <div className={styles.icon}>⚠️</div>
            <div className="error-text">{errorMessage}</div>
            <button 
                className="error-close"
                onClick={clearError}
                aria-label="Закрыть уведомление"
            >
                &times;
            </button>
        </div>
    )
};
