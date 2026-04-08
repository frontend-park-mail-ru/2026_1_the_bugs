import { useEffect } from '@my-react/hooks';
import style from "./Modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: any;
}

/** Универсальная модальная обёртка с затемнённым оверлеем; закрывается кликом по фону. */
export function Modal({ isOpen, onClose, children}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e: MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('modal')) {
      onClose();
    }
  };

  return (
    <div className={`modal ${isOpen ? 'active' : ''}`} onClick={handleOverlayClick}>
      <div className="modal-content">
          <button className={style.close} onClick={onClose}>&times;</button>
          {children}
      </div>
    </div>
  );
}