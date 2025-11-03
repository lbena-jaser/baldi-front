import api from './api.js';
import { API_ENDPOINTS, STORAGE_KEYS } from '../config/constants.js';

// Authentication Manager
class AuthManager {
  constructor() {
    this.accessToken = null;
    this.refreshToken = null;
    this.tokenRefreshTimer = null;
    this.encryptionKey = 'baldi-secure-key-2024'; // In production, use env variable
    this.isInitialized = false;
  }
  
  // Initialize auth manager
  // Initialize auth manager
  async init() {
    if (this.isInitialized) {
      return;
    }
    
    // Load refresh token from storage
    const encryptedToken = localStorage.getItem(STORAGE_KEYS.PREFIX + STORAGE_KEYS.REFRESH_TOKEN);
    
    if (encryptedToken) {
      try {
        this.refreshToken = this.decrypt(encryptedToken);
        
        // Immediately get a fresh access token if we have a refresh token
        // This ensures we have a valid access token on page load
        try {
          await this.refreshAccessToken();
          console.log('✅ Auth manager initialized with fresh access token');
        } catch (error) {
          console.error('Failed to refresh token on init:', error);
          // If refresh fails, clear everything
          this.logout();
        }
      } catch (error) {
        console.error('Auth init error:', error);
        // Don't logout on init error - just clear the bad token
        localStorage.removeItem(STORAGE_KEYS.PREFIX + STORAGE_KEYS.REFRESH_TOKEN);
      }
    }
    
    this.isInitialized = true;
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
    
    console.log('✅ Tokens stored successfully');
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
      
      console.log('✅ Token refreshed successfully');
      
      return response.data.accessToken;
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Don't auto-logout - let the user handle it
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
    
    console.log('✅ Auth manager cleared');
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