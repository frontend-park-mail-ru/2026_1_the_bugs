export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
export const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5173";
export const SUPPORT_URL = import.meta.env.VITE_SUPPORT_URL || "http://localhost:81";

export const VK_OAUTH_REDIRECT_URL = `${BASE_URL}/oauth/vk`;
export const YANDEX_OAUTH_REDIRECT_URL = `${BASE_URL}/oauth/yandex`;


export const YANDEX_OAUTH_CLIENT_ID = '8bcbe6284aee41e2944c4330e34a712e';
export const YANDEX_OAUTH_AUTHORIZE_URL = 'https://oauth.yandex.ru/authorize';
export const YANDEX_SCOPE = 'login:email login:info login:default_phone';


export const VK_OAUTH_CLIENT_ID = 54483363;
export const VK_OAUTH_AUTHORIZE_URL = 'https://oauth.vk.com/authorize';
export const VK_SCOPE = 'vkid.personal_info email phone';