import authService from '../../services/auth.service.js';
import orderService from '../../services/order.service.js';
import subscriptionService from '../../services/subscription.service.js';
import notificationService from '../../services/notification.service.js';
import { showToast } from '../../components/toast.js';
import { formatDate, formatCurrency } from '../../core/utils.js';

document.addEventListener('DOMContentLoaded', async () => {
  // Check authentication
  if (!authService.isAuthenticated()) {
    window.location.href = '/login.html';
    return;
  }

  const user = authService.getCurrentUser();
  
  // Update user info
  document.getElementById('userName').textContent = user.firstName;
  document.getElementById('welcomeName').textContent = user.firstName;
  document.getElementById('userInitials').textContent = 
    (user.firstName[0] + user.lastName[0]).toUpperCase();

  // Profile dropdown toggle
  const profileBtn = document.getElementById('profileBtn');
  const profileDropdown = document.getElementById('profileDropdown');
  
  profileBtn.addEventListener('click', () => {
    profileDropdown.classList.toggle('hidden');
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (!profileBtn.contains(e.target) && !profileDropdown.contains(e.target)) {
      profileDropdown.classList.add('hidden');
    }
  });

  // Logout
  document.getElementById('logoutBtn').addEventListener('click', async () => {
    await authService.logout();
  });

  // Notifications
  document.getElementById('notificationsBtn').addEventListener('click', () => {
    window.location.href = '/notifications.html';
  });

  // Load dashboard data
  await loadDashboardData();
});

async function loadDashboardData() {
  try {
    // Load subscription
    const subscription = await subscriptionService.getActiveSubscription();
    updateSubscriptionStatus(subscription);

    // Load orders
    const ordersResponse = await orderService.getMyOrders({ limit: 5 });
    const orders = ordersResponse.data;
    
    // Update stats
    document.getElementById('totalOrders').textContent = ordersResponse.pagination?.total || 0;
    
    // Get upcoming orders
    const upcomingOrders = orderService.getUpcomingOrders(orders);
    renderUpcomingDeliveries(upcomingOrders);

    // Update next delivery
    if (upcomingOrders.length > 0) {
      const nextOrder = upcomingOrders[0];
      document.getElementById('nextDelivery').textContent = 
        formatDate(nextOrder.scheduledDate, 'short');
    } else {
      document.getElementById('nextDelivery').textContent = 'None';
    }

    // Count pending payments
    const pendingPayments = orders.filter(order => 
      order.payment && order.payment.status === 'PENDING'
    ).length;
    document.getElementById('pendingPayments').textContent = pendingPayments;

    // Load notification count
    const unreadCount = await notificationService.getUnreadCount();
    const badge = document.getElementById('notificationBadge');
    if (unreadCount > 0) {
      badge.textContent = unreadCount;
      badge.classList.remove('hidden');
    }

  } catch (error) {
    console.error('Error loading dashboard:', error);
    showToast('Failed to load dashboard data', 'error');
  }
}

function updateSubscriptionStatus(subscription) {
  const statusElement = document.getElementById('subscriptionStatus');
  
  if (!subscription) {
    statusElement.textContent = 'None';
    statusElement.parentElement.parentElement.querySelector('.bg-green-100').classList.remove('bg-green-100');
    statusElement.parentElement.parentElement.querySelector('.bg-green-100').classList.add('bg-gray-100');
    return;
  }

  const statusInfo = subscriptionService.getStatusInfo(subscription.status);
  statusElement.textContent = statusInfo.label;
  
  // Update badge color based on status
  const badge = statusElement.parentElement.parentElement.querySelector('.w-12');
  badge.classList.remove('bg-green-100', 'bg-blue-100', 'bg-red-100');
  
  if (subscription.status === 'ACTIVE') {
    badge.classList.add('bg-green-100');
  } else if (subscription.status === 'PAUSED') {
    badge.classList.add('bg-blue-100');
  } else {
    badge.classList.add('bg-red-100');
  }
}

function renderUpcomingDeliveries(orders) {
  const container = document.getElementById('upcomingDeliveries');
  
  if (orders.length === 0) {
    container.innerHTML = `
      <div class="text-center py-8">
        <svg class="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
        <p class="text-gray-500">No upcoming deliveries</p>
        <a href="/create-order.html" class="btn btn-primary mt-4">Create Your First Order</a>
      </div>
    `;
    return;
  }

  container.innerHTML = orders.map(order => `
    <div class="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-2">
            <span class="badge ${getStatusColor(order.status)}">${order.status}</span>
            <span class="text-sm text-gray-600">${formatDate(order.scheduledDate, 'long')}</span>
          </div>
          <p class="text-sm text-gray-600">
            ${order.totalMeals} meals • ${formatCurrency(order.finalPrice)}
          </p>
        </div>
        <a href="/order-details.html?id=${order.id}" class="btn btn-sm btn-outline">
          View Details
        </a>
      </div>
    </div>
  `).join('');
}

function getStatusColor(status) {
  const colors = {
    SCHEDULED: 'badge-primary',
    CONFIRMED: 'badge-success',
    PREPARING: 'badge-warning',
    OUT_FOR_DELIVERY: 'badge-secondary',
    DELIVERED: 'badge-success',
    CANCELLED: 'badge-error',
  };
  return colors[status] || 'badge-primary';
}