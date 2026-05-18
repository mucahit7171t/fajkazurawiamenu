import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";

interface User {
  id?: string;
  username: string;
  role: "admin";
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;

  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      error: null,

      login: async (username: string, password: string) => {
        set({ loading: true, error: null });

        try {
          const response = await axios.post("/api/auth/login", {
            username,
            password,
          });

          const { success, user, token, message } = response.data;

          if (!success || !token || !user) {
            set({
              user: null,
              token: null,
              isAuthenticated: false,
              loading: false,
              error: message || "Login failed",
            });

            return false;
          }

          set({
            user,
            token,
            isAuthenticated: true,
            loading: false,
            error: null,
          });

          return true;
        } catch (error: unknown) {
          let message = "Login failed";

          if (axios.isAxiosError(error)) {
            message =
              error.response?.data?.message ||
              error.response?.data?.error ||
              "Invalid username or password";
          }

          set({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,
            error: message,
          });

          return false;
        }
      },

      logout: () => {
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false,
          error: null,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "fajka-auth-storage",
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)