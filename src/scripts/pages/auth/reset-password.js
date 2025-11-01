import authService from '../../services/auth.service.js';
import { validateResetPassword } from '../../validators/auth.validator.js';
import { showToast } from '../../components/toast.js';
import { getQueryParam } from '../../core/utils.js';

document.addEventListener('DOMContentLoaded', () => {
  // Get token from URL
  const token = getQueryParam('token');

  if (!token) {
    showToast('Invalid or missing reset token', 'error');
    setTimeout(() => {
      window.location.href = '/forgot-password.html';
    }, 2000);
    return;
  }

  const form = document.getElementById('resetPasswordForm');
  const resetBtn = document.getElementById('resetBtn');
  const resetBtnText = document.getElementById('resetBtnText');
  const resetBtnLoading = document.getElementById('resetBtnLoading');
  const passwordInput = document.getElementById('password');
  const confirmPasswordInput = document.getElementById('confirmPassword');

  // Real-time password match validation
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

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    document.querySelectorAll('.form-error').forEach(el => {
      el.classList.add('hidden');
      el.textContent = '';
    });

    // Get form data
    const formData = {
      password: passwordInput.value,
      confirmPassword: confirmPasswordInput.value,
    };

    // Validate
    const { isValid, errors } = validateResetPassword(formData);

    if (!isValid) {
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
    resetBtn.disabled = true;
    resetBtnText.classList.add('hidden');
    resetBtnLoading.classList.remove('hidden');

    try {
      // Reset password
      await authService.resetPassword(token, {
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      // Success - redirect to login
      showToast('Password reset successful! Redirecting to login...', 'success');
      
      setTimeout(() => {
        window.location.href = '/login.html';
      }, 2000);

    } catch (error) {
      console.error('Reset password error:', error);

      // Check if token is invalid/expired
      if (error.response?.status === 400 || error.response?.status === 404) {
        showToast('Invalid or expired reset token', 'error');
        setTimeout(() => {
          window.location.href = '/forgot-password.html';
        }, 2000);
      }

      // Show field errors if available
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
      resetBtn.disabled = false;
      resetBtnText.classList.remove('hidden');
      resetBtnLoading.classList.add('hidden');
    }
  });
});