import { showToast } from '../../components/toast.js';
import { required, email } from '../../validators/index.js';

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupNavbar();
  setupContactForm();
});

function setupMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
  }
}

function setupNavbar() {
  const navbar = document.getElementById('navbar');
  
  if (navbar) {
    window.addEventListener('scroll', () => {
      if (window.scrollY > 50) {
        navbar.classList.add('navbar-scrolled');
        navbar.classList.remove('navbar-transparent');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    });
  }
}

function setupContactForm() {
  const form = document.getElementById('contactForm');
  const submitBtn = document.getElementById('submitBtn');
  const submitBtnText = document.getElementById('submitBtnText');
  const submitBtnLoading = document.getElementById('submitBtnLoading');
  
  if (!form) return;
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    document.querySelectorAll('.form-error').forEach(el => {
      el.classList.add('hidden');
      el.textContent = '';
    });
    
    // Get form data
    const formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      subject: document.getElementById('subject').value.trim(),
      message: document.getElementById('message').value.trim(),
    };
    
    // Validate
    const validation = validateContactForm(formData);
    
    if (!validation.isValid) {
      // Show validation errors
      Object.keys(validation.errors).forEach(field => {
        const errorElement = document.getElementById(`${field}Error`);
        if (errorElement) {
          errorElement.textContent = validation.errors[field];
          errorElement.classList.remove('hidden');
        }
      });
      return;
    }
    
    // Show loading
    submitBtn.disabled = true;
    submitBtnText.classList.add('hidden');
    submitBtnLoading.classList.remove('hidden');
    
    try {
      // Submit form (you can replace this with actual API call)
      await submitContactForm(formData);
      
      // Success
      showToast('Message sent successfully! We\'ll get back to you soon.', 'success');
      
      // Clear form
      form.reset();
      
    } catch (error) {
      console.error('Contact form error:', error);
      showToast('Failed to send message. Please try again.', 'error');
    } finally {
      // Hide loading
      submitBtn.disabled = false;
      submitBtnText.classList.remove('hidden');
      submitBtnLoading.classList.add('hidden');
    }
  });
}

function validateContactForm(formData) {
  const rules = {
    name: [required, (value) => {
      if (value.length < 2) return 'Name must be at least 2 characters';
      return true;
    }],
    email: [required, email],
    subject: [required, (value) => {
      if (value.length < 3) return 'Subject must be at least 3 characters';
      return true;
    }],
    message: [required, (value) => {
      if (value.length < 10) return 'Message must be at least 10 characters';
      if (value.length > 1000) return 'Message must be less than 1000 characters';
      return true;
    }],
  };
  
  const errors = {};
  let isValid = true;
  
  Object.keys(rules).forEach(field => {
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

async function submitContactForm(formData) {
  // Simulate API call - replace with actual endpoint when available
  // Example: await api.post('/contact', formData);
  
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Contact form submitted:', formData);
      resolve();
    }, 1500);
  });
}