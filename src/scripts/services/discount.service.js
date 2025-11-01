import api from '../core/api.js';
import { showToast } from '../components/toast.js';
import { API_ENDPOINTS, SUCCESS_MESSAGES } from '../config/constants.js';

/**
 * Discount Service
 * Handles discount code validation and application
 */
class DiscountService {
  /**
   * Validate discount code
   * @param {string} code - Discount code
   * @param {number} orderAmount - Order amount to validate against
   * @returns {Promise<Object>} Validation result with discount amount
   */
  async validateDiscount(code, orderAmount) {
    try {
      const response = await api.post(API_ENDPOINTS.VALIDATE_DISCOUNT, {
        code,
        orderAmount,
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get active discounts (public)
   * @returns {Promise<Array>} List of active discount codes
   */
  async getActiveDiscounts() {
    try {
      const response = await api.get(API_ENDPOINTS.ACTIVE_DISCOUNTS);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get my discount usages
   * @returns {Promise<Array>} List of used discounts
   */
  async getMyUsages() {
    try {
      const response = await api.get(API_ENDPOINTS.MY_DISCOUNT_USAGES);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Apply discount code (during checkout)
   * This validates and returns discount info without creating order
   * @param {string} code - Discount code
   * @param {number} orderAmount - Order amount
   * @returns {Promise<Object>} Discount details
   */
  async applyDiscount(code, orderAmount) {
    try {
      const result = await this.validateDiscount(code, orderAmount);
      
      if (result.discountAmount > 0) {
        showToast(
          `${SUCCESS_MESSAGES.DISCOUNT_APPLIED} You saved ${result.discountAmount} TND!`,
          'success'
        );
      }
      
      return result;
    } catch (error) {
      // Show specific error message
      const message = error.response?.data?.error || 'Invalid discount code';
      showToast(message, 'error');
      throw error;
    }
  }
  
  /**
   * Calculate discount amount
   * @param {Object} discount - Discount object
   * @param {number} orderAmount - Order amount
   * @returns {number} Discount amount
   */
  calculateDiscountAmount(discount, orderAmount) {
    if (!discount) {
      return 0;
    }
    
    let discountAmount = 0;
    
    if (discount.type === 'PERCENTAGE') {
      discountAmount = (orderAmount * discount.value) / 100;
    } else if (discount.type === 'FIXED_AMOUNT') {
      discountAmount = discount.value;
    }
    
    // Apply max discount cap if set
    if (discount.maxDiscount && discountAmount > discount.maxDiscount) {
      discountAmount = discount.maxDiscount;
    }
    
    // Ensure discount doesn't exceed order amount
    if (discountAmount > orderAmount) {
      discountAmount = orderAmount;
    }
    
    return Math.round(discountAmount * 100) / 100; // Round to 2 decimals
  }
  
  /**
   * Check if user can use discount
   * @param {Object} discount - Discount object
   * @param {number} orderAmount - Order amount
   * @returns {Object} Validation result
   */
  canUseDiscount(discount, orderAmount) {
    const reasons = [];
    
    // Check if discount is active
    if (!discount.isActive) {
      reasons.push('Discount code is inactive');
    }
    
    // Check expiry
    if (discount.expiresAt) {
      const expiryDate = new Date(discount.expiresAt);
      const now = new Date();
      
      if (now > expiryDate) {
        reasons.push('Discount code has expired');
      }
    }
    
    // Check start date
    if (discount.startsAt) {
      const startDate = new Date(discount.startsAt);
      const now = new Date();
      
      if (now < startDate) {
        reasons.push('Discount code not yet active');
      }
    }
    
    // Check minimum order amount
    if (discount.minOrderAmount && orderAmount < discount.minOrderAmount) {
      reasons.push(
        `Minimum order amount is ${discount.minOrderAmount} TND`
      );
    }
    
    // Check usage limit
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) {
      reasons.push('Discount code usage limit reached');
    }
    
    return {
      canUse: reasons.length === 0,
      reasons,
    };
  }
  
  /**
   * Get discount type info
   * @param {string} type - Discount type
   * @returns {Object} Type information
   */
  getTypeInfo(type) {
    const types = {
      PERCENTAGE: {
        label: 'Percentage Off',
        format: (value) => `${value}% OFF`,
        icon: '%',
      },
      FIXED_AMOUNT: {
        label: 'Fixed Amount Off',
        format: (value) => `${value} TND OFF`,
        icon: 'TND',
      },
    };
    
    return types[type] || types.PERCENTAGE;
  }
  
  /**
   * Format discount for display
   * @param {Object} discount - Discount object
   * @returns {string} Formatted discount
   */
  formatDiscount(discount) {
    const typeInfo = this.getTypeInfo(discount.type);
    return typeInfo.format(discount.value);
  }
  
  /**
   * Check if discount is expired
   * @param {Object} discount - Discount object
   * @returns {boolean}
   */
  isExpired(discount) {
    if (!discount.expiresAt) {
      return false;
    }
    
    const expiryDate = new Date(discount.expiresAt);
    const now = new Date();
    
    return now > expiryDate;
  }
  
  /**
   * Get days until expiry
   * @param {Object} discount - Discount object
   * @returns {number|null} Days until expiry or null
   */
  getDaysUntilExpiry(discount) {
    if (!discount.expiresAt) {
      return null;
    }
    
    const expiryDate = new Date(discount.expiresAt);
    const now = new Date();
    const diff = expiryDate - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    return days;
  }
  
  /**
   * Check if code has already been used by user
   * @param {string} code - Discount code
   * @param {Array} usages - User's discount usages
   * @returns {boolean}
   */
  hasBeenUsed(code, usages) {
    return usages.some((usage) => usage.discount.code === code);
  }
  
  /**
   * Get savings summary
   * @param {number} subtotal - Subtotal amount
   * @param {number} discountAmount - Discount amount
   * @returns {Object} Savings information
   */
  getSavingsSummary(subtotal, discountAmount) {
    const total = subtotal - discountAmount;
    const savingsPercent = ((discountAmount / subtotal) * 100).toFixed(1);
    
    return {
      subtotal,
      discount: discountAmount,
      total,
      savingsPercent: parseFloat(savingsPercent),
      saved: discountAmount,
    };
  }
}

export default new DiscountService();