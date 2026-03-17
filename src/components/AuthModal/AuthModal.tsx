import { useEffect, useState } from '@my-react/hooks';
import style from "./AuthModal.module.css";
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  
  const [mode, setMode] = useState<'login' | 'register'>('login');

  const toggleMode = () => setMode(mode === 'login' ? 'register' : 'login');

  useEffect(() => {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = '';
      };
    }, []);

  return (
    <div className="modal active">
      <div className="modal-content">
        <button className={style.close} onClick={onClose}>×</button>
        <div>
          {mode === 'login' ? (
            <LoginForm key="login" onClose={onClose} onSuccess={onSuccess} onToggleMode={toggleMode} />
          ) : (
            <RegisterForm key="register" onClose={onClose} onSuccess={onSuccess} onToggleMode={toggleMode} />
          )}
        </div>
      </div>
    </div>
  );
}
