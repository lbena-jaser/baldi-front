import api from '../core/api.js';
import { showToast } from '../components/toast.js';
import { API_ENDPOINTS, SUCCESS_MESSAGES } from '../config/constants.js';
import { copyToClipboard } from '../core/utils.js';

/**
 * Referral Service
 * Handles referral code generation and management
 */
class ReferralService {
  /**
   * Create referral code
   * @param {Object} options - Referral options (optional)
   * @param {number} options.maxUsage - Max number of uses (optional)
   * @param {number} options.discountPercent - Discount percentage (optional)
   * @param {number} options.expiryDays - Days until expiry (optional)
   * @returns {Promise<Object>} Created referral
   */
  async createReferral(options = {}) {
    try {
      const response = await api.post(API_ENDPOINTS.REFERRALS, options);
      
      showToast('Referral code created successfully!', 'success');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get my referrals
   * @returns {Promise<Array>} List of referrals
   */
  async getMyReferrals() {
    try {
      const response = await api.get(API_ENDPOINTS.MY_REFERRALS);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get referral statistics
   * @returns {Promise<Object>} Referral stats
   */
  async getMyStats() {
    try {
      const response = await api.get(API_ENDPOINTS.MY_REFERRAL_STATS);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get my referral discount (if applied)
   * @returns {Promise<Object|null>} Discount info or null
   */
  async getMyDiscount() {
    try {
      const response = await api.get(API_ENDPOINTS.MY_DISCOUNT);
      return response.data;
    } catch (error) {
      if (error.response?.status === 404) {
        return null; // No discount
      }
      throw error;
    }
  }
  
  /**
   * Get referral by code
   * @param {string} code - Referral code
   * @returns {Promise<Object>} Referral details
   */
  async getReferralByCode(code) {
    try {
      const response = await api.get(API_ENDPOINTS.REFERRAL_BY_CODE(code));
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Apply referral code
   * @param {string} code - Referral code
   * @returns {Promise<Object>} Applied referral result
   */
  async applyReferral(code) {
    try {
      const response = await api.post(API_ENDPOINTS.APPLY_REFERRAL, {
        referralCode: code,
      });
      
      const discount = response.data.discount;
      showToast(
        `${SUCCESS_MESSAGES.REFERRAL_APPLIED} You got ${discount}% discount!`,
        'success'
      );
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Copy referral code to clipboard
   * @param {string} code - Referral code
   * @returns {Promise<boolean>} Success status
   */
  async copyReferralCode(code) {
    const success = await copyToClipboard(code);
    
    if (success) {
      showToast(SUCCESS_MESSAGES.COPIED_TO_CLIPBOARD, 'success');
    } else {
      showToast('Failed to copy code', 'error');
    }
    
    return success;
  }
  
  /**
   * Generate shareable link
   * @param {string} code - Referral code
   * @returns {string} Shareable URL
   */
  generateShareLink(code) {
    const baseUrl = window.location.origin;
    return `${baseUrl}/register.html?ref=${code}`;
  }
  
  /**
   * Share referral on social media
   * @param {string} code - Referral code
   * @param {string} platform - Social platform (facebook, twitter, whatsapp)
   * @returns {void}
   */
  shareOnSocial(code, platform) {
    const link = this.generateShareLink(code);
    const text = `Join Baldi Meals and get 10% off your first order! Use my code: ${code}`;
    
    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(link)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + link)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}`,
    };
    
    const url = urls[platform];
    
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
    }
  }
  
  /**
   * Get referral status info
   * @param {string} status - Referral status
   * @returns {Object} Display information
   */
  getStatusInfo(status) {
    const statusInfo = {
      PENDING: {
        label: 'Active',
        description: 'Available for use',
        color: 'green',
        icon: '✅',
      },
      COMPLETED: {
        label: 'Completed',
        description: 'All uses claimed',
        color: 'gray',
        icon: '✔️',
      },
      EXPIRED: {
        label: 'Expired',
        description: 'No longer valid',
        color: 'red',
        icon: '❌',
      },
    };
    
    return statusInfo[status] || statusInfo.PENDING;
  }
  
  /**
   * Check if referral is active
   * @param {Object} referral - Referral object
   * @returns {boolean}
   */
  isActive(referral) {
    if (referral.status !== 'PENDING') {
      return false;
    }
    
    if (referral.expiresAt) {
      const expiryDate = new Date(referral.expiresAt);
      const now = new Date();
      
      if (now > expiryDate) {
        return false;
      }
    }
    
    if (referral.maxUsage && referral.usageCount >= referral.maxUsage) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Get uses remaining
   * @param {Object} referral - Referral object
   * @returns {number|string} Uses remaining or "Unlimited"
   */
  getUsesRemaining(referral) {
    if (!referral.maxUsage) {
      return 'Unlimited';
    }
    
    return Math.max(0, referral.maxUsage - referral.usageCount);
  }
  
  /**
   * Get days until expiry
   * @param {Object} referral - Referral object
   * @returns {number|null} Days until expiry or null
   */
  getDaysUntilExpiry(referral) {
    if (!referral.expiresAt) {
      return null;
    }
    
    const expiryDate = new Date(referral.expiresAt);
    const now = new Date();
    const diff = expiryDate - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    return days;
  }
  
  /**
   * Format referral code for display
   * @param {string} code - Referral code
   * @returns {string} Formatted code
   */
  formatCode(code) {
    // Add dashes every 4 characters for readability
    // e.g., ABCD1234 -> ABCD-1234
    return code.match(/.{1,4}/g)?.join('-') || code;
  }
}

export default new ReferralService();