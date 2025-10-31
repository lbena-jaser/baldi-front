import { createStore } from './index.js';
import storage from '../core/storage.js';
import { STORAGE_KEYS } from '../config/constants.js';

export const authStore = createStore('auth', (set, get) => ({
  // State
  user: storage.get(STORAGE_KEYS.USER) || null,
  isAuthenticated: !!storage.get(STORAGE_KEYS.USER),
  isLoading: false,
  requires2FA: false,
  tempToken: null,
  
  // Actions
  setUser: (user) => {
    storage.set(STORAGE_KEYS.USER, user);
    set({ user, isAuthenticated: true });
  },
  
  setLoading: (isLoading) => {
    set({ isLoading });
  },
  
  setRequires2FA: (requires2FA, tempToken = null) => {
    set({ requires2FA, tempToken });
  },
  
  logout: () => {
    storage.remove(STORAGE_KEYS.USER);
    set({
      user: null,
      isAuthenticated: false,
      requires2FA: false,
      tempToken: null,
    });
  },
  
  updateUser: (updates) => {
    const currentUser = get().user;
    const updatedUser = { ...currentUser, ...updates };
    storage.set(STORAGE_KEYS.USER, updatedUser);
    set({ user: updatedUser });
  },
  
  // Selectors
  getUser: () => get().user,
  
  isAdmin: () => {
    const user = get().user;
    return user?.role === 'SUPER_ADMIN' || user?.role === 'MANAGER';
  },
}));

export default authStore;