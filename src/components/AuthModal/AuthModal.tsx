import { useState, useEffect } from '@my-react/hooks';
import style from "./AuthModal.module.css";
import { authService } from '../../services/auth';
import type { ErrorResponse } from 'src/types/api';

/**
 * Props for AuthModal component.
 */
interface AuthModalProps {
    /** Callback when modal is closed */
    onClose: () => void;
    /** Callback when authentication succeeds */
    onSuccess: () => void;
}

/** Available authentication modes */
type AuthMode = 'login' | 'register';

/** Validatable fields for login form */
type LoginField = 'email' | 'password';
/** Validatable fields for register form */
type RegisterField = 'email' | 'password' | 'confirmPassword';
/** Union of all possible form fields */
type AuthField = LoginField | RegisterField;

/** Form state containing all authentication fields */
interface AuthFormState {
    email: string;
    password: string;
    confirmPassword: string;
}

/**
 * Predefined error messages mapped to HTTP status codes.
 */
const ERROR_MESSAGES: Record<number, string> = {
    400: 'Ошибка валидации поля',
    401: 'Введен неверный email или пароль',
    404: 'Пользователь не найден',
    409: 'Пользователь с таким email уже существует',
    429: 'Слишком много попыток. Попробуйте через минуту',
    500: 'Ошибка сервера. Попробуйте позже'
};

/**
 * Fields to highlight on specific error status codes for login.
 */
const LOGIN_ERROR_FIELDS: Partial<Record<number, LoginField[]>> = {
    400: ['email'],
    401: ['email', 'password'],
    404: ['email'],
    409: ['email'],
    429: ['password']
};

/**
 * Retrieves localized error message for given HTTP status.
 * @param status - HTTP status code.
 * @returns Error message or generic fallback.
 */
const getErrorMessage = (status: number): string => 
    ERROR_MESSAGES[status] || 'Что-то пошло не так';

/**
 * Generates inline error highlight styles for form fields.
 * @param isHighlighted - Whether field should be highlighted.
 * @returns CSS style object with red border/shadow or undefined.
 */
const getHighlightStyle = (isHighlighted?: boolean) => 
    isHighlighted ? {
        border: '1px solid #ff4d4f',
        boxShadow: '0 0 0 2px rgba(255, 77, 79, 0.25)'
    } : undefined;

/**
 * Comprehensive authentication modal supporting login/register modes.
 * Features client/server validation, password visibility toggle,
 * comprehensive password rules, and loading states.
 */
export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
    const [mode, setMode] = useState<AuthMode>('login');
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState<AuthFormState>({
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [fieldHighlights, setFieldHighlights] = useState<Partial<Record<AuthField, boolean>>>({});
    const [error, setError] = useState<string | null>(null);
    
    // Password visibility states
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    /**
     * Locks body scroll on mount, resets password visibility, restores on unmount.
     */
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        setShowPassword(false);
        setShowConfirmPassword(false);
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    /**
     * Clears all form feedback (errors, highlights).
     */
    const clearFeedback = () => {
        setError(null);
        setFieldHighlights({});
    };

    /**
     * Updates form field value and clears related feedback.
     */
    const updateField = (field: keyof AuthFormState, value: string) => {
        setFormData({
            ...formData,
            [field]: value
        });
        
        if (fieldHighlights[field]) {
            setFieldHighlights({
                ...fieldHighlights,
                [field]: false
            });
        }
        
        if (error) {
            setError(null);
        }
    };

    /**
     * Switches between login/register modes and resets form.
     */
    const toggleMode = () => {
        clearFeedback();
        setFormData({ email: '', password: '', confirmPassword: '' });
        setShowPassword(false);
        setShowConfirmPassword(false);
        setMode(mode === 'login' ? 'register' : 'login');
    };

    /** Password validation constants */
    const MIN_PWD_LEN = 8;
    const MAX_PWD_LEN = 72;
    const pwdRegexPattern = `^[a-zA-Z\\d!@#$%^&*\\-]{${MIN_PWD_LEN},}$`;

    /**
     * Validates registration form client-side before API submission.
     * Checks password confirmation, length, character requirements, and pattern.
     * @returns true if valid, false if validation failed.
     */
    const validateRegister = (): boolean => {
        if (formData.password !== formData.confirmPassword) {
            setError('Пароли не совпадают!');
            setFieldHighlights({ password: true, confirmPassword: true });
            return false;
        }

        const pwd = formData.password;

        if (pwd.length < MIN_PWD_LEN) {
            setError(`Пароль должен быть минимум ${MIN_PWD_LEN} символов`);
            setFieldHighlights({ password: true, confirmPassword: true });
            return false;
        }
        if (pwd.length > MAX_PWD_LEN) {
            setError(`Пароль слишком длинный (макс. ${MAX_PWD_LEN} символов)`);
            setFieldHighlights({ password: true, confirmPassword: true });
            return false;
        }

        if (!/[A-Z]/.test(pwd)) {
            setError('Пароль должен содержать заглавную букву (A-Z)');
            setFieldHighlights({ password: true, confirmPassword: true });
            return false;
        }

        if (!/[a-z]/.test(pwd)) {
            setError('Пароль должен содержать строчную букву (a-z)');
            setFieldHighlights({ password: true, confirmPassword: true });
            return false;
        }

        if (!/\d/.test(pwd)) {
            setError('Пароль должен содержать цифру (0-9)');
            setFieldHighlights({ password: true, confirmPassword: true });
            return false;
        }

        if (!new RegExp(pwdRegexPattern).test(pwd)) {
            setError('Допустимы только: a-z A-Z 0-9 !@#$%^&*-');
            setFieldHighlights({ password: true, confirmPassword: true });
            return false;
        }

        setError(''); 
        setFieldHighlights({});
        return true;
    };

    /**
     * Handles API authentication errors with field-specific highlighting.
     */
    const handleAuthError = (error: ErrorResponse) => {
        const message = getErrorMessage(error.status);
        setError(message);

        if (error.data?.field) {
            setFieldHighlights({ [error.data.field]: true });
            return;
        }
        const fields = LOGIN_ERROR_FIELDS[error.status];
        if (fields) {
            const highlights: Partial<Record<AuthField, boolean>> = {};
            fields.forEach(f => { highlights[f] = true; });
            setFieldHighlights(highlights);
        }
    };

    /**
     * Handles login form submission.
     */
    const handleLogin = async (e: any) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);
        setFieldHighlights({});

        try {
            await authService.login({
                email: formData.email,
                password: formData.password
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            handleAuthError(error as ErrorResponse);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Handles registration form submission with client validation.
     */
    const handleRegister = async (e: any) => {
        e.preventDefault();
        setError(null);
        setFieldHighlights({});

        if (!validateRegister()) {
            return;
        }

        setIsLoading(true);
        try {
            await authService.register({
                email: formData.email,
                password: formData.password
            });
            onSuccess();
            onClose();
        } catch (error: any) {
            handleAuthError(error as ErrorResponse);
        } finally {
            setIsLoading(false);
        }
    };

    const isLogin = mode === 'login';

    return (
        <div className="modal active">
            <div className="modal-content">
                <button className={style.close} onClick={onClose}>×</button>
                <div>
                    <h2 className={style.title}>
                        {isLogin ? 'Авторизация' : 'Регистрация'}
                    </h2>

                    <form 
                        className={style.form} 
                        onSubmit={isLogin ? handleLogin : handleRegister}
                    >
                        <div className={style.formGroups}>
                            <div className={style.group}>
                                <label htmlFor="email">Email:</label>
                                <input
                                    className="input font2"
                                    style={getHighlightStyle(fieldHighlights.email)}
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="your@email.com"
                                    required
                                    value={formData.email}
                                    onInput={(e: any) => updateField('email', e.target.value)}
                                />
                            </div>

                            <div className={style.group}>
                                <label htmlFor="password">Пароль:</label>
                                <div className={style.passwordWrapper}>
                                    <input
                                        className="input font2"
                                        style={getHighlightStyle(fieldHighlights.password)}
                                        type={showPassword ? "text" : "password"}
                                        id="password"
                                        name="password"
                                        placeholder="Введите пароль"
                                        required
                                        value={formData.password}
                                        onInput={(e: any) => updateField('password', e.target.value)}
                                    />
                                    <img
                                        src="/svg/eye.svg"
                                        alt="show password"
                                        className={`${style.eyeIcon} ${showPassword ? style.eyeIconActive : ''}`}
                                        draggable="false"
                                        onMouseDown={(e: any) => e.preventDefault()}
                                        onClick={(e: any) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setShowPassword(!showPassword);
                                        }}
                                    />
                                </div>
                            </div>

                            {!isLogin && (
                                <div className={style.group}>
                                    <label htmlFor="confirmPassword">Повторите пароль:</label>
                                    <div className={style.passwordWrapper}>
                                        <input
                                            className="input font2"
                                            style={getHighlightStyle(fieldHighlights.confirmPassword)}
                                            type={showConfirmPassword ? "text" : "password"}
                                            id="confirmPassword"
                                            name="confirmPassword"
                                            placeholder="Повторите пароль"
                                            required
                                            value={formData.confirmPassword}
                                            onInput={(e: any) => updateField('confirmPassword', e.target.value)}
                                        />
                                        <img
                                            src="/svg/eye.svg"
                                            alt="show password"
                                            className={`${style.eyeIcon} ${showConfirmPassword ? style.eyeIconActive : ''}`}
                                            draggable="false"
                                            onMouseDown={(e: any) => e.preventDefault()}
                                            onClick={(e: any) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setShowConfirmPassword(!showConfirmPassword);
                                            }}
                                        />
                                    </div>
                                </div>
                            )}
                            
                            <div className={style.errorOverlay}>
                                {error && (<span>{error}</span>)}
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            className={style.primary} 
                            disabled={isLoading}
                        >
                            {isLoading ? 'Загрузка...' : (isLogin ? 'Войти' : 'Создать аккаунт')}
                        </button>
                    </form>

                    <button 
                        className={style.secondary} 
                        onClick={toggleMode} 
                        disabled={isLoading}
                    >
                        {isLogin ? 'Создать аккаунт' : 'Вернуться к входу'}
                    </button>
                </div>
            </div>
        </div>
    );
}
