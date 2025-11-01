import { required, phone, minLength } from './index.js';

/**
 * Validate address form
 * @param {Object} formData - Address form data
 * @returns {Object} Validation result
 */
export function validateAddress(formData) {
  const rules = {
    label: [required],
    fullName: [required, minLength(3)],
    phoneNumber: [required, phone],
    addressLine1: [required, minLength(5)],
    city: [required, minLength(2)],
    state: [required, minLength(2)],
    postalCode: [required, minLength(4)],
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
 * Validate address label
 * @param {string} label - Address label
 * @returns {Object} Validation result
 */
export function validateLabel(label) {
  if (!label) {
    return { isValid: false, error: 'Label is required' };
  }
  
  if (label.length < 2) {
    return { isValid: false, error: 'Label must be at least 2 characters' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate postal code (Tunisian format)
 * @param {string} postalCode - Postal code
 * @returns {Object} Validation result
 */
export function validatePostalCode(postalCode) {
  if (!postalCode) {
    return { isValid: false, error: 'Postal code is required' };
  }
  
  // Tunisian postal codes are 4 digits
  if (!/^\d{4}$/.test(postalCode)) {
    return { isValid: false, error: 'Postal code must be 4 digits' };
  }
  
  return { isValid: true, error: null };
}