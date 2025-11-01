import api from '../core/api.js';
import { showToast } from '../components/toast.js';
import { API_ENDPOINTS, SUCCESS_MESSAGES } from '../config/constants.js';

/**
 * Address Service
 * Handles delivery address management for customers
 */
class AddressService {
  /**
   * Get all user addresses
   * @returns {Promise<Array>} List of addresses
   */
  async getAddresses() {
    try {
      const response = await api.get(API_ENDPOINTS.ADDRESSES);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get address by ID
   * @param {string} id - Address ID
   * @returns {Promise<Object>} Address details
   */
  async getAddress(id) {
    try {
      const response = await api.get(API_ENDPOINTS.ADDRESS(id));
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Create new address
   * @param {Object} addressData - Address details
   * @param {string} addressData.label - Address label (Home, Office, etc.)
   * @param {string} addressData.fullName - Recipient name
   * @param {string} addressData.phoneNumber - Phone number
   * @param {string} addressData.addressLine1 - Address line 1
   * @param {string} addressData.addressLine2 - Address line 2 (optional)
   * @param {string} addressData.city - City
   * @param {string} addressData.state - State/Governorate
   * @param {string} addressData.postalCode - Postal code
   * @param {boolean} addressData.isDefault - Set as default
   * @returns {Promise<Object>} Created address
   */
  async createAddress(addressData) {
    try {
      const response = await api.post(API_ENDPOINTS.ADDRESSES, addressData);
      
      showToast(SUCCESS_MESSAGES.ADDRESS_ADDED, 'success');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Update address
   * @param {string} id - Address ID
   * @param {Object} updates - Fields to update
   * @returns {Promise<Object>} Updated address
   */
  async updateAddress(id, updates) {
    try {
      const response = await api.patch(API_ENDPOINTS.ADDRESS(id), updates);
      
      showToast(SUCCESS_MESSAGES.ADDRESS_UPDATED, 'success');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Delete address
   * @param {string} id - Address ID
   * @returns {Promise<void>}
   */
  async deleteAddress(id) {
    try {
      await api.delete(API_ENDPOINTS.ADDRESS(id));
      
      showToast(SUCCESS_MESSAGES.ADDRESS_DELETED, 'success');
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Set address as default
   * @param {string} id - Address ID
   * @returns {Promise<Object>} Updated address
   */
  async setDefaultAddress(id) {
    try {
      const response = await api.patch(API_ENDPOINTS.ADDRESS(id), {
        isDefault: true,
      });
      
      showToast('Default address updated', 'success');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Get default address
   * @returns {Promise<Object|null>} Default address or null
   */
  async getDefaultAddress() {
    try {
      const addresses = await this.getAddresses();
      return addresses.find((addr) => addr.isDefault) || null;
    } catch (error) {
      throw error;
    }
  }
  
  /**
   * Format address for display
   * @param {Object} address - Address object
   * @returns {string} Formatted address
   */
  formatAddress(address) {
    const parts = [
      address.addressLine1,
      address.addressLine2,
      address.city,
      address.state,
      address.postalCode,
    ].filter(Boolean);
    
    return parts.join(', ');
  }
  
  /**
   * Format address for display (multi-line)
   * @param {Object} address - Address object
   * @returns {Array<string>} Address lines
   */
  formatAddressLines(address) {
    const lines = [address.addressLine1];
    
    if (address.addressLine2) {
      lines.push(address.addressLine2);
    }
    
    lines.push(`${address.city}, ${address.state} ${address.postalCode}`);
    
    return lines;
  }
  
  /**
   * Validate address has all required fields
   * @param {Object} address - Address object
   * @returns {boolean} Is valid
   */
  isValidAddress(address) {
    const required = [
      'fullName',
      'phoneNumber',
      'addressLine1',
      'city',
      'state',
      'postalCode',
    ];
    
    return required.every((field) => address[field]);
  }
  
  /**
   * Get address label with icon
   * @param {string} label - Address label
   * @returns {Object} Label with icon
   */
  getLabelInfo(label) {
    const labels = {
      Home: { icon: '🏠', color: 'blue' },
      Office: { icon: '🏢', color: 'purple' },
      Other: { icon: '📍', color: 'gray' },
    };
    
    return labels[label] || labels.Other;
  }
}

export default new AddressService();