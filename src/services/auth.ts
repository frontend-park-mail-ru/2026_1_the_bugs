import { apiService } from "./apiClass";
import { type IOAuthFlow, type LoginResponse } from "../types/api";

/**
 * Сервис аутентификации, управляющий жизненным циклом JWT-токена с автоматическим обновлением.
 * Обрабатывает вход, регистрацию и проактивное обновление токена перед истечением срока действия.
 */
class AuthService {
    /** Текущий промис обновления токена (предотвращает дублирующиеся вызовы обновления) */
    private refreshPromise: Promise<LoginResponse> | null = null;
    
    /** ID таймаута для проактивного обновления токена */
    private refreshTimeout: number | null = null;

    /**
     * Запускает таймер обновления, который обновляет токен до истечения срока действия.
     * @param exp - Время истечения токена в секундах (относительное).
     */
    startRefreshTimer(exp: number) {
        if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
        
        this.refreshTimeout = setTimeout(async () => {
            const date = await this.refreshTokenSilently();
            this.startRefreshTimer(date.expire_at);
        }, exp * 1000);
    }

    /**
     * Тихо обновляет токен с дедупликацией промисов.
     * Возвращает существующий промис, если обновление уже выполняется.
     * @returns Свежие учетные данные входа с новым токеном доступа.
     */
    async refreshTokenSilently(): Promise<LoginResponse> {
        if (this.refreshPromise) {
            return this.refreshPromise;
        }
        
        this.refreshPromise = this.refreshToken();
        try {
            return await this.refreshPromise;
        } finally {
            this.refreshPromise = null;
        }
    }

    /**
     * Аутентифицирует пользователя с учетными данными email/пароль.
     * Сохраняет токен доступа и запускает таймер обновления.
     * @param data - Учетные данные для входа (email, пароль).
     * @throws Ошибка API при неудачном входе.
     */
    async login(data: { email: string; password: string }) {
        const params = new URLSearchParams(data);
        
        const cred: LoginResponse = await apiService.post(
            "/auth/login",
            params.toString(),
            { "Content-Type": "application/x-www-form-urlencoded" }
        );
        apiService.setToken(cred.access_token);
        this.startRefreshTimer(cred.expire_at);
    }

    /**
     * Регистрирует нового пользователя и автоматически выполняет вход.
     * Сохраняет токен доступа и запускает таймер обновления.
     * @param data - Учетные данные для регистрации (email, пароль).
     * @throws Ошибка API при неудачной регистрации или входе.
     */
    async register(data: { email: string; password: string }) {
        const params = new URLSearchParams(data);
        
        await apiService.post(
            "/auth/reg",
            params.toString(),
            { "Content-Type": "application/x-www-form-urlencoded" }
        );

        const cred: LoginResponse = await apiService.post(
            "/auth/login",
            params.toString(),
            { "Content-Type": "application/x-www-form-urlencoded" }
        );
        apiService.setToken(cred.access_token);
    }

    /**
     * Обновляет текущий токен доступа с помощью механизма обновления.
     * Требует действующую куку refresh-токена.
     * @returns Обновленные учетные данные входа.
     * @throws Ошибка API при неудачном обновлении.
     */
    async refreshToken() {
        const data = await apiService.post(
            "/auth/refresh", 
            '',
            { "Content-Type": "text/plain; charset=utf-8" },
        );
        return data;
    }
    
    /** Выполняет выход пользователя, удаляя токен доступа и очищая таймер обновления. 
     * При наличии действующего токена отправляет запрос на сервер для завершения сессии.
     * @throws Ошибка API при неудачном выходе (например, если токен недействителен).
     * При отсутствии токена просто очищает локальное состояние.
    */
    async logout() {
        const token = apiService.getToken();
        if (!token) return; 
        apiService.removeToken();
        await apiService.post(
            "/auth/logout", 
            null,
            {'Authorization': `Bearer ${token}` , 'Accept': 'application/json'},
        );
        if (this.refreshTimeout) {
            clearTimeout(this.refreshTimeout);
            this.refreshTimeout = null;
        }
        return;
    }
    async loginFromVK(flow: IOAuthFlow) {
        const res: LoginResponse =await apiService.post('/auth/vkid', 
            JSON.stringify(flow),
            { 'Content-Type': 'application/json' },
        );
        apiService.setToken(res.access_token);
    }
  
}

export const authService = new AuthService();
