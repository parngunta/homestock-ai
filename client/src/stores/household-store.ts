import { create } from 'zustand';
import api from '@/lib/api';
import type { Household, HouseholdMember } from '@/types';

interface HouseholdState {
  households: Household[];
  currentHousehold: (Household & { members: HouseholdMember[] }) | null;
  isLoading: boolean;
  error: string | null;
  fetchHouseholds: () => Promise<void>;
  fetchHousehold: (id: string) => Promise<void>;
  createHousehold: (name: string) => Promise<Household>;
  inviteMember: (householdId: string, email: string, role: string) => Promise<void>;
  removeMember: (householdId: string, memberId: string) => Promise<void>;
  joinHousehold: (inviteCode: string) => Promise<void>;
  setCurrentHousehold: (id: string) => void;
}

export const useHouseholdStore = create<HouseholdState>((set, get) => ({
  households: [],
  currentHousehold: null,
  isLoading: false,
  error: null,

  fetchHouseholds: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/households');
      set({ households: res.data, isLoading: false });
      const saved = localStorage.getItem('current_household_id');
      if (saved && res.data.find((h: Household) => h.id === saved)) {
        get().fetchHousehold(saved);
      } else if (res.data.length > 0) {
        get().fetchHousehold(res.data[0].id);
      }
    } catch {
      set({ isLoading: false });
    }
  },

  fetchHousehold: async (id) => {
    try {
      const res = await api.get(`/households/${id}`);
      set({ currentHousehold: res.data });
      localStorage.setItem('current_household_id', id);
    } catch {
      // handle error
    }
  },

  createHousehold: async (name) => {
    const res = await api.post('/households', { name });
    set((state) => ({ households: [...state.households, res.data] }));
    await get().fetchHousehold(res.data.id);
    return res.data;
  },

  inviteMember: async (householdId, email, role) => {
    await api.post(`/households/${householdId}/invite`, { email, role });
    await get().fetchHousehold(householdId);
  },

  removeMember: async (householdId, memberId) => {
    await api.delete(`/households/${householdId}/members/${memberId}`);
    await get().fetchHousehold(householdId);
  },

  joinHousehold: async (inviteCode) => {
    const res = await api.post('/households/join', { inviteCode });
    await get().fetchHouseholds();
    return res.data;
  },

  setCurrentHousehold: (id) => {
    get().fetchHousehold(id);
  },
}));