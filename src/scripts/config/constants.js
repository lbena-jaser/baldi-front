// Application constants
import {
  MAX_FILE_SIZE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  LOCAL_STORAGE_PREFIX,
  ENABLE_2FA,
  ENABLE_REFERRALS,
  ENABLE_DISCOUNTS,
} from './env.js';

// API Endpoints
export const API_ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH_TOKEN: '/auth/refresh-token',
  PROFILE: '/auth/profile',
  CHANGE_PASSWORD: '/auth/change-password',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',
  ENABLE_2FA: '/auth/2fa/enable',
  VERIFY_2FA_SETUP: '/auth/2fa/verify-setup',
  VERIFY_2FA: '/auth/2fa/verify',
  DISABLE_2FA: '/auth/2fa/disable',
  
  // Subscriptions
  SUBSCRIPTIONS: '/subscriptions',
  MY_SUBSCRIPTIONS: '/subscriptions/my-subscriptions',
  ACTIVE_SUBSCRIPTION: '/subscriptions/active',
  PAUSE_SUBSCRIPTION: (id) => `/subscriptions/${id}/pause`,
  RESUME_SUBSCRIPTION: (id) => `/subscriptions/${id}/resume`,
  CANCEL_SUBSCRIPTION: (id) => `/subscriptions/${id}/cancel`,
  
  // Meals
  MEALS: '/meals',
  MEAL: (id) => `/meals/${id}`,
  WEEKLY_MENU: '/weekly-menu/current',
  ADD_ONS: '/add-ons',
  
  // Deliveries
  DELIVERIES: '/deliveries',
  MY_DELIVERIES: '/deliveries/my-deliveries',
  DELIVERY: (id) => `/deliveries/${id}`,
  CONFIRM_DELIVERY: (id) => `/deliveries/${id}/confirm`,
  DELIVERY_VERIFICATION: (id) => `/deliveries/${id}/verification`,
  
  // Addresses
  ADDRESSES: '/addresses',
  ADDRESS: (id) => `/addresses/${id}`,
  
  // Payments
  PAYMENTS: '/payments',
  MY_PAYMENTS: '/payments/my-payments',
  PAYMENT: (id) => `/payments/${id}`,
  INITIATE_PAYMENT: '/payments/initiate',
  PROCESS_PAYMENT: (id) => `/payments/${id}/process`,
  PAYMENT_STATS: '/payments/stats',
  
  // Notifications
  NOTIFICATIONS: '/notifications',
  NOTIFICATION: (id) => `/notifications/${id}`,
  UNREAD_COUNT: '/notifications/unread-count',
  MARK_READ: (id) => `/notifications/${id}/read`,
  MARK_ALL_READ: '/notifications/read-all',
  NOTIFICATION_STREAM: '/notifications/stream',
  
  // Referrals
  REFERRALS: '/referrals',
  MY_REFERRALS: '/referrals/my-referrals',
  MY_REFERRAL_STATS: '/referrals/my-stats',
  MY_DISCOUNT: '/referrals/my-discount',
  REFERRAL_BY_CODE: (code) => `/referrals/code/${code}`,
  APPLY_REFERRAL: '/referrals/apply',
  
  // Discounts
  ACTIVE_DISCOUNTS: '/discounts/active',
  VALIDATE_DISCOUNT: '/discounts/validate',
  MY_DISCOUNT_USAGES: '/discounts/my-usages',
};

// User Roles
export const USER_ROLES = {
  CUSTOMER: 'CUSTOMER',
  SUPER_ADMIN: 'SUPER_ADMIN',
  MANAGER: 'MANAGER',
  SUPPORT: 'SUPPORT',
  DELIVERY_GUY: 'DELIVERY_GUY',
};

// Subscription Status
export const SUBSCRIPTION_STATUS = {
  PENDING: 'PENDING',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  CANCELLED: 'CANCELLED',
};

// Plan Types
export const PLAN_TYPES = {
  FIVE_DAY: 'FIVE_DAY',
  SEVEN_DAY: 'SEVEN_DAY',
};

// Meal Categories
export const MEAL_CATEGORIES = {
  BULKING: 'BULKING',
  CUTTING: 'CUTTING',
};

// Delivery Status
export const DELIVERY_STATUS = {
  SCHEDULED: 'SCHEDULED',
  CONFIRMED: 'CONFIRMED',
  PREPARING: 'PREPARING',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

// Payment Status
export const PAYMENT_STATUS = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
  REFUNDED: 'REFUNDED',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  DELIVERY_REMINDER: 'DELIVERY_REMINDER',
  DELIVERY_CONFIRMED: 'DELIVERY_CONFIRMED',
  DELIVERY_OUT_FOR_DELIVERY: 'DELIVERY_OUT_FOR_DELIVERY',
  DELIVERY_DELIVERED: 'DELIVERY_DELIVERED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAYMENT_COMPLETED: 'PAYMENT_COMPLETED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  SUBSCRIPTION_PAUSED: 'SUBSCRIPTION_PAUSED',
  SUBSCRIPTION_RESUMED: 'SUBSCRIPTION_RESUMED',
  SUBSCRIPTION_CANCELLED: 'SUBSCRIPTION_CANCELLED',
  REFERRAL_REWARD: 'REFERRAL_REWARD',
  DISCOUNT_APPLIED: 'DISCOUNT_APPLIED',
  SYSTEM_ANNOUNCEMENT: 'SYSTEM_ANNOUNCEMENT',
};

// Notification Status
export const NOTIFICATION_STATUS = {
  UNREAD: 'UNREAD',
  READ: 'READ',
  ARCHIVED: 'ARCHIVED',
};

// Validation Rules
export const VALIDATION = {
  PASSWORD_MIN_LENGTH: 8,
  PHONE_LENGTH: 8,
  MIN_MEALS: 5,
  MAX_MEALS: 20,
  MAX_FILE_SIZE: MAX_FILE_SIZE,
};

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: DEFAULT_PAGE_SIZE,
  MAX_LIMIT: MAX_PAGE_SIZE,
};

// Local Storage Keys
export const STORAGE_KEYS = {
  PREFIX: LOCAL_STORAGE_PREFIX,
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  CART: 'cart',
  THEME: 'theme',
  LANGUAGE: 'language',
};

// Cache Keys
export const CACHE_KEYS = {
  MEALS: 'meals',
  MENUS: 'menus',
  ORDERS: 'orders',
  USER: 'user',
};

// Routes
export const ROUTES = {
  HOME: '/',
  ABOUT: '/about-us.html',
  HOW_IT_WORKS: '/how-it-works.html',
  MENU: '/our-menu.html',
  REFER: '/refer-and-save.html',
  CONTACT: '/contact-us.html',
  FAQ: '/FQAs.html',
  TERMS: '/terms.html',
  
  LOGIN: '/login.html',
  REGISTER: '/register.html',
  FORGOT_PASSWORD: '/forgot-password.html',
  RESET_PASSWORD: '/reset-password.html',
  TWO_FACTOR: '/two-factor.html',
  
  DASHBOARD: '/dashboard.html',
  WEEKLY_MENU: '/weekly-menu.html',
  SUBSCRIPTION: '/subscription.html',
  CREATE_ORDER: '/create-order.html',
  ORDERS: '/orders.html',
  ORDER_DETAILS: '/order-details.html',
  ADDRESSES: '/addresses.html',
  PAYMENTS: '/payments.html',
  NOTIFICATIONS: '/notifications.html',
  REFERRALS: '/referrals.html',
  PROFILE: '/profile.html',
  SETTINGS: '/settings.html',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'Please login to continue.',
  FORBIDDEN: 'You do not have permission to access this resource.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  VALIDATION_ERROR: 'Please check your input and try again.',
  REQUIRED_FIELD: 'This field is required.',
  INVALID_EMAIL: 'Please enter a valid email address.',
  INVALID_PHONE: 'Please enter a valid phone number.',
  PASSWORD_MISMATCH: 'Passwords do not match.',
  PASSWORD_WEAK: 'Password must be at least 8 characters with uppercase, lowercase, number, and special character.',
  INVALID_2FA_CODE: 'Invalid verification code.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  REGISTRATION_SUCCESS: 'Registration successful! Welcome to Baldi Meals.',
  LOGIN_SUCCESS: 'Login successful! Welcome back.',
  LOGOUT_SUCCESS: 'Logged out successfully.',
  PROFILE_UPDATED: 'Profile updated successfully.',
  PASSWORD_CHANGED: 'Password changed successfully.',
  SUBSCRIPTION_CREATED: 'Subscription created successfully.',
  SUBSCRIPTION_PAUSED: 'Subscription paused successfully.',
  SUBSCRIPTION_RESUMED: 'Subscription resumed successfully.',
  SUBSCRIPTION_CANCELLED: 'Subscription cancelled successfully.',
  ORDER_CREATED: 'Order placed successfully.',
  ORDER_CONFIRMED: 'Delivery confirmed successfully.',
  ADDRESS_ADDED: 'Address added successfully.',
  ADDRESS_UPDATED: 'Address updated successfully.',
  ADDRESS_DELETED: 'Address deleted successfully.',
  PAYMENT_SUCCESS: 'Payment completed successfully.',
  REFERRAL_APPLIED: 'Referral code applied successfully!',
  DISCOUNT_APPLIED: 'Discount code applied successfully!',
  COPIED_TO_CLIPBOARD: 'Copied to clipboard!',
};

// Plan Details
export const PLAN_DETAILS = {
  FIVE_DAY: {
    name: '5-Day Plan',
    meals: 5,
    description: 'Perfect for weekday meal prep',
    icon: '📦',
  },
  SEVEN_DAY: {
    name: '7-Day Plan',
    meals: 7,
    description: 'Complete week coverage',
    icon: '📦📦',
  },
};

// Status Colors
export const STATUS_COLORS = {
  // Subscription
  PENDING: 'bg-yellow-100 text-yellow-800',
  ACTIVE: 'bg-green-100 text-green-800',
  PAUSED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800',
  
  // Delivery
  SCHEDULED: 'bg-blue-100 text-blue-800',
  CONFIRMED: 'bg-green-100 text-green-800',
  PREPARING: 'bg-yellow-100 text-yellow-800',
  OUT_FOR_DELIVERY: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  
  // Payment
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
  REFUNDED: 'bg-gray-100 text-gray-800',
  
  // Meal Category
  BULKING: 'bg-blue-100 text-blue-800',
  CUTTING: 'bg-green-100 text-green-800',
};

// Social Media Links
export const SOCIAL_LINKS = {
  FACEBOOK: 'https://facebook.com/baldimeals',
  INSTAGRAM: 'https://instagram.com/baldimeals',
  TWITTER: 'https://twitter.com/baldimeals',
  LINKEDIN: 'https://linkedin.com/company/baldimeals',
};

// Contact Info
export const CONTACT_INFO = {
  EMAIL: 'info@baldimeals.com',
  PHONE: '+216 XX XXX XXX',
  ADDRESS: 'Tunis, Tunisia',
  HOURS: 'Mon-Fri: 8AM-8PM, Sat-Sun: 9AM-6PM',
};

// Feature Flags
export const FEATURES = {
  ENABLE_2FA: ENABLE_2FA,
  ENABLE_REFERRALS: ENABLE_REFERRALS,
  ENABLE_DISCOUNTS: ENABLE_DISCOUNTS,
};