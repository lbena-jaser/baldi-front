import authService from '../../services/auth.service.js';
import referralService from '../../services/referral.service.js';
import { showToast } from '../../components/toast.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Mobile menu
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  mobileMenuBtn?.addEventListener('click', () => {
    mobileMenu.classList.toggle('hidden');
  });

  // Check authentication
  if (!authService.isAuthenticated()) {
    document.getElementById('loginPrompt').classList.remove('hidden');
    return;
  }

  // User is authenticated - show referral section
  document.getElementById('loginPrompt').classList.add('hidden');
  document.getElementById('referralSection').classList.remove('hidden');

  await loadReferral();
});

async function loadReferral() {
  try {
    // Get or create referral
    let referrals = await referralService.getMyReferrals();
    
    let referral;
    if (referrals.length === 0) {
      // Create new referral
      referral = await referralService.createReferral();
    } else {
      // Use existing active referral
      referral = referrals.find(r => r.status === 'PENDING') || referrals[0];
    }

    // Display referral code
    const codeElement = document.getElementById('referralCode');
    const formattedCode = referralService.formatCode(referral.referralCode);
    codeElement.textContent = formattedCode;

    // Display stats
    document.getElementById('totalReferrals').textContent = referrals.length;
    document.getElementById('usageCount').textContent = referral.usageCount;
    document.getElementById('usesRemaining').textContent = referralService.getUsesRemaining(referral);

    // Setup copy button
    document.getElementById('copyCodeBtn').addEventListener('click', async () => {
      await referralService.copyReferralCode(referral.referralCode);
    });

    // Setup share buttons
    document.getElementById('shareFacebook').addEventListener('click', () => {
      referralService.shareOnSocial(referral.referralCode, 'facebook');
    });

    document.getElementById('shareTwitter').addEventListener('click', () => {
      referralService.shareOnSocial(referral.referralCode, 'twitter');
    });

    document.getElementById('shareWhatsapp').addEventListener('click', () => {
      referralService.shareOnSocial(referral.referralCode, 'whatsapp');
    });

  } catch (error) {
    console.error('Error loading referral:', error);
    showToast('Failed to load referral information', 'error');
  }
}