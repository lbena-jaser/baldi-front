// FAQs Page - Dynamic FAQ accordion with search

const faqs = [
  {
    category: 'Getting Started',
    questions: [
      {
        q: 'How does Baldi Meals work?',
        a: 'Choose your meal plan (5-day or 7-day), select your meals from our weekly menu, and get fresh meals delivered to your door every week. It\'s that simple!'
      },
      {
        q: 'How do I sign up?',
        a: 'Click "Get Started" on our homepage, create your account, choose your plan, and place your first order. Your subscription activates with your first delivery.'
      },
      {
        q: 'What areas do you deliver to?',
        a: 'We currently deliver to all areas in Tunis, Tunisia. More cities coming soon!'
      }
    ]
  },
  {
    category: 'Plans & Pricing',
    questions: [
      {
        q: 'What meal plans are available?',
        a: 'We offer 5-Day Plan (perfect for weekdays) and 7-Day Plan (complete week coverage). Both plans let you choose from 5-20 meals per delivery.'
      },
      {
        q: 'Can I change my plan?',
        a: 'Yes! You can upgrade or downgrade your plan at any time. Changes apply to your next delivery.'
      },
      {
        q: 'How much do meals cost?',
        a: 'Meal prices vary based on category and ingredients. Check our menu for current pricing. Discounts available for referrals!'
      },
      {
        q: 'Are there any commitment requirements?',
        a: 'No long-term commitment required. You can pause or cancel your subscription anytime.'
      }
    ]
  },
  {
    category: 'Meals & Menu',
    questions: [
      {
        q: 'What meal categories do you offer?',
        a: 'We offer Bulking meals (high calories, muscle building) and Cutting meals (lean protein, fat loss). All meals designed by certified nutritionists.'
      },
      {
        q: 'Do you offer vegetarian/vegan options?',
        a: 'Currently we focus on protein-rich meals. Vegetarian options coming soon!'
      },
      {
        q: 'Can I customize my meals?',
        a: 'You can select any combination of meals from our weekly menu. Each delivery requires 5-20 meals total.'
      },
      {
        q: 'How long do meals stay fresh?',
        a: 'Meals stay fresh for 5-7 days when refrigerated properly. Heating instructions included.'
      }
    ]
  },
  {
    category: 'Delivery',
    questions: [
      {
        q: 'When will I receive my meals?',
        a: 'Your first delivery arrives 5-7 days after ordering. After that, you receive weekly deliveries on the same day each week.'
      },
      {
        q: 'What if I\'m not home during delivery?',
        a: 'Our delivery team will call you before arriving. You can also leave delivery instructions with your order.'
      },
      {
        q: 'How is delivery verified?',
        a: 'Each delivery includes a QR code and 6-digit verification code for secure verification upon arrival.'
      },
      {
        q: 'Can I change my delivery address?',
        a: 'Yes, you can add multiple addresses and choose which one to use for each delivery.'
      }
    ]
  },
  {
    category: 'Subscription Management',
    questions: [
      {
        q: 'Can I pause my subscription?',
        a: 'Yes! Pause your subscription anytime. Resume whenever you\'re ready - no penalties.'
      },
      {
        q: 'How do I cancel?',
        a: 'Cancel anytime from your dashboard. All future deliveries will be cancelled immediately.'
      },
      {
        q: 'Can I skip a week?',
        a: 'Yes, you can skip upcoming deliveries or pause your subscription temporarily.'
      },
      {
        q: 'What happens if I miss a payment?',
        a: 'We\'ll send payment reminders. If payment isn\'t completed, your delivery will be cancelled.'
      }
    ]
  },
  {
    category: 'Payment',
    questions: [
      {
        q: 'When am I charged?',
        a: 'You\'re charged when you place each delivery order. Payment must be completed before delivery.'
      },
      {
        q: 'What payment methods do you accept?',
        a: 'We accept credit/debit cards and local Tunisian payment gateways.'
      },
      {
        q: 'Do you offer refunds?',
        a: 'Refunds available for cancelled deliveries before preparation starts. Contact support for assistance.'
      }
    ]
  },
  {
    category: 'Account & Support',
    questions: [
      {
        q: 'How do I contact support?',
        a: 'Email us at info@baldimeals.com or use our contact form. We respond within 24 hours.'
      },
      {
        q: 'Can I change my email/password?',
        a: 'Yes, update your account details anytime from your profile settings.'
      },
      {
        q: 'What is 2FA and do I need it?',
        a: '2FA (Two-Factor Authentication) adds extra security. It\'s optional for customers, mandatory for admin accounts.'
      }
    ]
  }
];

let allQuestions = [];

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupNavbar();
  renderFAQs();
  setupSearch();
});

function setupMobileMenu() {
  const btn = document.getElementById('mobile-menu-btn');
  const menu = document.getElementById('mobile-menu');
  
  if (btn) {
    btn.addEventListener('click', () => {
      menu.classList.toggle('hidden');
    });
  }
}

function setupNavbar() {
  const navbar = document.getElementById('navbar');
  
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      navbar.classList.add('navbar-scrolled');
      navbar.classList.remove('navbar-transparent');
    } else {
      navbar.classList.remove('navbar-scrolled');
    }
  });
}

function renderFAQs(filter = '') {
  const container = document.getElementById('faqContainer');
  container.innerHTML = '';
  
  // Flatten all questions for search
  allQuestions = [];
  faqs.forEach(category => {
    category.questions.forEach(q => {
      allQuestions.push({ ...q, category: category.category });
    });
  });
  
  // Filter questions
  let filteredCategories = faqs;
  
  if (filter) {
    const lowerFilter = filter.toLowerCase();
    filteredCategories = faqs.map(cat => ({
      category: cat.category,
      questions: cat.questions.filter(q => 
        q.q.toLowerCase().includes(lowerFilter) ||
        q.a.toLowerCase().includes(lowerFilter)
      )
    })).filter(cat => cat.questions.length > 0);
  }
  
  // Render categories
  filteredCategories.forEach(category => {
    const categoryDiv = document.createElement('div');
    categoryDiv.className = 'mb-8';
    
    const categoryTitle = document.createElement('h2');
    categoryTitle.className = 'text-2xl font-bold text-gray-900 mb-4';
    categoryTitle.textContent = category.category;
    categoryDiv.appendChild(categoryTitle);
    
    const questionsDiv = document.createElement('div');
    questionsDiv.className = 'space-y-3';
    
    category.questions.forEach((item, idx) => {
      const faqItem = createFAQItem(item, `${category.category}-${idx}`);
      questionsDiv.appendChild(faqItem);
    });
    
    categoryDiv.appendChild(questionsDiv);
    container.appendChild(categoryDiv);
  });
  
  if (filteredCategories.length === 0) {
    container.innerHTML = '<p class="text-gray-500 text-center py-8">No FAQs found matching your search.</p>';
  }
}

function createFAQItem(item, id) {
  const div = document.createElement('div');
  div.className = 'border border-gray-200 rounded-lg overflow-hidden';
  
  div.innerHTML = `
    <button class="faq-toggle w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 transition-colors" data-target="${id}">
      <span class="font-semibold text-gray-900">${item.q}</span>
      <svg class="faq-icon w-5 h-5 text-gray-500 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
      </svg>
    </button>
    <div id="${id}" class="faq-answer hidden px-6 py-4 bg-gray-50 border-t border-gray-200">
      <p class="text-gray-600">${item.a}</p>
    </div>
  `;
  
  const button = div.querySelector('.faq-toggle');
  button.addEventListener('click', () => {
    toggleFAQ(id);
  });
  
  return div;
}

function toggleFAQ(id) {
  const answer = document.getElementById(id);
  const button = document.querySelector(`[data-target="${id}"]`);
  const icon = button.querySelector('.faq-icon');
  
  if (answer.classList.contains('hidden')) {
    answer.classList.remove('hidden');
    icon.style.transform = 'rotate(180deg)';
  } else {
    answer.classList.add('hidden');
    icon.style.transform = 'rotate(0deg)';
  }
}

function setupSearch() {
  const searchInput = document.getElementById('searchFAQ');
  
  let timeout;
  searchInput.addEventListener('input', (e) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      renderFAQs(e.target.value);
    }, 300);
  });
}