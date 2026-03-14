// src/components/AuthModal/authValidation.ts

export interface AuthFormState {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
  fieldsToHighlight: Partial<Record<keyof AuthFormState, boolean>>;
}

const MAX_EMAIL_LENGTH = 254;
const MIN_PWD_LEN = 8;
const MAX_PWD_LEN = 64;

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/;
const emailCharsRegex = /^[a-zA-Z0-9._%+-@-]{1,}$/;
const pwdRegex = new RegExp(`^[a-zA-Z\\d!@#$%^&*\\-]{${MIN_PWD_LEN},}$`);

export const validateEmail = (email: string): ValidationResult => {
  if (email === '') {
    return {
      isValid: false,
      error: 'Email не может быть пустым',
      fieldsToHighlight: { email: true },
    };
  }

  if (email.length > MAX_EMAIL_LENGTH) {
    return {
      isValid: false,
      error: `Email слишком длинный (макс. ${MAX_EMAIL_LENGTH} символов)`,
      fieldsToHighlight: { email: true },
    };
  }
  if (!emailCharsRegex.test(email)){
    return {
      isValid: false,
      error: 'Допустимы только: a-z A-Z 0-9 ._%+-@-',
      fieldsToHighlight: { email: true },
    };
  }

  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Неверный формат почты',
      fieldsToHighlight: { email: true },
    };
  }

  return { isValid: true, error: null, fieldsToHighlight: {} };
};

export const baseValidatePassword = (pwd: string): ValidationResult => {
   if (pwd === '') {
    return {
      isValid: false,
      error: 'Пароль не может быть пустым',
      fieldsToHighlight: { password: true },
    };
  }

  if (pwd.length < MIN_PWD_LEN) {
    return {
      isValid: false,
      error: `Пароль должен быть минимум ${MIN_PWD_LEN} символов`,
      fieldsToHighlight: { password: true },
    };
  }

  if (pwd.length > MAX_PWD_LEN) {
    return {
      isValid: false,
      error: `Пароль слишком длинный (макс. ${MAX_PWD_LEN} символов)`,
      fieldsToHighlight: { password: true },
    };
  }
  return { isValid: true, error: null, fieldsToHighlight: {} };
}

export const validatePassword = (pwd: string): ValidationResult => {
  if (pwd === '') {
    return {
      isValid: false,
      error: 'Пароль не может быть пустым',
      fieldsToHighlight: { password: true },
    };
  }

  if (pwd.length < MIN_PWD_LEN) {
    return {
      isValid: false,
      error: `Пароль должен быть минимум ${MIN_PWD_LEN} символов`,
      fieldsToHighlight: { password: true },
    };
  }

  if (pwd.length > MAX_PWD_LEN) {
    return {
      isValid: false,
      error: `Пароль слишком длинный (макс. ${MAX_PWD_LEN} символов)`,
      fieldsToHighlight: { password: true },
    };
  }

  if (!/[A-Z]/.test(pwd)) {
    return {
      isValid: false,
      error: 'Пароль должен содержать заглавную букву (A-Z)',
      fieldsToHighlight: { password: true },
    };
  }

  if (!/[a-z]/.test(pwd)) {
    return {
      isValid: false,
      error: 'Пароль должен содержать строчную букву (a-z)',
      fieldsToHighlight: { password: true },
    };
  }

  if (!/\d/.test(pwd)) {
    return {
      isValid: false,
      error: 'Пароль должен содержать цифру (0-9)',
      fieldsToHighlight: { password: true },
    };
  }

  if (!pwdRegex.test(pwd)) {
    return {
      isValid: false,
      error: 'Допустимы только: a-z A-Z 0-9 !@#$%^&*-',
      fieldsToHighlight: { password: true },
    };
  }

  return { isValid: true, error: null, fieldsToHighlight: {} };
};

export const validateConfirmPassword = (
  pwd: string,
  confirmPwd: string
): ValidationResult => {
  if (confirmPwd === '') {
    return {
      isValid: false,
      error: 'Подтверждение пароля не может быть пустым',
      fieldsToHighlight: { confirmPassword: true },
    };
  }

  if (pwd !== confirmPwd) {
    return {
      isValid: false,
      error: 'Пароли не совпадают!',
      fieldsToHighlight: { password: true, confirmPassword: true },
    };
  }

  return { isValid: true, error: null, fieldsToHighlight: {} };
};

export const validateLoginForm = (form: AuthFormState): ValidationResult => {
  const emailResult = validateEmail(form.email);
  if (!emailResult.isValid) {
    return emailResult;
  }

  const pwdResult = baseValidatePassword(form.password);
  if (!pwdResult.isValid) {
    return pwdResult;
  }

  return { isValid: true, error: null, fieldsToHighlight: {} };
};

export const validateRegisterForm = (form: AuthFormState): ValidationResult => {
  const confirmResult = validateConfirmPassword(
    form.password,
    form.confirmPassword
  );
  if (!confirmResult.isValid) {
    return confirmResult;
  }

  const pwdResult = validatePassword(form.password);
  if (!pwdResult.isValid) {
    // дополнительно подсветим confirmPassword, если пароль не проходит
    return {
      ...pwdResult,
      fieldsToHighlight: {
        ...pwdResult.fieldsToHighlight,
        confirmPassword: true,
      },
    };
  }

  const emailResult = validateEmail(form.email);
  if (!emailResult.isValid) {
    return emailResult;
  }

  return { isValid: true, error: null, fieldsToHighlight: {} };
};
