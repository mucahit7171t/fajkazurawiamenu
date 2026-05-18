import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { useAuthStore } from "./authStore";

interface LocalizedString {
  pl: string;
  en: string;
}

interface PriceOption {
  label: string;
  value: string;
}

interface Product {
  _id: string;
  name: LocalizedString;
  desc?: LocalizedString;
  price?: string;
  prices?: PriceOption[];
  image?: string;
  category: string;
  categoryId?: string;
  subcategory?: string;
  badge?: string;
  order: number;
}

interface Subcategory {
  _id: string;
  title: LocalizedString;
  category: string;
  order: number;
  products: Product[];
}

interface Category {
  _id: string;
  title: LocalizedString;
  anchorId: string;
  image: string;
  order: number;
  subcategories: Subcategory[];
  products: Product[];
}

interface MenuState {
  menu: Category[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  fetchMenu: (force?: boolean) => Promise<void>;

  createCategory: (data: any) => Promise<void>;
  updateCategory: (id: string, data: any) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;

  createSubcategory: (data: any) => Promise<void>;
  updateSubcategory: (id: string, data: any) => Promise<void>;
  deleteSubcategory: (id: string) => Promise<void>;

  createProduct: (data: any) => Promise<void>;
  updateProduct: (id: string, data: any) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;

  reorder: (
    type: string,
    items: { id: string; order: number }[]
  ) => Promise<void>;
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

const handleAdminError = (error: unknown) => {
  if (axios.isAxiosError(error) && error.response?.status === 401) {
    useAuthStore.getState().logout();
    throw new Error("Admin session expired. Please log in again.");
  }

  throw error;
};

export const useMenuStore = create<MenuState>()(
  persist(
    (set, get) => ({
      menu: [],
      loading: false,
      error: null,
      lastFetched: null,

      fetchMenu: async () => {
        set({ loading: true, error: null });

        try {
          const response = await axios.get("/api/admin/menu", getAuthHeader());

          set({
            menu: response.data,
            loading: false,
            lastFetched: Date.now(),
            error: null,
          });
        } catch (error: unknown) {
          console.error("Failed to fetch admin menu:", error);

          if (axios.isAxiosError(error) && error.response?.status === 401) {
            useAuthStore.getState().logout();
            set({
              loading: false,
              error: "Admin session expired. Please log in again.",
            });
            return;
          }

          set({
            loading: false,
            error: "Failed to fetch menu",
          });
        }
      },

      createCategory: async (data) => {
        try {
          await axios.post("/api/admin/categories", data, getAuthHeader());
          await get().fetchMenu(true);
        } catch (error) {
          handleAdminError(error);
        }
      },

      updateCategory: async (id, data) => {
        try {
          await axios.put(`/api/admin/categories/${id}`, data, getAuthHeader());
          await get().fetchMenu(true);
        } catch (error) {
          handleAdminError(error);
        }
      },

      deleteCategory: async (id) => {
        try {
          await axios.delete(`/api/admin/categories/${id}`, getAuthHeader());
          await get().fetchMenu(true);
        } catch (error) {
          handleAdminError(error);
        }
      },

      createSubcategory: async (data) => {
        try {
          await axios.post("/api/admin/subcategories", data, getAuthHeader());
          await get().fetchMenu(true);
        } catch (error) {
          handleAdminError(error);
        }
      },

      updateSubcategory: async (id, data) => {
        try {
          await axios.put(
            `/api/admin/subcategories/${id}`,
            data,
            getAuthHeader()
          );
          await get().fetchMenu(true);
        } catch (error) {
          handleAdminError(error);
        }
      },

      deleteSubcategory: async (id) => {
        try {
          await axios.delete(`/api/admin/subcategories/${id}`, getAuthHeader());
          await get().fetchMenu(true);
        } catch (error) {
          handleAdminError(error);
        }
      },

      createProduct: async (data) => {
        try {
          await axios.post("/api/admin/products", data, getAuthHeader());
          await get().fetchMenu(true);
        } catch (error) {
          handleAdminError(error);
        }
      },

      updateProduct: async (id, data) => {
        try {
          await axios.put(`/api/admin/products/${id}`, data, getAuthHeader());
          await get().fetchMenu(true);
        } catch (error) {
          handleAdminError(error);
        }
      },

      deleteProduct: async (id) => {
        try {
          await axios.delete(`/api/admin/products/${id}`, getAuthHeader());
          await get().fetchMenu(true);
        } catch (error) {
          handleAdminError(error);
        }
      },

      reorder: async (type, items) => {
        try {
          await axios.post(
            "/api/admin/reorder",
            { type, items },
            getAuthHeader()
          );
          await get().fetchMenu(true);
        } catch (error) {
          handleAdminError(error);
        }
      },
    }),
    {
      name: "fajka-menu-storage",
      partialize: (state) => ({
        menu: state.menu,
        lastFetched: state.lastFetched,
      }),
    }
  )
);