import api from '../core/api.js';
import authManager from '../core/auth.js';
import authStore from '../state/auth.store.js';
import { showToast } from '../components/toast.js';
import { API_ENDPOINTS, SUCCESS_MESSAGES } from '../config/constants.js';
import eventBus, { EVENTS } from '../core/events.js';
import cacheService from '../core/cache.js';

class AuthService {
  // Register new user
  async register(userData) {
    try {
      const response = await api.post(API_ENDPOINTS.REGISTER, userData);
      
      // Store tokens
      authManager.setTokens(
        response.data.accessToken,
        response.data.refreshToken
      );
      
      // Update store BEFORE any redirect
      authStore.getState().setUser(response.data.user);
      
      // Emit event
      eventBus.emit(EVENTS.AUTH_REGISTER, response.data.user);
      
      showToast(SUCCESS_MESSAGES.REGISTRATION_SUCCESS, 'success');
      
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  // Login user
  async login(credentials) {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
      
      // Check if 2FA is required
      if (response.requiresTwoFactor) {
        authStore.getState().setRequires2FA(true, response.tempToken);
        eventBus.emit(EVENTS.AUTH_2FA_REQUIRED);
        return { requires2FA: true };
      }
      
      // Store tokens
      authManager.setTokens(
        response.data.accessToken,
        response.data.refreshToken
      );
      
      // Update store BEFORE any redirect - this is critical
      authStore.getState().setUser(response.data.user);
      
      // Wait a tick to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Emit event
      eventBus.emit(EVENTS.AUTH_LOGIN, response.data.user);
      
      showToast(SUCCESS_MESSAGES.LOGIN_SUCCESS, 'success');
      
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  // Verify 2FA code
  async verify2FA(code) {
    try {
      const tempToken = authStore.getState().tempToken;
      
      const response = await api.post(API_ENDPOINTS.VERIFY_2FA, {
        tempToken,
        code,
      });
      
      // Store tokens
      authManager.setTokens(
        response.data.accessToken,
        response.data.refreshToken
      );
      
      // Update store BEFORE any redirect
      authStore.getState().setUser(response.data.user);
      authStore.getState().setRequires2FA(false);
      
      // Wait a tick to ensure state is updated
      await new Promise(resolve => setTimeout(resolve, 0));
      
      // Emit event
      eventBus.emit(EVENTS.AUTH_LOGIN, response.data.user);
      
      showToast(SUCCESS_MESSAGES.LOGIN_SUCCESS, 'success');
      
      return response;
    } catch (error) {
      throw error;
    }
  }
  
  // Logout
  async logout() {
    try {
      const refreshToken = authManager.getRefreshToken();
      
      if (refreshToken) {
        await api.post(API_ENDPOINTS.LOGOUT, { refreshToken });
      }
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // Clear local state (even if API call fails)
      authManager.logout();
      authStore.getState().logout();
      
      // Clear cache
      await cacheService.clearAll();
      
      // Emit event
      eventBus.emit(EVENTS.AUTH_LOGOUT);
      
      showToast(SUCCESS_MESSAGES.LOGOUT_SUCCESS, 'info');
      
      // Redirect to login
      window.location.href = '/login.html';
    }
  }
  
  // Get current user profile
  async getProfile() {
    try {
      const response = await api.get(API_ENDPOINTS.PROFILE);
      
      // Update store
      authStore.getState().setUser(response.data);
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Update profile
  async updateProfile(updates) {
    try {
      const response = await api.patch(API_ENDPOINTS.PROFILE, updates);
      
      // Update store
      authStore.getState().updateUser(response.data);
      
      // Emit event
      eventBus.emit(EVENTS.USER_UPDATED, response.data);
      
      showToast(SUCCESS_MESSAGES.PROFILE_UPDATED, 'success');
      
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Change password
  async changePassword(passwords) {
    try {
      await api.post(API_ENDPOINTS.CHANGE_PASSWORD, passwords);
      
      showToast(SUCCESS_MESSAGES.PASSWORD_CHANGED, 'success');
      
      // Logout after password change
      setTimeout(() => {
        this.logout();
      }, 2000);
    } catch (error) {
      throw error;
    }
  }
  
  // Enable 2FA
  async enable2FA() {
    try {
      const response = await api.post(API_ENDPOINTS.ENABLE_2FA);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
  
  // Verify 2FA setup
  async verify2FASetup(code) {
    try {
      await api.post(API_ENDPOINTS.VERIFY_2FA_SETUP, { code });
      
      // Update user state
      authStore.getState().updateUser({ twoFactorEnabled: true });
      
      showToast('2FA enabled successfully', 'success');
    } catch (error) {
      throw error;
    }
  }
  
  // Disable 2FA
  async disable2FA(code) {
    try {
      await api.post(API_ENDPOINTS.DISABLE_2FA, { code });
      
      // Update user state
      authStore.getState().updateUser({ twoFactorEnabled: false });
      
      showToast('2FA disabled successfully', 'success');
    } catch (error) {
      throw error;
    }
  }
  
  // Forgot password
  async forgotPassword(email) {
    try {
      await api.post(API_ENDPOINTS.FORGOT_PASSWORD, { email });
      
      showToast('Password reset link sent to your email', 'success');
    } catch (error) {
      throw error;
    }
  }
  
  // Reset password
  async resetPassword(token, passwords) {
    try {
      await api.post(API_ENDPOINTS.RESET_PASSWORD, {
        token,
        ...passwords,
      });
      
      showToast('Password reset successful. Please login.', 'success');
    } catch (error) {
      throw error;
    }
  }
  
  // Check if user is authenticated
  isAuthenticated() {
    // Check both the store AND the token
    const hasUser = authStore.getState().isAuthenticated;
    const hasToken = authManager.getAccessToken() !== null;
    
    // Both must be true
    return hasUser && hasToken;
  }
  
  // Get current user
  getCurrentUser() {
    return authStore.getState().user;
  }
  
  // Check if user has role
  hasRole(role) {
    const user = this.getCurrentUser();
    return user?.role === role;
  }
  
  // Check if user is admin
  isAdmin() {
    return authStore.getState().isAdmin();
  }
}

export default new AuthService();