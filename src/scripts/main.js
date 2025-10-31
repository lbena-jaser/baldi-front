// Main entry point - Initialize application

import authManager from './core/auth.js';
import cacheService from './core/cache.js';
import { initPageLoader } from './components/loader.js';

// Initialize page loader
initPageLoader();

// Initialize services
async function initializeApp() {
  try {
    // Initialize auth manager
    authManager.init();
    
    // Initialize cache
    await cacheService.init();
    
    console.log('✅ Application initialized');
  } catch (error) {
    console.error('❌ Application initialization failed:', error);
  }
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeApp);
} else {
  initializeApp();
}

// Export for global access
export { authManager, cacheService };