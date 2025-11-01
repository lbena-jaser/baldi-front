import authService from '../../services/auth.service.js';
import { validateRegister } from '../../validators/auth.validator.js';
import { showToast } from '../../components/toast.js';
import { getQueryParam } from '../../core/utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // Check if already authenticated
  if (authService.isAuthenticated()) {
    window.location.href = '/dashboard.html';
    return;
  }

  const form = document.getElementById('registerForm');
  const registerBtn = document.getElementById('registerBtn');
  const registerBtnText = document.getElementById('registerBtnText');
  const registerBtnLoading = document.getElementById('registerBtnLoading');

  // Check for referral code in URL
  const referralCode = getQueryParam('ref');
  if (referralCode) {
    sessionStorage.setItem('referralCode', referralCode);
    showToast('Referral code will be applied after registration!', 'info');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    document.querySelectorAll('.form-error').forEach(el => {
      el.classList.add('hidden');
      el.textContent = '';
    });

    // Get form data
    const formData = {
      email: document.getElementById('email').value.trim(),
      password: document.getElementById('password').value,
      confirmPassword: document.getElementById('confirmPassword').value,
      firstName: document.getElementById('firstName').value.trim(),
      lastName: document.getElementById('lastName').value.trim(),
      phoneNumber: document.getElementById('phoneNumber').value.trim(),
    };

    // Validate
    const { isValid, errors } = validateRegister(formData);

    if (!isValid) {
      // Show validation errors
      Object.keys(errors).forEach(field => {
        const errorElement = document.getElementById(`${field}Error`);
        if (errorElement) {
          errorElement.textContent = errors[field];
          errorElement.classList.remove('hidden');
        }
      });
      return;
    }

    // Check terms
    if (!document.getElementById('terms').checked) {
      showToast('Please accept the Terms & Conditions', 'error');
      return;
    }

    // Show loading
    registerBtn.disabled = true;
    registerBtnText.classList.add('hidden');
    registerBtnLoading.classList.remove('hidden');

    try {
      // Register
      await authService.register(formData);

      // Check if there's a referral code to apply
      const storedReferralCode = sessionStorage.getItem('referralCode');
      if (storedReferralCode) {
        try {
          // Apply referral code
          await fetch(`${import.meta.env.VITE_API_URL}/referrals/apply`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${authService.getCurrentUser()?.accessToken}`,
            },
            body: JSON.stringify({ referralCode: storedReferralCode }),
          });
          sessionStorage.removeItem('referralCode');
          showToast('Referral code applied! You got 10% discount!', 'success');
        } catch (error) {
          console.error('Failed to apply referral:', error);
        }
      }

      // Success - redirect to dashboard
      showToast('Registration successful! Welcome to Baldi Meals!', 'success');
      
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1500);

    } catch (error) {
      console.error('Registration error:', error);
      
      // Error already shown by toast via API interceptor
      // Show specific field errors if available
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        errors.forEach(err => {
          const errorElement = document.getElementById(`${err.field}Error`);
          if (errorElement) {
            errorElement.textContent = err.message;
            errorElement.classList.remove('hidden');
          }
        });
      }
    } finally {
      // Hide loading
      registerBtn.disabled = false;
      registerBtnText.classList.remove('hidden');
      registerBtnLoading.classList.add('hidden');
    }
  });

  // Real-time password validation
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');

  confirmPasswordInput.addEventListener('input', () => {
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (confirmPassword && password !== confirmPassword) {
      document.getElementById('confirmPasswordError').textContent = 'Passwords do not match';
      document.getElementById('confirmPasswordError').classList.remove('hidden');
    } else {
      document.getElementById('confirmPasswordError').classList.add('hidden');
    }
  });
});