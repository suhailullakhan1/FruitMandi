import { apiRequest } from "./queryClient";

interface User {
  id: string;
  phone: string;
  role: string;
  // name: string;
}

interface AuthResponse {
  user: User;
  message: string;
}

export const authAPI = {
  sendOTP: async (phone: string, role: string) => {
    const response = await apiRequest('POST', '/api/auth/send-otp', { phone, role });
    return response.json();
  },

  verifyOTP: async (phone: string, otp: string, role: string, name?: string) => {
    const response = await apiRequest('POST', '/api/auth/verify-otp', { phone, otp, role, name });
    return response.json() as Promise<AuthResponse>;
  },

  logout: async () => {
    const response = await apiRequest('POST', '/api/auth/logout');
    return response.json();
  },

  getCurrentUser: async (): Promise<AuthResponse> => {
    const response = await apiRequest('GET', '/api/auth/me');
    return response.json();
  }
};
