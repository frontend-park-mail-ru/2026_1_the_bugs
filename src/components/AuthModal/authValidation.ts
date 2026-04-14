// src/components/AuthModal/authValidation.ts

export interface AuthFormState {
  email: string;
  password: string;
  confirmPassword: string;
  firstname: string;
  lastname: string;
  phone: string;
}
export interface LoginFormState {
  email: string;
  password: string;
}

export interface ValidationResult {
  isValid: boolean;
  error: string | null;
  fieldsToHighlight: Partial<Record<keyof AuthFormState, boolean>>;
}

const MAX_EMAIL_LENGTH = 255;
const MIN_PWD_LEN = 8;
const MAX_PWD_LEN = 64;

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9]+[a-zA-Z0-9.-]*\.[a-zA-Z]{2,}$/;
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

export const validateLoginForm = (form: LoginFormState): ValidationResult => {
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
  const emailResult = validateEmail(form.email);
  if (!emailResult.isValid) {
    return emailResult;
  }

  const pwdResult = validatePassword(form.password);
  if (!pwdResult.isValid) {
    return {
      ...pwdResult,
      fieldsToHighlight: {
        ...pwdResult.fieldsToHighlight,
        confirmPassword: true,
      },
    };
  }
  const confirmResult = validateConfirmPassword(
    form.password,
    form.confirmPassword
  );
  if (!confirmResult.isValid) {
    return confirmResult;
  }

 
  return { isValid: true, error: null, fieldsToHighlight: {} };
};

export const validateProfileForm = (form: AuthFormState): ValidationResult => {
  const firstnameResult = validateName(form.firstname, 'firstname');
  if (!firstnameResult.isValid) {
    return firstnameResult;
  }

  const lastnameResult = validateName(form.lastname, 'lastname');
  if (!lastnameResult.isValid) {
    return lastnameResult
  }
  const phoneResult = validatePhone(form.phone);
  if (!phoneResult.isValid) {
    return phoneResult;
  }

  return { isValid: true, error: null, fieldsToHighlight: {} };
};
export const validatePhone = (phone: string): ValidationResult => {
  const phoneRegex = /^(\+7|8)\s?[\s(]?\d{3}[\s)-]?\s?\d{3}[\s-]?\d{2}[\s-]?\d{2}$/;
  if (phone === '') {
    return {
      isValid: false,
      error: 'Телефон не может быть пустым',
      fieldsToHighlight: { phone: true },
    };
  }
  if (!/^(\+7|8)/.test(phone)) {
    return {
      isValid: false,
      error: 'Телефон должен начинаться с +7 или 8',
      fieldsToHighlight: { phone: true },
    };
  }
  if (!phoneRegex.test(phone)) {
    return {
      isValid: false,
      error: 'Неверный формат номера телефона',
      fieldsToHighlight: { phone: true },
    };
  }
  return { isValid: true, error: null, fieldsToHighlight: {} };
};

export const validateName = (name: string, field: 'firstname' | 'lastname'): ValidationResult => {
  if (name === '') {
    return {
      isValid: false,
      error: `${field === 'firstname' ? 'Имя' : 'Фамилия'} не может быть пустым`,
      fieldsToHighlight: { [field]: true },
    };
  }
  if (!/^[a-zA-Zа-яА-ЯёЁ-]+$/.test(name)) {
    return {
      isValid: false,
      error: `${field === 'firstname' ? 'Имя' : 'Фамилия'} может содержать только буквы и дефис`,
      fieldsToHighlight: { [field]: true },
    };
  }
  if (name.length > 40) {
    return {
      isValid: false,
      error: `${field === 'firstname' ? 'Имя' : 'Фамилия'} слишком длинное (макс. 40 символов)`,
      fieldsToHighlight: { [field]: true },
    };
  }
  return { isValid: true, error: null, fieldsToHighlight: {} };
}

export function applyValidationResult<T extends string>(
    result: ValidationResult,
    setError: (error: string | null) => void,
    setFieldHighlights: (highlights: Partial<Record<T, boolean>>) => void
  ): boolean{
    if (!result.isValid) {
      setError(result.error);
      setFieldHighlights(result.fieldsToHighlight as Partial<Record<T, boolean>>);
      return false;
    }
    setError(null);
    setFieldHighlights({});
    return true;
  };
  