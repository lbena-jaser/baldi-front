# Baldi Meals - Frontend

Modern, production-ready frontend for Baldi Meals subscription service built with vanilla JavaScript, Vite, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites

- Node.js v16+
- npm or yarn
- Backend API running (see backend README)

### Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env

# Edit .env with your API URL
# VITE_API_URL=http://localhost:5000/api/v1

# Start development server
npm run dev
```

The app will open at `http://localhost:3000`

## 📁 Project Structure

```
src/
├── pages/              # HTML pages
│   ├── landing/       # Public pages
│   ├── auth/          # Authentication pages
│   └── app/           # Customer dashboard
├── scripts/           # JavaScript
│   ├── core/         # Core utilities
│   ├── components/   # UI components
│   ├── services/     # API services
│   ├── state/        # State management (Zustand)
│   ├── validators/   # Form validation
│   └── config/       # Configuration
└── styles/            # CSS (Tailwind)
```

## 🛠️ Available Scripts

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm run preview    # Preview production build
npm run lint       # Lint code
npm run format     # Format code with Prettier
```

## 🎨 Features

### Core
- ✅ JWT Authentication with token refresh
- ✅ 2FA Support (TOTP-based)
- ✅ State Management (Zustand)
- ✅ Offline Support (IndexedDB caching)
- ✅ Form Validation
- ✅ Toast Notifications
- ✅ Modal Dialogs
- ✅ Loading States

### Pages
- Landing pages (Home, About, Menu, etc.)
- Authentication (Login, Register, 2FA)
- Customer Dashboard
- Weekly Menu Browser
- Order Management
- Subscription Management
- Profile & Settings

### Services
- Auth Service (login, register, 2FA)
- Meal Service (browse, cache, filter)
- Order Service (create, manage, verify)
- And more...

## 🔐 Security

- XSS protection (input sanitization)
- Token encryption (client-side)
- Secure token storage
- HTTPS in production
- Rate limiting ready

## 📱 Responsive Design

- Mobile-first approach
- Tailwind CSS utilities
- Breakpoints: xs, sm, md, lg, xl, 2xl, 3xl

## 🎯 State Management

Uses Zustand for lightweight state management:

```javascript
import authStore from '@stores/auth.store';

// Get state
const user = authStore.getState().user;

// Update state
authStore.getState().setUser(userData);

// Subscribe to changes
authStore.subscribe((state) => {
  console.log('User changed:', state.user);
});
```

## 🔌 API Integration

All API calls go through the centralized API client:

```javascript
import api from '@scripts/core/api';

// Automatic auth headers
// Automatic token refresh
// Error handling
const response = await api.get('/meals');
```

## 🎨 Styling

Uses Tailwind CSS with custom configuration:

```html
<!-- Primary purple color -->
<button class="btn btn-primary">Click Me</button>

<!-- Custom components -->
<div class="card card-hover">
  <h3 class="gradient-text">Title</h3>
</div>
```

## 📦 Building for Production

```bash
# Build
npm run build

# Output in dist/
# Deploy dist/ folder to your hosting
```

### Recommended Hosting
- Netlify (automatic deployments)
- Vercel (serverless functions)
- Cloudflare Pages (fast CDN)

## 🌐 Environment Variables

```env
# API Configuration
VITE_API_URL=http://localhost:5000/api/v1

# Feature Flags
VITE_ENABLE_2FA=true
VITE_ENABLE_REFERRALS=true
VITE_ENABLE_DISCOUNTS=true
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run with UI
npm run test:ui

# Coverage
npm run test:coverage
```

## 🐛 Debugging

1. Check browser console for errors
2. Check Network tab for API calls
3. Use Vue DevTools for state inspection
4. Check `logs/` folder for server logs

## 📚 Documentation

- **API Documentation**: See `API_DOCUMENTATION.md` in backend
- **Components**: See `src/scripts/components/`
- **Services**: See `src/scripts/services/`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

ISC

## 👨‍💻 Author

Baldi Meals Team

---

**Need Help?** Check the backend README for API setup and configuration.