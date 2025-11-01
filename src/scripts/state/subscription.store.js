import { createStore } from './index.js';

/**
 * Subscription Store
 * Manages subscription state
 */
export const subscriptionStore = createStore('subscription', (set, get) => ({
  // State
  activeSubscription: null,
  allSubscriptions: [],
  isLoading: false,
  
  // Actions
  setActiveSubscription: (subscription) => {
    set({ activeSubscription: subscription });
  },
  
  setAllSubscriptions: (subscriptions) => {
    set({ allSubscriptions: subscriptions });
  },
  
  setLoading: (isLoading) => {
    set({ isLoading });
  },
  
  updateSubscription: (updates) => {
    const current = get().activeSubscription;
    if (current) {
      set({ activeSubscription: { ...current, ...updates } });
    }
  },
  
  clearSubscription: () => {
    set({
      activeSubscription: null,
      allSubscriptions: [],
    });
  },
  
  // Selectors
  hasActiveSubscription: () => {
    const subscription = get().activeSubscription;
    return subscription && subscription.status === 'ACTIVE';
  },
  
  getNextDeliveryDate: () => {
    const subscription = get().activeSubscription;
    return subscription?.nextDeliveryDate || null;
  },
  
  getPlanType: () => {
    const subscription = get().activeSubscription;
    return subscription?.planType || null;
  },
  
  isPending: () => {
    const subscription = get().activeSubscription;
    return subscription?.status === 'PENDING';
  },
  
  isPaused: () => {
    const subscription = get().activeSubscription;
    return subscription?.status === 'PAUSED';
  },
  
  isCancelled: () => {
    const subscription = get().activeSubscription;
    return subscription?.status === 'CANCELLED';
  },
}));

export default subscriptionStore;