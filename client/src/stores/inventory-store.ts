import { create } from 'zustand';
import api from '@/lib/api';
import type { InventoryItem, InventoryAdjustment } from '@/types';

interface InventoryState {
  items: InventoryItem[];
  currentItem: (InventoryItem & { adjustments?: InventoryAdjustment[] }) | null;
  isLoading: boolean;
  error: string | null;
  fetchItems: (householdId: string, filters?: Record<string, string>) => Promise<void>;
  fetchItem: (householdId: string, itemId: string) => Promise<void>;
  createItem: (householdId: string, data: Partial<InventoryItem>) => Promise<InventoryItem>;
  updateItem: (householdId: string, itemId: string, data: Partial<InventoryItem>) => Promise<void>;
  deleteItem: (householdId: string, itemId: string) => Promise<void>;
  adjustQuantity: (householdId: string, itemId: string, type: 'ADD' | 'REMOVE' | 'SET', quantity: number, note?: string) => Promise<void>;
  archiveItem: (householdId: string, itemId: string) => Promise<void>;
}

export const useInventoryStore = create<InventoryState>((set) => ({
  items: [],
  currentItem: null,
  isLoading: false,
  error: null,

  fetchItems: async (householdId, filters) => {
    set({ isLoading: true });
    try {
      const params = new URLSearchParams(filters);
      const res = await api.get(`/inventory/${householdId}/items?${params.toString()}`);
      set({ items: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchItem: async (householdId, itemId) => {
    try {
      const res = await api.get(`/inventory/${householdId}/items/${itemId}`);
      set({ currentItem: res.data });
    } catch {
      // handle error
    }
  },

  createItem: async (householdId, data) => {
    const res = await api.post(`/inventory/${householdId}/items`, data);
    set((state) => ({ items: [...state.items, res.data] }));
    return res.data;
  },

  updateItem: async (householdId, itemId, data) => {
    const res = await api.patch(`/inventory/${householdId}/items/${itemId}`, data);
    set((state) => ({
      items: state.items.map((i) => (i.id === itemId ? res.data : i)),
      currentItem: state.currentItem?.id === itemId ? { ...state.currentItem, ...res.data } : state.currentItem,
    }));
  },

  deleteItem: async (householdId, itemId) => {
    await api.delete(`/inventory/${householdId}/items/${itemId}`);
    set((state) => ({ items: state.items.filter((i) => i.id !== itemId), currentItem: null }));
  },

  adjustQuantity: async (householdId, itemId, type, quantity, note) => {
    const res = await api.post(`/inventory/${householdId}/items/${itemId}/adjust`, { type, quantity, note });
    set((state) => ({
      items: state.items.map((i) => (i.id === itemId ? res.data.item : i)),
      currentItem: state.currentItem?.id === itemId ? { ...state.currentItem, ...res.data.item } : state.currentItem,
    }));
  },

  archiveItem: async (householdId, itemId) => {
    await api.post(`/inventory/${householdId}/items/${itemId}/archive`);
    set((state) => ({
      items: state.items.filter((i) => i.id !== itemId),
      currentItem: null,
    }));
  },
}));