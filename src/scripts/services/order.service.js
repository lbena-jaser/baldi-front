import api from '../core/api.js';
import cartStore from '../state/cart.store.js';
import { showToast } from '../components/toast.js';
import { API_ENDPOINTS, SUCCESS_MESSAGES } from '../config/constants.js';
import eventBus, { EVENTS } from '../core/events.js';

class OrderService {
  // Create delivery order
  async createOrder(orderData) {
    try {
      const response = await api.post(API_ENDPOINTS.DELIVERIES, orderData);
      
      // Clear cart after successful order
      cartStore.getState().clearCart();
      
      // Emit event
      eventBus.emit(EVENTS.ORDER_CREATED, response.data);
      
      showToast(SUCCESS_MESSAGES.ORDER_CREATED, 'success');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Create order from cart
  async createOrderFromCart(subscriptionId, deliveryAddressId, notes = '') {
    const cart = cartStore.getState();
    
    // Prepare order data
    const orderData = {
      subscriptionId,
      deliveryAddressId,
      meals: cart.items.map((item) => ({
        mealId: item.mealId,
        quantity: item.quantity,
      })),
      addOns: cart.addOns.map((item) => ({
        addOnId: item.addOnId,
        quantity: item.quantity,
      })),
      notes,
    };
    
    // Add discount code if present
    if (cart.discountCode) {
      orderData.discountCode = cart.discountCode;
    }
    
    return await this.createOrder(orderData);
  }
  
  // Get user orders
  async getMyOrders(params = {}) {
    try {
      const response = await api.get(API_ENDPOINTS.MY_DELIVERIES, { params });
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  // Get order by ID
  async getOrder(id) {
    try {
      const response = await api.get(API_ENDPOINTS.DELIVERY(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Update order
  async updateOrder(id, updates) {
    try {
      const response = await api.patch(API_ENDPOINTS.DELIVERY(id), updates);
      
      showToast('Order updated successfully', 'success');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Confirm delivery
  async confirmOrder(id, confirmed = true) {
    try {
      const response = await api.post(API_ENDPOINTS.CONFIRM_DELIVERY(id), {
        confirmed,
      });
      
      // Emit event
      eventBus.emit(EVENTS.ORDER_CONFIRMED, response.data);
      
      showToast(SUCCESS_MESSAGES.ORDER_CONFIRMED, 'success');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Cancel delivery
  async cancelOrder(id) {
    try {
      const response = await api.post(API_ENDPOINTS.CONFIRM_DELIVERY(id), {
        confirmed: false,
      });
      
      // Emit event
      eventBus.emit(EVENTS.ORDER_CANCELLED, response.data);
      
      showToast('Delivery cancelled successfully', 'success');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Get verification details (QR code)
  async getVerificationDetails(id) {
    try {
      const response = await api.get(API_ENDPOINTS.DELIVERY_VERIFICATION(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Verify delivery (for delivery guy)
  async verifyDelivery(verificationData) {
    try {
      const response = await api.post('/deliveries/verify', verificationData);
      
      showToast('Delivery verified successfully', 'success');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Filter orders by status
  filterByStatus(orders, status) {
    if (!status) {
      return orders;
    }
    return orders.filter((order) => order.status === status);
  }
  
  // Get upcoming orders
  getUpcomingOrders(orders) {
    const now = new Date();
    return orders.filter((order) => {
      const scheduledDate = new Date(order.scheduledDate);
      return scheduledDate >= now && order.status !== 'CANCELLED';
    });
  }
  
  // Get past orders
  getPastOrders(orders) {
    const now = new Date();
    return orders.filter((order) => {
      const scheduledDate = new Date(order.scheduledDate);
      return scheduledDate < now || order.status === 'DELIVERED';
    });
  }
  
  // Calculate order total
  calculateOrderTotal(order) {
    return order.finalPrice || order.totalPrice;
  }
}

export default new OrderService();