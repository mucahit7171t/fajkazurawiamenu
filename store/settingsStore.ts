import { create } from "zustand";
import axios from "axios";
import { useAuthStore } from "./authStore";

type Notice = {
  icon: string;
  text: string;
  order: number;
  isActive: boolean;
};

type OpeningHours = {
  monday?: string;
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
};

type Settings = {
  siteName?: string;
  location?: string;
  currency?: string;
  language?: string;
  isOpen?: boolean;
  phone?: string;
  openingHours?: OpeningHours;
  notices?: Notice[];
  [key: string]: unknown;
};

interface SettingsState {
  settings: Settings;
  loading: boolean;
  error: string | null;
  fetchSettings: () => Promise<void>;
  updateSetting: (key: string, value: unknown) => Promise<void>;
}

const getAuthHeader = () => {
  const token = useAuthStore.getState().token;

  if (!token) {
    throw new Error("Admin session expired. Please log in again.");
  }

  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: {},
  loading: false,
  error: null,

  fetchSettings: async () => {
    set({ loading: true, error: null });

    try {
      const response = await axios.get("/api/settings");

      set({
        settings: response.data,
        loading: false,
        error: null,
      });
    } catch (error) {
      console.error("Failed to fetch settings:", error);

      set({
        loading: false,
        error: "Failed to fetch settings",
      });
    }
  },

  updateSetting: async (key, value) => {
    try {
      const response = await axios.put(
        "/api/admin/settings",
        { key, value },
        getAuthHeader()
      );

      const updatedSettings = response.data?.settings;

      if (updatedSettings) {
        set({
          settings: updatedSettings,
          error: null,
        });
      } else {
        set((state) => ({
          settings: { ...state.settings, [key]: value },
          error: null,
        }));
      }
    } catch (error: unknown) {
      console.error("Failed to update settings:", error);

      if (axios.isAxiosError(error) && error.response?.status === 401) {
        useAuthStore.getState().logout();
        set({ error: "Admin session expired. Please log in again." });
        throw new Error("Admin session expired. Please log in again.");
      }

      set({ error: "Failed to update settings" });
      throw error;
    }
  },
}));