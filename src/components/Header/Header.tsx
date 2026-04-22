import { useEffect, useState } from 'the-react/hooks';
import { useNavigate } from '@router-dom';
import style from './Header.module.css';
import type { UserResponse } from 'src/types';
import { Button } from '../Button/Button';

interface HeaderProps {
  currentPath: string;
  isAuthResolved: boolean;
  onLogoutClick: () => void;
  onAuthorizeClick: ()=> void;
  isAutenticated: boolean;
  currentUser?: UserResponse | null;
}

/** Шапка сайта с логотипом и навигационными действиями; отображает кнопку входа или действия авторизованного пользователя. */
export function Header({ currentPath, isAuthResolved, onLogoutClick, onAuthorizeClick, isAutenticated, currentUser }: HeaderProps) {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const normalizedPath = currentPath.replace(/\/+$/, '') || '/';
  const isMyPostersRoute = normalizedPath === '/myposters';

  useEffect(() => {
    setIsMenuOpen(false);
  }, [currentPath]);

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
            {/* <Button className={style.btn} type="button" aria-label="Сообщение" onClick={() => navigate('/myposters')}>
              <img src="/svg/message.svg" alt="Сообщение" aria-hidden="true" draggable="false"/>
            </Button> */}
            <Button variant='primary' shape="round" type="button" aria-label="Избранное" onClick={() => navigate('/profile/likes')}>
              <img src="/svg/heart.svg" alt="Лайки" aria-hidden="true" draggable="false"/>
            </Button>
            {/* <Button className={style.btn} type="button" id="openAuth" aria-label="Профиль">
              <img src="/svg/profile.svg" alt="Профиль" aria-hidden="true" draggable="false"/>
            </Button>
            <Button className={style.btn} type="button" aria-label="Выйти" onClick={onLogoutClick}>
              <img src="/svg/logout.svg" alt="Выйти" aria-hidden="true" draggable="false"/>
            </Button> */}
            <div className={style.menuWrap}>
              <Button
                variant='primary'
                shape="round"
                className={isMenuOpen ? style.menuBtnActive : ''}
                type="button"
                aria-label="Открыть меню"
                onClick={(e: MouseEvent) => {
                  e.stopPropagation();
                  setIsMenuOpen(!isMenuOpen);
                }}
              >
                {currentUser?.avatar_url ? (
                  <img className={style.avatar} src={currentUser.avatar_url} alt="Профиль" aria-hidden="true" draggable="false"/>
                ) : (
                  <img src="/svg/profile.svg" alt="Меню" aria-hidden="true" draggable="false"/>
                )}
              </Button>
              {isMenuOpen && (
                <div className={style.menuPopup}>
                  <Button 
                    variant='menu'
                    className="fontHero"
                    text="Мой профиль"
                    type="button"
                    onClick={() => {
                      closeMenu();
                      navigate('/profile');
                    }}
                  />
                  <div className={style.menuSeparator} />
                  <Button 
                    variant='menu'
                    className="fontHero"
                    text="Мои объявления"
                    type="button"
                    onClick={() => {
                      closeMenu();
                      if (!isMyPostersRoute) {
                        navigate('/my-posters');
                      }
                    }}
                  />
                  <div className={style.menuSeparator} />
                  <Button
                    variant='menu'
                    className="fontHero"
                    icon={<img src="/svg/logout.svg" alt="Выйти" aria-hidden="true" draggable="false"/>}
                    text="Выйти"
                    type="button"
                    onClick={() => {
                      closeMenu();
                      onLogoutClick();
                    }}
                  />
                </div>
              )}
            </div>

          </div>
        
        ) : (
          <div className={style['actions']}>
            <Button variant="accent" type="button" id="openAuth" aria-label="Войти" onClick={onAuthorizeClick}>
              Войти
            </Button>
          </div>
        )}
        
        
    </header>
  );
}