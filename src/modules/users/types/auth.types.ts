export interface LoginDTO {
  email: string;
  password: string;
}

export interface RegisterDTO {
  username: string;
  email: string;
  password: string;
  role?: string;
  status?: string;
  nomeCompleto?: string;
}

export interface AuthResponse {
  success: boolean;
  data?: {
    access_token: string;
    user: {
      id: number;
      username: string;
      email: string;
      role: string;
      status?: string;
    };
  };
  message?: string;
  error?: string;
}