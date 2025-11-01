import { required, minLength, pattern } from './index.js';

/**
 * Validate payment card details
 * @param {Object} formData - Card form data
 * @returns {Object} Validation result
 */
export function validateCard(formData) {
  const rules = {
    cardNumber: [required, validateCardNumber],
    cardHolder: [required, minLength(3)],
    expiryDate: [required, validateExpiryDate],
    cvv: [required, validateCVV],
  };
  
  const errors = {};
  let isValid = true;
  
  Object.keys(rules).forEach((field) => {
    const value = formData[field];
    const fieldRules = rules[field];
    
    for (const rule of fieldRules) {
      const result = rule(value);
      
      if (result !== true) {
        errors[field] = result;
        isValid = false;
        break;
      }
    }
  });
  
  return { isValid, errors };
}

/**
 * Validate card number (Luhn algorithm)
 * @param {string} cardNumber - Card number
 * @returns {boolean|string} True if valid, error message if invalid
 */
export function validateCardNumber(cardNumber) {
  if (!cardNumber) {
    return true; // Skip if empty (use required separately)
  }
  
  // Remove spaces and dashes
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  
  // Check if only digits
  if (!/^\d+$/.test(cleaned)) {
    return 'Card number must contain only digits';
  }
  
  // Check length (13-19 digits)
  if (cleaned.length < 13 || cleaned.length > 19) {
    return 'Card number must be between 13 and 19 digits';
  }
  
  // Luhn algorithm
  let sum = 0;
  let isEven = false;
  
  for (let i = cleaned.length - 1; i >= 0; i--) {
    let digit = parseInt(cleaned[i], 10);
    
    if (isEven) {
      digit *= 2;
      if (digit > 9) {
        digit -= 9;
      }
    }
    
    sum += digit;
    isEven = !isEven;
  }
  
  if (sum % 10 !== 0) {
    return 'Invalid card number';
  }
  
  return true;
}

/**
 * Validate card holder name
 * @param {string} name - Card holder name
 * @returns {Object} Validation result
 */
export function validateCardHolder(name) {
  if (!name) {
    return { isValid: false, error: 'Card holder name is required' };
  }
  
  if (name.length < 3) {
    return { isValid: false, error: 'Name must be at least 3 characters' };
  }
  
  if (name.length > 100) {
    return { isValid: false, error: 'Name is too long' };
  }
  
  // Only letters, spaces, hyphens, apostrophes
  if (!/^[a-zA-Z\s'-]+$/.test(name)) {
    return { isValid: false, error: 'Name can only contain letters' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate expiry date (MM/YY format)
 * @param {string} expiryDate - Expiry date
 * @returns {boolean|string} True if valid, error message if invalid
 */
export function validateExpiryDate(expiryDate) {
  if (!expiryDate) {
    return true; // Skip if empty (use required separately)
  }
  
  // Check format MM/YY or MM/YYYY
  if (!/^\d{2}\/\d{2,4}$/.test(expiryDate)) {
    return 'Expiry date must be in MM/YY format';
  }
  
  const [month, year] = expiryDate.split('/');
  const monthNum = parseInt(month, 10);
  
  // Validate month
  if (monthNum < 1 || monthNum > 12) {
    return 'Invalid month';
  }
  
  // Validate year and check if expired
  const yearNum = parseInt(year, 10);
  const fullYear = yearNum < 100 ? 2000 + yearNum : yearNum;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  if (fullYear < currentYear || (fullYear === currentYear && monthNum < currentMonth)) {
    return 'Card has expired';
  }
  
  // Check if expiry is too far in the future (more than 20 years)
  if (fullYear > currentYear + 20) {
    return 'Invalid expiry date';
  }
  
  return true;
}

/**
 * Validate CVV/CVC code
 * @param {string} cvv - CVV code
 * @returns {boolean|string} True if valid, error message if invalid
 */
export function validateCVV(cvv) {
  if (!cvv) {
    return true; // Skip if empty (use required separately)
  }
  
  // Must be 3 or 4 digits
  if (!/^\d{3,4}$/.test(cvv)) {
    return 'CVV must be 3 or 4 digits';
  }
  
  return true;
}

/**
 * Get card type from number
 * @param {string} cardNumber - Card number
 * @returns {string} Card type (visa, mastercard, amex, etc.)
 */
export function getCardType(cardNumber) {
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  
  // Visa
  if (/^4/.test(cleaned)) {
    return 'visa';
  }
  
  // Mastercard
  if (/^5[1-5]/.test(cleaned)) {
    return 'mastercard';
  }
  
  // American Express
  if (/^3[47]/.test(cleaned)) {
    return 'amex';
  }
  
  // Discover
  if (/^6(?:011|5)/.test(cleaned)) {
    return 'discover';
  }
  
  // Diners Club
  if (/^3(?:0[0-5]|[68])/.test(cleaned)) {
    return 'diners';
  }
  
  // JCB
  if (/^35/.test(cleaned)) {
    return 'jcb';
  }
  
  return 'unknown';
}

/**
 * Format card number with spaces
 * @param {string} cardNumber - Card number
 * @returns {string} Formatted card number
 */
export function formatCardNumber(cardNumber) {
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  const type = getCardType(cleaned);
  
  // American Express: 4-6-5 format
  if (type === 'amex') {
    return cleaned.replace(/(\d{4})(\d{6})(\d{5})/, '$1 $2 $3');
  }
  
  // Others: 4-4-4-4 format
  return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
}

/**
 * Mask card number (show last 4 digits only)
 * @param {string} cardNumber - Card number
 * @returns {string} Masked card number
 */
export function maskCardNumber(cardNumber) {
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  const last4 = cleaned.slice(-4);
  return `•••• •••• •••• ${last4}`;
}

/**
 * Validate payment method selection
 * @param {string} method - Payment method
 * @returns {Object} Validation result
 */
export function validatePaymentMethod(method) {
  if (!method) {
    return { isValid: false, error: 'Please select a payment method' };
  }
  
  const validMethods = ['card', 'local_gateway', 'cash'];
  
  if (!validMethods.includes(method)) {
    return { isValid: false, error: 'Invalid payment method' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate billing address
 * @param {Object} address - Billing address
 * @returns {Object} Validation result
 */
export function validateBillingAddress(address) {
  const required = ['fullName', 'addressLine1', 'city', 'postalCode'];
  const missing = [];
  
  required.forEach((field) => {
    if (!address[field] || !address[field].trim()) {
      missing.push(field);
    }
  });
  
  if (missing.length > 0) {
    return {
      isValid: false,
      error: `Missing required fields: ${missing.join(', ')}`,
    };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate payment amount
 * @param {number} amount - Payment amount
 * @returns {Object} Validation result
 */
export function validateAmount(amount) {
  if (!amount || amount <= 0) {
    return { isValid: false, error: 'Invalid payment amount' };
  }
  
  if (amount < 1) {
    return { isValid: false, error: 'Minimum payment amount is 1 TND' };
  }
  
  if (amount > 10000) {
    return { isValid: false, error: 'Maximum payment amount is 10,000 TND' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Check if card is expired
 * @param {string} expiryDate - Expiry date (MM/YY)
 * @returns {boolean} True if expired
 */
export function isCardExpired(expiryDate) {
  if (!expiryDate || !/^\d{2}\/\d{2,4}$/.test(expiryDate)) {
    return true;
  }
  
  const [month, year] = expiryDate.split('/');
  const monthNum = parseInt(month, 10);
  const yearNum = parseInt(year, 10);
  const fullYear = yearNum < 100 ? 2000 + yearNum : yearNum;
  
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  
  return fullYear < currentYear || (fullYear === currentYear && monthNum < currentMonth);
}

/**
 * Get card icon based on type
 * @param {string} type - Card type
 * @returns {string} Icon or emoji
 */
export function getCardIcon(type) {
  const icons = {
    visa: '💳',
    mastercard: '💳',
    amex: '💳',
    discover: '💳',
    diners: '💳',
    jcb: '💳',
    unknown: '💳',
  };
  
  return icons[type] || icons.unknown;
}

/**
 * Get card display name
 * @param {string} type - Card type
 * @returns {string} Display name
 */
export function getCardDisplayName(type) {
  const names = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    discover: 'Discover',
    diners: 'Diners Club',
    jcb: 'JCB',
    unknown: 'Card',
  };
  
  return names[type] || names.unknown;
}