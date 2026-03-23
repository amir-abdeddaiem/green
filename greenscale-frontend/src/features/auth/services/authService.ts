import { API_URL } from "@/config/api";

const formatApiError = (value: unknown): string => {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value)) {
    const messages = value
      .map((item) => {
        if (typeof item === "string") return item;
        if (item && typeof item === "object") {
          const obj = item as Record<string, unknown>;
          if (typeof obj.msg === "string") return obj.msg;
          if (typeof obj.message === "string") return obj.message;
        }
        return "";
      })
      .filter(Boolean);

    return messages.length > 0 ? messages.join("; ") : "Request failed";
  }

  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    if (typeof obj.detail === "string") return obj.detail;
    if (typeof obj.message === "string") return obj.message;
    return JSON.stringify(obj);
  }

  return "Request failed";
};

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  business_name: string;
  email: string;
  password: string;
}

interface AuthResponse {
  status: string;
  message: string;
  token?: string;
  user_id?: number;
  business_name?: string;
  email?: string;
  is_super_admin?: boolean;
}

interface ApiError {
  detail?: string;
  message?: string;
}

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: credentials.email,
          password: credentials.password
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        const error = data as ApiError;
        throw new Error(formatApiError(error.detail ?? error.message ?? data) || "Login failed");
      }

      // Store auth data
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (data.user_id) {
        localStorage.setItem("user_id", data.user_id.toString());
      }
      if (data.business_name) {
        localStorage.setItem("business_name", data.business_name);
      }
      if (data.email) {
        localStorage.setItem("email", data.email);
      }
      if (data.is_super_admin !== undefined) {
        localStorage.setItem("is_super_admin", data.is_super_admin.toString());
      }
      localStorage.setItem("isLoggedIn", "true");

      return data as AuthResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        "Failed to connect to backend. Check VITE_API_URL or ensure the backend is running."
      );
    }
  },

  register: async (userData: RegisterData): Promise<AuthResponse> => {
    try {
      // Validate input
      if (!userData.business_name || userData.business_name.trim().length === 0) {
        throw new Error("Business name is required");
      }
      if (!userData.email || !userData.email.includes("@")) {
        throw new Error("Valid email is required");
      }
      if (!userData.password || userData.password.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      const response = await fetch(`${API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: userData.business_name,
          email: userData.email,
          password: userData.password
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        const error = data as ApiError;
        throw new Error(formatApiError(error.detail ?? error.message ?? data) || "Registration failed");
      }

      return data as AuthResponse;
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error(
        "Failed to connect to backend. Check VITE_API_URL or ensure the backend is running."
      );
    }
  },

  logout: () => {
    localStorage.removeItem("user_id");
    localStorage.removeItem("business_name");
    localStorage.removeItem("email");
    localStorage.removeItem("isLoggedIn");
  },

  isAuthenticated: (): boolean => {
    return localStorage.getItem("isLoggedIn") === "true";
  },

  getCurrentUser: () => {
    return {
      user_id: localStorage.getItem("user_id"),
      business_name: localStorage.getItem("business_name"),
      email: localStorage.getItem("email")
    };
  }
};