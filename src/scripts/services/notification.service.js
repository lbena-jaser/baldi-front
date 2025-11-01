import api from '../core/api.js';
import authManager from '../core/auth.js';
import { showToast } from '../components/toast.js';
import { API_ENDPOINTS } from '../config/constants.js';
import eventBus, { EVENTS } from '../core/events.js';

/**
 * Notification Service
 * Handles in-app notifications and real-time SSE
 */
class NotificationService {
  constructor() {
    this.eventSource = null;
    this.isConnected = false;
  }
  
  /**
   * Get all notifications
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status (optional)
   * @param {string} params.type - Filter by type (optional)
   * @param {number} params.page - Page number (optional)
   * @param {number} params.limit - Items per page (optional)
   * @returns {Promise<Object>} Notifications with pagination
   */
  async getNotifications(params = {}) {
    try {
      const response = await api.get(API_ENDPOINTS.NOTIFICATIONS, { params });
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get unread notification count
   * @returns {Promise<number>} Unread count
   */
  async getUnreadCount() {
    try {
      const response = await api.get(API_ENDPOINTS.UNREAD_COUNT);
      return response.data.unreadCount;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Mark notification as read
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  async markAsRead(id) {
    try {
      const response = await api.patch(API_ENDPOINTS.MARK_READ(id));
      
      // Emit event
      eventBus.emit(EVENTS.NOTIFICATION_READ, response.data);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Result with count
   */
  async markAllAsRead() {
    try {
      const response = await api.patch(API_ENDPOINTS.MARK_ALL_READ);
      
      showToast('All notifications marked as read', 'success');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Archive notification
   * @param {string} id - Notification ID
   * @returns {Promise<Object>} Updated notification
   */
  async archiveNotification(id) {
    try {
      const response = await api.patch(
        `${API_ENDPOINTS.NOTIFICATION(id)}/archive`
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Delete notification
   * @param {string} id - Notification ID
   * @returns {Promise<void>}
   */
  async deleteNotification(id) {
    try {
      await api.delete(API_ENDPOINTS.NOTIFICATION(id));
      
      showToast('Notification deleted', 'info');
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Connect to notification stream (SSE)
   * @param {Function} onNotification - Callback for new notifications
   * @returns {void}
   */
  connectToStream(onNotification) {
    // Disconnect existing connection
    this.disconnectFromStream();
    
    const token = authManager.getAccessToken();
    
    if (!token) {
      console.warn('No auth token for SSE connection');
      return;
    }
    
    try {
      // Create EventSource with auth token
      // Note: EventSource doesn't support custom headers, so we pass token in URL
      const streamUrl = `${import.meta.env.VITE_API_URL}${API_ENDPOINTS.NOTIFICATION_STREAM}?token=${token}`;
      
      this.eventSource = new EventSource(streamUrl);
      
      this.eventSource.onopen = () => {
        this.isConnected = true;
        console.log('✅ Notification stream connected');
      };
      
      this.eventSource.onmessage = (event) => {
        try {
          const notification = JSON.parse(event.data);
          
          // Emit event
          eventBus.emit(EVENTS.NOTIFICATION_RECEIVED, notification);
          
          // Call callback
          if (onNotification) {
            onNotification(notification);
          }
          
          // Show toast for important notifications
          this.showNotificationToast(notification);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      };
      
      this.eventSource.onerror = (error) => {
        console.error('SSE connection error:', error);
        this.isConnected = false;
        
        // Auto-reconnect after 5 seconds
        setTimeout(() => {
          if (authManager.isAuthenticated()) {
            this.connectToStream(onNotification);
          }
        }, 5000);
      };
    } catch (error) {
      console.error('Failed to connect to notification stream:', error);
    }
  }
  
  /**
   * Disconnect from notification stream
   * @returns {void}
   */
  disconnectFromStream() {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
      this.isConnected = false;
      console.log('Notification stream disconnected');
    }
  }
  
  /**
   * Show toast for notification
   * @param {Object} notification - Notification object
   * @returns {void}
   */
  showNotificationToast(notification) {
    // Show toast for specific types
    const toastTypes = [
      'DELIVERY_CONFIRMED',
      'DELIVERY_OUT_FOR_DELIVERY',
      'DELIVERY_DELIVERED',
      'PAYMENT_COMPLETED',
      'PAYMENT_FAILED',
      'REFERRAL_REWARD',
      'DISCOUNT_APPLIED',
    ];
    
    if (toastTypes.includes(notification.type)) {
      showToast(notification.message, 'info');
    }
  }
  
  /**
   * Get notification type info for display
   * @param {string} type - Notification type
   * @returns {Object} Display information
   */
  getTypeInfo(type) {
    const types = {
      DELIVERY_REMINDER: {
        icon: '🔔',
        color: 'blue',
        priority: 'normal',
      },
      DELIVERY_CONFIRMED: {
        icon: '✅',
        color: 'green',
        priority: 'high',
      },
      DELIVERY_OUT_FOR_DELIVERY: {
        icon: '🚚',
        color: 'purple',
        priority: 'high',
      },
      DELIVERY_DELIVERED: {
        icon: '📦',
        color: 'green',
        priority: 'high',
      },
      PAYMENT_PENDING: {
        icon: '💳',
        color: 'yellow',
        priority: 'high',
      },
      PAYMENT_COMPLETED: {
        icon: '✅',
        color: 'green',
        priority: 'normal',
      },
      PAYMENT_FAILED: {
        icon: '❌',
        color: 'red',
        priority: 'high',
      },
      SUBSCRIPTION_PAUSED: {
        icon: '⏸️',
        color: 'blue',
        priority: 'normal',
      },
      SUBSCRIPTION_RESUMED: {
        icon: '▶️',
        color: 'green',
        priority: 'normal',
      },
      SUBSCRIPTION_CANCELLED: {
        icon: '🚫',
        color: 'red',
        priority: 'normal',
      },
      REFERRAL_REWARD: {
        icon: '🎁',
        color: 'purple',
        priority: 'normal',
      },
      DISCOUNT_APPLIED: {
        icon: '🎉',
        color: 'green',
        priority: 'normal',
      },
      SYSTEM_ANNOUNCEMENT: {
        icon: '📢',
        color: 'blue',
        priority: 'low',
      },
    };
    
    return types[type] || types.SYSTEM_ANNOUNCEMENT;
  }
  
  /**
   * Filter notifications by status
   * @param {Array} notifications - List of notifications
   * @param {string} status - Status to filter by
   * @returns {Array} Filtered notifications
   */
  filterByStatus(notifications, status) {
    if (!status) {
      return notifications;
    }
    return notifications.filter((n) => n.status === status);
  }
  
  /**
   * Filter notifications by type
   * @param {Array} notifications - List of notifications
   * @param {string} type - Type to filter by
   * @returns {Array} Filtered notifications
   */
  filterByType(notifications, type) {
    if (!type) {
      return notifications;
    }
    return notifications.filter((n) => n.type === type);
  }
  
  /**
   * Get unread notifications
   * @param {Array} notifications - List of notifications
   * @returns {Array} Unread notifications
   */
  getUnreadNotifications(notifications) {
    return notifications.filter((n) => n.status === 'UNREAD');
  }
  
  /**
   * Sort notifications by date (newest first)
   * @param {Array} notifications - List of notifications
   * @returns {Array} Sorted notifications
   */
  sortByDate(notifications) {
    return [...notifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }
  
  /**
   * Check if stream is connected
   * @returns {boolean}
   */
  isStreamConnected() {
    return this.isConnected;
  }
}

export default new NotificationService();