// Custom Event Bus for component communication
class EventBus {
  constructor() {
    this.events = {};
  }
  
  // Subscribe to event
  on(event, callback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    
    this.events[event].push(callback);
    
    // Return unsubscribe function
    return () => this.off(event, callback);
  }
  
  // Unsubscribe from event
  off(event, callback) {
    if (!this.events[event]) {
      return;
    }
    
    this.events[event] = this.events[event].filter((cb) => cb !== callback);
  }
  
  // Emit event
  emit(event, data) {
    if (!this.events[event]) {
      return;
    }
    
    this.events[event].forEach((callback) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event handler for ${event}:`, error);
      }
    });
  }
  
  // Subscribe once (auto-unsubscribe after first call)
  once(event, callback) {
    const onceCallback = (data) => {
      callback(data);
      this.off(event, onceCallback);
    };
    
    this.on(event, onceCallback);
  }
  
  // Clear all listeners for event
  clear(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
  
  // Get listener count
  listenerCount(event) {
    return this.events[event] ? this.events[event].length : 0;
  }
}

export default new EventBus();

// Common event names
export const EVENTS = {
  // Auth events
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  AUTH_REGISTER: 'auth:register',
  AUTH_TOKEN_REFRESH: 'auth:token-refresh',
  AUTH_2FA_REQUIRED: 'auth:2fa-required',
  
  // User events
  USER_UPDATED: 'user:updated',
  
  // Cart events
  CART_UPDATED: 'cart:updated',
  CART_CLEARED: 'cart:cleared',
  CART_ITEM_ADDED: 'cart:item-added',
  CART_ITEM_REMOVED: 'cart:item-removed',
  
  // Order events
  ORDER_CREATED: 'order:created',
  ORDER_CONFIRMED: 'order:confirmed',
  ORDER_CANCELLED: 'order:cancelled',
  
  // Subscription events
  SUBSCRIPTION_CREATED: 'subscription:created',
  SUBSCRIPTION_PAUSED: 'subscription:paused',
  SUBSCRIPTION_RESUMED: 'subscription:resumed',
  SUBSCRIPTION_CANCELLED: 'subscription:cancelled',
  
  // Notification events
  NOTIFICATION_RECEIVED: 'notification:received',
  NOTIFICATION_READ: 'notification:read',
  
  // UI events
  MODAL_OPENED: 'modal:opened',
  MODAL_CLOSED: 'modal:closed',
  LOADER_SHOW: 'loader:show',
  LOADER_HIDE: 'loader:hide',
  TOAST_SHOW: 'toast:show',
};