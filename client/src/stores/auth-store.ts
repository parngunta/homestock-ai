import { create } from 'zustand';
import api from '@/lib/api';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: localStorage.getItem('auth_token'),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data;
      localStorage.setItem('auth_token', token);
      set({ user, token, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Login failed', isLoading: false });
      throw err;
    }
  },

  register: async (email, password, name) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', { email, password, name });
      const { user, token } = res.data;
      localStorage.setItem('auth_token', token);
      set({ user, token, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.error || 'Registration failed', isLoading: false });
      throw err;
    }
  },

  logout: () => {
    localStorage.removeItem('auth_token');
    set({ user: null, token: null });
  },

  checkAuth: async () => {
    const token = localStorage.getItem('auth_token');
    if (!token) {
      set({ user: null, token: null });
      return;
    }
    try {
      const res = await api.get('/auth/me');
      set({ user: res.data, token, isLoading: false });
    } catch {
      localStorage.removeItem('auth_token');
      set({ user: null, token: null });
    }
  },
}));