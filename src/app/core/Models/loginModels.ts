export interface loginModel {
    identifier: string;
    password: string;
}

export interface loginResponse {
    token: string;
    role: string;
}