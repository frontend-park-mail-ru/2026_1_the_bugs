import { useEffect, useState } from 'the-react/hooks';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import ResetCode from './SendCode';
import VerifyCode from './VerifyCode';
import UpdatePwd from './UpdatePwd';
import { Modal } from '../Modal/Modal';
import EmailVerification from './EmailVerification';

interface AuthModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export type ToggleModeType = 'login' | 'register'| 'recover' | 'code_verify' | 'update_pwd' | 'email_verify';


export interface AuthModalChildProps {
  onSuccess: () => void;
  onToggleMode: (mode: ToggleModeType) => void;
}


export function AuthModal({ onClose, onSuccess }: AuthModalProps) {
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
    <div>
      <Modal isOpen={true} onClose={onClose}>
          <div>
            {mode === 'login' && (
              <LoginForm key="login" onSuccess={onSuccess} onToggleMode={toggleMode} />
            )}
            {mode === 'register' && (
              <RegisterForm key="register" onSuccess={onSuccess} onToggleMode={toggleMode} />
            )}
            {mode === 'recover' && (
              <ResetCode key="reset_code" onSuccess={onSuccess} onToggleMode={toggleMode} />
            )}
            {mode === 'code_verify' && (
              <VerifyCode key="verify_code" onSuccess={onSuccess} onToggleMode={toggleMode} />
            )}
            {mode === 'update_pwd' && (
              <UpdatePwd key="update_pwd" onSuccess={onSuccess} onToggleMode={toggleMode} />
            )}
            {mode === 'email_verify' && (
              <EmailVerification key="email_verify" onSuccess={onSuccess} onToggleMode={toggleMode} />
            )}
          </div>
      </Modal>
    </div>
  );
}
