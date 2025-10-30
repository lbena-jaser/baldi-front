// Utility helper functions

// Format currency (Tunisian Dinar)
export function formatCurrency(amount) {
  return `${parseFloat(amount).toFixed(2)} TND`;
}

// Format date
export function formatDate(date, format = 'short') {
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
  
  if (format === 'time') {
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
  
  return d.toISOString();
}

// Format relative time (e.g., "2 days ago")
export function formatRelativeTime(date) {
  const now = new Date();
  const then = new Date(date);
  const diff = now - then;
  
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);
  
  if (seconds < 60) {
    return 'just now';
  }
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (hours < 24) {
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  if (days < 7) {
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  if (weeks < 4) {
    return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
  }
  if (months < 12) {
    return `${months} month${months > 1 ? 's' : ''} ago`;
  }
  return `${years} year${years > 1 ? 's' : ''} ago`;
}

// Sanitize HTML (prevent XSS)
export function sanitizeHTML(html) {
  const div = document.createElement('div');
  div.textContent = html;
  return div.innerHTML;
}

// Sanitize input
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }
  
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Debounce function
export function debounce(func, wait = 300) {
  let timeout;
  
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Throttle function
export function throttle(func, limit = 300) {
  let inThrottle;
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
      }, limit);
    }
  };
}

// Generate unique ID
export function generateId(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Deep clone object
export function deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

// Check if email is valid
export function isValidEmail(email) {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

// Check if phone number is valid (Tunisian format)
export function isValidPhone(phone) {
  const regex = /^[2-9]\d{7}$/;
  return regex.test(phone.replace(/\s+/g, ''));
}

// Truncate text
export function truncate(text, length = 100, suffix = '...') {
  if (text.length <= length) {
    return text;
  }
  
  return text.substring(0, length).trim() + suffix;
}

// Capitalize first letter
export function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

// Capitalize each word
export function capitalizeWords(text) {
  return text
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

// Slugify text
export function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Get query parameter from URL
export function getQueryParam(param) {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

// Set query parameter in URL
export function setQueryParam(param, value) {
  const url = new URL(window.location);
  url.searchParams.set(param, value);
  window.history.pushState({}, '', url);
}

// Remove query parameter from URL
export function removeQueryParam(param) {
  const url = new URL(window.location);
  url.searchParams.delete(param);
  window.history.pushState({}, '', url);
}

// Scroll to element
export function scrollToElement(selector, offset = 0) {
  const element = document.querySelector(selector);
  
  if (element) {
    const top = element.getBoundingClientRect().top + window.pageYOffset - offset;
    
    window.scrollTo({
      top,
      behavior: 'smooth',
    });
  }
}

// Check if element is in viewport
export function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

// Copy to clipboard
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    console.error('Copy failed:', error);
    return false;
  }
}

// Download file
export function downloadFile(url, filename) {
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Format file size
export function formatFileSize(bytes) {
  if (bytes === 0) {
    return '0 Bytes';
  }
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Parse JWT token
export function parseJWT(token) {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('JWT parse error:', error);
    return null;
  }
}

// Check if JWT is expired
export function isJWTExpired(token) {
  const decoded = parseJWT(token);
  
  if (!decoded || !decoded.exp) {
    return true;
  }
  
  return decoded.exp * 1000 < Date.now();
}

// Group array by key
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const group = item[key];
    
    if (!result[group]) {
      result[group] = [];
    }
    
    result[group].push(item);
    return result;
  }, {});
}

// Sort array by key
export function sortBy(array, key, order = 'asc') {
  return array.sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (order === 'asc') {
      return aVal > bVal ? 1 : -1;
    }
    
    return aVal < bVal ? 1 : -1;
  });
}

// Remove duplicates from array
export function unique(array) {
  return [...new Set(array)];
}

// Chunk array into smaller arrays
export function chunk(array, size) {
  const chunks = [];
  
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  
  return chunks;
}

// Wait for specified time
export function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Retry function with exponential backoff
export async function retry(fn, maxAttempts = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      
      await wait(delay * attempt);
    }
  }
}

// Get device type
export function getDeviceType() {
  const width = window.innerWidth;
  
  if (width < 768) {
    return 'mobile';
  }
  if (width < 1024) {
    return 'tablet';
  }
  return 'desktop';
}

// Check if mobile device
export function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// Get browser name
export function getBrowser() {
  const userAgent = navigator.userAgent;
  
  if (userAgent.includes('Firefox')) {
    return 'Firefox';
  }
  if (userAgent.includes('Chrome')) {
    return 'Chrome';
  }
  if (userAgent.includes('Safari')) {
    return 'Safari';
  }
  if (userAgent.includes('Edge')) {
    return 'Edge';
  }
  
  return 'Unknown';
}

// Local storage helpers
export const storage = {
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Storage set error:', error);
      return false;
    }
  },
  
  get(key) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Storage get error:', error);
      return null;
    }
  },
  
  remove(key) {
    localStorage.removeItem(key);
  },
  
  clear() {
    localStorage.clear();
  },
};