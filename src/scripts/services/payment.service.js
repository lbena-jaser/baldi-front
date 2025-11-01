import api from '../core/api.js';
import { showToast } from '../components/toast.js';
import { API_ENDPOINTS, SUCCESS_MESSAGES } from '../config/constants.js';

/**
 * Payment Service
 * Generic payment handling - can be customized for specific gateway
 */
class PaymentService {
  /**
   * Initiate payment for delivery
   * @param {string} deliveryId - Delivery ID
   * @returns {Promise<Object>} Payment details
   */
  async initiatePayment(deliveryId) {
    try {
      const response = await api.post(API_ENDPOINTS.INITIATE_PAYMENT, {
        deliveryId,
      });
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Process payment (complete payment)
   * @param {string} paymentId - Payment ID
   * @param {Object} paymentData - Payment details
   * @param {string} paymentData.transactionId - Transaction ID from gateway
   * @param {string} paymentData.paymentMethod - Payment method used
   * @returns {Promise<Object>} Payment result
   */
  async processPayment(paymentId, paymentData) {
    try {
      const response = await api.post(
        API_ENDPOINTS.PROCESS_PAYMENT(paymentId),
        paymentData
      );
      
      showToast(SUCCESS_MESSAGES.PAYMENT_SUCCESS, 'success');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get payment by ID
   * @param {string} id - Payment ID
   * @returns {Promise<Object>} Payment details
   */
  async getPayment(id) {
    try {
      const response = await api.get(API_ENDPOINTS.PAYMENT(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get user payment history
   * @param {Object} params - Query parameters
   * @param {string} params.status - Filter by status (optional)
   * @param {number} params.page - Page number (optional)
   * @param {number} params.limit - Items per page (optional)
   * @returns {Promise<Object>} Payments with pagination
   */
  async getMyPayments(params = {}) {
    try {
      const response = await api.get(API_ENDPOINTS.MY_PAYMENTS, { params });
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get payment statistics
   * @returns {Promise<Object>} Payment stats
   */
  async getPaymentStats() {
    try {
      const response = await api.get(API_ENDPOINTS.PAYMENT_STATS);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Handle payment gateway callback
   * This is called when payment gateway redirects back
   * @param {Object} callbackData - Data from gateway
   * @returns {Promise<Object>} Verification result
   */
  async handlePaymentCallback(callbackData) {
    try {
      // This would be customized based on your gateway
      // For now, generic handling
      const response = await api.post('/payments/callback', callbackData);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get payment status info for display
   * @param {string} status - Payment status
   * @returns {Object} Display information
   */
  getStatusInfo(status) {
    const statusInfo = {
      PENDING: {
        label: 'Pending',
        description: 'Waiting for payment',
        color: 'yellow',
        icon: '⏳',
        action: 'Pay Now',
      },
      COMPLETED: {
        label: 'Completed',
        description: 'Payment successful',
        color: 'green',
        icon: '✅',
        action: null,
      },
      FAILED: {
        label: 'Failed',
        description: 'Payment failed',
        color: 'red',
        icon: '❌',
        action: 'Retry Payment',
      },
      REFUNDED: {
        label: 'Refunded',
        description: 'Payment refunded',
        color: 'gray',
        icon: '↩️',
        action: null,
      },
    };
    
    return statusInfo[status] || statusInfo.PENDING;
  }
  
  /**
   * Format payment method for display
   * @param {string} method - Payment method
   * @returns {Object} Method info
   */
  getMethodInfo(method) {
    const methods = {
      local_gateway: {
        name: 'Online Payment',
        icon: '💳',
      },
      card: {
        name: 'Credit/Debit Card',
        icon: '💳',
      },
      cash: {
        name: 'Cash on Delivery',
        icon: '💵',
      },
    };
    
    return methods[method] || methods.local_gateway;
  }
  
  /**
   * Calculate payment summary
   * @param {number} subtotal - Subtotal amount
   * @param {number} discount - Discount amount
   * @param {number} tax - Tax amount (if applicable)
   * @returns {Object} Payment summary
   */
  calculatePaymentSummary(subtotal, discount = 0, tax = 0) {
    const total = subtotal - discount + tax;
    
    return {
      subtotal,
      discount,
      tax,
      total,
      saved: discount,
    };
  }
  
  /**
   * Redirect to payment gateway
   * This is a placeholder - customize based on your gateway
   * @param {Object} payment - Payment object
   * @param {string} returnUrl - URL to return after payment
   */
  redirectToGateway(payment, returnUrl) {
    // This would be customized for your specific gateway
    // Example structure:
    const gatewayUrl = import.meta.env.VITE_PAYMENT_GATEWAY_URL;
    const gatewayKey = import.meta.env.VITE_PAYMENT_GATEWAY_KEY;
    
    if (!gatewayUrl) {
      console.error('Payment gateway not configured');
      showToast('Payment gateway not configured', 'error');
      return;
    }
    
    // Build payment URL with parameters
    const params = new URLSearchParams({
      amount: payment.amount,
      orderId: payment.id,
      returnUrl: returnUrl,
      apiKey: gatewayKey,
      // Add other gateway-specific parameters
    });
    
    // Redirect to gateway
    window.location.href = `${gatewayUrl}?${params.toString()}`;
  }
  
  /**
   * Check if payment is pending
   * @param {Object} payment - Payment object
   * @returns {boolean}
   */
  isPending(payment) {
    return payment.status === 'PENDING';
  }
  
  /**
   * Check if payment is completed
   * @param {Object} payment - Payment object
   * @returns {boolean}
   */
  isCompleted(payment) {
    return payment.status === 'COMPLETED';
  }
  
  /**
   * Check if payment failed
   * @param {Object} payment - Payment object
   * @returns {boolean}
   */
  isFailed(payment) {
    return payment.status === 'FAILED';
  }
  
  /**
   * Get pending payments
   * @param {Array} payments - List of payments
   * @returns {Array} Pending payments
   */
  getPendingPayments(payments) {
    return payments.filter((p) => this.isPending(p));
  }
  
  /**
   * Get completed payments
   * @param {Array} payments - List of payments
   * @returns {Array} Completed payments
   */
  getCompletedPayments(payments) {
    return payments.filter((p) => this.isCompleted(p));
  }
}

export default new PaymentService();