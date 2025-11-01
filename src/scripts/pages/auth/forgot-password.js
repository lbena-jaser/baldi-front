import authService from '../../services/auth.service.js';
import { validateForgotPassword } from '../../validators/auth.validator.js';
import { showToast } from '../../components/toast.js';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('forgotPasswordForm');
  const resetBtn = document.getElementById('resetBtn');
  const resetBtnText = document.getElementById('resetBtnText');
  const resetBtnLoading = document.getElementById('resetBtnLoading');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    document.querySelectorAll('.form-error').forEach(el => {
      el.classList.add('hidden');
      el.textContent = '';
    });

    // Get form data
    const email = document.getElementById('email').value.trim();
    const formData = { email };

    // Validate
    const { isValid, errors } = validateForgotPassword(formData);

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
      // Request password reset
      await authService.forgotPassword(email);

      // Success - show message (email sent)
      showToast('Password reset link sent! Check your email.', 'success');

      // Clear form
      form.reset();

    } catch (error) {
      console.error('Forgot password error:', error);

      // Show error (but don't reveal if email exists for security)
      const errorElement = document.getElementById('emailError');
      if (errorElement) {
        errorElement.textContent = error.response?.data?.error || 'Failed to send reset link';
        errorElement.classList.remove('hidden');
      }
    } finally {
      resetBtn.disabled = false;
      resetBtnText.classList.remove('hidden');
      resetBtnLoading.classList.add('hidden');
    }
  });
});