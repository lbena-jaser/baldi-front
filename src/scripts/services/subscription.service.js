import api from '../core/api.js';
import { showToast } from '../components/toast.js';
import { API_ENDPOINTS, SUCCESS_MESSAGES } from '../config/constants.js';
import eventBus, { EVENTS } from '../core/events.js';

/**
 * Subscription Service
 * Handles subscription management for customers
 */
class SubscriptionService {
  /**
   * Create new subscription
   * @param {Object} subscriptionData - Subscription details
   * @param {string} subscriptionData.planType - FIVE_DAY or SEVEN_DAY
   * @returns {Promise<Object>} Created subscription
   */
  async createSubscription(subscriptionData) {
    try {
      const response = await api.post(API_ENDPOINTS.SUBSCRIPTIONS, subscriptionData);
      
      // Emit event
      eventBus.emit(EVENTS.SUBSCRIPTION_CREATED, response.data);
      
      showToast(SUCCESS_MESSAGES.SUBSCRIPTION_CREATED, 'success');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get all user subscriptions
   * @returns {Promise<Array>} List of subscriptions
   */
  async getMySubscriptions() {
    try {
      const response = await api.get(API_ENDPOINTS.MY_SUBSCRIPTIONS);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get active subscription
   * @returns {Promise<Object|null>} Active subscription or null
   */
  async getActiveSubscription() {
    try {
      const response = await api.get(API_ENDPOINTS.ACTIVE_SUBSCRIPTION);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No active subscription
      }
      throw error;
    }
  }
  
  /**
   * Get subscription by ID
   * @param {string} id - Subscription ID
   * @returns {Promise<Object>} Subscription details
   */
  async getSubscription(id) {
    try {
      const response = await api.get(`${API_ENDPOINTS.SUBSCRIPTIONS}/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Pause subscription
   * @param {string} id - Subscription ID
   * @returns {Promise<Object>} Updated subscription
   */
  async pauseSubscription(id) {
    try {
      const response = await api.post(API_ENDPOINTS.PAUSE_SUBSCRIPTION(id));
      
      // Emit event
      eventBus.emit(EVENTS.SUBSCRIPTION_PAUSED, response.data);
      
      showToast(SUCCESS_MESSAGES.SUBSCRIPTION_PAUSED, 'success');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Resume subscription
   * @param {string} id - Subscription ID
   * @returns {Promise<Object>} Updated subscription
   */
  async resumeSubscription(id) {
    try {
      const response = await api.post(API_ENDPOINTS.RESUME_SUBSCRIPTION(id));
      
      // Emit event
      eventBus.emit(EVENTS.SUBSCRIPTION_RESUMED, response.data);
      
      showToast(SUCCESS_MESSAGES.SUBSCRIPTION_RESUMED, 'success');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Cancel subscription
   * @param {string} id - Subscription ID
   * @returns {Promise<Object>} Updated subscription
   */
  async cancelSubscription(id) {
    try {
      const response = await api.post(API_ENDPOINTS.CANCEL_SUBSCRIPTION(id));
      
      // Emit event
      eventBus.emit(EVENTS.SUBSCRIPTION_CANCELLED, response.data);
      
      showToast(SUCCESS_MESSAGES.SUBSCRIPTION_CANCELLED, 'success');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Check if user has active subscription
   * @returns {Promise<boolean>}
   */
  async hasActiveSubscription() {
    try {
      const subscription = await this.getActiveSubscription();
      return subscription !== null && subscription.status === 'ACTIVE';
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Get subscription status display info
   * @param {string} status - Subscription status
   * @returns {Object} Display information
   */
  getStatusInfo(status) {
    const statusInfo = {
      PENDING: {
        label: 'Pending',
        description: 'Waiting for first order',
        color: 'yellow',
        icon: '⏳',
      },
      ACTIVE: {
        label: 'Active',
        description: 'Subscription is running',
        color: 'green',
        icon: '✅',
      },
      PAUSED: {
        label: 'Paused',
        description: 'Temporarily stopped',
        color: 'blue',
        icon: '⏸️',
      },
      CANCELLED: {
        label: 'Cancelled',
        description: 'Subscription ended',
        color: 'red',
        icon: '❌',
      },
    };
    
    return statusInfo[status] || statusInfo.PENDING;
  }
  
  /**
   * Get plan details
   * @param {string} planType - FIVE_DAY or SEVEN_DAY
   * @returns {Object} Plan information
   */
  getPlanDetails(planType) {
    const plans = {
      FIVE_DAY: {
        name: '5-Day Plan',
        meals: 5,
        description: 'Perfect for weekday meal prep',
        icon: '📦',
        recommended: false,
      },
      SEVEN_DAY: {
        name: '7-Day Plan',
        meals: 7,
        description: 'Complete week coverage',
        icon: '📦📦',
        recommended: true,
      },
    };
    
    return plans[planType] || plans.FIVE_DAY;
  }
  
  /**
   * Calculate next delivery date based on subscription
   * @param {Object} subscription - Subscription object
   * @returns {Date|null} Next delivery date
   */
  getNextDeliveryDate(subscription) {
    if (!subscription || !subscription.nextDeliveryDate) {
      return null;
    }
    
    return new Date(subscription.nextDeliveryDate);
  }
  
  /**
   * Get days until next delivery
   * @param {Object} subscription - Subscription object
   * @returns {number|null} Days until delivery
   */
  getDaysUntilNextDelivery(subscription) {
    const nextDate = this.getNextDeliveryDate(subscription);
    
    if (!nextDate) {
      return null;
    }
    
    const now = new Date();
    const diff = nextDate - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    return days;
  }
}

export default new SubscriptionService();