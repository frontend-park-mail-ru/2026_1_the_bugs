export interface LoginResponse{
    access_token: string
    expire_at: number
}

export interface ErrorResponse extends Error{
    status: number;
    data: any;
}

export interface IOAuthFlow{
    code_verifier?: string,
    code: string,
    state?: string,
    device_id?: string
}

