# Baldi Meals Frontend - Setup Guide

Complete guide to set up and run the frontend application.

## 📋 Prerequisites

### Required Software
- **Node.js** v16 or higher ([Download](https://nodejs.org/))
- **npm** v7+ (comes with Node.js)
- **Git** ([Download](https://git-scm.com/))
- **Code Editor** (VS Code recommended)

### Backend Setup
The backend API must be running. See backend `SETUP_GUIDE.md`.

---

## 🚀 Installation Steps

### 1. Clone/Create Project

```bash
# If cloning
git clone <your-repo-url>
cd baldi-meals-frontend

# If starting fresh, create the folder structure as shown in the project
```

### 2. Install Dependencies

```bash
npm install
```

This installs:
- Vite (build tool)
- Tailwind CSS (styling)
- Axios (HTTP client)
- Zustand (state management)
- date-fns (date utilities)
- idb (IndexedDB wrapper)
- And dev dependencies

### 3. Configure Environment

```bash
# Copy example env file
cp .env.example .env
```

Edit `.env`:

```env
# Point to your backend API
VITE_API_URL=http://localhost:5000/api/v1

# Keep other defaults or customize
VITE_APP_NAME=Baldi Meals
VITE_ENABLE_2FA=true
VITE_ENABLE_REFERRALS=true
VITE_ENABLE_DISCOUNTS=true
```

### 4. Start Development Server

```bash
npm run dev
```

The app opens at `http://localhost:3000`

---

## 🎨 Customizing Your Design

Since you're creating your own design, here's how to customize:

### HTML Pages

All HTML files are in `src/pages/`:
- `landing/` - Public pages (home, about, menu, etc.)
- `auth/` - Login, register, 2FA pages
- `app/` - Customer dashboard pages

**Example structure:**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Your Page Title</title>
  <link rel="stylesheet" href="../../styles/main.css">
</head>
<body>
  <!-- Your custom HTML here -->
  
  <!-- Import page-specific JavaScript -->
  <script type="module" src="../../scripts/pages/your-page.js"></script>
</body>
</html>
```

### Styling

**Option 1: Use Tailwind Classes**

```html
<button class="btn btn-primary">
  Click Me
</button>

<div class="card card-hover">
  <h3 class="text-2xl font-bold text-gray-900">Title</h3>
  <p class="text-gray-600">Description</p>
</div>
```

**Option 2: Custom CSS**

Add to `src/styles/components.css` or create new files:

```css
/* Your custom styles */
.my-custom-class {
  /* styles */
}
```

**Option 3: Inline Styles** (not recommended for production)

```html
<div style="color: purple;">Content</div>
```

### Color Theme

Edit `tailwind.config.js` to change colors:

```javascript
theme: {
  extend: {
    colors: {
      primary: {
        500: '#your-color', // Change primary color
      },
      secondary: {
        500: '#your-color', // Change secondary color
      },
    },
  },
},
```

---

## 🔌 Using the JavaScript API

### Authentication

```javascript
import authService from '@services/auth.service';

// Login
const response = await authService.login({
  email: 'user@example.com',
  password: 'password123',
});

// Get current user
const user = authService.getCurrentUser();

// Logout
await authService.logout();
```

### Meals

```javascript
import mealService from '@services/meal.service';

// Get all meals
const meals = await mealService.getMeals();

// Get current week menu
const menu = await mealService.getCurrentWeekMenu();

// Filter meals
const bulkingMeals = mealService.filterByCategory(meals, 'BULKING');
```

### Cart

```javascript
import cartStore from '@stores/cart.store';

// Add meal to cart
cartStore.getState().addMeal(meal, quantity);

// Get cart items
const items = cartStore.getState().items;

// Get total
const total = cartStore.getState().getTotal();

// Clear cart
cartStore.getState().clearCart();
```

### Orders

```javascript
import orderService from '@services/order.service';

// Create order from cart
const order = await orderService.createOrderFromCart(
  subscriptionId,
  addressId,
  'Delivery notes'
);

// Get my orders
const orders = await orderService.getMyOrders();

// Confirm order
await orderService.confirmOrder(orderId);
```

### Toast Notifications

```javascript
import { showToast } from '@components/toast';

showToast('Success message!', 'success');
showToast('Error occurred!', 'error');
showToast('Warning!', 'warning');
showToast('Info message', 'info');
```

### Modal Dialogs

```javascript
import { showConfirm, showAlert } from '@components/modal';

// Confirm dialog
showConfirm('Delete Item', 'Are you sure?', () => {
  // User clicked confirm
  console.log('Confirmed!');
});

// Alert dialog
showAlert('Notice', 'This is an alert message');
```

### Loading States

```javascript
import { showLoader, hideLoader } from '@components/loader';

// Show loader
showLoader('Processing...');

// Hide loader
hideLoader();
```

---

## 📄 Creating New Pages

### 1. Create HTML File

`src/pages/landing/my-page.html`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>My Page - Baldi Meals</title>
  <link rel="stylesheet" href="../../styles/main.css">
</head>
<body>
  <h1 id="title">My Custom Page</h1>
  <button id="myButton">Click Me</button>
  
  <script type="module" src="../../scripts/pages/landing/my-page.js"></script>
</body>
</html>
```

### 2. Create JavaScript File

`src/scripts/pages/landing/my-page.js`:

```javascript
import { showToast } from '@components/toast';

// DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const button = document.getElementById('myButton');
  
  button.addEventListener('click', () => {
    showToast('Button clicked!', 'success');
  });
});
```

### 3. Add to Vite Config

Edit `vite.config.js`:

```javascript
input: {
  // ... other pages
  'my-page': resolve(__dirname, 'src/pages/landing/my-page.html'),
}
```

### 4. Access Page

Navigate to `http://localhost:3000/my-page.html`

---

## 🧪 Form Validation Example

```javascript
import { validateLogin } from '@scripts/validators/auth.validator';

// Get form data
const formData = {
  email: emailInput.value,
  password: passwordInput.value,
};

// Validate
const { isValid, errors } = validateLogin(formData);

if (!isValid) {
  // Show errors
  if (errors.email) {
    emailError.textContent = errors.email;
  }
  if (errors.password) {
    passwordError.textContent = errors.password;
  }
  return;
}

// Form is valid, proceed
await authService.login(formData);
```

---

## 🔒 Protected Pages

For pages that require authentication:

```javascript
import authService from '@services/auth.service';

// Check authentication
if (!authService.isAuthenticated()) {
  window.location.href = '/login.html';
}

// Get current user
const user = authService.getCurrentUser();
console.log('Logged in as:', user.email);
```

---

## 🌐 API Configuration

### Development

Uses proxy in `vite.config.js`:

```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:5000',
      changeOrigin: true,
    },
  },
},
```

This means:
- Frontend: `http://localhost:3000`
- API calls: `/api/v1/...` → `http://localhost:5000/api/v1/...`

### Production

Set `VITE_API_URL` in production `.env`:

```env
VITE_API_URL=https://api.baldimeals.com/api/v1
```

---

## 📦 Building for Production

```bash
# Build
npm run build

# Output folder: dist/
# Contains optimized HTML, CSS, JS
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy --prod --dir=dist
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

---

## 🐛 Troubleshooting

### Issue: "Module not found"

**Solution:** Check import paths use aliases:

```javascript
// ✅ Correct
import api from '@scripts/core/api';

// ❌ Wrong
import api from '../../../scripts/core/api';
```

### Issue: Styles not loading

**Solution:**
1. Ensure Tailwind is imported in `main.css`
2. Run `npm run dev` again
3. Hard refresh browser (Ctrl+F5)

### Issue: API calls failing

**Solution:**
1. Check backend is running
2. Verify `VITE_API_URL` in `.env`
3. Check browser console for errors
4. Check Network tab for failed requests

### Issue: "Cannot find module 'zustand'"

**Solution:**

```bash
npm install zustand
```

### Issue: Build errors

**Solution:**

```bash
# Clear cache and reinstall
rm -rf node_modules dist
npm install
npm run build
```

---

## 📚 Learning Resources

### Vite
- [Vite Docs](https://vitejs.dev/)
- [Vite Guide](https://vitejs.dev/guide/)

### Tailwind CSS
- [Tailwind Docs](https://tailwindcss.com/docs)
- [Tailwind UI Components](https://tailwindui.com/)

### Vanilla JavaScript
- [MDN Web Docs](https://developer.mozilla.org/)
- [JavaScript.info](https://javascript.info/)

### State Management
- [Zustand Docs](https://docs.pmnd.rs/zustand/)

---

## ✅ Next Steps

1. ✅ Install dependencies
2. ✅ Configure environment
3. ✅ Start dev server
4. 🎨 Design your HTML pages
5. 🔌 Integrate with JavaScript APIs
6. 🧪 Test functionality
7. 📦 Build for production
8. 🚀 Deploy!

---

**Need Help?**
- Check console for errors
- Review API documentation
- Check backend setup
- Ask in project discussions

Happy coding! 🚀