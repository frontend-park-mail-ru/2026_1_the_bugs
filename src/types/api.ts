export interface LoginResponse{
    access_token: string
    expire_at: number
}

export interface ErrorResponse extends Error{
    status: number;
    data: any;
}

export interface IOAuthFlow{
    codeVerifier: string,
    code: string,
    state: string,
    deviceID: string
}