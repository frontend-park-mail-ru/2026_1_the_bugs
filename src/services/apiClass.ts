import type { ErrorResponse } from "src/types/api";

class ApiService {
    baseURL: string | undefined
    constructor(baseURL: string = '/api') {
        this.baseURL = baseURL;
    }

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

  async post(endpoint: string, data: any, headers: any, cookie: boolean = true) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: this.getHeaders(headers),
        body: data,
        credentials: cookie ? 'include': 'omit',
      });
      return this.handleResponse(response);
    } catch (error) {
      console.error('POST request error:', error);
      throw error;
    }
  }


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
  getHeaders(headers: any = {}) {
    if (headers['Content-Type'] == undefined)
        headers['Content-Type'] = 'application/json';
    // const token = this.getToken();
    // if (token) {
    //   headers['Authorization'] = `Bearer ${token}`;
    // }
    console.log(headers)
    return headers;
  }


  async handleResponse(response: Response) {
    if (response.status == 204){
      return null
    }
    const data = await response.json();
    

    if (!response.ok) {
      const error = new Error(data.message || 'API error') as ErrorResponse;
      error.status = response.status;
      error.message = data;
      throw error;
    }
    

    return data;
  }

  getToken() {
    return localStorage.getItem('authToken');
  } 

  setToken(token: string) {
    localStorage.setItem('authToken', token);
  }

  
  removeToken() {
    localStorage.removeItem('authToken');
  }

  isAuthenticated() {
    return !!this.getToken();
  }
}

export const apiService = new ApiService("http://localhost:8000/api");

export { ApiService };
