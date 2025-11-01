import authService from '../../services/auth.service.js';
import { validateLogin } from '../../validators/auth.validator.js';
import { showToast } from '../../components/toast.js';
import { getQueryParam } from '../../core/utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // Check if already authenticated
  if (authService.isAuthenticated()) {
    window.location.href = '/dashboard.html';
    return;
  }

  const form = document.getElementById('loginForm');
  const loginBtn = document.getElementById('loginBtn');
  const loginBtnText = document.getElementById('loginBtnText');
  const loginBtnLoading = document.getElementById('loginBtnLoading');

  // Check for redirect parameter
  const redirect = getQueryParam('redirect');

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
    };

    // Validate
    const { isValid, errors } = validateLogin(formData);

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

    // Show loading
    loginBtn.disabled = true;
    loginBtnText.classList.add('hidden');
    loginBtnLoading.classList.remove('hidden');

    try {
      // Login
      const response = await authService.login(formData);

      // Check if 2FA is required
      if (response.requires2FA) {
        // Redirect to 2FA page
        window.location.href = '/two-factor.html';
        return;
      }

      // Success - redirect
      showToast('Login successful! Redirecting...', 'success');
      
      setTimeout(() => {
        if (redirect) {
          window.location.href = redirect;
        } else {
          window.location.href = '/dashboard.html';
        }
      }, 1000);

    } catch (error) {
      console.error('Login error:', error);
      
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
      loginBtn.disabled = false;
      loginBtnText.classList.remove('hidden');
      loginBtnLoading.classList.add('hidden');
    }
  });

  // Auto-fill email if coming from registration
  const registeredEmail = getQueryParam('email');
  if (registeredEmail) {
    document.getElementById('email').value = registeredEmail;
    showToast('Registration successful! Please login.', 'success');
  }
});