import { useEffect } from 'the-react/hooks';
import styles from "./Modal.module.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: any;
  contentClassName?: string;
  overlayClassName?: string;
  style?: Record<string, any>
}

/** Универсальная модальная обёртка с затемнённым оверлеем; закрывается кликом по фону. */
export function Modal({
  isOpen,
  onClose,
  children,
  contentClassName = '',
  overlayClassName = '',
  style
}: ModalProps) {
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
    <div className={`modal ${isOpen ? 'active' : ''} ${overlayClassName}`.trim()} onClick={handleOverlayClick} style={style}>
      <div className={`modal-content ${contentClassName}`.trim()}>
        <button className={styles.close} onClick={onClose}>&times;</button>
          {children}
      </div>
    </div>
  );
}