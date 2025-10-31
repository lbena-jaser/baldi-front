import { defineConfig } from 'vite';
import { resolve } from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';

// Dev/preview middleware to rewrite top-level html paths to actual file locations
function rewriteHtmlRoutes() {
  const landingPages = new Set([
    'index', 'about-us', 'how-it-works', 'our-menu', 'refer-and-save', 'contact-us', 'FQAs', 'terms',
  ]);
  const authPages = new Set([
    'login', 'register', 'forgot-password', 'reset-password', 'verify-email', 'two-factor',
  ]);
  const appPages = new Set([
    'dashboard', 'weekly-menu', 'subscription', 'create-order', 'orders', 'order-details', 'addresses',
    'payment-methods', 'payments', 'notifications', 'referrals', 'profile', 'settings',
  ]);

  function rewrite(url) {
    if (!url) return url;
    // Normalize and only handle top-level html files
    const qIndex = url.indexOf('?');
    const base = qIndex === -1 ? url : url.slice(0, qIndex);
    const query = qIndex === -1 ? '' : url.slice(qIndex);

    // Ensure leading slash
    let path = base.startsWith('/') ? base : `/${base}`;
    // Add .html if missing
    if (!path.endsWith('.html') && !path.endsWith('/')) {
      path = `${path}.html`;
    }

    // Extract slug like "/about-us.html" -> "about-us"
    const match = path.match(/^\/(?:([^\/]+))\.html$/);
    if (!match) return url; // ignore nested paths already correct like /pages/landing/...
    const slug = match[1];

    if (landingPages.has(slug)) return `/pages/landing/${slug}.html${query}`;
    if (authPages.has(slug)) return `/pages/auth/${slug}.html${query}`;
    if (appPages.has(slug)) return `/pages/app/${slug}.html${query}`;
    return url;
  }

  return {
    name: 'rewrite-html-routes',
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        req.url = rewrite(req.url);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, _res, next) => {
        req.url = rewrite(req.url);
        next();
      });
    },
  };
}

export default defineConfig({
  root: './src',
  publicDir: '../public',
  
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        // Landing pages (www.baldimeals.com)
        main: resolve(__dirname, 'src/pages/landing/index.html'),
        'about-us': resolve(__dirname, 'src/pages/landing/about-us.html'),
        'how-it-works': resolve(__dirname, 'src/pages/landing/how-it-works.html'),
        'our-menu': resolve(__dirname, 'src/pages/landing/our-menu.html'),
        'refer-and-save': resolve(__dirname, 'src/pages/landing/refer-and-save.html'),
        'contact-us': resolve(__dirname, 'src/pages/landing/contact-us.html'),
        'FQAs': resolve(__dirname, 'src/pages/landing/FQAs.html'),
        terms: resolve(__dirname, 'src/pages/landing/terms.html'),
        
        // Auth pages
        login: resolve(__dirname, 'src/pages/auth/login.html'),
        register: resolve(__dirname, 'src/pages/auth/register.html'),
        'forgot-password': resolve(__dirname, 'src/pages/auth/forgot-password.html'),
        'reset-password': resolve(__dirname, 'src/pages/auth/reset-password.html'),
        'verify-email': resolve(__dirname, 'src/pages/auth/verify-email.html'),
        'two-factor': resolve(__dirname, 'src/pages/auth/two-factor.html'),
        
        // App pages (app.baldimeals.com)
        dashboard: resolve(__dirname, 'src/pages/app/dashboard.html'),
        'weekly-menu': resolve(__dirname, 'src/pages/app/weekly-menu.html'),
        subscription: resolve(__dirname, 'src/pages/app/subscription.html'),
        'create-order': resolve(__dirname, 'src/pages/app/create-order.html'),
        orders: resolve(__dirname, 'src/pages/app/orders.html'),
        'order-details': resolve(__dirname, 'src/pages/app/order-details.html'),
        addresses: resolve(__dirname, 'src/pages/app/addresses.html'),
        'payment-methods': resolve(__dirname, 'src/pages/app/payment-methods.html'),
        payments: resolve(__dirname, 'src/pages/app/payments.html'),
        notifications: resolve(__dirname, 'src/pages/app/notifications.html'),
        referrals: resolve(__dirname, 'src/pages/app/referrals.html'),
        profile: resolve(__dirname, 'src/pages/app/profile.html'),
        settings: resolve(__dirname, 'src/pages/app/settings.html'),
      },
      output: {
        manualChunks: {
          'vendor': ['axios', 'zustand', 'date-fns'],
          'core': [
            'src/scripts/core/api.js',
            'src/scripts/core/auth.js',
            'src/scripts/core/storage.js',
            'src/scripts/core/cache.js',
          ],
          'services': [
            'src/scripts/services/auth.service.js',
            'src/scripts/services/meal.service.js',
            'src/scripts/services/order.service.js',
          ],
        },
      },
    },
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
      },
    },
    sourcemap: false,
  },
  
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  
  preview: {
    port: 4173,
  },
  
  define: {
    'import.meta.env.VITE_API_URL': JSON.stringify(
      process.env.VITE_API_URL || 'http://localhost:5000/api/v1'
    ),
  },
  
  plugins: [
    rewriteHtmlRoutes(),
    createHtmlPlugin({
      minify: true,
      inject: {
        data: {
          title: 'Baldi Meals - Healthy Meal Prep Subscription',
          description: 'Premium meal prep delivery service in Tunisia',
        },
      },
    }),
  ],
  
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
      '@scripts': resolve(__dirname, 'src/scripts'),
      '@styles': resolve(__dirname, 'src/styles'),
      '@components': resolve(__dirname, 'src/scripts/components'),
      '@services': resolve(__dirname, 'src/scripts/services'),
      '@stores': resolve(__dirname, 'src/scripts/state'),
      '@utils': resolve(__dirname, 'src/scripts/core/utils.js'),
    },
  },
});