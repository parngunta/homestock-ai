import { create } from 'zustand';
import api from '@/lib/api';
import type { Activity } from '@/types';

interface ActivityStore {
  activities: Activity[];
  isLoading: boolean;
  error: string | null;
  fetchActivities: (householdId: string, limit?: number) => Promise<void>;
}

export const useActivityStore = create<ActivityStore>((set) => ({
  activities: [],
  isLoading: false,
  error: null,
  fetchActivities: async (householdId: string, limit = 20) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/activity/${householdId}?limit=${limit}`);
      set({ activities: res.data, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Failed to load activity', isLoading: false });
    }
  },
}));
