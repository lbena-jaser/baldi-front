import api from '../../core/api.js';
import { showToast } from '../../components/toast.js';
import { getQueryParam } from '../../core/utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Get token from URL
  const token = getQueryParam('token');

  const verificationContent = document.getElementById('verificationContent');
  const successContent = document.getElementById('successContent');
  const errorContent = document.getElementById('errorContent');
  const errorMessage = document.getElementById('errorMessage');

  if (!token) {
    // No token provided
    verificationContent.classList.add('hidden');
    errorContent.classList.remove('hidden');
    errorMessage.textContent = 'No verification token provided.';
    return;
  }

  try {
    // Call verification endpoint
    // Note: Adjust endpoint based on your backend API
    await api.post('/auth/verify-email', { token });

    // Success
    verificationContent.classList.add('hidden');
    successContent.classList.remove('hidden');
    showToast('Email verified successfully!', 'success');

  } catch (error) {
    console.error('Email verification error:', error);

    // Failed
    verificationContent.classList.add('hidden');
    errorContent.classList.remove('hidden');

    // Set appropriate error message
    if (error.response?.status === 400) {
      errorMessage.textContent = 'Invalid verification token.';
    } else if (error.response?.status === 404) {
      errorMessage.textContent = 'Verification token not found.';
    } else if (error.response?.status === 410) {
      errorMessage.textContent = 'Verification token has expired.';
    } else {
      errorMessage.textContent = error.response?.data?.error || 'Failed to verify email.';
    }
  }
});