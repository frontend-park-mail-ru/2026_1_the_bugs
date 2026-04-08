import { API_URL } from '../config';
import type { ErrorResponse } from "src/types/api";

/**
 * Универсальный сервис API для HTTP-запросов к бэкенд-эндпоинтам.
 * Поддерживает методы GET, POST, PUT, DELETE с автоматической обработкой ошибок,
 * токенной аутентификацией и парсингом JSON-ответов.
 */
class ApiService {
    /** Базовый URL для всех API-запросов (например, '/api' или полный URL) */
    baseURL: string | undefined;

    /**
     * Создает экземпляр ApiService.
     * @param baseURL - Базовый URL для API-запросов. По умолчанию '/api'.
     */
    constructor(baseURL: string = '/api') {
        this.baseURL = baseURL;
    }

    /**
     * Выполняет GET-запрос с параметрами запроса.
     * @param endpoint - Путь к API-эндпоинту (например, '/users').
     * @param params - Параметры запроса в формате ключ-значение.
     * @returns Promise с распарсенными JSON-данными ответа.
     * @throws ErrorResponse при неудачном запросе или не-2xx статусе.
     */
    async get(endpoint: string,  params: Record<string, any> = {}, headers: Record<string, any> = {}) {
        try {
            const paramsURL = new URLSearchParams(params).toString();
            const response = await fetch(`${this.baseURL}${endpoint}?${paramsURL}`, {
                method: 'GET',
                headers: {...headers, "Accept": 'application/json'},
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('GET request error:', error);
            throw error;
        }
    }

    /**
     * Выполняет POST-запрос с пользовательскими данными и заголовками.
     * @param endpoint - Путь к API-эндпоинту (например, '/login').
     * @param data - Данные тела запроса (FormData, JSON и т.д.).
     * @param headers - Дополнительные заголовки для включения.
     * @param cookie - Включать ли куки credentials. По умолчанию true.
     * @returns Promise с распарсенными JSON-данными ответа.
     * @throws ErrorResponse при неудачном запросе или не-2xx статусе.
     */
    async post(endpoint: string, data: any, headers: any, cookie: boolean = true) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'POST',
                headers: headers,
                body: data,
                credentials: cookie ? 'include': 'omit',
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('POST request error:', error);
            throw error;
        }
    }

    /**
     * Выполняет PUT-запрос с JSON или FormData-данными.
     * @param endpoint - Путь к API-эндпоинту (например, '/users/1').
     * @param data - Данные для отправки в теле запроса.
     * @returns Promise с распарсенными JSON-данными ответа.
     * @throws ErrorResponse при неудачном запросе или не-2xx статусе.
     */
    async put(endpoint: string, data: any, headers: Record<string, any>) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'PUT',
               headers:headers,
                body: data instanceof FormData ? data : JSON.stringify(data),
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('PUT request error:', error);
            throw error;
        }
    }

    /**
     * Выполняет DELETE-запрос для удаления ресурсов.
     * @param endpoint - Путь к API-эндпоинту (например, '/users/1').
     * @returns Promise с распарсенными JSON-данными ответа или null для 204.
     * @throws ErrorResponse при неудачном запросе или не-2xx статусе.
     */
    async delete(endpoint: string, headers: Record<string, any> = {}) {
        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                method: 'DELETE',
                headers:headers,
            });
            return this.handleResponse(response);
        } catch (error) {
            console.error('DELETE request error:', error);
            throw error;
        }
    }

    /**
     * Обработка HTTP-ответа с парсингом и преобразованием ошибок.
     * @param response - Объект Fetch Response.
     * @returns Распарсенные JSON-данные или null для 204 No Content.
     * @throws ErrorResponse со статусом и данными ошибки для неудачных запросов.
     */

    async handleResponse(response: Response) {
        if (response.status == 204) {
            return null;
        }
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'API error') as ErrorResponse;
            error.status = response.status;
            error.data = data;
            throw error;
        }

        return data;
    }

    /**
     * Получить токен аутентификации из localStorage.
     * @returns Текущий токен аутентификации или null.
     */
    getToken() {
        return localStorage.getItem('authToken');
    }

    /**
     * Сохранить токен аутентификации в localStorage.
     * @param token - JWT или токен аутентификации для сохранения.
     */
    setToken(token: string) {
        localStorage.setItem('authToken', token);
    }

    /**
     * Удалить токен аутентификации из localStorage.
     */
    removeToken() {
        localStorage.removeItem('authToken');
    }

}


export const apiService = new ApiService(API_URL);

export { ApiService };
