// Centralized runtime configuration for frontend

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
export const API_TIMEOUT_MS = Number(import.meta.env.VITE_API_TIMEOUT ?? 30000);
export const NODE_ENV = import.meta.env.MODE || 'development';

// Uploads / Files
export const MAX_FILE_SIZE = Number(import.meta.env.VITE_MAX_FILE_SIZE ?? 10485760); // 10MB default

// Pagination
export const DEFAULT_PAGE_SIZE = Number(import.meta.env.VITE_DEFAULT_PAGE_SIZE ?? 20);
export const MAX_PAGE_SIZE = Number(import.meta.env.VITE_MAX_PAGE_SIZE ?? 50);

// Storage
export const LOCAL_STORAGE_PREFIX = import.meta.env.VITE_LOCAL_STORAGE_PREFIX || 'baldi_';

// Feature flags
export const ENABLE_2FA = String(import.meta.env.VITE_ENABLE_2FA).toLowerCase() === 'true';
export const ENABLE_REFERRALS = String(import.meta.env.VITE_ENABLE_REFERRALS).toLowerCase() === 'true';
export const ENABLE_DISCOUNTS = String(import.meta.env.VITE_ENABLE_DISCOUNTS).toLowerCase() === 'true';

const config = {
  API_BASE_URL,
  API_TIMEOUT_MS,
  NODE_ENV,
  MAX_FILE_SIZE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  LOCAL_STORAGE_PREFIX,
  ENABLE_2FA,
  ENABLE_REFERRALS,
  ENABLE_DISCOUNTS,
};

export default config;


