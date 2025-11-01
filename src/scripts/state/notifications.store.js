import { createStore } from './index.js';

/**
 * Notifications Store
 * Manages in-app notifications state
 */
export const notificationsStore = createStore('notifications', (set, get) => ({
  // State
  notifications: [],
  unreadCount: 0,
  isLoading: false,
  
  // Actions
  setNotifications: (notifications) => {
    set({ notifications });
    get().updateUnreadCount();
  },
  
  addNotification: (notification) => {
    const notifications = get().notifications;
    set({ notifications: [notification, ...notifications] });
    get().updateUnreadCount();
  },
  
  updateNotification: (notificationId, updates) => {
    const notifications = get().notifications;
    set({
      notifications: notifications.map((notif) =>
        notif.id === notificationId ? { ...notif, ...updates } : notif
      ),
    });
    get().updateUnreadCount();
  },
  
  removeNotification: (notificationId) => {
    const notifications = get().notifications;
    set({
      notifications: notifications.filter((notif) => notif.id !== notificationId),
    });
    get().updateUnreadCount();
  },
  
  markAsRead: (notificationId) => {
    get().updateNotification(notificationId, {
      status: 'READ',
      readAt: new Date().toISOString(),
    });
  },
  
  markAllAsRead: () => {
    const notifications = get().notifications;
    const now = new Date().toISOString();
    
    set({
      notifications: notifications.map((notif) => ({
        ...notif,
        status: 'READ',
        readAt: notif.readAt || now,
      })),
    });
    
    set({ unreadCount: 0 });
  },
  
  setUnreadCount: (count) => {
    set({ unreadCount: count });
  },
  
  updateUnreadCount: () => {
    const notifications = get().notifications;
    const unread = notifications.filter((n) => n.status === 'UNREAD').length;
    set({ unreadCount: unread });
  },
  
  setLoading: (isLoading) => {
    set({ isLoading });
  },
  
  clearNotifications: () => {
    set({
      notifications: [],
      unreadCount: 0,
    });
  },
  
  // Selectors
  getUnreadNotifications: () => {
    const notifications = get().notifications;
    return notifications.filter((n) => n.status === 'UNREAD');
  },
  
  getReadNotifications: () => {
    const notifications = get().notifications;
    return notifications.filter((n) => n.status === 'READ');
  },
  
  getNotificationsByType: (type) => {
    const notifications = get().notifications;
    return notifications.filter((n) => n.type === type);
  },
  
  hasUnreadNotifications: () => {
    return get().unreadCount > 0;
  },
  
  getLatestNotifications: (limit = 5) => {
    const notifications = get().notifications;
    return notifications.slice(0, limit);
  },
}));

export default notificationsStore;