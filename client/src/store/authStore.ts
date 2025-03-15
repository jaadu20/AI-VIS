import { create } from "zustand";
import { persist } from "zustand/middleware";

interface User {
  id: string;
  email: string;
  role: "student" | "company" | "admin";
  name: string;
  phone: string;
  company_name?: string;
  company_address?: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  setUser: (user: User | null, token?: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,

      setUser: (user, token) =>
        set({
          user,
          accessToken: token || null,
        }),

      logout: () =>
        set(
          {
            user: null,
            accessToken: null,
          },
          true
        ), // Clear storage
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    }
  )
);
