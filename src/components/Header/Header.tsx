import { apiService } from '../../services/apiClass';
import { Button } from '../Button/Button';
import style from './Header.module.css';

interface HeaderProps {
  onProfileClick: () => void;
}

export function Header({ onProfileClick }: HeaderProps) {
  return (
    <header className={style['header']}>
      <div className={style['logo']}>ДОМДЕЛИ</div>
      <div className={style['actions']}>

        <button className={style.btn} type="button" aria-label="Сообщение">
          <img src="/svg/message.svg" alt="" aria-hidden="true" draggable="false"/>
        </button>
        <button className={style.btn} type="button" aria-label="Избранное">
          <img src="/svg/heart.svg" alt="" aria-hidden="true" draggable="false"/>
        </button>
        {apiService.isAuthenticated() ? (
          <button className={style.btn} type="button" id="openAuth" aria-label="Профиль" onClick={apiService.removeToken}>
            <img src="/svg/profile.svg" alt="" aria-hidden="true" draggable="false"/>
          </button>
        ) : (
          <button className={style.secondary} type="button" id="openAuth" aria-label="Профиль" onClick={onProfileClick}>
            Войти
          </button>
        )}
        
        
      </div>
    </header>
  );
}