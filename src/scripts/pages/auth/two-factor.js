import authService from '../../services/auth.service.js';
import authStore from '../../state/auth.store.js';
import { validate2FACode } from '../../validators/auth.validator.js';
import { showToast } from '../../components/toast.js';

document.addEventListener('DOMContentLoaded', () => {
  // Check if 2FA is actually required
  const requires2FA = authStore.getState().requires2FA;
  
  if (!requires2FA) {
    showToast('2FA not required', 'error');
    window.location.href = '/login.html';
    return;
  }

  const form = document.getElementById('twoFactorForm');
  const verifyBtn = document.getElementById('verifyBtn');
  const verifyBtnText = document.getElementById('verifyBtnText');
  const verifyBtnLoading = document.getElementById('verifyBtnLoading');
  const codeInput = document.getElementById('code');

  // Auto-format code input (digits only)
  codeInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '').slice(0, 6);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear previous errors
    document.getElementById('codeError').classList.add('hidden');
    document.getElementById('codeError').textContent = '';

    // Get code
    const code = codeInput.value.trim();

    // Validate
    const { isValid, error } = validate2FACode(code);

    if (!isValid) {
      document.getElementById('codeError').textContent = error;
      document.getElementById('codeError').classList.remove('hidden');
      return;
    }

    // Show loading
    verifyBtn.disabled = true;
    verifyBtnText.classList.add('hidden');
    verifyBtnLoading.classList.remove('hidden');

    try {
      // Verify 2FA
      await authService.verify2FA(code);

      // Success - redirect to dashboard
      showToast('Verification successful! Redirecting...', 'success');
      
      setTimeout(() => {
        window.location.href = '/dashboard.html';
      }, 1000);

    } catch (error) {
      console.error('2FA verification error:', error);

      // Show error
      const errorMsg = error.response?.data?.error || 'Invalid verification code';
      document.getElementById('codeError').textContent = errorMsg;
      document.getElementById('codeError').classList.remove('hidden');

      // Clear input for retry
      codeInput.value = '';
      codeInput.focus();
    } finally {
      verifyBtn.disabled = false;
      verifyBtnText.classList.remove('hidden');
      verifyBtnLoading.classList.add('hidden');
    }
  });
});