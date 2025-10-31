# Baldi Meals - Backend API

A comprehensive, enterprise-grade meal prep subscription service backend built with Node.js, Express, and Prisma.

## 🌟 Features

### Core Features
- 🔐 **JWT Authentication** with refresh tokens and token rotation
- 🔒 **Two-Factor Authentication (2FA)** - TOTP-based (mandatory for admins)
- 👥 **Role-Based Access Control (RBAC)** - 5 roles with granular permissions
- 📦 **Subscription Management** - 5-day & 7-day plans with pause/resume/cancel
- 🍽️ **Weekly Menu System** - Admin-managed menus
- 🥗 **Meal Management** - Bulking & Cutting categories with nutritional info
- 🛒 **Add-ons System** - Extra items customers can purchase
- 📅 **Automatic Weekly Delivery Scheduling** - Smart scheduling based on first order
- 🏠 **Multiple Delivery Addresses** - Per user management
- 💳 **Complete Payment System** - Gateway integration ready with Tunisian support
- 📧 **Email Notifications** - Comprehensive email templates
- ⏰ **Automated Cron Jobs** - 7 scheduled tasks for reminders and maintenance

### Advanced Features
- 🔔 **In-App Notifications** - 13 notification types with real-time updates
- 📊 **Analytics & Reporting** - Revenue, user growth, popular meals, and more
- 🖼️ **Image Compression** - Automatic compression with Sharp (80% quality, max 1920x1080)
- 🎁 **Referral System** - Unique codes with percentage discounts
- 🏷️ **Discount Codes** - Percentage & fixed amount promotions
- 🔗 **Webhooks** - 11 event types for third-party integrations
- 📱 **QR Code Verification** - Dual verification (QR + 6-digit code) for delivery
- 📝 **Audit Logging** - Complete activity tracking for compliance
- 🗑️ **Soft Deletes** - 30-day recovery window with auto-purge
- 🛡️ **Input Sanitization** - XSS protection on all inputs
- 🔒 **Rate Limiting** - Separate limits for general API and auth endpoints
- 📈 **Expected Revenue** - Future revenue projections
- 📤 **Data Export** - CSV and PDF export capabilities

## 🏗️ Tech Stack

### Core Technologies
- **Runtime:** Node.js v16+
- **Framework:** Express.js v5
- **Database:** PostgreSQL v12+
- **ORM:** Prisma v6
- **Authentication:** JWT (jsonwebtoken)
- **Validation:** Joi

### Security & Authentication
- **2FA:** Speakeasy (TOTP-based)
- **Password Hashing:** bcryptjs (12 rounds)
- **Security Headers:** Helmet
- **Rate Limiting:** express-rate-limit
- **QR Codes:** qrcode

### Communication & Integration
- **Email:** Nodemailer
- **Webhooks:** Axios with HMAC signatures
- **Scheduling:** node-cron (7 jobs)
- **Logging:** Winston & Morgan

### Media & Files
- **Image Processing:** Sharp (compression, resizing)
- **File Upload:** Multer

### Testing
- **Framework:** Jest
- **API Testing:** Supertest

## 📊 System Architecture

### Database Models (17 Total)
1. **User** - Authentication, roles, 2FA
2. **RefreshToken** - Token rotation and management
3. **AdminPermission** - Granular RBAC permissions
4. **AuditLog** - Complete activity tracking
5. **Subscription** - 5-day/7-day plans
6. **WeeklyMenu** - Admin-managed menus
7. **Meal** - Nutritional info, categories
8. **WeeklyMenuMeal** - Menu-meal junction
9. **AddOn** - Extra purchasable items
10. **Delivery** - Orders with QR verification
11. **DeliveryMeal** - Order line items
12. **DeliveryAddOn** - Order add-ons
13. **DeliveryAddress** - User addresses
14. **Payment** - Transaction tracking
15. **Notification** - In-app notifications
16. **Referral** - Referral code system
17. **Discount** - Promotional codes
18. **DiscountUsage** - Usage tracking
19. **Webhook** - Third-party integrations
20. **WebhookLog** - Webhook event history
21. **MealAnalytics** - Meal performance tracking
22. **RevenueAnalytics** - Revenue tracking

### API Endpoints (100+ Total)
- **Authentication:** 10 endpoints (login, 2FA, profile, etc.)
- **Subscriptions:** 7 endpoints
- **Meals/Menus/Add-ons:** 15 endpoints
- **Deliveries/Addresses:** 12 endpoints
- **Payments:** 11 endpoints
- **Notifications:** 7 endpoints
- **Referrals:** 6 endpoints
- **Discounts:** 9 endpoints
- **Analytics:** 9 endpoints (admin only)
- **Webhooks:** 9 endpoints (admin only)
- **Health Check:** 1 endpoint

## 🚀 Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn
- Gmail account for email (or SMTP server)

## 📥 Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd baldi-backend
```

2. **Install dependencies:**
```bash
npm install
```

3. **Set up environment variables:**
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=development
PORT=5000

DATABASE_URL="postgresql://user:password@localhost:5432/baldimeals"

JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# Image Upload
MAX_FILE_SIZE=10485760  # 10MB

# Soft Delete
SOFT_DELETE_AUTO_PURGE_DAYS=30
```

4. **Initialize Prisma:**
```bash
npm run prisma:generate
npm run prisma:migrate
```

5. **Create upload directories:**
```bash
mkdir -p uploads/original uploads/compressed
```

6. **Start the development server:**
```bash
npm run dev
```

## 🎯 Quick Start

### 1. Create Admin User

After setting up the database:

```bash
# Register via API
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@baldimeals.com",
    "password": "Admin123!@#",
    "confirmPassword": "Admin123!@#",
    "firstName": "Admin",
    "lastName": "User",
    "phoneNumber": "12345678"
  }'

# Update role in database
psql -U postgres -d baldimeals
UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'admin@baldimeals.com';
\q

# Enable 2FA (mandatory for admins)
# Login and follow 2FA setup process
```

### 2. Test the API

```bash
# Health check
curl http://localhost:5000/api/v1/health

# Expected response:
# {
#   "success": true,
#   "message": "Baldi API is running",
#   "timestamp": "2024-01-01T12:00:00.000Z"
# }
```

## 💼 Business Logic

### User Roles & Permissions

#### SUPER_ADMIN
- Full access to all resources
- Can manage all users, subscriptions, meals, analytics
- Can configure webhooks and view audit logs
- **2FA Mandatory**

#### MANAGER
- Manage meals, menus, add-ons
- View analytics and reports
- Manage deliveries and subscriptions
- **2FA Mandatory**

#### SUPPORT
- View-only access to most resources
- Can assist customers with orders
- **2FA Mandatory**

#### DELIVERY_GUY
- View assigned deliveries
- Verify deliveries via QR/code
- **2FA Mandatory**

#### CUSTOMER
- Create and manage subscriptions
- Place delivery orders
- Manage addresses
- View notifications and analytics
- Optional 2FA

### Subscription Flow

1. **User creates subscription:**
   - Choose plan type (5-day or 7-day)
   - Subscription starts in PENDING status

2. **User creates first delivery order:**
   - Select meals (5-20 meals total)
   - Optionally add add-ons
   - Apply discount code (optional)
   - Choose delivery address
   - System calculates first delivery date (5 or 7 days from order)
   - Subscription becomes ACTIVE
   - Payment record created
   - QR code & verification code generated on confirmation

3. **Weekly delivery scheduling:**
   - System automatically tracks delivery weekday
   - Sends reminder email + notification 2 days before delivery
   - User confirms delivery
   - After delivery is verified, next delivery is scheduled for same weekday next week

4. **Subscription management:**
   - **Pause:** Stops automatic deliveries until resumed
   - **Resume:** Reactivates automatic delivery scheduling
   - **Cancel:** Cancels all future deliveries permanently

### Delivery Verification Flow

1. **User confirms delivery** → QR code + 6-digit code generated
2. **Delivery guy arrives** → Scans QR code OR enters 6-digit code
3. **System verifies** → Marks delivery as DELIVERED
4. **Next delivery scheduled** → Automatically scheduled for next week

### Referral System

1. **User creates referral code** → Unique code generated
2. **Shares code with friends** → Via social media, email, etc.
3. **Friend applies code** → Gets 10% discount (default)
4. **Both get notifications** → Referrer gets usage notification
5. **Code expires** → After 5 uses or 90 days

### Notification Types

1. **Delivery Updates:** Reminder, Confirmed, Out for Delivery, Delivered
2. **Payment Updates:** Pending, Completed, Failed
3. **Subscription Updates:** Paused, Resumed, Cancelled
4. **Rewards:** Referral Reward, Discount Applied
5. **System:** Announcements

## 🤖 Automated Jobs (Cron)

The system runs 7 automated tasks:

1. **Delivery Reminders** (Daily at 9 AM)
   - Sends email + notification 2 days before scheduled deliveries

2. **Weekly Delivery Scheduling** (Daily at midnight)
   - Updates next delivery dates for active subscriptions

3. **Payment Reminders** (Daily at 10 AM)
   - Sends payment reminders for upcoming deliveries

4. **Expired Referrals Cleanup** (Daily at 2 AM)
   - Expires old referral codes

5. **Expired Discounts Cleanup** (Daily at 3 AM)
   - Deactivates expired discount codes

6. **Token Cleanup** (Daily at 4 AM)
   - Removes expired refresh tokens

7. **Notification Cleanup** (Weekly on Sunday at 1 AM)
   - Removes old read/archived notifications (90 days)

## 📊 Analytics & Reporting

### Available Metrics:
- **Revenue Analytics:** Daily, weekly, monthly revenue with growth rates
- **User Growth:** New users, retention, growth percentage
- **Popular Meals:** Most ordered meals with revenue contribution
- **Subscription Stats:** Active, paused, cancelled, retention rate
- **Payment Stats:** Success rate, method distribution, total revenue
- **Delivery Stats:** Completion rate, status distribution
- **Expected Revenue:** Future revenue projections (30-90 days)

### Export Options:
- **CSV:** All analytics data exportable
- **PDF:** Framework ready (requires pdfkit integration)

## 🔒 Security Features

### Authentication & Authorization
- JWT with refresh token rotation
- Password hashing with bcrypt (12 rounds)
- Two-Factor Authentication (TOTP) - Mandatory for admins
- Role-based access control (RBAC) with 5 roles
- Granular resource-level permissions

### Protection Mechanisms
- Rate limiting (general + auth-specific)
- Helmet security headers
- CORS configuration
- Input validation with Joi
- Input sanitization (XSS protection)
- SQL injection prevention (Prisma)
- HMAC webhook signatures

### Audit & Compliance
- Complete audit logging (all admin actions)
- IP address and user agent tracking
- Soft delete with 30-day recovery
- Token expiry and rotation
- Session management

## 🗂️ Project Structure

```
baldi-backend/
├── src/
│   ├── config/           # Configuration files
│   │   ├── database.js   # Prisma + soft delete middleware
│   │   ├── jwt.js        # Token generation/verification
│   │   └── env.js        # Environment validation
│   ├── controllers/      # Request handlers (15 controllers)
│   │   ├── authController.js
│   │   ├── subscriptionController.js
│   │   ├── mealController.js
│   │   ├── deliveryController.js
│   │   ├── paymentController.js
│   │   ├── notificationController.js
│   │   ├── referralController.js
│   │   ├── discountController.js
│   │   ├── analyticsController.js
│   │   └── webhookController.js
│   ├── middleware/       # Express middleware
│   │   ├── auth.js       # JWT + RBAC
│   │   ├── validate.js   # Joi validation
│   │   ├── errorHandler.js
│   │   ├── rateLimiter.js
│   │   ├── logger.js     # Winston + Morgan
│   │   └── sanitization.js  # XSS protection
│   ├── routes/           # API routes (11 route files)
│   │   ├── index.js
│   │   ├── authRoutes.js
│   │   ├── subscriptionRoutes.js
│   │   ├── mealRoutes.js
│   │   ├── deliveryRoutes.js
│   │   ├── paymentRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── referralRoutes.js
│   │   ├── discountRoutes.js
│   │   ├── analyticsRoutes.js
│   │   └── webhookRoutes.js
│   ├── services/         # Business logic (11 services)
│   │   ├── authService.js       # 2FA, login, registration
│   │   ├── subscriptionService.js
│   │   ├── mealService.js       # Image compression
│   │   ├── deliveryService.js   # QR verification
│   │   ├── paymentService.js
│   │   ├── emailService.js
│   │   ├── schedulerService.js  # 7 cron jobs
│   │   ├── notificationService.js
│   │   ├── referralService.js
│   │   ├── discountService.js
│   │   ├── analyticsService.js
│   │   ├── webhookService.js
│   │   ├── imageService.js      # Sharp compression
│   │   └── auditLogService.js
│   ├── utils/            # Utility functions
│   │   ├── errors.js     # Custom error classes
│   │   ├── constants.js  # Enums, roles, permissions
│   │   └── helpers.js    # Date, price, QR calculations
│   ├── validators/       # Request validation schemas
│   │   ├── authValidator.js     # 2FA validation
│   │   ├── subscriptionValidator.js
│   │   └── orderValidator.js    # QR verification
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── prisma/
│   ├── schema.prisma    # Database schema (22 models)
│   └── migrations/      # Version-controlled migrations
├── uploads/             # Auto-created
│   ├── original/        # Original images
│   └── compressed/      # Compressed images
├── logs/                # Application logs
│   ├── error.log
│   └── combined.log
├── tests/               # Test suites
│   ├── unit/
│   └── integration/
├── .env                 # Environment variables
├── .env.example         # Environment template
├── .gitignore
├── package.json
├── README.md            # This file
├── SETUP_GUIDE.md       # Detailed setup instructions
├── API_DOCUMENTATION.md # Complete API reference
└── PROJECT_SUMMARY.md   # Project overview
```

## 📝 Error Handling

The API uses consistent error responses:

```json
{
  "success": false,
  "error": "Error message here",
  "errors": []  // Optional validation errors
}
```

### HTTP Status Codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `429` - Too Many Requests
- `500` - Internal Server Error

## 📋 Logging

### Application Logs
- **Winston:** Structured logging with levels (error, warn, info, debug)
- **Morgan:** HTTP request logging
- **Files:** 
  - `logs/error.log` - Error-level logs only
  - `logs/combined.log` - All logs

### Audit Logs
- All admin actions logged to database
- Includes: IP address, user agent, action type, resource, changes
- Queryable via analytics API

## 🧪 Development

### Available Scripts

```bash
# Development
npm run dev              # Start with nodemon

# Production
npm start                # Start production server

# Testing
npm test                 # Run all tests
npm run test:watch       # Watch mode
npm run test:coverage    # With coverage

# Database
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
npm run prisma:reset     # Reset database
```

### Development Tips

1. **Use Prisma Studio** for database management:
   ```bash
   npm run prisma:studio
   ```

2. **Check logs** for debugging:
   ```bash
   tail -f logs/combined.log
   tail -f logs/error.log
   ```

3. **Test with Postman/Insomnia** - Import collection from API docs

4. **Enable 2FA for admin testing:**
   ```bash
   # Login as admin
   # Call POST /api/v1/auth/2fa/enable
   # Scan QR code with Google Authenticator
   # Verify setup
   ```

## 🚀 Deployment

### Production Checklist

- [ ] Change all default passwords and secrets
- [ ] Set `NODE_ENV=production`
- [ ] Configure proper CORS origins
- [ ] Set up SSL/HTTPS
- [ ] Configure production database (managed PostgreSQL)
- [ ] Set up database backups (daily recommended)
- [ ] Configure production email service
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Configure proper logging
- [ ] Set up load balancer (if needed)
- [ ] Configure firewall rules
- [ ] Test all endpoints in staging
- [ ] Set up CI/CD pipeline
- [ ] Configure webhook endpoints
- [ ] Test 2FA with production authenticator apps
- [ ] Verify image compression settings
- [ ] Test scheduled cron jobs

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000

DATABASE_URL="postgresql://user:password@production-db:5432/baldimeals"

# Use strong random secrets (64+ characters)
JWT_SECRET=<generate-with-crypto>
JWT_REFRESH_SECRET=<generate-with-crypto>

# Production email service
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=<sendgrid-api-key>

# Strict rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50

# Production CORS
CORS_ORIGIN=https://yourdomain.com

# Image settings
MAX_FILE_SIZE=5242880  # 5MB for production

# Soft delete
SOFT_DELETE_AUTO_PURGE_DAYS=30
```

## 🎨 Email Templates

The system includes email templates for:
- Welcome email (on registration)
- Delivery reminders (2 days before)
- Delivery confirmations
- Payment reminders
- Payment confirmations
- Subscription paused/resumed/cancelled notifications

Configure your email service in `.env` to enable email sending.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use ESLint for linting
- Follow Airbnb JavaScript style guide
- Write tests for new features
- Update documentation

## 📄 License

ISC

## 👨‍💻 Author

Jasser Tissaoui

## 📞 Support

For issues or questions:
- Create an issue in the repository
- Check documentation files:
  - `SETUP_GUIDE.md` - Detailed setup instructions
  - `API_DOCUMENTATION.md` - Complete API reference
  - `PROJECT_SUMMARY.md` - Feature overview
- Review logs in `logs/` directory
- Check Prisma Studio for database state

## 🙏 Acknowledgments

- Prisma team for excellent ORM
- Express.js community
- All open-source contributors

---

**Note:** This is a production-ready backend with enterprise-grade features. Make sure to:
- Use strong JWT secrets in production
- Configure proper CORS origins
- Set up SSL/HTTPS
- Configure backup strategy for database
- Set up proper monitoring and alerting
- Configure production-grade email service
- Implement payment gateway integration
- Enable 2FA for all admin accounts
- Test webhook integrations thoroughly
- Monitor image storage usage
- Review audit logs regularly
- Test QR verification flow
- Add comprehensive tests