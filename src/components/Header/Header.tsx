import { useEffect, useState } from '@my-react/hooks';
import { useNavigate } from '@my-react/router-dom/hooks';
import style from './Header.module.css';

interface HeaderProps {
  currentPath: string;
  isAuthResolved: boolean;
  onLogoutClick: () => void;
  onAuthorizeClick: ()=> void;
  isAutenticated: boolean;
}

/** Шапка сайта с логотипом и навигационными действиями; отображает кнопку входа или действия авторизованного пользователя. */
export function Header({ currentPath, isAuthResolved, onLogoutClick, onAuthorizeClick, isAutenticated }: HeaderProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showBtn, setShowBtn] = useState(false);
  const [isBtnVisible, setIsBtnVisible] = useState(false);
  const normalizedPath = currentPath.replace(/\/+$/, '') || '/';
  const isMyPostersRoute = normalizedPath === '/myposters';
  const shouldShowBtn = isAuthResolved && isAutenticated && isMyPostersRoute;

  useEffect(() => {
    setIsMenuOpen(false);
  }, [currentPath]);

  useEffect(() => {
    let showTimer: number | null = null;

    if (shouldShowBtn) {
      setShowBtn(true);
      showTimer = window.setTimeout(() => {
        setIsBtnVisible(true);
      }, 0);
    } else {
      setIsBtnVisible(false);
      setShowBtn(false);
    }

    return () => {
      if (showTimer !== null) {
        clearTimeout(showTimer);
      }
    };
  }, [shouldShowBtn]);

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={style['header']}>
      {isMenuOpen && (
        <div className={style.menuOverlay} onClick={closeMenu} />
      )}
      <button
        className={style['logo']}
        type="button"
        aria-label="Перейти на главную"
        onClick={() => navigate('/')}
      >
        ДОМДЕЛИ
      </button>
        {!isAuthResolved ? (
          <div className={style['actions']} />
        ) : isAutenticated ? (
          <div className={style['actions']}>
            {showBtn && (
              <button
                className={`${style.secondary} ${style.createBtn} ${isBtnVisible ? style.createBtnVisible : style.createBtnHidden}`}
                type="button"
                aria-label="Создать объявление"
                tabIndex={isBtnVisible ? 0 : -1}
                aria-hidden={!isBtnVisible}
                onClick={() => {
                  if (shouldShowBtn) {
                    navigate('/posters/create');
                  }
                }}
              >
                Создать
              </button>
            )}
            {/* <button className={style.btn} type="button" aria-label="Сообщение" onClick={() => navigate('/myposters')}>
              <img src="/svg/message.svg" alt="Сообщение" aria-hidden="true" draggable="false"/>
            </button> */}
            <button className={style.btn} type="button" aria-label="Избранное">
              <img src="/svg/heart.svg" alt="Лайки" aria-hidden="true" draggable="false"/>
            </button>
            {/* <button className={style.btn} type="button" id="openAuth" aria-label="Профиль">
              <img src="/svg/profile.svg" alt="Профиль" aria-hidden="true" draggable="false"/>
            </button>
            <button className={style.btn} type="button" aria-label="Выйти" onClick={onLogoutClick}>
              <img src="/svg/logout.svg" alt="Выйти" aria-hidden="true" draggable="false"/>
            </button> */}
            <div className={style.menuWrap}>
              <button
                className={style.btn + (isMenuOpen ? ' ' + style.menuBtnActive : '')}
                type="button"
                aria-label="Открыть меню"
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
              >
                <img src="/svg/profile.svg" alt="Меню" aria-hidden="true" draggable="false"/>
              </button>
              {isMenuOpen && (
                <div className={style.menuPopup}>
                  <button
                    className={`${style.menuItem} fontHero`}
                    type="button"
                    onClick={() => {
                      closeMenu();
                      navigate('/profile');
                    }}
                  >
                    Мой профиль
                  </button>
                  <div className={style.menuSeparator} />
                  <button
                    className={`${style.menuItem} fontHero`}
                    type="button"
                    onClick={() => {
                      closeMenu();
                      if (!isMyPostersRoute) {
                        navigate('/myposters');
                      }
                    }}
                  >
                    Мои объявления
                  </button>
                  <div className={style.menuSeparator} />
                  <button
                    className={`${style.menuItem} ${style.menuDelete} fontHero`}
                    type="button"
                    onClick={() => {
                      closeMenu();
                      onLogoutClick();
                    }}
                  >
                    Выйти
                  </button>
                </div>
              )}
            </div>

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