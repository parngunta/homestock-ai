import { create } from 'zustand';
import api from '@/lib/api';
import type { NotificationItem } from '@/types';

interface NotificationState {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  fetchNotifications: (householdId: string) => Promise<void>;
  markRead: (notificationId: string) => Promise<void>;
  markAllRead: (householdId: string) => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set) => ({
  notifications: [],
  unreadCount: 0,
  isLoading: false,

  fetchNotifications: async (householdId) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/notifications/${householdId}`);
      set({ notifications: res.data, unreadCount: res.data.filter((n: NotificationItem) => !n.isRead).length, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  markRead: async (notificationId) => {
    await api.patch(`/notifications/${notificationId}/read`);
    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
  },

  markAllRead: async (householdId) => {
    await api.post('/notifications/mark-all-read', { householdId });
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },
}));