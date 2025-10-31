# Baldi Meals Backend - Complete Setup Guide

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Database Configuration](#database-configuration)
4. [Environment Variables](#environment-variables)
5. [Running Migrations](#running-migrations)
6. [Creating Admin Users](#creating-admin-users)
7. [Setting Up 2FA](#setting-up-2fa)
8. [Image Upload Configuration](#image-upload-configuration)
9. [Email Configuration](#email-configuration)
10. [Webhook Configuration](#webhook-configuration)
11. [Testing the Installation](#testing-the-installation)
12. [Common Issues](#common-issues)
13. [Production Deployment](#production-deployment)

---

## 1. Prerequisites

### Required Software

**Node.js (v16+)**
```bash
# Check version
node --version

# Download from https://nodejs.org/ if needed
```

**PostgreSQL (v12+)**
```bash
# Check version
psql --version

# Download from https://www.postgresql.org/download/
```

**Git**
```bash
# Check version
git --version
```

**Package Manager**
```bash
# npm (comes with Node.js)
npm --version

# OR yarn
yarn --version
```

### Recommended Tools
- **Postman or Insomnia** - API testing
- **pgAdmin** - PostgreSQL GUI
- **VS Code** - Code editor
- **Google Authenticator** (mobile app) - For 2FA testing

---

## 2. Initial Setup

### Clone or Create Project

**If cloning:**
```bash
git clone <your-repo-url>
cd baldi-backend
```

**If starting fresh:**
Create the directory structure as shown in the project files.

### Install Dependencies

```bash
npm install
```

This installs all required packages:
- Core: express, @prisma/client
- Security: bcryptjs, jsonwebtoken, helmet, speakeasy, qrcode
- Email: nodemailer
- Scheduling: node-cron
- Image Processing: sharp, multer
- Webhooks: axios
- Validation: joi
- Logging: winston, morgan
- Testing: jest, supertest

---

## 3. Database Configuration

### Create PostgreSQL Database

**Option 1: Using psql command line**
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE baldimeals;

# Create user (optional)
CREATE USER baldiadmin WITH ENCRYPTED PASSWORD 'your-secure-password';
GRANT ALL PRIVILEGES ON DATABASE baldimeals TO baldiadmin;

# Exit
\q
```

**Option 2: Using pgAdmin (GUI)**
1. Open pgAdmin
2. Right-click "Databases"
3. Create > Database
4. Name: "baldimeals"
5. Owner: postgres (or create new user)
6. Click "Save"

### Verify Database Connection

```bash
psql -U postgres -d baldimeals -c "SELECT version();"
```

Expected output: PostgreSQL version information

---

## 4. Environment Variables

### Copy Example File

```bash
cp .env.example .env
```

### Generate Strong Secrets

**Generate JWT secrets:**
```bash
# Run this command twice to get two different secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Configure .env File

Edit `.env` with your settings:

```env
# ============================================
# ENVIRONMENT
# ============================================
NODE_ENV=development
PORT=5000

# ============================================
# DATABASE
# ============================================
DATABASE_URL="postgresql://postgres:your_password@localhost:5432/baldimeals"

# For production, use connection pooling:
# DATABASE_URL="postgresql://user:pass@host:5432/baldimeals?connection_limit=10"

# ============================================
# JWT CONFIGURATION
# ============================================
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
JWT_SECRET=your-generated-secret-here-64-chars-minimum
JWT_EXPIRES_IN=7d

JWT_REFRESH_SECRET=your-generated-refresh-secret-here-64-chars-minimum
JWT_REFRESH_EXPIRES_IN=30d

# ============================================
# EMAIL CONFIGURATION
# ============================================
# For Gmail
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password

# For SendGrid (production recommended)
# EMAIL_HOST=smtp.sendgrid.net
# EMAIL_PORT=587
# EMAIL_USER=apikey
# EMAIL_PASS=your-sendgrid-api-key

# ============================================
# RATE LIMITING
# ============================================
RATE_LIMIT_WINDOW_MS=900000      # 15 minutes
RATE_LIMIT_MAX_REQUESTS=100      # 100 requests per window

# ============================================
# CORS
# ============================================
CORS_ORIGIN=*  # For development
# CORS_ORIGIN=https://yourdomain.com  # For production

# ============================================
# IMAGE UPLOAD
# ============================================
MAX_FILE_SIZE=10485760  # 10MB in bytes

# ============================================
# SOFT DELETE
# ============================================
SOFT_DELETE_AUTO_PURGE_DAYS=30

# ============================================
# WEBHOOKS (Optional)
# ============================================
WEBHOOK_SECRET=your-webhook-secret-for-verification
```

### Gmail App Password Setup

1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable **2-Step Verification** (if not already enabled)
3. Go to **App passwords**
4. Select app: **Mail**
5. Select device: **Other (Custom name)** - Enter "Baldi Backend"
6. Click **Generate**
7. Copy the 16-character password (no spaces)
8. Use this as `EMAIL_PASS` in `.env`

---

## 5. Running Migrations

### Generate Prisma Client

```bash
npm run prisma:generate
```

Expected output:
```
✔ Generated Prisma Client
```

### Run Database Migrations

```bash
npm run prisma:migrate
```

When prompted for migration name, enter: `init` or `enhanced_features`

Expected output:
```
✔ Database migrations ran successfully
✔ Generated Prisma Client
```

### Verify Migration

```bash
# Open Prisma Studio
npm run prisma:studio
```

Browser opens at `http://localhost:5555`

Check that all 22 models are visible:
- User
- RefreshToken
- AdminPermission
- AuditLog
- Subscription
- WeeklyMenu
- Meal
- WeeklyMenuMeal
- AddOn
- Delivery
- DeliveryMeal
- DeliveryAddOn
- DeliveryAddress
- Payment
- Notification
- Referral
- Discount
- DiscountUsage
- Webhook
- WebhookLog
- MealAnalytics
- RevenueAnalytics

---

## 6. Creating Admin Users

### Method 1: API + Database Update (Recommended)

**Step 1: Register via API**
```bash
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
```

**Step 2: Update Role in Database**
```bash
psql -U postgres -d baldimeals
UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'admin@baldimeals.com';
\q
```

**Step 3: Verify**
```bash
psql -U postgres -d baldimeals -c "SELECT id, email, role FROM users WHERE email = 'admin@baldimeals.com';"
```

### Method 2: Using Prisma Studio

1. Open Prisma Studio:
   ```bash
   npm run prisma:studio
   ```

2. Navigate to `users` table

3. Click "Add record"

4. Generate hashed password:
   ```bash
   node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('YourPassword123!', 12))"
   ```

5. Fill in fields:
   - **email:** admin@baldimeals.com
   - **password:** (paste hashed password from step 4)
   - **firstName:** Admin
   - **lastName:** User
   - **phoneNumber:** 12345678
   - **role:** SUPER_ADMIN
   - **isActive:** true
   - **twoFactorEnabled:** false (will enable in next section)

6. Click "Save 1 change"

---

## 7. Setting Up 2FA

### Why 2FA?
- **Mandatory** for all admin roles (SUPER_ADMIN, MANAGER, SUPPORT, DELIVERY_GUY)
- **Optional** for CUSTOMER role
- Uses TOTP (Time-based One-Time Password) - compatible with Google Authenticator, Authy, etc.

### Enable 2FA for Admin

**Step 1: Login as Admin**
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@baldimeals.com",
    "password": "Admin123!@#"
  }'
```

Save the `accessToken` from response.

**Step 2: Enable 2FA**
```bash
curl -X POST http://localhost:5000/api/v1/auth/2fa/enable \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

Response includes:
```json
{
  "success": true,
  "data": {
    "secret": "BASE32_SECRET_STRING",
    "qrCode": "data:image/png;base64,...",
    "isAdmin": true
  }
}
```

**Step 3: Scan QR Code**
1. Open Google Authenticator (or similar app) on mobile
2. Tap "+" to add account
3. Choose "Scan QR code"
4. Scan the QR code from the API response (decode base64 if needed)
5. App will start generating 6-digit codes

**Step 4: Verify Setup**
```bash
curl -X POST http://localhost:5000/api/v1/auth/2fa/verify-setup \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "code": "123456"
  }'
```

Replace `123456` with the current code from your authenticator app.

**Step 5: Test 2FA Login**
```bash
# Login will now require 2FA
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@baldimeals.com",
    "password": "Admin123!@#"
  }'

# Response will include tempToken and requiresTwoFactor: true

# Then verify with code
curl -X POST http://localhost:5000/api/v1/auth/2fa/verify \
  -H "Content-Type: application/json" \
  -d '{
    "tempToken": "TEMP_TOKEN_FROM_LOGIN",
    "code": "123456"
  }'
```

### Disable 2FA (Customers Only)

Admins **cannot** disable 2FA. Customers can:

```bash
curl -X POST http://localhost:5000/api/v1/auth/2fa/disable \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "code": "123456"
  }'
```

---

## 8. Image Upload Configuration

### Create Upload Directories

```bash
mkdir -p uploads/original uploads/compressed
```

### Configure Permissions

**Linux/Mac:**
```bash
chmod 755 uploads
chmod 755 uploads/original
chmod 755/compressed
```

**Windows:**
Right-click folder → Properties → Security → Edit → Add write permissions

### Test Image Compression

**Step 1: Create a Meal with Image (as Admin)**

```bash
# This requires multipart/form-data, best tested with Postman
# Or using curl with file upload:

curl -X POST http://localhost:5000/api/v1/meals \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -F "name=Test Meal" \
  -F "category=BULKING" \
  -F "price=15.99" \
  -F "calories=500" \
  -F "protein=40" \
  -F "carbs=50" \
  -F "fats=15" \
  -F "isAvailable=true" \
  -F "image=@/path/to/image.jpg"
```

**Step 2: Verify Compression**

Check both directories:
```bash
ls -lh uploads/original/
ls -lh uploads/compressed/
```

You should see:
- Original image in `uploads/original/`
- Compressed image (smaller size) in `uploads/compressed/`

### Compression Settings

Default settings (in `src/services/imageService.js`):
- **Quality:** 80%
- **Max Width:** 1920px
- **Max Height:** 1080px
- **Format:** JPEG

To customize, update `src/utils/constants.js`:
```javascript
const IMAGE_COMPRESSION = {
  QUALITY: 80,
  MAX_WIDTH: 1920,
  MAX_HEIGHT: 1080,
  FORMAT: 'jpeg',
};
```

---

## 9. Email Configuration

### Test Email Sending

**Step 1: Register a New User**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "confirmPassword": "Test123!@#",
    "firstName": "Test",
    "lastName": "User",
    "phoneNumber": "98765432"
  }'
```

**Step 2: Check Email Inbox**
- Welcome email should arrive within 1-2 minutes
- Check spam folder if not in inbox

**Step 3: Check Logs**
```bash
tail -f logs/combined.log | grep "Email sent"
```

### Email Templates

All email templates are in `src/services/emailService.js`:
- Welcome email
- Delivery reminder (2 days before)
- Delivery confirmation
- Payment reminder
- Subscription paused/resumed/cancelled

To customize templates, edit the `sendEmail` methods in `emailService.js`.

### Email Troubleshooting

**Issue: Gmail blocks login**
- Solution: Use App Password (see section 4)
- Enable "Less secure app access" (not recommended)

**Issue: Emails go to spam**
- Solution: Configure SPF/DKIM records for production domain
- Use a reputable email service (SendGrid, Mailgun, etc.)

**Issue: Emails not sending**
- Check `logs/error.log` for email errors
- Verify EMAIL_* variables in `.env`
- Test SMTP connection:
  ```bash
  node -e "const nodemailer = require('nodemailer'); const transport = nodemailer.createTransport({host: 'smtp.gmail.com', port: 587, auth: {user: 'your-email@gmail.com', pass: 'your-app-password'}}); transport.verify((err, success) => console.log(err ? err : 'SMTP connection successful'));"
  ```

---

## 10. Webhook Configuration

### What Are Webhooks?

Webhooks allow external services to receive real-time notifications about events in your system.

**11 Webhook Events:**
1. DELIVERY_SCHEDULED
2. DELIVERY_CONFIRMED
3. DELIVERY_OUT_FOR_DELIVERY
4. DELIVERY_DELIVERED
5. DELIVERY_CANCELLED
6. PAYMENT_COMPLETED
7. PAYMENT_FAILED
8. PAYMENT_REFUNDED
9. SUBSCRIPTION_CREATED
10. SUBSCRIPTION_CANCELLED
11. USER_REGISTERED

### Create a Webhook (Admin Only)

**Step 1: Login as Admin**
```bash
# Get admin access token
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@baldimeals.com",
    "password": "Admin123!@#"
  }'
# Verify 2FA code
```

**Step 2: Create Webhook**
```bash
curl -X POST http://localhost:5000/api/v1/admin/webhooks \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "url": "https://your-service.com/webhooks/baldi",
    "event": "DELIVERY_DELIVERED"
  }'
```

Response includes a `secret` for signature verification.

**Step 3: Test Webhook**
```bash
curl -X POST http://localhost:5000/api/v1/admin/webhooks/WEBHOOK_ID/test \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Webhook Payload Format

```json
{
  "event": "DELIVERY_DELIVERED",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "data": {
    "deliveryId": "uuid",
    "deliveredDate": "2024-01-01T12:00:00.000Z"
  }
}
```

### Webhook Signature Verification

Webhooks include HMAC signature in headers:
```
X-Webhook-Signature: <hmac-sha256-signature>
X-Webhook-Event: DELIVERY_DELIVERED
```

**Verify in your service:**
```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}
```

### Webhook Testing Tool

Use [webhook.site](https://webhook.site) for testing:
1. Go to https://webhook.site
2. Copy your unique URL
3. Create webhook with that URL
4. Trigger an event (e.g., create delivery)
5. See payload in webhook.site

---

## 11. Testing the Installation

### Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

Expected output:
```
✅ Database connected successfully
✅ Scheduler service initialized
🚀 Server running on http://localhost:5000
📊 API available at http://localhost:5000/api/v1
❤️  Health check: http://localhost:5000/api/v1/health
```

### Health Check

```bash
curl http://localhost:5000/api/v1/health
```

Expected response:
```json
{
  "success": true,
  "message": "Baldi API is running",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

### Complete Flow Test

**1. Register Customer**
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "customer@test.com",
    "password": "Test123!@#",
    "confirmPassword": "Test123!@#",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "98765432"
  }'
```

Save `accessToken`.

**2. Create Subscription**
```bash
curl -X POST http://localhost:5000/api/v1/subscriptions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -d '{
    "planType": "FIVE_DAY"
  }'
```

Save `subscriptionId`.

**3. Create Meals (as Admin)**
```bash
curl -X POST http://localhost:5000/api/v1/meals \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{
    "name": "Grilled Chicken",
    "category": "CUTTING",
    "price": 12.5,
    "calories": 350,
    "protein": 45,
    "carbs": 20,
    "fats": 10,
    "isAvailable": true
  }'
```

Create 5+ meals, save their IDs.

**4. Create Delivery Address**
```bash
curl -X POST http://localhost:5000/api/v1/addresses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -d '{
    "label": "Home",
    "fullName": "John Doe",
    "phoneNumber": "98765432",
    "addressLine1": "123 Main St",
    "city": "Tunis",
    "postalCode": "1000",
    "isDefault": true
  }'
```

Save `addressId`.

**5. Create Delivery Order**
```bash
curl -X POST http://localhost:5000/api/v1/deliveries \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -d '{
    "subscriptionId": "SUBSCRIPTION_ID",
    "deliveryAddressId": "ADDRESS_ID",
    "meals": [
      {"mealId": "MEAL_ID_1", "quantity": 3},
      {"mealId": "MEAL_ID_2", "quantity": 4}
    ],
    "notes": "Please call before delivery"
  }'
```

Save `deliveryId`.

**6. Confirm Delivery**
```bash
curl -X POST http://localhost:5000/api/v1/deliveries/DELIVERY_ID/confirm \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer CUSTOMER_TOKEN" \
  -d '{
    "confirmed": true
  }'
```

**7. Get QR Code**
```bash
curl http://localhost:5000/api/v1/deliveries/DELIVERY_ID/verification \
  -H "Authorization: Bearer CUSTOMER_TOKEN"
```

Response includes `qrCode` and `verificationCode`.

**8. Verify Delivery (as Delivery Guy)**
```bash
curl -X POST http://localhost:5000/api/v1/deliveries/verify \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer DELIVERY_GUY_TOKEN" \
  -d '{
    "verificationCode": "123456"
  }'
```

**9. Check Notifications**
```bash
curl http://localhost:5000/api/v1/notifications \
  -H "Authorization: Bearer CUSTOMER_TOKEN"
```

**10. Check Analytics (as Admin)**
```bash
curl http://localhost:5000/api/v1/admin/analytics/dashboard \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

## 12. Common Issues

### Issue: Database Connection Failed

**Symptoms:**
```
❌ Database connection failed: connect ECONNREFUSED 127.0.0.1:5432
```

**Solutions:**
1. **Check PostgreSQL is running:**
   ```bash
   # Linux/Mac
   sudo systemctl status postgresql
   
   # Mac (Homebrew)
   brew services list
   
   # Windows
   # Check Services app for "postgresql"
   ```

2. **Verify DATABASE_URL:**
   ```bash
   psql "postgresql://postgres:password@localhost:5432/baldimeals"
   ```

3. **Check PostgreSQL port:**
   ```bash
   psql -U postgres -c "SHOW port;"
   ```

### Issue: Prisma Client Not Found

**Symptoms:**
```
Error: @prisma/client did not initialize yet
```

**Solution:**
```bash
npm run prisma:generate
```

### Issue: Migration Failed

**Symptoms:**
```
Error: P3009: Failed to create database
```

**Solutions:**
1. **Database already exists:**
   ```bash
   # Drop and recreate
   psql -U postgres
   DROP DATABASE baldimeals;
   CREATE DATABASE baldimeals;
   \q
   
   # Run migration again
   npm run prisma:migrate
   ```

2. **Reset database (⚠️ deletes all data):**
   ```bash
   npm run prisma:reset
   ```

### Issue: Port 5000 Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**
1. **Change port in .env:**
   ```env
   PORT=3000
   ```

2. **Kill process using port 5000:**
   ```bash
   # Linux/Mac
   lsof -ti:5000 | xargs kill -9
   
   # Windows
   netstat -ano | findstr :5000
   taskkill /PID <PID> /F
   ```

### Issue: Email Not Sending

**Symptoms:**
- No welcome email after registration
- Error in logs: "Failed to send email"

**Solutions:**
1. **Check email configuration:**
   ```bash
   node -e "console.log(process.env.EMAIL_HOST, process.env.EMAIL_PORT, process.env.EMAIL_USER)"
   ```

2. **Test SMTP connection:**
   ```bash
   node -e "const nodemailer = require('nodemailer'); const transport = nodemailer.createTransport({host: process.env.EMAIL_HOST, port: process.env.EMAIL_PORT, auth: {user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS}}); transport.verify((err) => console.log(err || 'OK'));"
   ```

3. **Check Gmail App Password:**
   - Must be 16 characters, no spaces
   - 2FA must be enabled on Google account

### Issue: JWT Token Invalid

**Symptoms:**
```json
{
  "success": false,
  "error": "Invalid token"
}
```

**Solutions:**
1. **Check JWT_SECRET is set:**
   ```bash
   node -e "console.log(process.env.JWT_SECRET ? 'Set' : 'Not set')"
   ```

2. **Token expired - login again**

3. **User not active:**
   ```bash
   psql -U postgres -d baldimeals
   UPDATE users SET "isActive" = true WHERE email = 'user@example.com';
   ```

### Issue: 2FA Not Working

**Symptoms:**
- QR code not scannable
- Codes not accepted

**Solutions:**
1. **Time sync issue:**
   - Ensure server and phone have correct time
   - Time difference > 30 seconds will fail

2. **Regenerate secret:**
   ```bash
   # Disable and re-enable 2FA
   curl -X POST http://localhost:5000/api/v1/auth/2fa/disable ...
   curl -X POST http://localhost:5000/api/v1/auth/2fa/enable ...
   ```

3. **Use different authenticator app:**
   - Try Google Authenticator, Authy, or Microsoft Authenticator

### Issue: Image Upload Failing

**Symptoms:**
```
Error: ENOENT: no such file or directory, open 'uploads/original/...'
```

**Solutions:**
1. **Create directories:**
   ```bash
   mkdir -p uploads/original uploads/compressed
   ```

2. **Check permissions:**
   ```bash
   # Linux/Mac
   chmod 755 uploads uploads/original uploads/compressed
   ```

3. **Check file size:**
   - Max 10MB by default (see MAX_FILE_SIZE in .env)

### Issue: Webhooks Not Firing

**Symptoms:**
- Events occur but no webhook sent
- Webhook logs show failures

**Solutions:**
1. **Check webhook is active:**
   ```bash
   curl http://localhost:5000/api/v1/admin/webhooks \
     -H "Authorization: Bearer ADMIN_TOKEN"
   ```

2. **Test webhook endpoint:**
   ```bash
   curl -X POST http://localhost:5000/api/v1/admin/webhooks/WEBHOOK_ID/test \
     -H "Authorization: Bearer ADMIN_TOKEN"
   ```

3. **Check webhook logs:**
   ```bash
   curl http://localhost:5000/api/v1/admin/webhooks/WEBHOOK_ID/logs \
     -H "Authorization: Bearer ADMIN_TOKEN"
   ```

4. **Webhook deactivated after failures:**
   - After 10 consecutive failures, webhook auto-deactivates
   - Fix the endpoint and reactivate manually

---

## 13. Production Deployment

### Pre-Deployment Checklist

- [ ] All tests passing
- [ ] All secrets changed from defaults
- [ ] `NODE_ENV=production` set
- [ ] Database backed up
- [ ] SSL certificates configured
- [ ] CORS properly configured
- [ ] Email service tested
- [ ] All admin users have 2FA enabled
- [ ] Webhook endpoints tested
- [ ] Image storage sufficient
- [ ] Log rotation configured
- [ ] Monitoring set up (e.g., Sentry)
- [ ] CI/CD pipeline tested

### Environment Variables for Production

```env
NODE_ENV=production
PORT=5000

# Use managed PostgreSQL with connection pooling
DATABASE_URL="postgresql://user:pass@prod-db.example.com:5432/baldimeals?connection_limit=20&pool_timeout=10"

# Strong secrets (64+ characters)
JWT_SECRET=<use-strong-random-64-char-string>
JWT_REFRESH_SECRET=<use-different-strong-random-64-char-string>

# Production email service
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASS=<your-sendgrid-api-key>

# Strict rate limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=50

# Production domain
CORS_ORIGIN=https://yourdomain.com

# Image settings
MAX_FILE_SIZE=5242880  # 5MB

# Soft delete
SOFT_DELETE_AUTO_PURGE_DAYS=30
```

### Deployment Steps

**1. Set up managed PostgreSQL:**
- Use AWS RDS, DigitalOcean Managed Databases, or similar
- Enable automated backups (daily recommended)
- Configure connection pooling

**2. Set up production server:**
```bash
# SSH into server
ssh user@your-server.com

# Clone repository
git clone <repo-url>
cd baldi-backend

# Install dependencies
npm ci --production

# Set up environment
cp .env.example .env
# Edit .env with production values

# Run migrations
npm run prisma:migrate

# Create upload directories
mkdir -p uploads/original uploads/compressed

# Start with PM2 (recommended)
npm install -g pm2
pm2 start src/server.js --name baldi-api
pm2 save
pm2 startup
```
### Configure Reverse Proxy (Nginx)

**Create Nginx configuration:**

```nginx
# /etc/nginx/sites-available/baldi-api

server {
    listen 80;
    server_name api.yourdomain.com;

    # Redirect HTTP to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/api.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # File Upload Size
    client_max_body_size 10M;

    # Proxy Configuration
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Static files (images)
    location /uploads/ {
        alias /path/to/baldi-backend/uploads/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Logs
    access_log /var/log/nginx/baldi-api-access.log;
    error_log /var/log/nginx/baldi-api-error.log;
}
```

**Enable configuration:**
```bash
sudo ln -s /etc/nginx/sites-available/baldi-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Set Up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt update
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d api.yourdomain.com

# Test auto-renewal
sudo certbot renew --dry-run
```

**Auto-renewal is configured by default via cron/systemd timer.**

### Set Up PM2 Process Manager

**Install PM2:**
```bash
npm install -g pm2
```

**Create PM2 ecosystem file:**

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'baldi-api',
    script: 'src/server.js',
    instances: 'max',  // Use all CPU cores
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 5000
    },
    error_file: 'logs/pm2-error.log',
    out_file: 'logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    max_memory_restart: '1G',
    autorestart: true,
    watch: false,
    merge_logs: true,
    time: true
  }]
};
```

**Start application:**
```bash
pm2 start ecosystem.config.js
pm2 save
pm2 startup  # Follow instructions to enable startup on boot
```

**Useful PM2 commands:**
```bash
pm2 list                    # List all processes
pm2 logs baldi-api          # View logs
pm2 logs baldi-api --lines 100  # View last 100 lines
pm2 monit                   # Monitor CPU/Memory
pm2 restart baldi-api       # Restart app
pm2 stop baldi-api          # Stop app
pm2 delete baldi-api        # Remove from PM2
```

### Set Up Database Backups

**Create backup script:**

```bash
#!/bin/bash
# /home/user/scripts/backup-db.sh

BACKUP_DIR="/home/user/backups"
DB_NAME="baldimeals"
DB_USER="postgres"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/${DB_NAME}_${TIMESTAMP}.sql.gz"

# Create backup directory if not exists
mkdir -p $BACKUP_DIR

# Dump database
pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_FILE

# Keep only last 30 days of backups
find $BACKUP_DIR -name "*.sql.gz" -mtime +30 -delete

echo "Backup completed: $BACKUP_FILE"
```

**Make executable:**
```bash
chmod +x /home/user/scripts/backup-db.sh
```

**Schedule with cron (daily at 2 AM):**
```bash
crontab -e

# Add this line:
0 2 * * * /home/user/scripts/backup-db.sh >> /var/log/db-backup.log 2>&1
```

**Test backup:**
```bash
/home/user/scripts/backup-db.sh
ls -lh /home/user/backups/
```

### Set Up Monitoring

**1. Install and configure Sentry (Error Tracking):**

```bash
npm install @sentry/node
```

**Add to src/server.js:**

```javascript
const Sentry = require('@sentry/node');

// Initialize Sentry BEFORE everything else
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
});

// Add after all routes but BEFORE error handler
app.use(Sentry.Handlers.requestHandler());
app.use(Sentry.Handlers.tracingHandler());

// Add error handler
app.use(Sentry.Handlers.errorHandler());
```

**Add to .env:**
```env
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

**2. Set up PM2 monitoring:**

```bash
# Link PM2 to PM2 Plus (optional)
pm2 link <secret-key> <public-key>

# Or use PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
```

**3. Set up uptime monitoring:**

Use services like:
- **UptimeRobot** (free, simple)
- **Pingdom**
- **StatusCake**
- **Better Uptime**

Configure to ping: `https://api.yourdomain.com/api/v1/health`

### Configure Log Rotation

**Create logrotate config:**

```bash
sudo nano /etc/logrotate.d/baldi-api
```

**Add configuration:**

```
/path/to/baldi-backend/logs/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0640 www-data www-data
    sharedscripts
    postrotate
        pm2 reloadLogs
    endscript
}
```

**Test logrotate:**
```bash
sudo logrotate -f /etc/logrotate.d/baldi-api
```

### Set Up Firewall

**Configure UFW (Ubuntu):**

```bash
# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Allow PostgreSQL only from localhost
sudo ufw allow from 127.0.0.1 to any port 5432

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

### Performance Optimization

**1. Enable database connection pooling:**

Already configured in Prisma with DATABASE_URL query parameters:
```env
DATABASE_URL="postgresql://user:pass@host:5432/db?connection_limit=20&pool_timeout=10"
```

**2. Enable Redis caching (optional but recommended):**

```bash
# Install Redis
sudo apt install redis-server

# Install Redis client
npm install redis
```

**Create cache service (src/services/cacheService.js):**

```javascript
const redis = require('redis');

const client = redis.createClient({
  url: process.env.REDIS_URL || 'redis://localhost:6379'
});

client.on('error', (err) => console.error('Redis error:', err));

const connectRedis = async () => {
  await client.connect();
};

const get = async (key) => {
  return await client.get(key);
};

const set = async (key, value, ttl = 3600) => {
  await client.setEx(key, ttl, JSON.stringify(value));
};

const del = async (key) => {
  await client.del(key);
};

module.exports = { connectRedis, get, set, del };
```

**3. Enable compression:**

```bash
npm install compression
```

**Add to src/app.js:**

```javascript
const compression = require('compression');
app.use(compression());
```

**4. Optimize Nginx:**

Already included in Nginx config:
- HTTP/2 enabled
- Gzip compression
- Static file caching (30 days)
- Connection keep-alive

### Security Best Practices

**1. Environment variables:**
- Never commit `.env` to version control
- Use secrets management (AWS Secrets Manager, HashiCorp Vault)
- Rotate secrets regularly (every 90 days)

**2. Database security:**
- Use strong passwords (20+ characters)
- Restrict database access to application server only
- Enable SSL for database connections
- Regular security updates

**3. Application security:**
- Keep dependencies updated: `npm audit`
- Use HTTPS only in production
- Enable rate limiting (already configured)
- Sanitize all inputs (already implemented)
- Use parameterized queries (Prisma does this)

**4. Server security:**
- Keep OS updated: `sudo apt update && sudo apt upgrade`
- Disable root login via SSH
- Use SSH keys instead of passwords
- Configure fail2ban for brute force protection

**5. Monitor security:**
- Set up alerts for failed login attempts
- Monitor unusual API activity
- Regular security audits
- Implement OWASP best practices

### Deploy Updates (Zero Downtime)

**1. Using PM2:**

```bash
# SSH into server
ssh user@your-server.com
cd /path/to/baldi-backend

# Pull latest changes
git pull origin main

# Install dependencies (if package.json changed)
npm install

# Run migrations (if schema changed)
npm run prisma:migrate

# Reload with zero downtime
pm2 reload baldi-api
```

**2. Using CI/CD (GitHub Actions example):**

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v2
    
    - name: Deploy to server
      uses: appleboy/ssh-action@master
      with:
        host: ${{ secrets.SERVER_HOST }}
        username: ${{ secrets.SERVER_USER }}
        key: ${{ secrets.SSH_PRIVATE_KEY }}
        script: |
          cd /path/to/baldi-backend
          git pull origin main
          npm install
          npm run prisma:migrate
          pm2 reload baldi-api
```

### Rollback Strategy

**1. Keep last 5 releases:**

```bash
# Create releases directory structure
/var/www/baldi-api/
  ├── current -> /var/www/baldi-api/releases/20240101_120000
  ├── releases/
  │   ├── 20240101_120000/
  │   ├── 20240102_130000/
  │   └── 20240103_140000/
  └── shared/
      ├── .env
      ├── logs/
      └── uploads/
```

**2. Quick rollback script:**

```bash
#!/bin/bash
# rollback.sh

RELEASES_DIR="/var/www/baldi-api/releases"
CURRENT_LINK="/var/www/baldi-api/current"

# Get previous release
PREVIOUS=$(ls -t $RELEASES_DIR | head -2 | tail -1)

# Update symlink
ln -sfn $RELEASES_DIR/$PREVIOUS $CURRENT_LINK

# Restart application
pm2 restart baldi-api

echo "Rolled back to: $PREVIOUS"
```

### Health Checks and Monitoring

**1. Application health endpoint:**

Already implemented at `/api/v1/health`

**2. Database health check:**

```bash
# Add to cron for monitoring
*/5 * * * * psql -U postgres -d baldimeals -c "SELECT 1;" > /dev/null 2>&1 || echo "DB DOWN" | mail -s "Database Alert" admin@yourdomain.com
```

**3. Disk space monitoring:**

```bash
#!/bin/bash
# /home/user/scripts/check-disk.sh

THRESHOLD=80
USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')

if [ $USAGE -gt $THRESHOLD ]; then
    echo "Disk usage is ${USAGE}% - Above threshold!" | mail -s "Disk Space Alert" admin@yourdomain.com
fi
```

**Add to cron:**
```bash
0 * * * * /home/user/scripts/check-disk.sh
```

### Scaling Strategies

**1. Vertical Scaling (Single Server):**
- Increase server resources (CPU, RAM)
- Already using PM2 cluster mode (all CPU cores)
- Database connection pooling configured

**2. Horizontal Scaling (Multiple Servers):**

```
                    ┌─────────────┐
                    │ Load Balancer│
                    └──────┬──────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    ┌───▼───┐          ┌───▼───┐         ┌───▼───┐
    │ App 1 │          │ App 2 │         │ App 3 │
    └───┬───┘          └───┬───┘         └───┬───┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                    ┌──────▼──────┐
                    │  Database   │
                    │   (Primary) │
                    └─────────────┘
```

**Requirements for horizontal scaling:**
- Load balancer (Nginx, HAProxy, AWS ELB)
- Shared Redis for sessions/cache
- Shared file storage for uploads (S3, NFS)
- Database with read replicas

**3. Database Scaling:**

```bash
# Read replicas for read-heavy operations
# Primary: Write operations
DATABASE_PRIMARY_URL="postgresql://..."

# Replica 1: Read operations
DATABASE_REPLICA_URL="postgresql://..."
```

### Production Troubleshooting

**1. High CPU usage:**

```bash
# Check PM2 metrics
pm2 monit

# Check node processes
top -p $(pgrep -d',' node)

# Check slow queries
psql -U postgres -d baldimeals
SELECT * FROM pg_stat_activity WHERE state = 'active' AND query_start < NOW() - INTERVAL '5 seconds';
```

**2. Memory leaks:**

```bash
# Monitor memory over time
pm2 start ecosystem.config.js --max-memory-restart 1G

# Check heap usage
curl http://localhost:5000/api/v1/health
# Add memory info to health endpoint if needed
```

**3. Database connection issues:**

```bash
# Check active connections
psql -U postgres -c "SELECT count(*) FROM pg_stat_activity;"

# Check connection limit
psql -U postgres -c "SHOW max_connections;"

# Kill idle connections
psql -U postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle' AND state_change < NOW() - INTERVAL '5 minutes';"
```

**4. Disk space issues:**

```bash
# Check disk usage
df -h

# Find large files
du -ah /var/www/baldi-api | sort -rh | head -20

# Clean up logs
sudo logrotate -f /etc/logrotate.d/baldi-api

# Clean old backups
find /home/user/backups -name "*.sql.gz" -mtime +30 -delete
```

**5. SSL certificate expiring:**

```bash
# Check certificate expiration
sudo certbot certificates

# Renew if needed
sudo certbot renew

# Test auto-renewal
sudo certbot renew --dry-run
```

### Maintenance Mode

**Create maintenance page:**

```html
<!-- /var/www/maintenance.html -->
<!DOCTYPE html>
<html>
<head>
    <title>Maintenance - Baldi Meals</title>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        .container {
            text-align: center;
            padding: 40px;
            background: rgba(255,255,255,0.1);
            border-radius: 10px;
            backdrop-filter: blur(10px);
        }
        h1 { font-size: 48px; margin: 0 0 20px; }
        p { font-size: 18px; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔧 Under Maintenance</h1>
        <p>We're making improvements. Be back soon!</p>
        <p style="font-size: 14px; margin-top: 30px;">Expected downtime: ~15 minutes</p>
    </div>
</body>
</html>
```

**Enable maintenance mode (Nginx):**

```nginx
# Add to server block
location / {
    if (-f /var/www/maintenance.html) {
        return 503;
    }
    # ... rest of config
}

error_page 503 @maintenance;

location @maintenance {
    root /var/www;
    rewrite ^(.*)$ /maintenance.html break;
}
```

**Toggle maintenance:**

```bash
# Enable
sudo touch /var/www/maintenance.html

# Disable
sudo rm /var/www/maintenance.html
```

---

## 14. Post-Deployment Verification

### Verification Checklist

**1. API Endpoints:**
```bash
# Health check
curl https://api.yourdomain.com/api/v1/health

# Register user
curl -X POST https://api.yourdomain.com/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!@#","confirmPassword":"Test123!@#","firstName":"Test","lastName":"User","phoneNumber":"12345678"}'

# Login
curl -X POST https://api.yourdomain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!@#"}'
```

**2. Database:**
```bash
psql -U postgres -d baldimeals -c "SELECT COUNT(*) FROM users;"
```

**3. Email:**
- Register new user
- Check welcome email arrives

**4. SSL:**
```bash
curl -I https://api.yourdomain.com/api/v1/health | grep "HTTP/2 200"
```

**5. 2FA:**
- Login as admin
- Verify 2FA required

**6. Logs:**
```bash
tail -f logs/combined.log
tail -f logs/error.log
pm2 logs baldi-api
```

**7. Monitoring:**
- Check Sentry for errors
- Check uptime monitor status
- Verify PM2 Plus dashboard

**8. Backups:**
```bash
ls -lh /home/user/backups/
```

**9. Cron Jobs:**
```bash
crontab -l
# Verify backup, disk check, etc. are scheduled
```

---

## 15. Support and Maintenance

### Regular Maintenance Tasks

**Daily:**
- Check error logs
- Monitor uptime alerts
- Review Sentry errors

**Weekly:**
- Review PM2 metrics (CPU, memory)
- Check disk space usage
- Review slow database queries
- Update dependencies if needed

**Monthly:**
- Rotate secrets (JWT, API keys)
- Review user feedback
- Performance optimization review
- Security audit

**Quarterly:**
- Major dependency updates
- Database optimization (VACUUM, REINDEX)
- Backup restoration test
- Disaster recovery drill

### Getting Help

**Documentation:**
- This Setup Guide
- README.md
- API_DOCUMENTATION.md
- PROJECT_SUMMARY.md

**Logs:**
```bash
# Application logs
tail -f logs/combined.log
tail -f logs/error.log

# PM2 logs
pm2 logs baldi-api

# Nginx logs
sudo tail -f /var/log/nginx/baldi-api-error.log

# System logs
sudo journalctl -u nginx -f
```

**Database queries for debugging:**

```sql
-- Active users
SELECT COUNT(*) FROM users WHERE "isActive" = true AND "deletedAt" IS NULL;

-- Active subscriptions
SELECT COUNT(*) FROM subscriptions WHERE status = 'ACTIVE';

-- Pending payments
SELECT COUNT(*) FROM payments WHERE status = 'PENDING';

-- Recent deliveries
SELECT id, "scheduledDate", status FROM deliveries ORDER BY "createdAt" DESC LIMIT 10;

-- Failed webhooks
SELECT w.url, wl."createdAt", wl.response 
FROM webhook_logs wl 
JOIN webhooks w ON wl."webhookId" = w.id 
WHERE wl.success = false 
ORDER BY wl."createdAt" DESC LIMIT 10;
```

### Emergency Contacts

Create a contacts document with:
- Database administrator
- Server provider support
- Email service support
- SSL certificate support
- Development team contacts

### Disaster Recovery

**1. Server failure:**
```bash
# Restore from backup
1. Provision new server
2. Install dependencies (Node.js, PostgreSQL, Nginx)
3. Restore database backup
4. Deploy application
5. Update DNS if needed
6. Verify all services
```

**2. Database corruption:**
```bash
# Restore from latest backup
cd /home/user/backups
gunzip -c baldimeals_YYYYMMDD_HHMMSS.sql.gz | psql -U postgres -d baldimeals
```

**3. Full system restore:**
- Documentation for rebuilding entire infrastructure
- Keep in secure, accessible location (not on same server!)
- Test annually

---

## Congratulations! 🎉

Your Baldi Meals backend is now fully set up and production-ready!

### Next Steps

1. ✅ Complete frontend integration
2. ✅ Integrate payment gateway
3. ✅ Set up analytics dashboard
4. ✅ Launch beta testing
5. ✅ Go live!

### Quick Reference Commands

```bash
# Start development
npm run dev

# Start production
pm2 start ecosystem.config.js

# View logs
pm2 logs baldi-api

# Restart app
pm2 restart baldi-api

# Database migrations
npm run prisma:migrate

# Database GUI
npm run prisma:studio

# Backup database
/home/user/scripts/backup-db.sh

# Check health
curl https://api.yourdomain.com/api/v1/health

# Enable maintenance
sudo touch /var/www/maintenance.html

# Disable maintenance
sudo rm /var/www/maintenance.html
```

---

**Happy Coding! 💪🚀**

Need help? Check logs first, then documentation, then create an issue!