import { useEffect, useState } from "the-react/hooks";
import style from './Profile.module.css';
import { authService } from '../../services/auth';
import type { Profile, UserResponse } from '../../types';
import {
    validateName,
    validatePhone,
} from '../AuthModal/authValidation';
import { getHighlightStyle } from '../AuthModal/authErrors';
import { ProfileSetAvatar } from './ProfileSetAvatar';
import { ProfilePassword } from './ProfilePassword';

type ProfileTab = 'main' | 'password';
type ProfileField =
    | 'firstname'
    | 'lastname'
    | 'phone';

interface Prop{
    setCurrentUser: (u: UserResponse)=>void
}

export function Profile({setCurrentUser}: Prop) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState<string | null>(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [phone, setPhone] = useState('');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [avatarCacheBuster, setAvatarCacheBuster] = useState<number | null>(null);
    const [pendingAvatarFile, setPendingAvatarFile] = useState<File | null>(null);
    const [isAvatarEditorOpen, setIsAvatarEditorOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<ProfileTab>('main');
    const [fieldHighlights, setFieldHighlights] = useState<Partial<Record<ProfileField, boolean>>>({});

    useEffect(() => {
        let isMounted = true;

        const fetchProfile = async () => {
            setIsLoading(true);
            setError(null);

            try {
                const response = await authService.getMe();
                if (!isMounted) {
                    return;
                }
                const profileData = response as Profile;
                setProfile(profileData);
                setFirstName(profileData.first_name || '');
                setLastName(profileData.last_name || '');
                setPhone(profileData.phone || '');
            } catch (e: any) {
                if (!isMounted) {
                    return;
                }
                const message = e?.data?.details || e?.message || 'Не удалось загрузить профиль';
                setError(message);
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchProfile();

        return () => {
            isMounted = false;
        };
    }, []);

    useEffect(() => {
        return () => {
            if (avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
            }
        };
    }, [avatarPreview]);

    useEffect(() => {
        setError(null);
        setFieldHighlights({});
    }, [activeTab]);

    const clearValidationState = () => {
        setError(null);
        setFieldHighlights({});
    };

    const setSingleHighlight = (field: ProfileField, message: string | null) => {
        setError(message);
        setFieldHighlights({ [field]: true });
    };

    const handleAvatarInputClick = () => {
        const input = document.getElementById('profileAvatarInput') as HTMLInputElement | null;
        input?.click();
    };

    const resetAvatarInput = () => {
        const input = document.getElementById('profileAvatarInput') as HTMLInputElement | null;
        if (input) {
            input.value = '';
        }
    };

    const handleAvatarChange = (event: any) => {
        const file = event?.target?.files?.[0];
        if (!file) {
            return;
        }
        setPendingAvatarFile(file);
        setIsAvatarEditorOpen(true);
        setError(null);
        setSaveMessage(null);
    };

    const handleAvatarEditorClose = () => {
        setPendingAvatarFile(null);
        setIsAvatarEditorOpen(false);
        resetAvatarInput();
    };

    const handleAvatarApply = (file: File, previewUrl: string) => {
        if (avatarPreview) {
            URL.revokeObjectURL(avatarPreview);
        }

        setAvatarFile(file);
        setAvatarPreview(previewUrl);
        setPendingAvatarFile(null);
        setIsAvatarEditorOpen(false);
        setError(null);
        setSaveMessage(null);
        resetAvatarInput();
    };

    const handleSave = async (event: Event) => {
        event.preventDefault();
        setSaveMessage(null);
        setError(null);

        const currentFirstName = profile?.first_name || '';
        const currentLastName = profile?.last_name || '';
        const currentPhone = profile?.phone || '';

        const isFirstNameChanged = firstName !== currentFirstName;
        const isLastNameChanged = lastName !== currentLastName;
        const isPhoneChanged = phone !== currentPhone;
        const isAvatarChanged = !!avatarFile;

        if (!isFirstNameChanged && !isLastNameChanged && !isPhoneChanged && !isAvatarChanged) {
            setSaveMessage('Изменений нет');
            return;
        }

        if (isFirstNameChanged) {
            const result = validateName(firstName, 'firstname');
            if (!result.isValid) {
                setSingleHighlight('firstname', result.error);
                return;
            }
        }

        if (isLastNameChanged) {
            const result = validateName(lastName, 'lastname');
            if (!result.isValid) {
                setSingleHighlight('lastname', result.error);
                return;
            }
        }

        if (isPhoneChanged) {
            const result = validatePhone(phone);
            if (!result.isValid) {
                setSingleHighlight('phone', result.error);
                return;
            }
        }

        clearValidationState();
        setIsSaving(true);
        const hasAvatarUpload = !!avatarFile;

        const formData = new FormData();

        if (isFirstNameChanged) {
            formData.append('first_name', firstName);
        }

        if (isLastNameChanged) {
            formData.append('last_name', lastName);
        }

        if (isPhoneChanged) {
            formData.append('phone', phone);
        }

        if (avatarFile) {
            formData.append('avatar', avatarFile);
        }

        try {
            await authService.updateMeProfile(formData);
            const updated = await authService.getMe() as Profile;
            const nextAvatarCacheBuster = avatarFile ? Date.now() : avatarCacheBuster;
            setProfile(updated);
            setFirstName(updated.first_name || '');
            setLastName(updated.last_name || '');
            setPhone(updated.phone || '');
            setAvatarCacheBuster(nextAvatarCacheBuster);
            setSaveMessage('Данные профиля сохранены');

            if (!hasAvatarUpload && avatarPreview) {
                URL.revokeObjectURL(avatarPreview);
                setAvatarPreview(null);
            }
            setCurrentUser(updated)

            setAvatarFile(null);
            resetAvatarInput();
        } catch (e: any) {
            const message = e?.data?.details || e?.message || 'Не удалось сохранить профиль';
            setError(message);
        } finally {
            setIsSaving(false);
        }
    };

    const getAvatarSrc = () => {
        if (avatarPreview) {
            return avatarPreview;
        }

        if (!profile?.avatar_url) {
            return '/svg/profile.svg';
        }

        if (!avatarCacheBuster) {
            return profile.avatar_url;
        }

        const separator = profile.avatar_url.includes('?') ? '&' : '?';
        return `${profile.avatar_url}${separator}v=${avatarCacheBuster}`;
    };

    const handleFirstNameInput = (event: any) => {
        const value = event.target.value;
        setFirstName(value);
        const result = validateName(value, 'firstname');
        if (!result.isValid) {
            setSingleHighlight('firstname', result.error);
            return;
        }
        clearValidationState();
    };

    const handleLastNameInput = (event: any) => {
        const value = event.target.value;
        setLastName(value);
        const result = validateName(value, 'lastname');
        if (!result.isValid) {
            setSingleHighlight('lastname', result.error);
            return;
        }
        clearValidationState();
    };

    const handlePhoneInput = (event: any) => {
        const value = event.target.value;
        setPhone(value);
        const result = validatePhone(value);
        if (!result.isValid) {
            setSingleHighlight('phone', result.error);
            return;
        }
        clearValidationState();
    };

    const avatarSrc = getAvatarSrc();
    const fullName = `${profile?.first_name || ''} ${profile?.last_name || ''}`.trim() || 'Пользователь';
    const email = profile?.email || 'Не указан';
    const phoneLink = profile?.phone || '';

    return (
        <section className={style.profilePage}>
            {isLoading && <p className={style.status}>Загрузка профиля...</p>}
            {!isLoading && !error && saveMessage && <p className={style.status}>{saveMessage}</p>}

            <article className={style.profileCard}>
                <div className={style.avatarWrap}>
                    <img key={avatarSrc} className={style.avatar} src={avatarSrc} alt="Аватар пользователя" draggable="false" />
                </div>
                <div className={style.profileMeta}>
                    <h1 className={style.fullName}>{fullName}</h1>
                    <a className={style.contactRow} href={phoneLink ? `tel:${phoneLink}` : '#'}>
                        <img src="/svg/phone.svg" alt="" aria-hidden="true" />
                        <span>{profile?.phone || 'Не указан'}</span>
                    </a>
                    <a className={style.contactRow} href={profile?.email ? `mailto:${email}` : '#'}>
                        <img src="/svg/message.svg" alt="" aria-hidden="true" />
                        <span>{email}</span>
                    </a>
                </div>
            </article>

            <nav className={style.tabs} aria-label="Разделы профиля">
                <button
                    type="button"
                    className={`${style.tab} ${activeTab === 'main' ? style.activeTab : ''}`}
                    onClick={() => setActiveTab('main')}
                >
                    Основное
                </button>
                <span className={style.tabDivider} aria-hidden="true">|</span>
                <button
                    type="button"
                    className={`${style.tab} ${activeTab === 'password' ? style.activeTab : ''}`}
                    onClick={() => setActiveTab('password')}
                >
                    Пароль
                </button>
            </nav>

            {activeTab === 'main' && (
            <form className={style.profileForm} onSubmit={handleSave}>
                <label className={style.label}>Фотография:</label>
                    <button type="button" className={style.ghostAction} onClick={handleAvatarInputClick}>Изменить</button>
                <input
                    id="profileAvatarInput"
                    className={style.fileInput}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                />

                <label htmlFor="lastName" className={style.label}>Фамилия:</label>
                <input
                    id="lastName"
                    className={style.input}
                    style={getHighlightStyle(fieldHighlights.lastname)}
                    value={lastName}
                    onInput={handleLastNameInput}
                />

                <label htmlFor="firstName" className={style.label}>Имя:</label>
                <input
                    id="firstName"
                    className={style.input}
                    style={getHighlightStyle(fieldHighlights.firstname)}
                    value={firstName}
                    onInput={handleFirstNameInput}
                />

                <label htmlFor="phone" className={style.label}>Телефон:</label>
                <input
                    id="phone"
                    className={style.input}
                    style={getHighlightStyle(fieldHighlights.phone)}
                    value={phone}
                    onInput={handlePhoneInput}
                />

                <div className={style.errorOverlay}>
                    {error && <span>{error}</span>}
                </div>

                <button type="submit" className={style.saveBtn} disabled={isSaving || isLoading}>
                    {isSaving ? 'Сохранение...' : 'Сохранить'}
                </button>
            </form>
            )}


            {activeTab === 'password' && (
            <section className={style.profileForm}>
                <ProfilePassword email={email} />
            </section>
            )}

            <ProfileSetAvatar
                isOpen={isAvatarEditorOpen}
                file={pendingAvatarFile}
                onClose={handleAvatarEditorClose}
                onApply={handleAvatarApply}
            />
        </section>
    );
}