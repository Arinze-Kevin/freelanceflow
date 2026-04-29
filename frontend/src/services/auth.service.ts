import api from "./api";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterCredentials,
  User,
  ApiResponse,
} from "../types";

export const authService = {
  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/register",
      credentials,
    );
    return response.data.data as AuthResponse;
  },

  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>(
      "/auth/login",
      credentials,
    );
    return response.data.data as AuthResponse;
  },

  getMe: async (): Promise<User> => {
    const response = await api.get<ApiResponse<User>>("/auth/me");
    return response.data.data as User;
  },

  updateProfile: async (data: Partial<User>): Promise<User> => {
    const response = await api.patch<ApiResponse<User>>("/auth/me", data);
    return response.data.data as User;
  },

  changePassword: async (data: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> => {
    await api.patch("/auth/me/password", data);
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
