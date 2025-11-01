import { required } from './index.js';

/**
 * Validate subscription creation
 * @param {Object} formData - Subscription form data
 * @returns {Object} Validation result
 */
export function validateSubscription(formData) {
  const rules = {
    planType: [required, validatePlanType],
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
 * Validate plan type
 * @param {string} planType - Plan type (FIVE_DAY or SEVEN_DAY)
 * @returns {boolean|string} True if valid, error message if invalid
 */
export function validatePlanType(planType) {
  if (!planType) {
    return true; // Skip if empty (use required separately)
  }
  
  const validPlans = ['FIVE_DAY', 'SEVEN_DAY'];
  
  if (!validPlans.includes(planType)) {
    return 'Please select a valid plan type';
  }
  
  return true;
}

/**
 * Check if subscription can be paused
 * @param {Object} subscription - Subscription object
 * @returns {Object} Validation result
 */
export function canPauseSubscription(subscription) {
  if (!subscription) {
    return { canPause: false, reason: 'No subscription found' };
  }
  
  if (subscription.status !== 'ACTIVE') {
    return { canPause: false, reason: 'Only active subscriptions can be paused' };
  }
  
  return { canPause: true, reason: null };
}

/**
 * Check if subscription can be resumed
 * @param {Object} subscription - Subscription object
 * @returns {Object} Validation result
 */
export function canResumeSubscription(subscription) {
  if (!subscription) {
    return { canResume: false, reason: 'No subscription found' };
  }
  
  if (subscription.status !== 'PAUSED') {
    return { canResume: false, reason: 'Only paused subscriptions can be resumed' };
  }
  
  return { canResume: true, reason: null };
}

/**
 * Check if subscription can be cancelled
 * @param {Object} subscription - Subscription object
 * @returns {Object} Validation result
 */
export function canCancelSubscription(subscription) {
  if (!subscription) {
    return { canCancel: false, reason: 'No subscription found' };
  }
  
  if (subscription.status === 'CANCELLED') {
    return { canCancel: false, reason: 'Subscription is already cancelled' };
  }
  
  return { canCancel: true, reason: null };
}