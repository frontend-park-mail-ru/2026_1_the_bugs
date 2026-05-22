import { useEffect, useState } from 'the-react/hooks';
import type { Roommate } from '../../types';
import type { UserMatchContacts, UserPoolProfile } from '../../types';
import { getUserContactsById, getUserProfileById, sendMatchByUserId } from '../../services/posters';
import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';
import styles from './UsersPool.module.css';

interface UsersPoolProps {
  users: Roommate[];
  onJoin?: () => void;
  isAuth: boolean;
}

export function UsersPool({ users, onJoin, isAuth }: UsersPoolProps) {
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState('Пользователь');
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserPoolProfile | null>(null);
  const [contacts, setContacts] = useState<UserMatchContacts | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isMatchLoading, setIsMatchLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);
  const [statusText, setStatusText] = useState<string | null>(null);

  const getAge = (birthday: string) => {
    const date = new Date(birthday);
    if (Number.isNaN(date.getTime())) {
      return null;
    }
    const now = new Date();
    let age = now.getFullYear() - date.getFullYear();
    const monthDiff = now.getMonth() - date.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < date.getDate())) {
      age -= 1;
    }
    return age >= 0 ? age : null;
  };

  const normalizeGender = (gender: string) => {
    const value = gender.toLowerCase();
    if (value === 'male' || value === 'm') {
      return 'муж.';
    }
    if (value === 'female' || value === 'f') {
      return 'жен.';
    }
    return gender;
  };

  const handleOpenUser = (user: Roommate) => {
    const fullName = `${user.first_name} ${user.last_name}`.trim() || 'Пользователь';
    setSelectedUserName(fullName);
    setSelectedUserId(user.id);
    setSelectedUserProfile(null);
    setContacts(null);
    setErrorText(null);
    setStatusText(null);
    setIsUserModalOpen(true);
  };

  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUserId(null);
    setSelectedUserProfile(null);
    setContacts(null);
    setErrorText(null);
    setStatusText(null);
  };

  const handleMatch = async () => {
    if (!selectedUserId) {
      return;
    }
    if (!isAuth) {
      setErrorText('Нужно авторизоваться, чтобы отправить симпатию');
      return;
    }

    try {
      setIsMatchLoading(true);
      setErrorText(null);
      await sendMatchByUserId(selectedUserId);
      setStatusText('Симпатия отправлена');

      try {
        const contactsData = await getUserContactsById(selectedUserId);
        setContacts(contactsData);
        setStatusText('Взаимный мэтч! Контакты открыты');
      } catch {
        setContacts(null);
      }
    } catch {
      setErrorText('Не удалось отправить симпатию');
    } finally {
      setIsMatchLoading(false);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      if (!isUserModalOpen || selectedUserId === null) {
        return;
      }

      try {
        setIsProfileLoading(true);
        setErrorText(null);
        const profile = await getUserProfileById(selectedUserId);
        setSelectedUserProfile(profile);
      } catch {
        setErrorText('Не удалось загрузить анкету пользователя');
      } finally {
        setIsProfileLoading(false);
      }
    };

    loadProfile();
  }, [isUserModalOpen, selectedUserId]);

  const modalFullName = selectedUserProfile
    ? `${selectedUserProfile.first_name} ${selectedUserProfile.last_name}`.trim() || selectedUserName
    : selectedUserName;

  const age = selectedUserProfile?.birthday ? getAge(selectedUserProfile.birthday) : null;
  const gender = selectedUserProfile?.gender ? normalizeGender(selectedUserProfile.gender) : '';

  return (
    <section className={styles['users-pool']}>
      <h3 className={styles['users-pool__title']}>Хотят жить здесь вместе</h3>

      <ul className={styles['users-pool__list']}>
        {users.map((user) => {
          const fullName = `${user.first_name} ${user.last_name}`.trim() || 'Пользователь';
          return (
            <li key={user.id} className={styles['users-pool__item']}>
              <Button
                variant="menu"
                className={styles['users-pool__item-btn']}
                onClick={() => handleOpenUser(user)}
                aria-label={`Открыть анкету: ${fullName}`}
              >
                <img
                  className={styles['users-pool__avatar']}
                  src={user.avatar_url || '/svg/profile.svg'}
                  alt={fullName}
                />
                <span className={styles['users-pool__name']}>{fullName}</span>
              </Button>
            </li>
          );
        })}
      </ul>

      {isAuth && (
        <Button
          variant="accent"
          className={styles['users-pool__join-btn']}
          onClick={onJoin}
        >
          Добавить свою анкету
        </Button>
      )}

      <Modal
        isOpen={isUserModalOpen}
        onClose={handleCloseUserModal}
        contentClassName={styles['users-pool__modal-content']}
      >
        <div className={styles['users-pool__profile']}>
          {isProfileLoading ? (
            <p className={styles['users-pool__state']}>Загружаем анкету...</p>
          ) : errorText ? (
            <p className={styles['users-pool__error']}>{errorText}</p>
          ) : selectedUserProfile ? (
            <div className={styles['users-pool__profile-body']}>
              <div className={styles['users-pool__profile-header']}>
                <img
                  className={styles['users-pool__profile-avatar']}
                  src={selectedUserProfile.avatar_url || '/svg/profile.svg'}
                  alt={modalFullName}
                />

                <div className={styles['users-pool__profile-info']}>
                  <h3 className={styles['users-pool__profile-name']}>{modalFullName}</h3>
                  {(age !== null || gender) && (
                    <p className={styles['users-pool__profile-meta']}>
                      {age !== null ? `${age} ${age % 10 === 1 && age % 100 !== 11 ? 'год' : (age % 10 >= 2 && age % 10 <= 4 && (age % 100 < 10 || age % 100 >= 20) ? 'года' : 'лет')}` : ''}
                      {age !== null && gender ? ', ' : ''}
                      {gender}
                    </p>
                  )}

                  {selectedUserProfile.tags.length > 0 && (
                    <ul className={styles['users-pool__tags']}>
                      {selectedUserProfile.tags.map((tag, index) => (
                        <li key={`${tag.alias}-${index}`} className={styles['users-pool__tag']}>
                          {tag.name}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>

              <p className={styles['users-pool__description']}>
                {selectedUserProfile.description || 'Пользователь пока не добавил описание'}
              </p>

              {contacts && (
                <div className={styles['users-pool__contacts']}>
                  <p className={styles['users-pool__contacts-title']}>Контакты</p>
                  <p className={styles['users-pool__contacts-item']}>Email: {contacts.email}</p>
                  <p className={styles['users-pool__contacts-item']}>Телефон: {contacts.phone}</p>
                </div>
              )}

              {statusText && <p className={styles['users-pool__status']}>{statusText}</p>}

              {isAuth &&<Button
                variant="accent"
                className={styles['users-pool__match-btn']}
                onClick={handleMatch}
                disabled={isMatchLoading}
              >
                {isMatchLoading ? 'Отправляем...' : 'Жить вместе'}
              </Button>}
            </div>
          ) : null}
        </div>
      </Modal>
    </section>
  );
}