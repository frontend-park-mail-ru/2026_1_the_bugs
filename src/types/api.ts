export interface LoginResponse{
    access_token: string
    expire_at: number
}

export interface ErrorResponse extends Error{
    status: number;
    message: string;
}
