import { openDB } from 'idb';
import { CACHE_KEYS } from '../config/constants.js';

// IndexedDB cache service for offline data
class CacheService {
  constructor() {
    this.db = null;
    this.dbName = 'baldi-cache';
    this.dbVersion = 1;
  }
  
  // Initialize database
  async init() {
    if (this.db) {
      return this.db;
    }
    
    try {
      this.db = await openDB(this.dbName, this.dbVersion, {
        upgrade(db) {
          // Create object stores
          if (!db.objectStoreNames.contains(CACHE_KEYS.MEALS)) {
            db.createObjectStore(CACHE_KEYS.MEALS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(CACHE_KEYS.MENUS)) {
            db.createObjectStore(CACHE_KEYS.MENUS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(CACHE_KEYS.ORDERS)) {
            db.createObjectStore(CACHE_KEYS.ORDERS, { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains(CACHE_KEYS.USER)) {
            db.createObjectStore(CACHE_KEYS.USER);
          }
        },
      });
      
      return this.db;
    } catch (error) {
      console.error('Cache init error:', error);
      return null;
    }
  }
  
  // Set item in cache
  async set(store, key, value) {
    try {
      const db = await this.init();
      if (!db) {
        return false;
      }
      
      const tx = db.transaction(store, 'readwrite');
      
      if (typeof key === 'object' && Array.isArray(key)) {
        // Bulk insert
        await Promise.all(key.map((item) => tx.store.put(item)));
      } else if (typeof value === 'object' && value.id) {
        // Single object with id
        await tx.store.put(value);
      } else {
        // Key-value pair
        await tx.store.put(value, key);
      }
      
      await tx.done;
      return true;
    } catch (error) {
      console.error('Cache set error:', error);
      return false;
    }
  }
  
  // Get item from cache
  async get(store, key) {
    try {
      const db = await this.init();
      if (!db) {
        return null;
      }
      
      return await db.get(store, key);
    } catch (error) {
      console.error('Cache get error:', error);
      return null;
    }
  }
  
  // Get all items
  async getAll(store) {
    try {
      const db = await this.init();
      if (!db) {
        return [];
      }
      
      return await db.getAll(store);
    } catch (error) {
      console.error('Cache getAll error:', error);
      return [];
    }
  }
  
  // Delete item
  async delete(store, key) {
    try {
      const db = await this.init();
      if (!db) {
        return false;
      }
      
      await db.delete(store, key);
      return true;
    } catch (error) {
      console.error('Cache delete error:', error);
      return false;
    }
  }
  
  // Clear store
  async clear(store) {
    try {
      const db = await this.init();
      if (!db) {
        return false;
      }
      
      await db.clear(store);
      return true;
    } catch (error) {
      console.error('Cache clear error:', error);
      return false;
    }
  }
  
  // Clear all caches
  async clearAll() {
    try {
      const db = await this.init();
      if (!db) {
        return false;
      }
      
      const stores = Object.values(CACHE_KEYS);
      await Promise.all(stores.map((store) => db.clear(store)));
      return true;
    } catch (error) {
      console.error('Cache clearAll error:', error);
      return false;
    }
  }
  
  // Check if item exists
  async has(store, key) {
    try {
      const item = await this.get(store, key);
      return item !== null && item !== undefined;
    } catch (error) {
      return false;
    }
  }
}

export default new CacheService();