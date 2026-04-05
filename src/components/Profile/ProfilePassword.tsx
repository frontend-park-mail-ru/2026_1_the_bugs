import { useEffect, useState } from '@my-react/hooks';
import style from './ProfilePassword.module.css';
import { authService } from '../../services/auth';
import type { ErrorResponse } from 'src/types/api';
import {
	applyValidationResult,
	validateConfirmPassword,
	validatePassword,
} from '../AuthModal/authValidation';
import { getHighlightStyle } from '../AuthModal/authErrors';

interface ProfilePasswordProps {
	email: string;
}

interface PasswordFormState {
	currentPassword: string;
	newPassword: string;
	confirmPassword: string;
	code: string;
}

type PasswordField = 'currentPassword' | 'newPassword' | 'confirmPassword' | 'code';
type PasswordStep = 'form' | 'verify' | 'success';

const CODE_RESEND_SECONDS = 60;

export function ProfilePassword({ email }: ProfilePasswordProps) {
	const [step, setStep] = useState<PasswordStep>('form');
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [successMessage, setSuccessMessage] = useState<string | null>(null);
	const [tick, setTick] = useState<number>(CODE_RESEND_SECONDS);
	const [isResendActive, setIsResendActive] = useState<boolean>(false);
	const [timerRestartKey, setTimerRestartKey] = useState(0);

	const [showCurrentPassword, setShowCurrentPassword] = useState(false);
	const [showNewPassword, setShowNewPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	const [formData, setFormData] = useState<PasswordFormState>({
		currentPassword: '',
		newPassword: '',
		confirmPassword: '',
		code: '',
	});
	const [fieldHighlights, setFieldHighlights] = useState<Partial<Record<PasswordField, boolean>>>({});

	useEffect(() => {
		if (step !== 'verify') {
			return;
		}

		let currentTick = CODE_RESEND_SECONDS;
		setTick(currentTick);
		setIsResendActive(false);

		const interval = setInterval(() => {
			currentTick -= 1;
			setTick(currentTick);

			if (currentTick <= 0) {
				clearInterval(interval);
				setIsResendActive(true);
			}
		}, 1000);

		return () => clearInterval(interval);
	}, [step, timerRestartKey]);

	const clearFeedback = () => {
		setError(null);
		setSuccessMessage(null);
		setFieldHighlights({});
	};

	const updateField = (field: keyof PasswordFormState, value: string) => {
		setFormData({
			...formData,
			[field]: value,
		});
	};

	const setSingleFieldError = (field: PasswordField, message: string) => {
		setError(message);
		setSuccessMessage(null);
		setFieldHighlights({ [field]: true });
	};

	const handlePasswordFormSubmit = async (event: any) => {
		event.preventDefault();

		if (formData.currentPassword === '') {
			setSingleFieldError('currentPassword', 'Введите текущий пароль');
			return;
		}

		let result = validateConfirmPassword(formData.newPassword, formData.confirmPassword);
		if (!applyValidationResult(result, setError, setFieldHighlights)) return;

		result = validatePassword(formData.newPassword);
		if (!applyValidationResult(result, setError, setFieldHighlights)) return;

		if (formData.currentPassword === formData.newPassword) {
			setError('Новый пароль должен отличаться от текущего');
			setFieldHighlights({ currentPassword: true, newPassword: true });
			return;
		}

		setIsLoading(true);
		clearFeedback();

		try {
			await authService.login({ email, password: formData.currentPassword });
			await authService.sendCode({ email });
			setStep('verify');
			setTimerRestartKey(timerRestartKey + 1);
			setSuccessMessage('Код отправлен на вашу почту');
		} catch (e: any) {
			const err = e as ErrorResponse;
			if (err.status === 400 || err.status === 401) {
				setSingleFieldError('currentPassword', 'Текущий пароль введен неверно');
			} else if (err.status === 429) {
				setError('Слишком много попыток. Попробуйте позже');
				setFieldHighlights({ currentPassword: true });
			} else {
				setError(err?.data?.details || err?.message || 'Не удалось отправить код подтверждения');
			}
		} finally {
			setIsLoading(false);
		}
	};

	const handleVerifyCodeSubmit = async (event: any) => {
		event.preventDefault();

		if (formData.code.trim() === '') {
			setSingleFieldError('code', 'Введите код из письма');
			return;
		}

		setIsLoading(true);
		clearFeedback();

		try {
			await authService.verifyCode(formData.code.trim());
			await authService.resetPwd(formData.newPassword);
			setStep('success');
			setSuccessMessage('Пароль успешно обновлен');
			setFormData({
				currentPassword: '',
				newPassword: '',
				confirmPassword: '',
				code: '',
			});
		} catch (e: any) {
			const err = e as ErrorResponse;
			if (err.status === 429) {
				setError(`Слишком много попыток. Повторите через ${tick} сек.`);
			} else {
				setError('Неверный код подтверждения');
			}
			setFieldHighlights({ code: true });
		} finally {
			setIsLoading(false);
		}
	};

	const handleResendCode = async (event: any) => {
		event.preventDefault();
		if (!isResendActive) return;

		setIsLoading(true);
		clearFeedback();

		try {
			await authService.sendCode({ email });
			setTimerRestartKey(timerRestartKey + 1);
			setSuccessMessage('Код отправлен повторно');
		} catch (e: any) {
			const err = e as ErrorResponse;
			setError(err?.data?.details || err?.message || 'Не удалось отправить код');
		} finally {
			setIsLoading(false);
		}
	};

	const handleInputWithValidation = (field: PasswordField, value: string) => {
		updateField(field as keyof PasswordFormState, value);

		if (field === 'newPassword') {
			const pwdResult = validatePassword(value);
			applyValidationResult(pwdResult, setError, setFieldHighlights);

			if (formData.confirmPassword !== '') {
				const confirmResult = validateConfirmPassword(value, formData.confirmPassword);
				applyValidationResult(confirmResult, setError, setFieldHighlights);
			}
			return;
		}

		if (field === 'confirmPassword') {
			const confirmResult = validateConfirmPassword(formData.newPassword, value);
			applyValidationResult(confirmResult, setError, setFieldHighlights);
			return;
		}

		if (field === 'currentPassword') {
			if (value === '') {
				setSingleFieldError('currentPassword', 'Введите текущий пароль');
				return;
			}
			clearFeedback();
			return;
		}

		if (field === 'code') {
			if (value.trim() === '') {
				setSingleFieldError('code', 'Введите код из письма');
				return;
			}
			clearFeedback();
		}
	};

	if (step === 'success') {
		return (
			<section className={style.form}>
				<p className={style.successText}>{successMessage}</p>
				<button
					type="button"
					className={style.saveBtn}
					onClick={() => {
						clearFeedback();
						setStep('form');
					}}
				>
					Изменить еще раз
				</button>
			</section>
		);
	}

	if (step === 'verify') {
		return (
			<section className={style.form}>
				<p className={style.hint}>Введите код, который отправлен на {email}</p>

				<form onSubmit={handleVerifyCodeSubmit} className={style.formInner}>
					<label htmlFor="confirmCode" className={style.label}>Код из письма:</label>
					<input
						id="confirmCode"
						className={style.input}
						style={getHighlightStyle(fieldHighlights.code)}
						value={formData.code}
						onInput={(e: any) => handleInputWithValidation('code', e.target.value)}
						placeholder="Введите код"
					/>

					<div className={style.messageRow}>
						{error && <span className={style.errorText}>{error}</span>}
						{!error && successMessage && <span className={style.successText}>{successMessage}</span>}
					</div>

					<button type="submit" className={style.saveBtn} disabled={isLoading}>
						{isLoading ? 'Проверка...' : 'Сохранить'}
					</button>
				</form>

				<button
					type="button"
					className={style.secondaryBtn}
					onClick={handleResendCode}
					disabled={!isResendActive || isLoading}
				>
					{isResendActive ? 'Отправить код еще раз' : `Отправить через ${tick} сек.`}
				</button>

				<button
					type="button"
					className={style.secondaryBtn}
					onClick={() => {
						clearFeedback();
						setStep('form');
					}}
					disabled={isLoading}
				>
					Назад
				</button>
			</section>
		);
	}

	return (
		<form className={style.form} onSubmit={handlePasswordFormSubmit}>
			<label htmlFor="currentPassword" className={style.label}>Введите текущий пароль:</label>
			<div className={style.passwordWrapper}>
				<input
					id="currentPassword"
					className={style.input}
					style={getHighlightStyle(fieldHighlights.currentPassword)}
					type={showCurrentPassword ? 'text' : 'password'}
					value={formData.currentPassword}
					onInput={(e: any) => handleInputWithValidation('currentPassword', e.target.value)}
					placeholder="Текущий пароль"
				/>
				<img
					src="/svg/eye.svg"
					alt="Показать пароль"
					className={`${style.eyeIcon} ${showCurrentPassword ? style.eyeIconActive : ''}`}
					draggable="false"
					onMouseDown={(e: any) => e.preventDefault()}
					onClick={(e: any) => {
						e.preventDefault();
						e.stopPropagation();
						setShowCurrentPassword(!showCurrentPassword);
					}}
				/>
			</div>

			<label htmlFor="newPassword" className={style.label}>Введите новый пароль:</label>
			<div className={style.passwordWrapper}>
				<input
					id="newPassword"
					className={style.input}
					style={getHighlightStyle(fieldHighlights.newPassword)}
					type={showNewPassword ? 'text' : 'password'}
					value={formData.newPassword}
					onInput={(e: any) => handleInputWithValidation('newPassword', e.target.value)}
					placeholder="Новый пароль"
				/>
				<img
					src="/svg/eye.svg"
					alt="Показать пароль"
					className={`${style.eyeIcon} ${showNewPassword ? style.eyeIconActive : ''}`}
					draggable="false"
					onMouseDown={(e: any) => e.preventDefault()}
					onClick={(e: any) => {
						e.preventDefault();
						e.stopPropagation();
						setShowNewPassword(!showNewPassword);
					}}
				/>
			</div>

			<label htmlFor="confirmPassword" className={style.label}>Повторите новый пароль:</label>
			<div className={style.passwordWrapper}>
				<input
					id="confirmPassword"
					className={style.input}
					style={getHighlightStyle(fieldHighlights.confirmPassword)}
					type={showConfirmPassword ? 'text' : 'password'}
					value={formData.confirmPassword}
					onInput={(e: any) => handleInputWithValidation('confirmPassword', e.target.value)}
					placeholder="Повторите пароль"
				/>
				<img
					src="/svg/eye.svg"
					alt="Показать пароль"
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

			<div className={style.messageRow}>
				{error && <span className={style.errorText}>{error}</span>}
				{!error && successMessage && <span className={style.successText}>{successMessage}</span>}
			</div>

			<button type="submit" className={style.saveBtn} disabled={isLoading}>
				{isLoading ? 'Отправка...' : 'Сохранить'}
			</button>
		</form>
	);
}
