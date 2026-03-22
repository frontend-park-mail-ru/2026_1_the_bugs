import { useEffect, useState } from '@my-react/hooks';
import style from "./AuthModal.module.css";
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ResetCode from './SendCode';
import VerifyCode from './VerifyCode';
import UpdatePwd from './UpdatePwd';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export type ToggleModeType = 'login' | 'register'| 'recover' | 'code_verify' | 'update_pwd'


export interface AuthModalChildProps {
  onClose: () => void;
  onSuccess: () => void;
  onToggleMode: (mode: ToggleModeType) => void;
}


export default function AuthModal({ onClose, onSuccess }: AuthModalProps) {
  
  const [mode, setMode] = useState<ToggleModeType>('login');

  const toggleMode = (mode: ToggleModeType) => {
    setMode(mode) 
  };

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
          {mode === 'login' && (
            <LoginForm key="login" onClose={onClose} onSuccess={onSuccess} onToggleMode={toggleMode} />
          )}
          {mode === 'register' && (
             <RegisterForm key="register" onClose={onClose} onSuccess={onSuccess} onToggleMode={toggleMode} />
          )}
          {mode === 'recover' && (
             <ResetCode key="reset_code" onClose={onClose} onSuccess={onSuccess} onToggleMode={toggleMode} />
          )}
           {mode === 'code_verify' && (
             <VerifyCode key="verify_code" onClose={onClose} onSuccess={onSuccess} onToggleMode={toggleMode} />
          )}
          {mode === 'update_pwd' && (
             <UpdatePwd key="update_pwd" onClose={onClose} onSuccess={onSuccess} onToggleMode={toggleMode} />
          )}
        </div>
      </div>
    </div>
  );
}
