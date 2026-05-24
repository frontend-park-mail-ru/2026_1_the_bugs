import { useEffect, useState } from 'the-react/hooks';
import style from './Profile.module.css';
import roommateStyle from './ProfileRoommateForm.module.css';
import posterStyles from '../PosterForm/PosterForm.module.css';
import { authService } from '../../services/auth';

type RoommateFormData = {
	birthday: string;
	description: string;
	gender: string;
	tags: string[];
};

type RoommateFormEmptyResponse = {
	details?: string;
	error?: string;
};

const EMPTY_FORM: RoommateFormData = {
	birthday: '',
	description: '',
	gender: '',
	tags: [],
};

const TAG_OPTIONS = [
	{ value: 'no_smoking', label: 'Не курит' },
	{ value: 'no_alcohol', label: 'Не пьет' },
	{ value: 'likes_animals', label: 'Любит животных' },
	{ value: 'early_riser', label: 'Ранний подъем' },
	{ value: 'tidy_lifestyle', label: 'Порядок — образ жизни' },
	{ value: 'no_guests', label: 'Не любит гостей' },
	{ value: 'quiet_roommate', label: 'Тихий сосед' },
	{ value: 'clean_person', label: 'Чистоплотный' },
	{ value: 'calm', label: 'Спокойный' },
	{ value: 'respects_privacy', label: 'Уважает личное пространство' },
];

const GENDER_OPTIONS = [
	{ value: 'male', label: 'Мужской' },
	{ value: 'female', label: 'Женский' },
];

const isRoommateForm = (data: any): data is RoommateFormData => {
	return Boolean(
		data
		&& typeof data === 'object'
		&& typeof data.birthday === 'string'
		&& typeof data.description === 'string'
		&& typeof data.gender === 'string'
	);
};

const isEmptyRoommateForm = (data: any): data is RoommateFormEmptyResponse => {
	return Boolean(data && (typeof data.error === 'string' || typeof data.details === 'string'));
};

export function ProfileRoommateForm() {
	const [birthday, setBirthday] = useState('');
	const [gender, setGender] = useState('');
	const [tags, setTags] = useState<string[]>([]);
	const [description, setDescription] = useState('');
	const [isLoading, setIsLoading] = useState(true);
	const [isSaving, setIsSaving] = useState(false);
	const [isExisting, setIsExisting] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [saveMessage, setSaveMessage] = useState<string | null>(null);
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

	useEffect(() => {
		let isMounted = true;

		const fetchRoommateForm = async () => {
			setIsLoading(true);
			setError(null);
			setSaveMessage(null);
			setFieldErrors({});

			try {
				const response = await authService.getRoommateForm();
				if (!isMounted) return;

				if (isRoommateForm(response)) {
					setBirthday(response.birthday || '');
					setGender(response.gender || '');
					setTags(Array.isArray(response.tags) ? response.tags : []);
					setDescription(response.description || '');
					setIsExisting(true);
					return;
				}

				if (isEmptyRoommateForm(response)) {
					setIsExisting(false);
					setBirthday(EMPTY_FORM.birthday);
					setGender(EMPTY_FORM.gender);
					setTags(EMPTY_FORM.tags);
					setDescription(EMPTY_FORM.description);
					return;
				}

				setIsExisting(false);
			} catch (e: any) {
				if (!isMounted) return;
				if (e?.status === 404) {
					setIsExisting(false);
					setBirthday(EMPTY_FORM.birthday);
					setGender(EMPTY_FORM.gender);
					setTags(EMPTY_FORM.tags);
					setDescription(EMPTY_FORM.description);
					setError(null);
					setFieldErrors({});
					return;
				}
				const message = e?.data?.details || e?.message || 'Не удалось загрузить анкету';
				setError(message);
			} finally {
				if (isMounted) setIsLoading(false);
			}
		};

		fetchRoommateForm();

		return () => {
			isMounted = false;
		};
	}, []);

	const handleTagToggle = (value: string) => {
		const nextTags = tags.includes(value)
			? tags.filter((tag) => tag !== value)
			: [...tags, value];
		setTags(nextTags);
		setError(null);
		setSaveMessage(null);
	};

	const handleDescriptionInput = (event: any) => {
		const nextValue = event.target.value;
		setDescription(nextValue);
		setError(null);
		setSaveMessage(null);
		if (fieldErrors.description) {
			setFieldErrors({ ...fieldErrors, description: '' });
		}
		event.target.style.height = 'auto';
		event.target.style.height = `${event.target.scrollHeight}px`;
	};

	const handleSave = async (event: any) => {
		event.preventDefault();
		setError(null);
		setSaveMessage(null);
		setFieldErrors({});

		const errors: Record<string, string> = {};

		const bday = new Date(birthday);
		const today = new Date();
		const minDate = new Date('1900-01-01');

		if (!birthday) {
			errors.birthday = 'Дата рождения обязательна';
		} else if (bday > today) {
			errors.birthday = 'Дата не может быть позже сегодняшней';
		} else if (bday < minDate) {
			errors.birthday = 'Дата не может быть раньше 1900 года';
		}

		if (!gender) {
			errors.gender = 'Пол нужно выбрать обязательно';
		}

		const trimmedDesc = description.trim();
		if (!trimmedDesc) {
			errors.description = 'Описание не может быть пустым';
		} else if (trimmedDesc.length > 1000) {
			errors.description = 'Описание ограничено 1000 символами';
		}

		if (Object.keys(errors).length > 0) {
			setFieldErrors(errors);
			return;
		}

		setIsSaving(true);
		setError(null);
		setSaveMessage(null);

		const payload: RoommateFormData = {
			birthday,
			description: description.trim(),
			gender,
			tags,
		};

		try {
			if (isExisting) {
				await authService.updateRoommateForm(payload);
				setSaveMessage('Анкета обновлена');
			} else {
				await authService.createRoommateForm(payload);
				setIsExisting(true);
				setSaveMessage('Анкета создана');
			}
		} catch (e: any) {
			const message = e?.data?.details || e?.message || 'Не удалось сохранить анкету';
			setError(message);
		} finally {
			setIsSaving(false);
		}
	};

	return (
		<section>
			{isLoading && <p className={style.status}>Загрузка анкеты...</p>}
			{!isLoading && !error && saveMessage && <p className={style.status}>{saveMessage}</p>}

			<form className={style.profileForm} onSubmit={handleSave}>
				<label className={style.label} htmlFor="roommateBirthday">Дата рождения:</label>
				<div>
					<input
						id="roommateBirthday"
						className={`${style.input} ${fieldErrors.birthday ? posterStyles.inputError : ''}`}
						type="date"
						value={birthday}
						onInput={(e: any) => {
							setBirthday(e.target.value);
							setError(null);
							setSaveMessage(null);
							if (fieldErrors.birthday) setFieldErrors({ ...fieldErrors, birthday: '' });
						}}
					/>
				</div>

				<label className={style.label}>Пол:</label>
				<div className={`${posterStyles.housingTypeGroup} ${fieldErrors.gender ? posterStyles.choiceGroupError : ''}`} role="group" aria-label="Выбор пола">
					{GENDER_OPTIONS.map((option) => {
						const selected = gender === option.value;
						return (
							<button
								key={option.value}
								type="button"
								className={`${roommateStyle.tagButton} ${selected ? roommateStyle.tagButtonActive : ''}`}
								aria-pressed={selected}
								onClick={() => {
									setGender(option.value);
									setError(null);
									setSaveMessage(null);
									if (fieldErrors.gender) setFieldErrors({ ...fieldErrors, gender: '' });
								}}
							>
								{option.label}
							</button>
						);
					})}
				</div>

				<label className={style.label}>Теги:</label>
				<div className={roommateStyle.tagGrid}>
					{TAG_OPTIONS.map((tag) => {
						const selected = tags.includes(tag.value);
						return (
							<button
								key={tag.value}
								type="button"
								className={`${roommateStyle.tagButton} ${selected ? roommateStyle.tagButtonActive : ''}`}
								aria-pressed={selected}
								onClick={() => handleTagToggle(tag.value)}
							>
								{tag.label}
							</button>
						);
					})}
				</div>

				<label className={style.label} htmlFor="roommateDescription">Описание:</label>
				<textarea
					id="roommateDescription"
					className={fieldErrors.description ? `${posterStyles.textarea} ${posterStyles.descTextarea} ${posterStyles.textareaError}` : `${posterStyles.textarea} ${posterStyles.descTextarea}`}
					placeholder="Расскажите о себе и о том, какого соседа вы ищете"
					value={description}
					onFocus={() => {
						if (fieldErrors.description) setFieldErrors({ ...fieldErrors, description: '' });
					}}
					onInput={handleDescriptionInput}
				>
					{description}
				</textarea>

				<div className={style.errorOverlay}>
					{error && <span>{error}</span>}
				</div>

				<div className={posterStyles.nextButtonWrap}>
					<button type="submit" className={style.saveBtn} disabled={isSaving || isLoading}>
						{isSaving ? 'Сохранение...' : isExisting ? 'Сохранить' : 'Создать'}
					</button>
					{Object.keys(fieldErrors).length > 0 && (
						<div className={posterStyles.errorHintWrap}>
							<span className={posterStyles.errorHintIcon} aria-hidden="true">!</span>
							<div className={posterStyles.errorHintPopup}>
								{Object.values(fieldErrors).map((msg, idx) => (
									<div key={`err-${idx}`}>{msg}</div>
								))}
							</div>
						</div>
					)}
				</div>
			</form>
		</section>
	);
}
