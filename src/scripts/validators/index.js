import { ERROR_MESSAGES, VALIDATION } from '../config/constants.js';

// Validation utilities

// Required field
export function required(value, fieldName = 'This field') {
  if (!value || (typeof value === 'string' && !value.trim())) {
    return `${fieldName} is required`;
  }
  return true;
}

// Email validation
export function email(value) {
  if (!value) {
    return true; // Skip if empty (use required separately)
  }
  
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regex.test(value)) {
    return ERROR_MESSAGES.INVALID_EMAIL;
  }
  return true;
}

// Phone number validation (Tunisian format)
export function phone(value) {
  if (!value) {
    return true;
  }
  
  const cleaned = value.replace(/\s+/g, '');
  const regex = /^[2-9]\d{7}$/;
  
  if (!regex.test(cleaned)) {
    return ERROR_MESSAGES.INVALID_PHONE;
  }
  return true;
}

// Password strength
export function password(value) {
  if (!value) {
    return true;
  }
  
  if (value.length < VALIDATION.PASSWORD_MIN_LENGTH) {
    return `Password must be at least ${VALIDATION.PASSWORD_MIN_LENGTH} characters`;
  }
  
  if (!/[A-Z]/.test(value)) {
    return 'Password must contain at least one uppercase letter';
  }
  
  if (!/[a-z]/.test(value)) {
    return 'Password must contain at least one lowercase letter';
  }
  
  if (!/[0-9]/.test(value)) {
    return 'Password must contain at least one number';
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    return 'Password must contain at least one special character';
  }
  
  return true;
}

// Confirm password
export function confirmPassword(value, passwordValue) {
  if (!value) {
    return true;
  }
  
  if (value !== passwordValue) {
    return ERROR_MESSAGES.PASSWORD_MISMATCH;
  }
  
  return true;
}

// Min length
export function minLength(min) {
  return (value) => {
    if (!value) {
      return true;
    }
    
    if (value.length < min) {
      return `Must be at least ${min} characters`;
    }
    
    return true;
  };
}

// Max length
export function maxLength(max) {
  return (value) => {
    if (!value) {
      return true;
    }
    
    if (value.length > max) {
      return `Must be at most ${max} characters`;
    }
    
    return true;
  };
}

// Min value
export function min(minValue) {
  return (value) => {
    if (!value && value !== 0) {
      return true;
    }
    
    const num = Number(value);
    if (isNaN(num) || num < minValue) {
      return `Must be at least ${minValue}`;
    }
    
    return true;
  };
}

// Max value
export function max(maxValue) {
  return (value) => {
    if (!value && value !== 0) {
      return true;
    }
    
    const num = Number(value);
    if (isNaN(num) || num > maxValue) {
      return `Must be at most ${maxValue}`;
    }
    
    return true;
  };
}

// Pattern matching
export function pattern(regex, message = 'Invalid format') {
  return (value) => {
    if (!value) {
      return true;
    }
    
    if (!regex.test(value)) {
      return message;
    }
    
    return true;
  };
}

// Validate form
export function validateForm(formData, rules) {
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
        break; // Stop at first error
      }
    }
  });
  
  return { isValid, errors };
}

// Validate single field
export function validateField(value, rules) {
  for (const rule of rules) {
    const result = rule(value);
    
    if (result !== true) {
      return { isValid: false, error: result };
    }
  }
  
  return { isValid: true, error: null };
}