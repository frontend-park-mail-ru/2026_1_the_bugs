import { useEffect, useState } from 'the-react/hooks';
import style from './Friends.module.css';
import usersPoolStyle from '../UsersPool/UsersPool.module.css';
import type { Roommate, UserMatchContacts, UserPoolProfile } from '../../types';
import { getIncomingRoommateRequests, getMatchedRoommates, removeRoommateMatchByUserId } from '../../services/roommateMatches';
import { getUserContactsById, getUserProfileById, sendMatchByUserId } from '../../services/posters';
import { Button } from '../Button/Button';
import { Modal } from '../Modal/Modal';
import { useNavigate } from '@router-dom';



type FriendsTab = 'friends' | 'requests';

const getInitialTab = (): FriendsTab => {
    const params = new URLSearchParams(window.location.search);
    return params.get('tab') === 'requests' ? 'requests' : 'friends';
};

function normalizeRequestsCount(count: number): string {
  if (count >= 10) return '9+';
  return count.toString();
}

interface FriendsProps {
    requestsCount: number;
}



export function FriendsPage({ requestsCount }: FriendsProps) {
    const [activeTab, setActiveTab] = useState<FriendsTab>(getInitialTab());
    const [friends, setFriends] = useState<Roommate[]>([]);
    const [requests, setRequests] = useState<Roommate[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
    const [selectedUserName, setSelectedUserName] = useState('Пользователь');
    const [selectedUserProfile, setSelectedUserProfile] = useState<UserPoolProfile | null>(null);
    const [contacts, setContacts] = useState<UserMatchContacts | null>(null);
    const [isProfileLoading, setIsProfileLoading] = useState(false);
    const [isMatchLoading, setIsMatchLoading] = useState(false);
    const [errorText, setErrorText] = useState<string | null>(null);
    const [statusText, setStatusText] = useState<string | null>(null);
    const isAuth = true;
    const navigate = useNavigate();


    // Флаг: является ли выбранный пользователь уже другом
    const [isSelectedUserFriend, setIsSelectedUserFriend] = useState(false);
    // poster_alias выбранного друга (для перехода к объявлению)
    const [selectedPosterAlias, setSelectedPosterAlias] = useState<string | null>(null);



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

        const isFriend = friends.some(f => f.id === user.id);
        setIsSelectedUserFriend(isFriend);
        setSelectedPosterAlias(isFriend ? (user.poster_alias ?? null) : null);

        setIsUserModalOpen(true);
    };



    const handleCloseUserModal = () => {
        setIsUserModalOpen(false);
        setSelectedUserId(null);
        setSelectedUserProfile(null);
        setContacts(null);
        setErrorText(null);
        setStatusText(null);
        setIsSelectedUserFriend(false);
        setSelectedPosterAlias(null);
    };



    const setTab = (tab: FriendsTab) => {
        setActiveTab(tab);
        const params = new URLSearchParams(window.location.search);
        if (tab === 'requests') {
            params.set('tab', 'requests');
        } else {
            params.delete('tab');
        }
        const search = params.toString();
        const nextUrl = `${window.location.pathname}${search ? `?${search}` : ''}${window.location.hash}`;
        window.history.replaceState(null, '', nextUrl);
    };

    const handleRemoveFriend = async (userId: number) => {
        try {
            setErrorText(null);
            await removeRoommateMatchByUserId(userId);
            if (activeTab === 'requests') {
                setRequests(requests.filter((request) => request.id !== userId));
            } else {    
                setFriends(friends.filter((friend) => friend.id !== userId));
            }

            if (selectedUserId === userId) {
                handleCloseUserModal();
            }
        } catch {
            setErrorText('Не удалось удалить пользователя из друзей');
        }
    };



const handleMatch = async () => {
    if (!selectedUserId) {
        return;
    }
    if (!isAuth) {
        setErrorText('Нужно авторизоваться, чтобы отправить симпатию');
        return;
    }

    const requestUser = requests.find(r => r.id === selectedUserId);

    try {
        setIsMatchLoading(true);
        setErrorText(null);
        await sendMatchByUserId(selectedUserId, null);
        //setStatusText('Симпатия отправлена');

        try {
            const contactsData = await getUserContactsById(selectedUserId);
            setContacts(contactsData);
            //setStatusText('Взаимный мэтч! Контакты открыты');
        } catch {
            setContacts(null);
        }
        const newUserRoommate: Roommate = {
            id: selectedUserId,
            first_name: selectedUserProfile?.first_name || requestUser?.first_name || selectedUserName.split(' ')[0],
            last_name: selectedUserProfile?.last_name || requestUser?.last_name || '',
            avatar_url: selectedUserProfile?.avatar_url || requestUser?.avatar_url || '/svg/profile.svg',
            poster_alias: requestUser?.poster_alias,
        };

        const exists = friends.some(f => f.id === selectedUserId);
        if (!exists) {
            setFriends([...friends, newUserRoommate]);
        }
        setRequests(requests.filter(r => r.id !== selectedUserId));

        setIsSelectedUserFriend(true);
        setSelectedPosterAlias(newUserRoommate.poster_alias ?? null);
    } catch {
        setErrorText('Не удалось отправить симпатию');
    } finally {
        setIsMatchLoading(false);
    }
};


    useEffect(() => {
        let isMounted = true;



        const loadMatches = async () => {
            try {
                setIsLoading(true);
                setError(null);



                const [friendsResp, requestsResp] = await Promise.all([
                    getMatchedRoommates(),
                    getIncomingRoommateRequests(),
                ]);



                if (!isMounted) {
                    return;
                }



                setFriends(Array.isArray(friendsResp.users) ? friendsResp.users : []);
                setRequests(Array.isArray(requestsResp.users) ? requestsResp.users : []);
            } catch {
                if (!isMounted) {
                    return;
                }
                setError('Не удалось загрузить списки');
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };



        loadMatches();



        return () => {
            isMounted = false;
        };
    }, []);



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


                // Если пользователь уже в друзьях, сразу загружаем контакты
                if (isSelectedUserFriend) {
                    try {
                        const contactsData = await getUserContactsById(selectedUserId);
                        setContacts(contactsData);
                    } catch {
                        setContacts(null);
                    }
                } else {
                    setContacts(null);
                }
            } catch {
                setErrorText('Не удалось загрузить анкету пользователя');
            } finally {
                setIsProfileLoading(false);
            }
        };



        loadProfile();
    }, [isUserModalOpen, selectedUserId, isSelectedUserFriend]);



    const renderList = (users: Roommate[], emptyText: string) => {
        if ( isLoading) {
            return <p className={style.status}>Загружаем...</p>;
        }



        if (error) {
            return <p className={style.status}>{error}</p>;
        }

        const usersToRender =  users;



        if (usersToRender.length === 0) {
            return <p className={style.placeholder}>{emptyText}</p>;
        }



        return (
            <ul className={style.list}>
                {usersToRender.map((user) => {
                    const fullName = `${user.first_name} ${user.last_name}`.trim() || 'Пользователь';
                    return (
                        <li key={user.id} className={style.item}>
                            <Button
                                variant="menu"
                                className={style.card}
                                onClick={() => handleOpenUser(user)}
                                aria-label={`Открыть анкету: ${fullName}`}
                            >
                                <img
                                    className={style.avatar}
                                    src={user.avatar_url || '/svg/profile.svg'}
                                    alt={fullName}
                                    draggable="false"
                                />
                                <span className={style.name}>{fullName}</span>
                            </Button>
                                <button
                                    type="button"
                                    className={style.removeBtn}
                                    onClick={async (event: MouseEvent) => {
                                        event.stopPropagation();
                                        await handleRemoveFriend(user.id);
                                    }}
                                    aria-label={`Удалить из друзей: ${fullName}`}
                                    title="Удалить из друзей"
                                >
                                    &times;
                                </button>
                        </li>
                    );
                })}
            </ul>
        );
    };



    const modalFullName = selectedUserProfile
        ? `${selectedUserProfile.first_name} ${selectedUserProfile.last_name}`.trim() || selectedUserName
        : selectedUserName;



    const age = selectedUserProfile?.birthday ? getAge(selectedUserProfile.birthday) : null;
    const gender = selectedUserProfile?.gender ? normalizeGender(selectedUserProfile.gender) : '';


    return (
        <section className={style.page}>
            <header className={style.head}>
                <h1 className={style.main}>Сожители</h1>
                <p className={style.subtitle}>Общайтесь и планируйте сожительство.</p>
            </header>



            <nav className={style.tabs} aria-label="Разделы друзей">
                <button
                    type="button"
                    className={`${style.tab} ${activeTab === 'friends' ? style.activeTab : ''}`}
                    onClick={() => setTab('friends')}
                >
                    Активные
                </button>
                <span className={style.tabDivider} aria-hidden="true">|</span>
                <div className='menuItemWithBadge'>
                      <button
                    type="button"
                    className={`${style.tab} ${activeTab === 'requests' ? style.activeTab : ''}`}
                    onClick={() => setTab('requests')}
                >
                    Заявки
                </button>
                {requestsCount > 0  && <span className='badge' style={{'top': '-7px', 'right':' -15px'}}>{normalizeRequestsCount(requestsCount)}</span>}
                </div>
              
            </nav>



            {activeTab === 'friends' && (
                <section className={style.section}>
                    {renderList(friends, 'Вы пока не добавили ни одного друга')}
                </section>
            )}



            {activeTab === 'requests' && (
                <section className={style.section}>
                    {renderList(requests, 'У вас нет заявок')}
                </section>
            )}



            <Modal
                isOpen={isUserModalOpen}
                onClose={handleCloseUserModal}
                contentClassName={usersPoolStyle['users-pool__modal-content']}
            >
                <div className={usersPoolStyle['users-pool__profile']}>
                    {isProfileLoading ? (
                        <p className={usersPoolStyle['users-pool__state']}>Загружаем анкету...</p>
                    ) : errorText ? (
                        <p className={usersPoolStyle['users-pool__error']}>{errorText}</p>
                    ) : selectedUserProfile ? (
                        <div className={usersPoolStyle['users-pool__profile-body']}>
                            <div className={usersPoolStyle['users-pool__profile-header']}>
                                <img
                                    className={usersPoolStyle['users-pool__profile-avatar']}
                                    src={selectedUserProfile.avatar_url || '/svg/profile.svg'}
                                    alt={modalFullName}
                                />



                                <div className={usersPoolStyle['users-pool__profile-info']}>
                                    <h3 className={usersPoolStyle['users-pool__profile-name']}>{modalFullName}</h3>
                                    {(age !== null || gender) && (
                                        <p className={usersPoolStyle['users-pool__profile-meta']}>
                                            {age !== null ? `${age} ${age % 10 === 1 && age % 100 !== 11 ? 'год' : (age % 10 >= 2 && age % 10 <= 4 && (age % 100 < 10 || age % 100 >= 20) ? 'года' : 'лет')}` : ''}
                                            {age !== null && gender ? ', ' : ''}
                                            {gender}
                                        </p>
                                    )}



                                    {selectedUserProfile.tags.length > 0 && (
                                        <ul className={usersPoolStyle['users-pool__tags']}>
                                            {selectedUserProfile.tags.map((tag, index) => (
                                                <li key={`${tag.alias}-${index}`} className={usersPoolStyle['users-pool__tag']}>
                                                    {tag.name}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                </div>
                            </div>



                            <p className={usersPoolStyle['users-pool__description']}>
                                {selectedUserProfile.description || 'Пользователь пока не добавил описание'}
                            </p>



                            {contacts && (
                                <div className={usersPoolStyle['users-pool__contacts']}>
                                    <p className={usersPoolStyle['users-pool__contacts-title']}>Контакты</p>
                                    <p className={usersPoolStyle['users-pool__contacts-item']}>Email: {contacts.email}</p>
                                    <p className={usersPoolStyle['users-pool__contacts-item']}>Телефон: {contacts.phone}</p>
                                </div>
                            )}



                            {statusText && <p className={usersPoolStyle['users-pool__status']}>{statusText}</p>}


                            {isAuth && !isSelectedUserFriend && (
                                <Button
                                    variant="accent"
                                    className={usersPoolStyle['users-pool__match-btn']}
                                    onClick={handleMatch}
                                    disabled={isMatchLoading}
                                >
                                    {isMatchLoading ? 'Отправляем...' : 'Жить вместе'}
                                </Button>
                            )}

                            {isAuth && isSelectedUserFriend && selectedPosterAlias && (
                                <Button
                                    variant="accent"
                                    className={usersPoolStyle['users-pool__match-btn']}
                                    onClick={() => navigate(`/posters/${selectedPosterAlias}`)}
                                    disabled={isMatchLoading}
                                >
                                    К объявлению
                                </Button>
                            )}
                        </div>
                    ) : null}
                </div>
            </Modal>
        </section>
    );
}