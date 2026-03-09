import { apiService } from "./apiClass";
import {type LoginResponse } from "../types/api"


class AuthService {
    private refreshPromise: Promise<LoginResponse> | null = null;
    private refreshTimeout: number | null = null;
    
    startRefreshTimer(exp: number) {
        if (this.refreshTimeout) clearTimeout(this.refreshTimeout);
        
        this.refreshTimeout = setTimeout(async () => {
            const date = await this.refreshTokenSilently();
            console.log(date.expire_at)
            this.startRefreshTimer(date.expire_at);
        }, exp * 1000);
    }

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

    async login(data: {email: string, password: string}) {
        const params = new URLSearchParams(data);
        
        const cred: LoginResponse = await apiService.post(
            "/auth/login",
            params.toString(),
            {"Content-Type": "application/x-www-form-urlencoded"}
        );
        apiService.setToken(cred.access_token);
        this.startRefreshTimer(cred.expire_at);
    }

    async register(data: {email: string, password: string}) {
        const params = new URLSearchParams(data);
        
        await apiService.post(
            "/auth/reg",
            params.toString(),
            {"Content-Type": "application/x-www-form-urlencoded"}
        );

        const cred: LoginResponse = await apiService.post(
            "/auth/login",
            params.toString(),
            {"Content-Type": "application/x-www-form-urlencoded"}
        );
        apiService.setToken(cred.access_token)


    }

    async refreshToken() {
        const data = await apiService.post("/auth/refresh", 
            '',
            {"Content-Type": "text/plain; charset=utf-8"},
            true
        )
        return data
    }

}

export const authService = new AuthService()