import api from './api.js';
import { API_ENDPOINTS, STORAGE_KEYS } from '../config/constants.js';

// Authentication Manager
class AuthManager {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenRefreshTimer = null;
    this.encryptionKey = 'baldi-secure-key-2024'; // In production, use env variable
  }
  
  // Initialize auth manager
  init() {
    // Load refresh token from storage
    const encryptedToken = localStorage.getItem(STORAGE_KEYS.PREFIX + STORAGE_KEYS.REFRESH_TOKEN);
    
    if (encryptedToken) {
      try {
        this.refreshToken = this.decrypt(encryptedToken);
        
        // Try to refresh access token on init
        this.refreshAccessToken().catch(() => {
          // If refresh fails, clear tokens
          this.logout();
        });
      } catch (error) {
        console.error('Auth init error:', error);
        this.logout();
      }
    }
  }
  
  // Set tokens
  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    
    // Store refresh token encrypted
    const encrypted = this.encrypt(refreshToken);
    localStorage.setItem(STORAGE_KEYS.PREFIX + STORAGE_KEYS.REFRESH_TOKEN, encrypted);
    
    // Schedule token refresh (6 days before 7-day expiry)
    this.scheduleTokenRefresh();
  }
  
  // Get access token
  getAccessToken() {
    return this.accessToken;
  }
  
  // Get refresh token
  getRefreshToken() {
    return this.refreshToken;
  }
  
  // Refresh access token
  async refreshAccessToken() {
    if (!this.refreshToken) {
      throw new Error('No refresh token available');
    }
    
    try {
      const response = await api.post(API_ENDPOINTS.REFRESH_TOKEN, {
        refreshToken: this.refreshToken,
      });
      
      this.setTokens(response.data.accessToken, response.data.refreshToken);
      
      return response.data.accessToken;
    } catch (error) {
      // Clear invalid tokens
      this.logout();
      throw error;
    }
  }
  
  // Schedule token refresh
  scheduleTokenRefresh() {
    // Clear existing timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
    }
    
    // Refresh after 6 days (tokens expire in 7 days)
    const SIX_DAYS = 6 * 24 * 60 * 60 * 1000;
    
    this.tokenRefreshTimer = setTimeout(() => {
      this.refreshAccessToken().catch((error) => {
        console.error('Auto refresh failed:', error);
      });
    }, SIX_DAYS);
  }
  
  // Logout
  logout() {
    this.accessToken = null;
    this.refreshToken = null;
    
    // Clear storage
    localStorage.removeItem(STORAGE_KEYS.PREFIX + STORAGE_KEYS.REFRESH_TOKEN);
    
    // Clear timer
    if (this.tokenRefreshTimer) {
      clearTimeout(this.tokenRefreshTimer);
      this.tokenRefreshTimer = null;
    }
  }
  
  // Check if user is authenticated
  isAuthenticated() {
    return !!this.accessToken;
  }
  
  // Simple encryption (XOR cipher)
  encrypt(text) {
    if (!text) {
      return '';
    }
    
    let encrypted = '';
    
    for (let i = 0; i < text.length; i++) {
      encrypted += String.fromCharCode(
        text.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
      );
    }
    
    return btoa(encrypted); // Base64 encode
  }
  
  // Simple decryption
  decrypt(encryptedText) {
    if (!encryptedText) {
      return '';
    }
    
    const text = atob(encryptedText); // Base64 decode
    let decrypted = '';
    
    for (let i = 0; i < text.length; i++) {
      decrypted += String.fromCharCode(
        text.charCodeAt(i) ^ this.encryptionKey.charCodeAt(i % this.encryptionKey.length)
      );
    }
    
    return decrypted;
  }
}

// Create singleton instance
const authManager = new AuthManager();

// Make it globally available (for API interceptors)
window.__authManager__ = authManager;

export default authManager;