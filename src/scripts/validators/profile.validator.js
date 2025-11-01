import { required, email, phone, minLength } from './index.js';

/**
 * Validate profile update
 * @param {Object} formData - Profile form data
 * @returns {Object} Validation result
 */
export function validateProfile(formData) {
  const rules = {
    firstName: [required, minLength(2)],
    lastName: [required, minLength(2)],
    phoneNumber: [required, phone],
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
 * Validate first name
 * @param {string} firstName - First name
 * @returns {Object} Validation result
 */
export function validateFirstName(firstName) {
  if (!firstName) {
    return { isValid: false, error: 'First name is required' };
  }
  
  if (firstName.length < 2) {
    return { isValid: false, error: 'First name must be at least 2 characters' };
  }
  
  if (firstName.length > 50) {
    return { isValid: false, error: 'First name must be less than 50 characters' };
  }
  
  // Only letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s'-]+$/.test(firstName)) {
    return { isValid: false, error: 'First name can only contain letters' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate last name
 * @param {string} lastName - Last name
 * @returns {Object} Validation result
 */
export function validateLastName(lastName) {
  if (!lastName) {
    return { isValid: false, error: 'Last name is required' };
  }
  
  if (lastName.length < 2) {
    return { isValid: false, error: 'Last name must be at least 2 characters' };
  }
  
  if (lastName.length > 50) {
    return { isValid: false, error: 'Last name must be less than 50 characters' };
  }
  
  // Only letters, spaces, hyphens, and apostrophes
  if (!/^[a-zA-Z\s'-]+$/.test(lastName)) {
    return { isValid: false, error: 'Last name can only contain letters' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate phone number update
 * @param {string} phoneNumber - Phone number
 * @returns {Object} Validation result
 */
export function validatePhoneNumber(phoneNumber) {
  if (!phoneNumber) {
    return { isValid: false, error: 'Phone number is required' };
  }
  
  // Tunisian phone numbers: 8 digits starting with 2-9
  const cleaned = phoneNumber.replace(/\s+/g, '');
  
  if (!/^[2-9]\d{7}$/.test(cleaned)) {
    return {
      isValid: false,
      error: 'Phone number must be 8 digits starting with 2-9',
    };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate email update (if changing email)
 * @param {string} emailAddress - Email address
 * @returns {Object} Validation result
 */
export function validateEmail(emailAddress) {
  if (!emailAddress) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(emailAddress)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate profile completeness
 * @param {Object} profile - Profile object
 * @returns {Object} Validation result
 */
export function validateProfileCompleteness(profile) {
  const required = ['firstName', 'lastName', 'email', 'phoneNumber'];
  const missing = [];
  
  required.forEach((field) => {
    if (!profile[field]) {
      missing.push(field);
    }
  });
  
  if (missing.length > 0) {
    return {
      isComplete: false,
      missing,
      message: `Please complete your profile: ${missing.join(', ')}`,
    };
  }
  
  return {
    isComplete: true,
    missing: [],
    message: 'Profile is complete',
  };
}

/**
 * Validate bio/description
 * @param {string} bio - User bio
 * @returns {Object} Validation result
 */
export function validateBio(bio) {
  if (!bio) {
    return { isValid: true, error: null }; // Bio is optional
  }
  
  if (bio.length > 500) {
    return {
      isValid: false,
      error: 'Bio must be less than 500 characters',
    };
  }
  
  return { isValid: true, error: null };
}