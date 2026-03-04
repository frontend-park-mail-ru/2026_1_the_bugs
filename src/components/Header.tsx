interface HeaderProps {
  onProfileClick: () => void;
}

export function Header({ onProfileClick }: HeaderProps) {
  return (
    <header className="header">
      <div className="logo">ДОМДЕЛИ</div>
      <div className="header__actions">

        <button className="icon-button" type="button" aria-label="Сообщение">
          <img src="/svg/message.svg" alt="" aria-hidden="true" />
        </button>
        <button className="icon-button" type="button" aria-label="Избранное">
          <img src="/svg/heart.svg" alt="" aria-hidden="true" />
        </button>
        <button className="icon-button" type="button" id="openAuth" aria-label="Профиль" onClick={onProfileClick}>
          <img src="/svg/profile.svg" alt="" aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}