import mealService from '../../services/meal.service.js';
import cartStore from '../../state/cart.store.js';
import authService from '../../services/auth.service.js';
import { showToast } from '../../components/toast.js';
import { formatCurrency } from '../../core/utils.js';

let allMeals = [];
let filteredMeals = [];
let currentCategory = 'all';

document.addEventListener('DOMContentLoaded', async () => {
  setupMobileMenu();
  setupNavbar();
  setupFilters();
  setupSearch();
  await loadMeals();
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

function setupFilters() {
  const categoryButtons = document.querySelectorAll('.category-btn');
  
  categoryButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      // Update active state
      categoryButtons.forEach(b => {
        b.classList.remove('btn-primary');
        b.classList.add('btn-outline');
      });
      btn.classList.remove('btn-outline');
      btn.classList.add('btn-primary');
      
      // Filter meals
      currentCategory = btn.dataset.category;
      filterMeals();
    });
  });
}

function setupSearch() {
  const searchInput = document.getElementById('searchInput');
  
  if (searchInput) {
    let timeout;
    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        filterMeals();
      }, 300);
    });
  }
}

async function loadMeals() {
  const container = document.getElementById('mealsContainer');
  
  // Show loading
  container.innerHTML = `
    <div class="col-span-full text-center py-12">
      <div class="spinner mx-auto mb-4"></div>
      <p class="text-gray-600">Loading meals...</p>
    </div>
  `;
  
  try {
    const response = await mealService.getMeals();
    allMeals = response.data || [];
    filteredMeals = allMeals;
    
    renderMeals();
  } catch (error) {
    console.error('Error loading meals:', error);
    container.innerHTML = `
      <div class="col-span-full text-center py-12">
        <svg class="w-16 h-16 mx-auto text-red-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-gray-600 mb-4">Failed to load meals</p>
        <button onclick="location.reload()" class="btn btn-primary">Retry</button>
      </div>
    `;
  }
}

function filterMeals() {
  let filtered = allMeals;
  
  // Filter by category
  if (currentCategory !== 'all') {
    filtered = mealService.filterByCategory(filtered, currentCategory);
  }
  
  // Filter by search
  const searchInput = document.getElementById('searchInput');
  if (searchInput && searchInput.value.trim()) {
    filtered = mealService.searchMeals(filtered, searchInput.value);
  }
  
  // Filter only available meals
  filtered = mealService.filterByAvailability(filtered, true);
  
  filteredMeals = filtered;
  renderMeals();
}

function renderMeals() {
  const container = document.getElementById('mealsContainer');
  
  if (filteredMeals.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-12">
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p class="text-gray-600">No meals found</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = filteredMeals.map(meal => createMealCard(meal)).join('');
  
  // Add click handlers for add to cart buttons
  container.querySelectorAll('.add-to-cart-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const mealId = e.currentTarget.dataset.mealId;
      const meal = filteredMeals.find(m => m.id === mealId);
      if (meal) {
        addToCart(meal);
      }
    });
  });
}

function createMealCard(meal) {
  const imageUrl = meal.imageUrl || '/placeholder-meal.jpg';
  const categoryBadge = meal.category === 'BULKING' 
    ? '<span class="badge bg-blue-100 text-blue-800">Bulking</span>'
    : '<span class="badge bg-green-100 text-green-800">Cutting</span>';
  
  return `
    <div class="meal-card bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      <div class="relative h-48 overflow-hidden bg-gray-200">
        <img 
          src="${imageUrl}" 
          alt="${meal.name}"
          class="w-full h-full object-cover"
          onerror="this.src='/placeholder-meal.jpg'"
        >
        <div class="absolute top-3 right-3">
          ${categoryBadge}
        </div>
      </div>
      
      <div class="p-4">
        <h3 class="text-xl font-bold text-gray-900 mb-2">${meal.name}</h3>
        ${meal.nameAr ? `<p class="text-sm text-gray-500 mb-2">${meal.nameAr}</p>` : ''}
        
        ${meal.description ? `
          <p class="text-sm text-gray-600 mb-3 line-clamp-2">${meal.description}</p>
        ` : ''}
        
        <div class="grid grid-cols-4 gap-2 mb-4 text-center">
          <div class="bg-gray-50 rounded p-2">
            <p class="text-xs text-gray-500">Calories</p>
            <p class="text-sm font-semibold text-gray-900">${meal.calories}</p>
          </div>
          <div class="bg-gray-50 rounded p-2">
            <p class="text-xs text-gray-500">Protein</p>
            <p class="text-sm font-semibold text-gray-900">${meal.protein}g</p>
          </div>
          <div class="bg-gray-50 rounded p-2">
            <p class="text-xs text-gray-500">Carbs</p>
            <p class="text-sm font-semibold text-gray-900">${meal.carbs}g</p>
          </div>
          <div class="bg-gray-50 rounded p-2">
            <p class="text-xs text-gray-500">Fats</p>
            <p class="text-sm font-semibold text-gray-900">${meal.fats}g</p>
          </div>
        </div>
        
        <div class="flex items-center justify-between">
          <span class="text-2xl font-bold text-primary-500">${formatCurrency(meal.price)}</span>
          <button 
            class="add-to-cart-btn btn btn-primary btn-sm"
            data-meal-id="${meal.id}"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  `;
}

function addToCart(meal) {
  // Check if user is logged in
  if (!authService.isAuthenticated()) {
    showToast('Please login to add items to cart', 'warning');
    setTimeout(() => {
      window.location.href = '/login.html?redirect=/our-menu.html';
    }, 2000);
    return;
  }
  
  // Add to cart
  cartStore.getState().addMeal(meal, 1);
  showToast(`${meal.name} added to cart!`, 'success');
}