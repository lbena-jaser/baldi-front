# Example Usage Guide

Practical examples of how to use the Baldi Meals frontend components and services in your custom pages.

---

## 🔐 Authentication Page Example

```javascript
// src/scripts/pages/auth/login.js

import authService from '@services/auth.service';
import { validateLogin } from '@scripts/validators/auth.validator';
import { showToast } from '@components/toast';
import { showLoader, hideLoader } from '@components/loader';

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get form data
    const formData = {
      email: document.getElementById('email').value,
      password: document.getElementById('password').value,
    };
    
    // Validate
    const { isValid, errors } = validateLogin(formData);
    
    if (!isValid) {
      // Show validation errors
      Object.keys(errors).forEach((field) => {
        const errorElement = document.getElementById(`${field}Error`);
        if (errorElement) {
          errorElement.textContent = errors[field];
          errorElement.classList.remove('hidden');
        }
      });
      return;
    }
    
    // Show loader
    showLoader('Logging in...');
    
    try {
      // Login
      const response = await authService.login(formData);
      
      // Check if 2FA is required
      if (response.requires2FA) {
        window.location.href = '/two-factor.html';
        return;
      }
      
      // Success - redirect to dashboard
      window.location.href = '/dashboard.html';
    } catch (error) {
      // Error is already shown by toast (from API interceptor)
      console.error('Login error:', error);
    } finally {
      hideLoader();
    }
  });
});
```

---

## 🍽️ Menu Page Example

```javascript
// src/scripts/pages/landing/our-menu.js

import mealService from '@services/meal.service';
import cartStore from '@stores/cart.store';
import { showToast } from '@components/toast';
import { showLoader, hideLoader } from '@components/loader';

let allMeals = [];
let filteredMeals = [];

document.addEventListener('DOMContentLoaded', async () => {
  await loadMeals();
  setupFilters();
  setupCart();
});

// Load meals
async function loadMeals() {
  showLoader('Loading meals...');
  
  try {
    const response = await mealService.getMeals();
    allMeals = response.data;
    filteredMeals = allMeals;
    
    renderMeals(filteredMeals);
  } catch (error) {
    showToast('Failed to load meals', 'error');
  } finally {
    hideLoader();
  }
}

// Render meals
function renderMeals(meals) {
  const container = document.getElementById('mealsContainer');
  container.innerHTML = '';
  
  meals.forEach((meal) => {
    const card = createMealCard(meal);
    container.appendChild(card);
  });
}

// Create meal card
function createMealCard(meal) {
  const card = document.createElement('div');
  card.className = 'meal-card';
  card.innerHTML = `
    <img src="${meal.imageUrl}" alt="${meal.name}" class="meal-image">
    <div class="meal-info">
      <h3 class="meal-name">${meal.name}</h3>
      <p class="meal-category">${meal.category}</p>
      <div class="meal-macros">
        <span>${meal.calories} cal</span>
        <span>${meal.protein}g protein</span>
        <span>${meal.carbs}g carbs</span>
        <span>${meal.fats}g fats</span>
      </div>
      <div class="meal-footer">
        <span class="meal-price">${meal.price} TND</span>
        <button class="btn btn-primary" data-meal-id="${meal.id}">
          Add to Cart
        </button>
      </div>
    </div>
  `;
  
  // Add to cart button
  const button = card.querySelector('button');
  button.addEventListener('click', () => addToCart(meal));
  
  return card;
}

// Add to cart
function addToCart(meal) {
  cartStore.getState().addMeal(meal, 1);
  showToast(`${meal.name} added to cart`, 'success');
  updateCartBadge();
}

// Setup filters
function setupFilters() {
  const categoryFilter = document.getElementById('categoryFilter');
  const searchInput = document.getElementById('searchInput');
  
  categoryFilter?.addEventListener('change', (e) => {
    filterMeals();
  });
  
  searchInput?.addEventListener('input', (e) => {
    filterMeals();
  });
}

// Filter meals
function filterMeals() {
  const category = document.getElementById('categoryFilter')?.value;
  const search = document.getElementById('searchInput')?.value;
  
  let filtered = allMeals;
  
  // Filter by category
  if (category && category !== 'all') {
    filtered = mealService.filterByCategory(filtered, category);
  }
  
  // Search
  if (search) {
    filtered = mealService.searchMeals(filtered, search);
  }
  
  filteredMeals = filtered;
  renderMeals(filteredMeals);
}

// Setup cart
function setupCart() {
  updateCartBadge();
  
  // Subscribe to cart changes
  cartStore.subscribe((state) => {
    updateCartBadge();
  });
}

// Update cart badge
function updateCartBadge() {
  const badge = document.getElementById('cartBadge');
  const count = cartStore.getState().getTotalMeals();
  
  if (badge) {
    badge.textContent = count;
    badge.classList.toggle('hidden', count === 0);
  }
}
```

---

## 🛒 Cart Page Example

```javascript
// src/scripts/pages/app/create-order.js

import cartStore from '@stores/cart.store';
import orderService from '@services/order.service';
import { showToast } from '@components/toast';
import { showConfirm } from '@components/modal';
import { showLoader, hideLoader } from '@components/loader';
import { formatCurrency } from '@scripts/core/utils';

document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  setupCartListeners();
  setupCheckout();
});

// Render cart
function renderCart() {
  const container = document.getElementById('cartItems');
  const cart = cartStore.getState();
  
  if (cart.items.length === 0) {
    container.innerHTML = '<p class="text-gray-500">Your cart is empty</p>';
    return;
  }
  
  container.innerHTML = '';
  
  cart.items.forEach((item) => {
    const row = createCartRow(item);
    container.appendChild(row);
  });
  
  // Update totals
  updateTotals();
}

// Create cart row
function createCartRow(item) {
  const row = document.createElement('div');
  row.className = 'cart-row';
  row.innerHTML = `
    <img src="${item.meal.imageUrl}" alt="${item.meal.name}">
    <div class="cart-item-details">
      <h4>${item.meal.name}</h4>
      <p>${formatCurrency(item.meal.price)}</p>
    </div>
    <div class="cart-item-quantity">
      <button class="btn-decrease" data-meal-id="${item.mealId}">-</button>
      <span>${item.quantity}</span>
      <button class="btn-increase" data-meal-id="${item.mealId}">+</button>
    </div>
    <div class="cart-item-total">
      ${formatCurrency(item.meal.price * item.quantity)}
    </div>
    <button class="btn-remove" data-meal-id="${item.mealId}">×</button>
  `;
  
  // Quantity buttons
  row.querySelector('.btn-decrease').addEventListener('click', () => {
    cartStore.getState().updateMealQuantity(item.mealId, item.quantity - 1);
    renderCart();
  });
  
  row.querySelector('.btn-increase').addEventListener('click', () => {
    cartStore.getState().updateMealQuantity(item.mealId, item.quantity + 1);
    renderCart();
  });
  
  // Remove button
  row.querySelector('.btn-remove').addEventListener('click', () => {
    showConfirm('Remove Item', 'Remove this meal from cart?', () => {
      cartStore.getState().removeMeal(item.mealId);
      renderCart();
      showToast('Item removed from cart', 'info');
    });
  });
  
  return row;
}

// Update totals
function updateTotals() {
  const cart = cartStore.getState();
  
  document.getElementById('subtotal').textContent = formatCurrency(cart.getSubtotal());
  document.getElementById('discount').textContent = formatCurrency(cart.discountAmount);
  document.getElementById('total').textContent = formatCurrency(cart.getTotal());
}

// Setup cart listeners
function setupCartListeners() {
  // Subscribe to cart changes
  cartStore.subscribe(() => {
    renderCart();
  });
  
  // Clear cart button
  document.getElementById('clearCart')?.addEventListener('click', () => {
    showConfirm('Clear Cart', 'Remove all items from cart?', () => {
      cartStore.getState().clearCart();
      renderCart();
      showToast('Cart cleared', 'info');
    });
  });
}

// Setup checkout
function setupCheckout() {
  const form = document.getElementById('checkoutForm');
  
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const cart = cartStore.getState();
    
    // Validate
    if (!cart.isValidOrder()) {
      showToast('Please ensure you have 5-20 meals and delivery address selected', 'error');
      return;
    }
    
    showLoader('Creating order...');
    
    try {
      const subscriptionId = document.getElementById('subscriptionId').value;
      const addressId = cart.deliveryAddressId;
      const notes = document.getElementById('notes').value;
      
      const order = await orderService.createOrderFromCart(
        subscriptionId,
        addressId,
        notes
      );
      
      // Redirect to order confirmation
      window.location.href = `/order-details.html?id=${order.id}`;
    } catch (error) {
      console.error('Checkout error:', error);
    } finally {
      hideLoader();
    }
  });
}
```

---

## 📱 Dashboard Example

```javascript
// src/scripts/pages/app/dashboard.js

import authService from '@services/auth.service';
import orderService from '@services/order.service';
import { showLoader, hideLoader } from '@components/loader';
import { formatDate, formatCurrency } from '@scripts/core/utils';

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  if (!authService.isAuthenticated()) {
    window.location.href = '/login.html';
    return;
  }
  
  await loadDashboard();
});

// Load dashboard data
async function loadDashboard() {
  showLoader('Loading dashboard...');
  
  try {
    // Get user
    const user = authService.getCurrentUser();
    document.getElementById('userName').textContent = `${user.firstName} ${user.lastName}`;
    
    // Get orders
    const orders = await orderService.getMyOrders();
    
    // Upcoming orders
    const upcoming = orderService.getUpcomingOrders(orders.data);
    renderUpcomingOrders(upcoming);
    
    // Recent orders
    const recent = orders.data.slice(0, 5);
    renderRecentOrders(recent);
    
  } catch (error) {
    console.error('Dashboard error:', error);
  } finally {
    hideLoader();
  }
}

// Render upcoming orders
function renderUpcomingOrders(orders) {
  const container = document.getElementById('upcomingOrders');
  
  if (orders.length === 0) {
    container.innerHTML = '<p class="text-gray-500">No upcoming orders</p>';
    return;
  }
  
  container.innerHTML = '';
  
  orders.forEach((order) => {
    const card = document.createElement('div');
    card.className = 'order-card';
    card.innerHTML = `
      <div class="order-header">
        <span class="order-date">${formatDate(order.scheduledDate, 'long')}</span>
        <span class="badge badge-${order.status.toLowerCase()}">${order.status}</span>
      </div>
      <div class="order-body">
        <p>${order.totalMeals} meals</p>
        <p class="order-price">${formatCurrency(order.finalPrice)}</p>
      </div>
      <div class="order-footer">
        <a href="/order-details.html?id=${order.id}" class="btn btn-sm btn-primary">
          View Details
        </a>
      </div>
    `;
    
    container.appendChild(card);
  });
}

// Render recent orders
function renderRecentOrders(orders) {
  const container = document.getElementById('recentOrders');
  
  if (orders.length === 0) {
    container.innerHTML = '<p class="text-gray-500">No orders yet</p>';
    return;
  }
  
  container.innerHTML = '';
  
  orders.forEach((order) => {
    const row = document.createElement('div');
    row.className = 'order-row';
    row.innerHTML = `
      <span>${formatDate(order.scheduledDate)}</span>
      <span>${order.totalMeals} meals</span>
      <span class="badge badge-${order.status.toLowerCase()}">${order.status}</span>
      <span>${formatCurrency(order.finalPrice)}</span>
      <a href="/order-details.html?id=${order.id}">View</a>
    `;
    
    container.appendChild(row);
  });
}
```

---

## 🔔 Notification Example

```javascript
// Listen to real-time notifications (SSE)

import eventBus, { EVENTS } from '@scripts/core/events';

// Setup SSE connection
function setupNotifications() {
  const authToken = authManager.getAccessToken();
  
  if (!authToken) {
    return;
  }
  
  const eventSource = new EventSource(
    `${import.meta.env.VITE_API_URL}/notifications/stream`,
    {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    }
  );
  
  eventSource.onmessage = (event) => {
    const notification = JSON.parse(event.data);
    
    // Emit event
    eventBus.emit(EVENTS.NOTIFICATION_RECEIVED, notification);
    
    // Show toast
    showToast(notification.message, 'info');
    
    // Update notification badge
    updateNotificationBadge();
  };
  
  eventSource.onerror = (error) => {
    console.error('SSE error:', error);
    eventSource.close();
  };
}

// Update notification badge
function updateNotificationBadge() {
  // Fetch unread count
  fetch(`${import.meta.env.VITE_API_URL}/notifications/unread-count`, {
    headers: {
      Authorization: `Bearer ${authManager.getAccessToken()}`,
    },
  })
    .then((res) => res.json())
    .then((data) => {
      const badge = document.getElementById('notificationBadge');
      if (badge) {
        badge.textContent = data.data.unreadCount;
        badge.classList.toggle('hidden', data.data.unreadCount === 0);
      }
    });
}
```

---

## 🎨 Form with Validation Example

```html
<!-- HTML -->
<form id="profileForm">
  <div class="form-group">
    <label for="firstName">First Name</label>
    <input type="text" id="firstName" name="firstName" class="form-input">
    <p id="firstNameError" class="form-error hidden"></p>
  </div>
  
  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" id="email" name="email" class="form-input">
    <p id="emailError" class="form-error hidden"></p>
  </div>
  
  <button type="submit" class="btn btn-primary">Save</button>
</form>
```

```javascript
// JavaScript
import authService from '@services/auth.service';
import { required, email, minLength } from '@scripts/validators';
import { showToast } from '@components/toast';

const form = document.getElementById('profileForm');

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  // Clear previous errors
  document.querySelectorAll('.form-error').forEach((el) => {
    el.classList.add('hidden');
    el.textContent = '';
  });
  
  // Get form data
  const formData = {
    firstName: document.getElementById('firstName').value,
    email: document.getElementById('email').value,
  };
  
  // Validate
  const rules = {
    firstName: [required, minLength(2)],
    email: [required, email],
  };
  
  const errors = {};
  let isValid = true;
  
  Object.keys(rules).forEach((field) => {
    for (const rule of rules[field]) {
      const result = rule(formData[field]);
      if (result !== true) {
        errors[field] = result;
        isValid = false;
        break;
      }
    }
  });
  
  if (!isValid) {
    // Show errors
    Object.keys(errors).forEach((field) => {
      const errorEl = document.getElementById(`${field}Error`);
      if (errorEl) {
        errorEl.textContent = errors[field];
        errorEl.classList.remove('hidden');
      }
    });
    return;
  }
  
  // Submit
  try {
    await authService.updateProfile(formData);
    showToast('Profile updated successfully', 'success');
  } catch (error) {
    console.error('Update error:', error);
  }
});
```

---

## 📍 Summary

Use these examples as templates for your custom pages. The key points:

1. **Import what you need** from `@services`, `@stores`, `@components`
2. **Check authentication** for protected pages
3. **Use services** for API calls
4. **Use stores** for state management
5. **Use components** for UI feedback (toast, modal, loader)
6. **Validate forms** before submission
7. **Handle errors** gracefully

All the functionality is ready - you just need to create the HTML/CSS design and wire it up with these JavaScript APIs!