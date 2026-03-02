class ApiService {
    baseURL: string | undefined
    constructor(baseURL: string = '/api') {
        this.baseURL = baseURL;
    }

  /**
   * Выполнить GET запрос
   */
  async get(endpoint: string) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'GET',
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('GET request error:', error);
      throw error;
    }
  }

  /**
   * Выполнить POST запрос
   */
  async post(endpoint: string, data: any) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('POST request error:', error);
      throw error;
    }
  }

  /**
   * Выполнить PUT запрос
   */
  async put(endpoint: string, data: any) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'PUT',
        headers: this.getHeaders(),
        body: JSON.stringify(data),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('PUT request error:', error);
      throw error;
    }
  }

  /**
   * Выполнить DELETE запрос
   */
  async delete(endpoint: string) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getHeaders(),
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('DELETE request error:', error);
      throw error;
    }
  }

  /**
   * Получить заголовки запроса
   */
  getHeaders() {
    const headers = {
      'Content-Type': 'application/json',
    };

    // Добавить токен авторизации если он есть
    const token = this.getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Обработать ответ от сервера
   */
  async handleResponse(response) {
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || 'API error');
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  }

  /**
   * Получить токен авторизации из localStorage
   */
  getToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Сохранить токен авторизации в localStorage
   */
  setToken(token) {
    localStorage.setItem('authToken', token);
  }

  /**
   * Удалить токен авторизации
   */
  removeToken() {
    localStorage.removeItem('authToken');
  }

  /**
   * Проверить есть ли токен авторизации
   */
  isAuthenticated() {
    return !!this.getToken();
  }
}

// Создать глобальный экземпляр API сервиса
export const apiService = new ApiService();

export { ApiService };
