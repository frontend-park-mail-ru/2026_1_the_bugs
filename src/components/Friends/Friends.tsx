import { useEffect, useState } from 'the-react/hooks';
import style from './Friends.module.css';
import type { Roommate } from '../../types';
import { getIncomingRoommateRequests, getMatchedRoommates } from '../../services/roommateMatches';

type FriendsTab = 'friends' | 'requests';

export function FriendsPage() {
	const [activeTab, setActiveTab] = useState<FriendsTab>('friends');
	const [friends, setFriends] = useState<Roommate[]>([]);
	const [requests, setRequests] = useState<Roommate[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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

	const renderList = (users: Roommate[], emptyText: string) => {
		if (isLoading) {
			return <p className={style.status}>Загружаем...</p>;
		}

		if (error) {
			return <p className={style.status}>{error}</p>;
		}

		if (users.length === 0) {
			return <p className={style.placeholder}>{emptyText}</p>;
		}

		return (
			<ul className={style.list}>
				{users.map((user) => {
					const fullName = `${user.first_name} ${user.last_name}`.trim() || 'Пользователь';
					return (
						<li key={user.id} className={style.item}>
							<div className={style.card}>
								<img
									className={style.avatar}
									src={user.avatar_url || '/svg/profile.svg'}
									alt={fullName}
									draggable="false"
								/>
								<span className={style.name}>{fullName}</span>
							</div>
						</li>
					);
				})}
			</ul>
		);
	};

	return (
		<section className={style.page}>
			<header className={style.head}>
				<h1 className={style.title}>Друзья</h1>
				<p className={style.subtitle}>Следите за друзьями и заявками на совместное проживание.</p>
			</header>

			<nav className={style.tabs} aria-label="Разделы друзей">
				<button
					type="button"
					className={`${style.tab} ${activeTab === 'friends' ? style.activeTab : ''}`}
					onClick={() => setActiveTab('friends')}
				>
					Друзья
				</button>
				<span className={style.tabDivider} aria-hidden="true">|</span>
				<button
					type="button"
					className={`${style.tab} ${activeTab === 'requests' ? style.activeTab : ''}`}
					onClick={() => setActiveTab('requests')}
				>
					Заявки
				</button>
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
		</section>
	);
}
