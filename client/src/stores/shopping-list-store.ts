import { create } from 'zustand';
import api from '@/lib/api';
import type { ShoppingListItem } from '@/types';

interface ShoppingListState {
  items: ShoppingListItem[];
  isLoading: boolean;
  fetchItems: (householdId: string) => Promise<void>;
  createItem: (householdId: string, data: Partial<ShoppingListItem>) => Promise<void>;
  updateItem: (householdId: string, itemId: string, data: Partial<ShoppingListItem>) => Promise<void>;
  deleteItem: (householdId: string, itemId: string) => Promise<void>;
  markPurchased: (householdId: string, itemId: string) => Promise<void>;
}

export const useShoppingListStore = create<ShoppingListState>((set) => ({
  items: [],
  isLoading: false,

  fetchItems: async (householdId) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/shopping-list/${householdId}`);
      set({ items: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createItem: async (householdId, data) => {
    const res = await api.post(`/shopping-list/${householdId}`, data);
    set((state) => ({ items: [...state.items, res.data] }));
  },

  updateItem: async (householdId, itemId, data) => {
    const res = await api.patch(`/shopping-list/${householdId}/items/${itemId}`, data);
    set((state) => ({
      items: state.items.map((i) => (i.id === itemId ? res.data : i)),
    }));
  },

  deleteItem: async (householdId, itemId) => {
    await api.delete(`/shopping-list/${householdId}/items/${itemId}`);
    set((state) => ({ items: state.items.filter((i) => i.id !== itemId) }));
  },

  markPurchased: async (householdId, itemId) => {
    const res = await api.post(`/shopping-list/${householdId}/items/${itemId}/purchase`);
    set((state) => ({
      items: state.items.map((i) => (i.id === itemId ? res.data : i)),
    }));
  },
}));