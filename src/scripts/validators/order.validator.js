import { required, minLength, min, max } from './index.js';

/**
 * Validate order creation
 * @param {Object} formData - Order form data
 * @returns {Object} Validation result
 */
export function validateOrder(formData) {
  const rules = {
    subscriptionId: [required],
    deliveryAddressId: [required],
    meals: [required, validateMeals],
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
 * Validate meals array
 * @param {Array} meals - Array of meal objects with mealId and quantity
 * @returns {boolean|string} True if valid, error message if invalid
 */
export function validateMeals(meals) {
  if (!meals) {
    return true; // Skip if empty (use required separately)
  }
  
  if (!Array.isArray(meals)) {
    return 'Meals must be an array';
  }
  
  if (meals.length === 0) {
    return 'Please select at least one meal';
  }
  
  // Calculate total quantity
  const totalQuantity = meals.reduce((sum, meal) => {
    return sum + (meal.quantity || 0);
  }, 0);
  
  if (totalQuantity < 5) {
    return 'Minimum 5 meals required per order';
  }
  
  if (totalQuantity > 20) {
    return 'Maximum 20 meals allowed per order';
  }
  
  // Validate each meal has required fields
  for (const meal of meals) {
    if (!meal.mealId) {
      return 'All meals must have a valid meal ID';
    }
    
    if (!meal.quantity || meal.quantity < 1) {
      return 'All meals must have a quantity of at least 1';
    }
  }
  
  return true;
}

/**
 * Validate meal quantity
 * @param {number} quantity - Meal quantity
 * @returns {Object} Validation result
 */
export function validateMealQuantity(quantity) {
  const minValidator = min(1);
  const maxValidator = max(20);
  
  const minResult = minValidator(quantity);
  if (minResult !== true) {
    return { isValid: false, error: minResult };
  }
  
  const maxResult = maxValidator(quantity);
  if (maxResult !== true) {
    return { isValid: false, error: maxResult };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate total meal count for order
 * @param {number} totalMeals - Total number of meals
 * @returns {Object} Validation result
 */
export function validateTotalMeals(totalMeals) {
  if (totalMeals < 5) {
    return {
      isValid: false,
      error: 'Minimum 5 meals required per order',
      min: 5,
      max: 20,
    };
  }
  
  if (totalMeals > 20) {
    return {
      isValid: false,
      error: 'Maximum 20 meals allowed per order',
      min: 5,
      max: 20,
    };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate delivery notes
 * @param {string} notes - Delivery notes
 * @returns {Object} Validation result
 */
export function validateNotes(notes) {
  if (!notes) {
    return { isValid: true, error: null }; // Notes are optional
  }
  
  if (notes.length > 500) {
    return {
      isValid: false,
      error: 'Notes must be less than 500 characters',
    };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate add-ons array
 * @param {Array} addOns - Array of add-on objects with addOnId and quantity
 * @returns {boolean|string} True if valid, error message if invalid
 */
export function validateAddOns(addOns) {
  if (!addOns || addOns.length === 0) {
    return true; // Add-ons are optional
  }
  
  if (!Array.isArray(addOns)) {
    return 'Add-ons must be an array';
  }
  
  // Validate each add-on has required fields
  for (const addOn of addOns) {
    if (!addOn.addOnId) {
      return 'All add-ons must have a valid add-on ID';
    }
    
    if (!addOn.quantity || addOn.quantity < 1) {
      return 'All add-ons must have a quantity of at least 1';
    }
  }
  
  return true;
}

/**
 * Validate QR code for delivery verification
 * @param {string} qrCode - QR code string
 * @returns {Object} Validation result
 */
export function validateQRCode(qrCode) {
  if (!qrCode) {
    return { isValid: false, error: 'QR code is required' };
  }
  
  // QR codes are 16-character hex strings
  if (!/^[A-F0-9]{16}$/i.test(qrCode)) {
    return { isValid: false, error: 'Invalid QR code format' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Validate verification code for delivery
 * @param {string} code - 6-digit verification code
 * @returns {Object} Validation result
 */
export function validateVerificationCode(code) {
  if (!code) {
    return { isValid: false, error: 'Verification code is required' };
  }
  
  if (!/^\d{6}$/.test(code)) {
    return { isValid: false, error: 'Verification code must be 6 digits' };
  }
  
  return { isValid: true, error: null };
}

/**
 * Check if order can be modified
 * @param {Object} order - Order object
 * @returns {Object} Validation result
 */
export function canModifyOrder(order) {
  if (!order) {
    return { canModify: false, reason: 'No order found' };
  }
  
  // Only SCHEDULED and CONFIRMED orders can be modified
  const modifiableStatuses = ['SCHEDULED', 'CONFIRMED'];
  
  if (!modifiableStatuses.includes(order.status)) {
    return {
      canModify: false,
      reason: 'Orders can only be modified when scheduled or confirmed',
    };
  }
  
  return { canModify: true, reason: null };
}

/**
 * Check if order can be cancelled
 * @param {Object} order - Order object
 * @returns {Object} Validation result
 */
export function canCancelOrder(order) {
  if (!order) {
    return { canCancel: false, reason: 'No order found' };
  }
  
  // Only SCHEDULED and CONFIRMED orders can be cancelled
  const cancellableStatuses = ['SCHEDULED', 'CONFIRMED'];
  
  if (!cancellableStatuses.includes(order.status)) {
    return {
      canCancel: false,
      reason: 'Orders can only be cancelled when scheduled or confirmed',
    };
  }
  
  return { canCancel: true, reason: null };
}