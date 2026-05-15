import type { Roommate } from '../../types';
import { Button } from '../Button/Button';
import styles from './UsersPool.module.css';

interface UsersPoolProps {
  users: Roommate[];
  onJoin?: () => void;
  isAuth: boolean;
}

export function UsersPool({ users, onJoin, isAuth }: UsersPoolProps) {
  return (
    <section className={styles['users-pool']}>
      <h3 className={styles['users-pool__title']}>Хотят жить здесь вместе</h3>

      {users.length === 0 ? (
        <p className={styles['users-pool__empty']}>Пока никто не добавил анкету</p>
      ) : (
        <ul className={styles['users-pool__list']}>
          {users.map((user) => {
            const fullName = `${user.firstname} ${user.lastname}`.trim() || 'Пользователь';
            return (
              <li key={user.id} className={styles['users-pool__item']}>
                <img
                  className={styles['users-pool__avatar']}
                  src={user.avatar_url || '/svg/profile.svg'}
                  alt={fullName}
                />
                <span className={styles['users-pool__name']}>{fullName}</span>
              </li>
            );
          })}
        </ul>
      )}

      {isAuth && (
        <Button
          variant="accent"
          className={styles['users-pool__join-btn']}
          onClick={onJoin}
        >
          Добавить свою анкету
        </Button>
      )}
    </section>
  );
}
