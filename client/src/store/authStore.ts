import { create } from "zustand";
import { persist } from "zustand/middleware";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

interface User {
  id: string;
  email: string;
  role: "candidate" | "company";
  name: string;
  phone: string;
  company_name?: string;
  company_address?: string;
}

interface JwtPayload {
  exp: number;
  iat: number;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  setUser: (user: User | null, token?: string, refreshToken?: string) => void;
  logout: () => void;
  isTokenExpired: () => boolean;
  autoLogout: () => void;
  setRefreshToken: (token: string) => void;
  refreshAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,

      setUser: (user, token, refreshToken) =>
        set({
          user,
          accessToken: token || null,
          refreshToken: refreshToken || null,
        }),

      logout: () =>
        set(
          {
            user: null,
            accessToken: null,
            refreshToken: null,
          },
          true
        ),

      isTokenExpired: () => {
        const token = get().accessToken;
        if (!token) return true;
        try {
          const decoded = jwtDecode<JwtPayload>(token);
          return Date.now() >= decoded.exp * 1000;
        } catch {
          return true;
        }
      },

      autoLogout: () => {
        get().logout();
        window.location.href = "/login";
      },

      setRefreshToken: (token) => set({ refreshToken: token }),

      refreshAuth: async () => {
        try {
          const { refreshToken } = get();
          const response = await axios.post(
            "http://127.0.0.1:8000/auth/token/refresh/",
            { refresh: refreshToken }
          );
          set({
            accessToken: response.data.access,
            refreshToken: response.data.refresh || refreshToken,
          });
        } catch (error) {
          get().autoLogout();
          throw error;
        }
      },
    }),

    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
