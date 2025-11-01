import { createStore } from './index.js';
import storage from '../core/storage.js';
import { STORAGE_KEYS } from '../config/constants.js';

/**
 * User Store
 * Manages user preferences, settings, and UI state
 * (Auth state is handled in auth.store.js)
 */
export const userStore = createStore('user', (set, get) => ({
  // State - Preferences
  preferences: storage.get(STORAGE_KEYS.PREFIX + 'preferences') || {
    language: 'en',
    theme: 'light',
    emailNotifications: true,
    smsNotifications: false,
    currency: 'TND',
    timeZone: 'Africa/Tunis',
  },
  
  // State - UI Settings
  sidebarCollapsed: storage.get(STORAGE_KEYS.PREFIX + 'sidebarCollapsed') || false,
  viewMode: storage.get(STORAGE_KEYS.PREFIX + 'viewMode') || 'grid', // grid or list
  sortPreference: storage.get(STORAGE_KEYS.PREFIX + 'sortPreference') || 'date',
  
  // State - User Activity
  lastActive: storage.get(STORAGE_KEYS.PREFIX + 'lastActive') || new Date().toISOString(),
  recentSearches: storage.get(STORAGE_KEYS.PREFIX + 'recentSearches') || [],
  favoriteItems: storage.get(STORAGE_KEYS.PREFIX + 'favoriteItems') || [],
  
  // Actions - Preferences
  setPreferences: (preferences) => {
    set({ preferences });
    storage.set(STORAGE_KEYS.PREFIX + 'preferences', preferences);
  },
  
  updatePreference: (key, value) => {
    const preferences = get().preferences;
    const updated = { ...preferences, [key]: value };
    set({ preferences: updated });
    storage.set(STORAGE_KEYS.PREFIX + 'preferences', updated);
  },
  
  setLanguage: (language) => {
    get().updatePreference('language', language);
    
    // Update document language
    document.documentElement.lang = language;
  },
  
  setTheme: (theme) => {
    get().updatePreference('theme', theme);
    
    // Update document theme
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  },
  
  toggleEmailNotifications: () => {
    const current = get().preferences.emailNotifications;
    get().updatePreference('emailNotifications', !current);
  },
  
  toggleSMSNotifications: () => {
    const current = get().preferences.smsNotifications;
    get().updatePreference('smsNotifications', !current);
  },
  
  // Actions - UI Settings
  setSidebarCollapsed: (collapsed) => {
    set({ sidebarCollapsed: collapsed });
    storage.set(STORAGE_KEYS.PREFIX + 'sidebarCollapsed', collapsed);
  },
  
  toggleSidebar: () => {
    const collapsed = get().sidebarCollapsed;
    get().setSidebarCollapsed(!collapsed);
  },
  
  setViewMode: (mode) => {
    set({ viewMode: mode });
    storage.set(STORAGE_KEYS.PREFIX + 'viewMode', mode);
  },
  
  toggleViewMode: () => {
    const mode = get().viewMode === 'grid' ? 'list' : 'grid';
    get().setViewMode(mode);
  },
  
  setSortPreference: (sort) => {
    set({ sortPreference: sort });
    storage.set(STORAGE_KEYS.PREFIX + 'sortPreference', sort);
  },
  
  // Actions - User Activity
  updateLastActive: () => {
    const now = new Date().toISOString();
    set({ lastActive: now });
    storage.set(STORAGE_KEYS.PREFIX + 'lastActive', now);
  },
  
  addRecentSearch: (query) => {
    const searches = get().recentSearches;
    const updated = [query, ...searches.filter(s => s !== query)].slice(0, 10);
    set({ recentSearches: updated });
    storage.set(STORAGE_KEYS.PREFIX + 'recentSearches', updated);
  },
  
  clearRecentSearches: () => {
    set({ recentSearches: [] });
    storage.remove(STORAGE_KEYS.PREFIX + 'recentSearches');
  },
  
  removeRecentSearch: (query) => {
    const searches = get().recentSearches;
    const updated = searches.filter(s => s !== query);
    set({ recentSearches: updated });
    storage.set(STORAGE_KEYS.PREFIX + 'recentSearches', updated);
  },
  
  addFavoriteItem: (item) => {
    const favorites = get().favoriteItems;
    
    // Check if already favorited
    if (favorites.some(f => f.id === item.id && f.type === item.type)) {
      return;
    }
    
    const updated = [item, ...favorites];
    set({ favoriteItems: updated });
    storage.set(STORAGE_KEYS.PREFIX + 'favoriteItems', updated);
  },
  
  removeFavoriteItem: (itemId, itemType) => {
    const favorites = get().favoriteItems;
    const updated = favorites.filter(f => !(f.id === itemId && f.type === itemType));
    set({ favoriteItems: updated });
    storage.set(STORAGE_KEYS.PREFIX + 'favoriteItems', updated);
  },
  
  toggleFavoriteItem: (item) => {
    const favorites = get().favoriteItems;
    const exists = favorites.some(f => f.id === item.id && f.type === item.type);
    
    if (exists) {
      get().removeFavoriteItem(item.id, item.type);
    } else {
      get().addFavoriteItem(item);
    }
  },
  
  clearFavorites: () => {
    set({ favoriteItems: [] });
    storage.remove(STORAGE_KEYS.PREFIX + 'favoriteItems');
  },
  
  // Actions - Reset
  resetPreferences: () => {
    const defaults = {
      language: 'en',
      theme: 'light',
      emailNotifications: true,
      smsNotifications: false,
      currency: 'TND',
      timeZone: 'Africa/Tunis',
    };
    
    set({ preferences: defaults });
    storage.set(STORAGE_KEYS.PREFIX + 'preferences', defaults);
  },
  
  resetUISettings: () => {
    set({
      sidebarCollapsed: false,
      viewMode: 'grid',
      sortPreference: 'date',
    });
    
    storage.remove(STORAGE_KEYS.PREFIX + 'sidebarCollapsed');
    storage.remove(STORAGE_KEYS.PREFIX + 'viewMode');
    storage.remove(STORAGE_KEYS.PREFIX + 'sortPreference');
  },
  
  clearUserData: () => {
    get().resetPreferences();
    get().resetUISettings();
    get().clearRecentSearches();
    get().clearFavorites();
    
    set({
      lastActive: new Date().toISOString(),
    });
  },
  
  // Selectors - Preferences
  getLanguage: () => {
    return get().preferences.language;
  },
  
  getTheme: () => {
    return get().preferences.theme;
  },
  
  isDarkMode: () => {
    return get().preferences.theme === 'dark';
  },
  
  hasEmailNotifications: () => {
    return get().preferences.emailNotifications === true;
  },
  
  hasSMSNotifications: () => {
    return get().preferences.smsNotifications === true;
  },
  
  getCurrency: () => {
    return get().preferences.currency;
  },
  
  getTimeZone: () => {
    return get().preferences.timeZone;
  },
  
  // Selectors - UI
  isGridView: () => {
    return get().viewMode === 'grid';
  },
  
  isListView: () => {
    return get().viewMode === 'list';
  },
  
  isSidebarCollapsed: () => {
    return get().sidebarCollapsed;
  },
  
  // Selectors - Activity
  getRecentSearches: () => {
    return get().recentSearches;
  },
  
  getFavoriteItems: () => {
    return get().favoriteItems;
  },
  
  isFavorite: (itemId, itemType) => {
    const favorites = get().favoriteItems;
    return favorites.some(f => f.id === itemId && f.type === itemType);
  },
  
  hasFavorites: () => {
    return get().favoriteItems.length > 0;
  },
  
  getFavoritesByType: (type) => {
    const favorites = get().favoriteItems;
    return favorites.filter(f => f.type === type);
  },
  
  getFavoriteMeals: () => {
    return get().getFavoritesByType('meal');
  },
  
  getLastActive: () => {
    return get().lastActive;
  },
  
  getMinutesSinceLastActive: () => {
    const lastActive = new Date(get().lastActive);
    const now = new Date();
    const diff = now - lastActive;
    return Math.floor(diff / (1000 * 60));
  },
}));

export default userStore;