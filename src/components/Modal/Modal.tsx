import { useEffect } from '@my-react/hooks';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  hisChildren: any;
}

/** Универсальная модальная обёртка с затемнённым оверлеем; закрывается кликом по фону. */
export function Modal({ isOpen, onClose, hisChildren}: ModalProps) {
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
          <button className="close-button" onClick={onClose}></button>
          {hisChildren}
      </div>
    </div>
  );
}