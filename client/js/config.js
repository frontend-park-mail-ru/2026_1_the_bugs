const Config = {
  // API Endpoints
  API: {
    BASE_URL: process.env.API_URL || '/api',
    ENDPOINTS: {
      AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/reg',
        LOGOUT: '/auth/logout',
        REFRESH: '/auth/refresh',
      },
      POSTERS: {
        GET_ALL: '/posters',
      },
    },
  },

  // Локальное хранилище ключи
  STORAGE: {
    AUTH_TOKEN: 'authToken',
    USER_DATA: 'userData',
    THEME: 'theme',
  },

  // UI Конфигурация
  UI: {
    MODAL_ANIMATION_DURATION: 300,
  },

  // Feature Flags
  FEATURES: {
    DEBUG_MODE: false,
    SHOW_PERFORMANCE_METRICS: false,
  },
};

export { Config };
