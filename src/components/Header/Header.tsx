import style from './Header.module.css';

interface HeaderProps {
  onProfileClick: () => void;
}

export function Header({ onProfileClick }: HeaderProps) {
  return (
    <header className={style['header']}>
      <div className={style['logo']}>ДОМДЕЛИ</div>
      <div className={style['actions']}>

        <button className={style['btn']} type="button" aria-label="Сообщение">
          <img src="/svg/message.svg" alt="" aria-hidden="true" />
        </button>
        <button className={style['btn']} type="button" aria-label="Избранное">
          <img src="/svg/heart.svg" alt="" aria-hidden="true" />
        </button>
        <button className={style['btn']} type="button" id="openAuth" aria-label="Профиль" onClick={onProfileClick}>
          <img src="/svg/profile.svg" alt="" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}