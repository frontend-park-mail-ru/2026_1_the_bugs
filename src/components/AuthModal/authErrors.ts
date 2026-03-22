import type { LoginField } from "./LoginForm";

export const ERROR_MESSAGES: Record<number, string> = {
  400: 'Введен неверный email или пароль',
  401: 'Введен неверный email или пароль',
  404: 'Пользователь не найден',
  409: 'Пользователь с таким email уже существует',
  429: 'Слишком много попыток. Попробуйте через минуту',
  500: 'Ошибка сервера. Попробуйте позже'
};


export const ERROR_FIELDS: Partial<Record<number, LoginField[]>> = {
  400: ['email', 'password'],
  401: ['email', 'password'],
  404: ['email'],
  409: ['email'],
  429: ['password']
};


export const getErrorMessage = (status: number): string => 
  ERROR_MESSAGES[status] || 'Что-то пошло не так';


export const getHighlightStyle = (isHighlighted?: boolean) => 
  isHighlighted ? {
    border: '1px solid #ff4d4f',
    boxShadow: '0 0 0 2px rgba(255, 77, 79, 0.25)'
  } : undefined;
