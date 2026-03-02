interface HeaderProps {
  onProfileClick: () => void;
}

export function Header({ onProfileClick }: HeaderProps) {
  return (
    <div>
    <header className="header">
      <div className="logo">ДОМДЕЛИ</div>
      <div className="header__actions">

        <button class="icon-button" type="button" aria-label="Сообщение">
            <svg viewBox="0 0 24 24">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 14.663 3.04094 17.0829 4.73812 18.875L2.72681 21.1705C2.44361 21.4937 2.67314 22 3.10288 22H12Z"/>
            </svg>
          </button>
          <button class="icon-button" type="button" aria-label="Избранное">
            <svg viewBox="0 0 192 192">
              <path d="M60.732 29.7C41.107 29.7 22 39.7 22 67.41c0 27.29 45.274 67.29 74 94.89 28.744-27.6 74-67.6 74-94.89 0-27.71-19.092-37.71-38.695-37.71C116 29.7 104.325 41.575 96 54.066 87.638 41.516 76 29.7 60.732 29.7z" style="clip-rule:evenodd;display:inline;fill:none;stroke:#000000;stroke-width:14;stroke-linecap:round;stroke-linejoin:round;stroke-miterlimit:2;stroke-dasharray:none;stroke-opacity:1"/>
            </svg>
          </button>
          <button class="icon-button" type="button" id="openAuth" aria-label="Профиль" onClick={onProfileClick}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4zm0 2c-4 0-7 2-7 4.5V20h14v-1.5C19 16 16 14 12 14z"/>
            </svg> 
          </button>
      </div>
    </header>
    </div>
  );
}