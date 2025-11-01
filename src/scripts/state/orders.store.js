import { createStore } from './index.js';

/**
 * Orders Store
 * Manages delivery orders state
 */
export const ordersStore = createStore('orders', (set, get) => ({
  // State
  orders: [],
  currentOrder: null,
  isLoading: false,
  
  // Actions
  setOrders: (orders) => {
    set({ orders });
  },
  
  setCurrentOrder: (order) => {
    set({ currentOrder: order });
  },
  
  addOrder: (order) => {
    const orders = get().orders;
    set({ orders: [order, ...orders] });
  },
  
  updateOrder: (orderId, updates) => {
    const orders = get().orders;
    set({
      orders: orders.map((order) =>
        order.id === orderId ? { ...order, ...updates } : order
      ),
    });
    
    // Update current order if it's the same
    const currentOrder = get().currentOrder;
    if (currentOrder && currentOrder.id === orderId) {
      set({ currentOrder: { ...currentOrder, ...updates } });
    }
  },
  
  removeOrder: (orderId) => {
    const orders = get().orders;
    set({ orders: orders.filter((order) => order.id !== orderId) });
  },
  
  setLoading: (isLoading) => {
    set({ isLoading });
  },
  
  clearOrders: () => {
    set({
      orders: [],
      currentOrder: null,
    });
  },
  
  // Selectors
  getOrderById: (id) => {
    const orders = get().orders;
    return orders.find((order) => order.id === id);
  },
  
  getUpcomingOrders: () => {
    const orders = get().orders;
    const now = new Date();
    
    return orders.filter((order) => {
      const scheduledDate = new Date(order.scheduledDate);
      return (
        scheduledDate >= now &&
        order.status !== 'CANCELLED' &&
        order.status !== 'DELIVERED'
      );
    });
  },
  
  getPastOrders: () => {
    const orders = get().orders;
    const now = new Date();
    
    return orders.filter((order) => {
      const scheduledDate = new Date(order.scheduledDate);
      return scheduledDate < now || order.status === 'DELIVERED';
    });
  },
  
  getOrdersByStatus: (status) => {
    const orders = get().orders;
    return orders.filter((order) => order.status === status);
  },
  
  getPendingOrders: () => {
    return get().getOrdersByStatus('SCHEDULED');
  },
  
  getDeliveredOrders: () => {
    return get().getOrdersByStatus('DELIVERED');
  },
  
  hasUpcomingOrders: () => {
    return get().getUpcomingOrders().length > 0;
  },
  
  getTotalOrders: () => {
    return get().orders.length;
  },
}));

export default ordersStore;