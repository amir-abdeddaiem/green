export interface User {
  email: string;
  businessName: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

export type AuthMode = 'login' | 'register';