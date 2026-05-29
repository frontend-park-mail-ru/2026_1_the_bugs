import { useEffect, useState } from 'the-react/hooks';
import type { Roommate, UserResponse } from '../../types';
import type { UserMatchContacts, UserPoolProfile } from '../../types';
import { getUserContactsById, getUserProfileById, removeMeFromPool, sendMatchByUserId } from '../../services/posters';
import { authService } from '../../services/auth';
import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';
import styles from './UsersPool.module.css';
import { useNavigate } from '@router-dom';


interface UsersPoolProps {
  users: Roommate[];
  onJoin?: () => void;
  onPoolRefresh?: () => Promise<void> | void;
  isAuth: boolean;
  user: UserResponse | null
  alias: string
}


export function UsersPool({ users, onJoin, onPoolRefresh, isAuth, user, alias }: UsersPoolProps) {
  const navigate = useNavigate();

  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [selectedUserName, setSelectedUserName] = useState('Пользователь');
  const [selectedUserProfile, setSelectedUserProfile] = useState<UserPoolProfile | null>(null);
  const [contacts, setContacts] = useState<UserMatchContacts | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [isMatchLoading, setIsMatchLoading] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const [hasSentMatch, setHasSentMatch] = useState(false);

  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorModalTitle, setErrorModalTitle] = useState('Ошибка');
  const [errorModalMessage, setErrorModalMessage] = useState('');
  const [isJoinConfirmModalOpen, setIsJoinConfirmModalOpen] = useState(false);
  const [isCheckingProfile, setIsCheckingProfile] = useState(false);
  const [isRemovingProfile, setIsRemovingProfile] = useState(false);
  const [isRemovedFromPool, setIsRemovedFromPool] = useState(false);


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


  const handleOpenUser = async (user: Roommate) => {
    try {
      const form = await authService.getRoommateForm();
      if (form) {
        const fullName = `${user.first_name} ${user.last_name}`.trim() || 'Пользователь';
        setSelectedUserName(fullName);
        setSelectedUserId(user.id);
        setSelectedUserProfile(null);
        setContacts(null);
        setStatusText(null);
        setHasSentMatch(false);
        setIsUserModalOpen(true);
      } else {
        showErrorModal('Анкета не заполнена', 'Сначала заполните вашу анкету в настройках, чтобы добавить её в пул.');
      }
    } catch {
      showErrorModal('Анкета не заполнена', 'Сначала заполните вашу анкету в настройках, чтобы добавить её в пул.');
    }
    
  };


  const handleCloseUserModal = () => {
    setIsUserModalOpen(false);
    setSelectedUserId(null);
    setSelectedUserProfile(null);
    setContacts(null);
    setStatusText(null);
    setHasSentMatch(false);
  };


  const showErrorModal = (title: string, message: string) => {
    setErrorModalTitle(title);
    setErrorModalMessage(message);
    setIsErrorModalOpen(true);
  };


  const handleCloseErrorModal = () => {
    setIsErrorModalOpen(false);
    setSelectedUserId(null);
    setSelectedUserProfile(null);
    setContacts(null);
    setStatusText(null);
    setHasSentMatch(false);
  };


  const handleOpenJoinConfirmModal = async () => {
    if (!isAuth) {
      showErrorModal('Нужно авторизоваться', 'Для добавления анкеты сначала нужно авторизоваться.');
      return;
    }

    setIsCheckingProfile(true);
    try {
      const form = await authService.getRoommateForm();
      if (form) {
        setIsJoinConfirmModalOpen(true);
      } else {
        showErrorModal('Анкета не заполнена', 'Сначала заполните вашу анкету в настройках, чтобы добавить её в пул.');
      }
    } catch {
      showErrorModal('Анкета не заполнена', 'Сначала заполните вашу анкету в настройках, чтобы добавить её в пул.');
    } finally {
      setIsCheckingProfile(false);
    }
  };


  const handleConfirmJoin = () => {
    setIsJoinConfirmModalOpen(false);
    setIsRemovedFromPool(false);
    if (onJoin) {
      onJoin();
    }
  };


  const handleCancelJoin = () => {
    setIsJoinConfirmModalOpen(false);
  };


  const handleGoToSettings = () => {
    setIsErrorModalOpen(false);
    navigate('/profile?form=roomate');
  };


  const handleRemoveFromPool = async () => {
    if (!isAuth) {
      showErrorModal('Нужно авторизоваться', 'Для удаления анкеты сначала нужно авторизоваться.');
      return;
    }

    try {
      setIsRemovingProfile(true);
      await removeMeFromPool(alias);
      setIsRemovedFromPool(true);
      setStatusText(null);
      if (onPoolRefresh) {
        await onPoolRefresh();
      }
    } catch {
      showErrorModal('Ошибка', 'Не удалось удалить вашу анкету из пула.');
    } finally {
      setIsRemovingProfile(false);
    }
  };


  const handleMatch = async () => {
    if (!selectedUserId) {
      return;
    }
    if (!isAuth) {
      showErrorModal('Нужно авторизоваться', 'Для отправки симпатии сначала нужно авторизоваться.');
      return;
    }


    try {
      setIsMatchLoading(true);
      setStatusText(null);
      await sendMatchByUserId(selectedUserId, alias);
      setStatusText('Симпатия отправлена');
      setHasSentMatch(true);


      try {
        const contactsData = await getUserContactsById(selectedUserId);
        setContacts(contactsData);
        setStatusText('Взаимный мэтч! Контакты открыты');
      } catch {
        setContacts(null);
      }
    } catch (err: any) {
      if (err?.status === 409 || err?.response?.status === 409) {
        showErrorModal('Заявка уже отправлена', 'Вы уже отправили заявку этому пользователю.');
      } else {
        showErrorModal('Ошибка', 'Не удалось отправить симпатию.');
      }
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
        const profile = await getUserProfileById(selectedUserId);
        setSelectedUserProfile(profile);
      } catch {
        showErrorModal('Ошибка', 'Не удалось загрузить анкету пользователя.');
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

  const isInclude = users.filter((r) => {
    if (user === null){
      return false
    }
    return r.id === user.id
  }).length !== 0;

  const isInPool = isInclude && !isRemovedFromPool;

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
          onClick={isInPool ? handleRemoveFromPool : handleOpenJoinConfirmModal}
          disabled={isCheckingProfile || isRemovingProfile}
        >
          {isCheckingProfile
            ? 'Проверяем...'
            : isRemovingProfile
              ? 'Удаляем...'
              : isInPool
                ? 'Удалить свою анкету'
                : 'Добавить свою анкету'}
        </Button>
      )}


      {/* Модалка профиля пользователя */}
      <Modal
        isOpen={isUserModalOpen}
        onClose={handleCloseUserModal}
        contentClassName={styles['users-pool__modal-content']}
      >
        <div className={styles['users-pool__profile']}>
          {isProfileLoading ? (
            <p className={styles['users-pool__state']}>Загружаем анкету...</p>
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


              {isAuth && (user && user.id != selectedUserId) && !hasSentMatch && (
                <Button
                  variant="accent"
                  className={styles['users-pool__match-btn']}
                  onClick={handleMatch}
                  disabled={isMatchLoading}
                >
                  {isMatchLoading ? 'Отправляем...' : 'Жить вместе'}
                </Button>
              )}
            </div>
          ) : null}
        </div>
      </Modal>


      {/* Модалка ошибки */}
      <Modal
        isOpen={isErrorModalOpen}
        onClose={handleCloseErrorModal}
        contentClassName={styles['users-pool__modal-content']}
      >
        <div className={styles['users-pool__error-modal']}>
          <h3 className={styles['users-pool__error-modal-title']}>{errorModalTitle}</h3>
          <p className={styles['users-pool__error-modal-text']}>{errorModalMessage}</p>
          {errorModalTitle === 'Анкета не заполнена' ? (
            <div className={styles['users-pool__error-modal-buttons']}>
              <Button variant="accent" onClick={handleGoToSettings}>
                Заполнить анкету
              </Button>
            </div>
          ) : (
            <Button variant="accent" onClick={handleCloseErrorModal}>
              Хорошо
            </Button>
          )}
        </div>
      </Modal>


      {/* Модалка подтверждения добавления анкеты */}
      <Modal
        isOpen={isJoinConfirmModalOpen}
        onClose={handleCancelJoin}
        contentClassName={`${styles['users-pool__modal-content']} ${styles['users-pool__confirm-modal-content']}`}
      >
        <div className={styles['users-pool__confirm-modal']}>
          <h3 className={styles['users-pool__confirm-modal-title']}>Внимание!</h3>
          <p className={styles['users-pool__confirm-modal-text']}>
            Ваша анкета станет видна для всех пользователей.
          </p>
          <div className={styles['users-pool__confirm-modal-buttons']}>
            <Button variant="accent" onClick={handleConfirmJoin}>
              Продолжить
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  );
}