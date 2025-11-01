// Homepage JavaScript - Mobile menu, navbar, animations, smooth scroll

document.addEventListener('DOMContentLoaded', () => {
  setupMobileMenu();
  setupNavbar();
  setupSmoothScroll();
  setupAnimations();
});

function setupMobileMenu() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  
  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
      
      // Animate hamburger icon (optional enhancement)
      const isOpen = !mobileMenu.classList.contains('hidden');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
        mobileMenu.classList.add('hidden');
      }
    });
    
    // Close menu when clicking a link
    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }
}

function setupNavbar() {
  const navbar = document.getElementById('navbar');
  let lastScroll = 0;
  
  if (navbar) {
    window.addEventListener('scroll', () => {
      const currentScroll = window.pageYOffset;
      
      // Add shadow when scrolled
      if (currentScroll > 50) {
        navbar.classList.add('navbar-scrolled');
        navbar.classList.remove('navbar-transparent');
      } else {
        navbar.classList.remove('navbar-scrolled');
        navbar.classList.add('navbar-transparent');
      }
      
      // Hide/show navbar on scroll (optional)
      // Uncomment if you want navbar to hide when scrolling down
      /*
      if (currentScroll > lastScroll && currentScroll > 500) {
        // Scrolling down & past hero
        navbar.style.transform = 'translateY(-100%)';
      } else {
        // Scrolling up
        navbar.style.transform = 'translateY(0)';
      }
      */
      
      lastScroll = currentScroll;
    });
  }
}

function setupSmoothScroll() {
  // Smooth scroll for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        const navbarHeight = 80; // Adjust based on your navbar height
        const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - navbarHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

function setupAnimations() {
  // Intersection Observer for fade-in animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };
  
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('fade-in');
        
        // Add staggered animation for children if they have data-animate attribute
        const children = entry.target.querySelectorAll('[data-animate]');
        children.forEach((child, index) => {
          setTimeout(() => {
            child.classList.add('fade-in');
          }, index * 100); // 100ms delay between each child
        });
        
        // Stop observing after animation
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  
  // Observe sections
  document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
  });
  
  // Observe cards
  document.querySelectorAll('.card').forEach(card => {
    observer.observe(card);
  });
}

// Counter animation for stats (if you have stats on homepage)
function animateCounter(element, target, duration = 2000) {
  let current = 0;
  const increment = target / (duration / 16); // 60fps
  
  const updateCounter = () => {
    current += increment;
    if (current < target) {
      element.textContent = Math.floor(current);
      requestAnimationFrame(updateCounter);
    } else {
      element.textContent = target;
    }
  };
  
  updateCounter();
}

// Initialize counters when they come into view
const statsObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const element = entry.target;
      const target = parseInt(element.dataset.count || element.textContent);
      
      if (!isNaN(target)) {
        animateCounter(element, target);
      }
      
      statsObserver.unobserve(element);
    }
  });
}, { threshold: 0.5 });

// Observe stat numbers
document.querySelectorAll('[data-count]').forEach(stat => {
  statsObserver.observe(stat);
});