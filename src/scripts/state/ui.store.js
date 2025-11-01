import { createStore } from './index.js';

/**
 * UI Store
 * Manages UI state (modals, loaders, sidebars, etc.)
 */
export const uiStore = createStore('ui', (set, get) => ({
  // State
  isLoading: false,
  loadingMessage: 'Loading...',
  
  // Modals
  activeModal: null,
  modalData: null,
  
  // Sidebar/Drawer
  isSidebarOpen: false,
  
  // Mobile menu
  isMobileMenuOpen: false,
  
  // Toast queue (for managing multiple toasts)
  toasts: [],
  
  // Actions - Loading
  showLoader: (message = 'Loading...') => {
    set({ isLoading: true, loadingMessage: message });
  },
  
  hideLoader: () => {
    set({ isLoading: false, loadingMessage: 'Loading...' });
  },
  
  // Actions - Modals
  openModal: (modalName, data = null) => {
    set({ activeModal: modalName, modalData: data });
  },
  
  closeModal: () => {
    set({ activeModal: null, modalData: null });
  },
  
  updateModalData: (data) => {
    set({ modalData: data });
  },
  
  // Actions - Sidebar
  openSidebar: () => {
    set({ isSidebarOpen: true });
  },
  
  closeSidebar: () => {
    set({ isSidebarOpen: false });
  },
  
  toggleSidebar: () => {
    set((state) => ({ isSidebarOpen: !state.isSidebarOpen }));
  },
  
  // Actions - Mobile Menu
  openMobileMenu: () => {
    set({ isMobileMenuOpen: true });
  },
  
  closeMobileMenu: () => {
    set({ isMobileMenuOpen: false });
  },
  
  toggleMobileMenu: () => {
    set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen }));
  },
  
  // Actions - Toasts
  addToast: (toast) => {
    const toasts = get().toasts;
    const id = Date.now() + Math.random();
    set({ toasts: [...toasts, { ...toast, id }] });
    return id;
  },
  
  removeToast: (id) => {
    const toasts = get().toasts;
    set({ toasts: toasts.filter((t) => t.id !== id) });
  },
  
  clearToasts: () => {
    set({ toasts: [] });
  },
  
  // Selectors
  isModalOpen: (modalName) => {
    return get().activeModal === modalName;
  },
  
  getModalData: () => {
    return get().modalData;
  },
  
  hasActiveModal: () => {
    return get().activeModal !== null;
  },
}));

export default uiStore;