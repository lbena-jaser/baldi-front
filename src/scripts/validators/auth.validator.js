import { required, email, phone, password, confirmPassword, minLength } from './index.js';

// Login validation
export function validateLogin(formData) {
  const rules = {
    email: [required, email],
    password: [required],
  };
  
  const errors = {};
  let isValid = true;
  
  Object.keys(rules).forEach((field) => {
    const value = formData[field];
    const fieldRules = rules[field];
    
    for (const rule of fieldRules) {
      const result = typeof rule === 'function' ? rule(value) : rule(value, formData.password);
      
      if (result !== true) {
        errors[field] = result;
        isValid = false;
        break;
      }
    }
  });
  
  return { isValid, errors };
}

// Register validation
export function validateRegister(formData) {
  const rules = {
    email: [required, email],
    password: [required, password],
    confirmPassword: [(value) => confirmPassword(value, formData.password)],
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

// Change password validation
export function validateChangePassword(formData) {
  const rules = {
    currentPassword: [required],
    newPassword: [required, password],
    confirmPassword: [(value) => confirmPassword(value, formData.newPassword)],
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

// 2FA code validation
export function validate2FACode(code) {
  if (!code) {
    return { isValid: false, error: 'Verification code is required' };
  }
  
  if (!/^\d{6}$/.test(code)) {
    return { isValid: false, error: 'Code must be 6 digits' };
  }
  
  return { isValid: true, error: null };
}

// Forgot password validation
export function validateForgotPassword(formData) {
  const rules = {
    email: [required, email],
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

// Reset password validation
export function validateResetPassword(formData) {
  const rules = {
    password: [required, password],
    confirmPassword: [(value) => confirmPassword(value, formData.password)],
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