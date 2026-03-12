import style from './Header.module.css';

interface HeaderProps {
  onLogoutClick: () => void;
  onAuthorizeClick: ()=> void;
  isAutenticated: boolean;
}

/** Шапка сайта с логотипом и навигационными действиями; отображает кнопку входа или действия авторизованного пользователя. */
export function Header({ onLogoutClick, onAuthorizeClick, isAutenticated }: HeaderProps) {
  return (
    <header className={style['header']}>
      <div className={style['logo']}>ДОМДЕЛИ</div>
        {isAutenticated ? (
          <div className={style['actions']}>
              <button className={style.btn} type="button" aria-label="Сообщение">
                <img src="/svg/message.svg" alt="" aria-hidden="true" draggable="false"/>
              </button>
              <button className={style.btn} type="button" aria-label="Избранное">
                <img src="/svg/heart.svg" alt="" aria-hidden="true" draggable="false"/>
              </button>
             <button className={style.btn} type="button" id="openAuth" aria-label="Профиль">
              <img src="/svg/profile.svg" alt="" aria-hidden="true" draggable="false"/>
            </button>
            <button className={style.btn} type="button" aria-label="Выйти" onClick={onLogoutClick}>
              <img src="/svg/logout.svg" alt="" aria-hidden="true" draggable="false"/>
            </button>
          </div>
         
        ) : (
          <div className={style['actions']}>
            <button className={style.secondary} type="button" id="openAuth" aria-label="Войти" onClick={onAuthorizeClick}>
              Войти
            </button>
          </div>
        )}
        
        
    </header>
  );
}