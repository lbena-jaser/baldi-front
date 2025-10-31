import { STORAGE_KEYS } from '../config/constants.js';

// Local Storage Service with prefix and expiry support
class StorageService {
  constructor() {
    this.prefix = STORAGE_KEYS.PREFIX;
  }
  
  // Set item with optional expiry (days)
  set(key, value, expiryDays = null) {
    try {
      const item = {
        value,
        timestamp: Date.now(),
        expiry: expiryDays ? Date.now() + expiryDays * 24 * 60 * 60 * 1000 : null,
      };
      
      localStorage.setItem(this.prefix + key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  }
  
  // Get item (returns null if expired)
  get(key) {
    try {
      const itemStr = localStorage.getItem(this.prefix + key);
      
      if (!itemStr) {
        return null;
      }
      
      const item = JSON.parse(itemStr);
      
      // Check expiry
      if (item.expiry && Date.now() > item.expiry) {
        this.remove(key);
        return null;
      }
      
      return item.value;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  }
  
  // Remove item
  remove(key) {
    localStorage.removeItem(this.prefix + key);
  }
  
  // Clear all items with prefix
  clear() {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }
  
  // Get all keys
  keys() {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(this.prefix))
      .map((key) => key.replace(this.prefix, ''));
  }
  
  // Check if key exists
  has(key) {
    return localStorage.getItem(this.prefix + key) !== null;
  }
  
  // Get size of storage
  size() {
    return this.keys().length;
  }
}

export default new StorageService();