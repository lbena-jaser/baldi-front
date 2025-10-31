# Baldi Meals API Documentation

Base URL: `http://localhost:5000/api/v1`

## Authentication

All protected endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <your-access-token>
```

---

## Table of Contents

1. [Authentication Endpoints](#authentication-endpoints)
2. [Two-Factor Authentication (2FA)](#two-factor-authentication-2fa)
3. [Subscription Endpoints](#subscription-endpoints)
4. [Meal Endpoints](#meal-endpoints)
5. [Weekly Menu Endpoints](#weekly-menu-endpoints)
6. [Add-on Endpoints](#add-on-endpoints)
7. [Delivery Endpoints](#delivery-endpoints)
8. [Delivery Address Endpoints](#delivery-address-endpoints)
9. [QR Code Verification](#qr-code-verification)
10. [Payment Endpoints](#payment-endpoints)
11. [Notification Endpoints](#notification-endpoints)
12. [Referral Endpoints](#referral-endpoints)
13. [Discount Endpoints](#discount-endpoints)
14. [Analytics Endpoints (Admin)](#analytics-endpoints-admin)
15. [Webhook Endpoints (Admin)](#webhook-endpoints-admin)
16. [Error Responses](#error-responses)
17. [Rate Limiting](#rate-limiting)

---

## Authentication Endpoints

### Register User
Creates a new customer account.

**Endpoint:** `POST /auth/register`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!",
  "confirmPassword": "Password123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "12345678"
}
```

**Password Requirements:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "phoneNumber": "12345678",
      "role": "CUSTOMER",
      "isActive": true,
      "twoFactorEnabled": false
    },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  },
  "message": "Registration successful"
}
```

### Login
Authenticates a user and returns tokens.

**Endpoint:** `POST /auth/login`

**Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Response (No 2FA):** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  },
  "message": "Login successful"
}
```

**Response (2FA Required):** `200 OK`
```json
{
  "success": true,
  "requiresTwoFactor": true,
  "tempToken": "temporary-jwt-token",
  "message": "Two-factor authentication required"
}
```

### Refresh Token
Gets a new access token using refresh token.

**Endpoint:** `POST /auth/refresh-token`

**Body:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "new-jwt-token",
    "refreshToken": "new-refresh-token"
  },
  "message": "Token refreshed successfully"
}
```

**Note:** Refresh tokens are rotated on each use for security.

### Logout
Revokes the user's refresh token.

**Endpoint:** `POST /auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "refreshToken": "your-refresh-token"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### Get Profile
Gets the authenticated user's profile.

**Endpoint:** `GET /auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "12345678",
    "role": "CUSTOMER",
    "isActive": true,
    "twoFactorEnabled": false,
    "subscriptions": [...],
    "deliveryAddresses": [...]
  }
}
```

### Update Profile
Updates user profile information.

**Endpoint:** `PATCH /auth/profile`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "firstName": "John",
  "lastName": "Smith",
  "phoneNumber": "98765432"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Smith",
    "phoneNumber": "98765432",
    "role": "CUSTOMER"
  },
  "message": "Profile updated successfully"
}
```

### Change Password
Changes user password.

**Endpoint:** `POST /auth/change-password`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!",
  "confirmPassword": "NewPassword123!"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Password changed successfully. Please login again."
  }
}
```

**Note:** All refresh tokens are revoked after password change.

---

## Two-Factor Authentication (2FA)

### Enable 2FA
Generates a secret and QR code for setting up 2FA.

**Endpoint:** `POST /auth/2fa/enable`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "secret": "BASE32-ENCODED-SECRET",
    "qrCode": "data:image/png;base64,...",
    "isAdmin": false
  },
  "message": "Scan the QR code with your authenticator app"
}
```

**Note:** QR code can be scanned with Google Authenticator, Authy, or any TOTP app.

### Verify 2FA Setup
Verifies the setup by checking a TOTP code.

**Endpoint:** `POST /auth/2fa/verify-setup`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "2FA enabled successfully"
  }
}
```

### Verify 2FA at Login
Completes login with 2FA code.

**Endpoint:** `POST /auth/2fa/verify`

**Body:**
```json
{
  "tempToken": "temporary-jwt-from-login",
  "code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "accessToken": "jwt-token",
    "refreshToken": "refresh-token"
  },
  "message": "Two-factor authentication successful"
}
```

### Disable 2FA
Disables 2FA for the account (customers only).

**Endpoint:** `POST /auth/2fa/disable`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "code": "123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "2FA disabled successfully"
  }
}
```

**Note:** Admin accounts cannot disable 2FA.

---

## Subscription Endpoints

### Create Subscription
Creates a new subscription for the user.

**Endpoint:** `POST /subscriptions`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "planType": "FIVE_DAY"
}
```

**Plan Types:**
- `FIVE_DAY` - 5 meals per week
- `SEVEN_DAY` - 7 meals per week

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "planType": "FIVE_DAY",
    "status": "PENDING",
    "firstOrderDate": null,
    "nextDeliveryDate": null,
    "deliveryWeekday": null,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Subscription created successfully"
}
```

### Get User Subscriptions
Gets all subscriptions for the authenticated user.

**Endpoint:** `GET /subscriptions/my-subscriptions`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "planType": "FIVE_DAY",
      "status": "ACTIVE",
      "nextDeliveryDate": "2024-01-08T00:00:00.000Z",
      "deliveries": [...]
    }
  ]
}
```

### Get Active Subscription
Gets the user's active or paused subscription.

**Endpoint:** `GET /subscriptions/active`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "planType": "FIVE_DAY",
    "status": "ACTIVE",
    "nextDeliveryDate": "2024-01-08T00:00:00.000Z",
    "deliveries": [...]
  }
}
```

### Get Subscription by ID
Gets details of a specific subscription.

**Endpoint:** `GET /subscriptions/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "planType": "FIVE_DAY",
    "status": "ACTIVE",
    "firstOrderDate": "2024-01-01T00:00:00.000Z",
    "nextDeliveryDate": "2024-01-08T00:00:00.000Z",
    "deliveryWeekday": 1,
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe"
    },
    "deliveries": [...]
  }
}
```

### Pause Subscription
Pauses an active subscription.

**Endpoint:** `POST /subscriptions/:id/pause`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "PAUSED",
    "pausedAt": "2024-01-05T00:00:00.000Z"
  },
  "message": "Subscription paused successfully"
}
```

### Resume Subscription
Resumes a paused subscription.

**Endpoint:** `POST /subscriptions/:id/resume`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "ACTIVE",
    "pausedAt": null
  },
  "message": "Subscription resumed successfully"
}
```

### Cancel Subscription
Cancels a subscription permanently.

**Endpoint:** `POST /subscriptions/:id/cancel`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "CANCELLED",
    "cancelledAt": "2024-01-05T00:00:00.000Z"
  },
  "message": "Subscription cancelled successfully"
}
```

**Note:** All scheduled deliveries are automatically cancelled.

### Get All Subscriptions (Admin)
Gets all subscriptions in the system.

**Endpoint:** `GET /subscriptions`

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `status` (optional): ACTIVE, PAUSED, CANCELLED, PENDING
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

---

## Meal Endpoints

### Get All Meals
Gets a list of all available meals.

**Endpoint:** `GET /meals`

**Query Parameters:**
- `category` (optional): BULKING or CUTTING
- `isAvailable` (optional): true or false
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 50)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Grilled Chicken",
      "nameAr": "دجاج مشوي",
      "description": "Lean protein meal",
      "category": "CUTTING",
      "price": 12.5,
      "calories": 350,
      "protein": 45,
      "carbs": 20,
      "fats": 10,
      "imageUrl": "/uploads/compressed/...",
      "isAvailable": true
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 50,
    "pages": 1
  }
}
```

### Get Meal by ID
Gets details of a specific meal.

**Endpoint:** `GET /meals/:id`

**Response:** `200 OK`

### Create Meal (Admin)
Creates a new meal with optional image upload.

**Endpoint:** `POST /meals`

**Headers:** `Authorization: Bearer <admin-token>`

**Body:**
```json
{
  "name": "Grilled Chicken",
  "nameAr": "دجاج مشوي",
  "description": "Lean protein meal",
  "descriptionAr": "وجبة بروتين",
  "category": "CUTTING",
  "price": 12.5,
  "calories": 350,
  "protein": 45,
  "carbs": 20,
  "fats": 10,
  "isAvailable": true
}
```

**Note:** For image upload, use `multipart/form-data` with field name `image`.

**Response:** `201 Created`

### Update Meal (Admin)
Updates an existing meal.

**Endpoint:** `PATCH /meals/:id`

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`

### Delete Meal (Admin)
Soft deletes a meal.

**Endpoint:** `DELETE /meals/:id`

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Meal deleted successfully"
  }
}
```

---

## Weekly Menu Endpoints

### Get Current Week Menu
Gets the menu for the current week.

**Endpoint:** `GET /weekly-menu/current`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "weekStartDate": "2024-01-01T00:00:00.000Z",
    "weekEndDate": "2024-01-07T23:59:59.999Z",
    "isActive": true,
    "meals": [
      {
        "id": "uuid",
        "meal": {
          "id": "uuid",
          "name": "Grilled Chicken",
          "category": "CUTTING",
          "price": 12.5
        }
      }
    ]
  }
}
```

### Get Weekly Menu by Date
Gets menu for a specific week.

**Endpoint:** `GET /weekly-menu?weekStartDate=2024-01-01`

**Response:** `200 OK`

### Get All Weekly Menus
Gets list of all weekly menus.

**Endpoint:** `GET /weekly-menus`

**Query Parameters:**
- `page` (optional)
- `limit` (optional)

**Response:** `200 OK`

### Create Weekly Menu (Admin)
Creates a new weekly menu.

**Endpoint:** `POST /weekly-menu`

**Headers:** `Authorization: Bearer <admin-token>`

**Body:**
```json
{
  "weekStartDate": "2024-01-01",
  "mealIds": [
    "meal-uuid-1",
    "meal-uuid-2",
    "meal-uuid-3"
  ]
}
```

**Response:** `201 Created`

### Update Weekly Menu (Admin)
Updates meals in an existing weekly menu.

**Endpoint:** `PATCH /weekly-menu/:id`

**Headers:** `Authorization: Bearer <admin-token>`

**Body:**
```json
{
  "mealIds": [
    "meal-uuid-1",
    "meal-uuid-2",
    "meal-uuid-4"
  ]
}
```

**Response:** `200 OK`

### Delete Weekly Menu (Admin)
Soft deletes a weekly menu.

**Endpoint:** `DELETE /weekly-menu/:id`

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`

---

## Add-on Endpoints

### Get All Add-ons
Gets list of all add-ons.

**Endpoint:** `GET /add-ons`

**Query Parameters:**
- `isAvailable` (optional): true or false
- `page` (optional)
- `limit` (optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Protein Shake",
      "nameAr": "مشروب بروتين",
      "description": "Extra protein supplement",
      "price": 5.0,
      "imageUrl": "/uploads/compressed/...",
      "isAvailable": true
    }
  ],
  "pagination": { ... }
}
```

### Create Add-on (Admin)
Creates a new add-on.

**Endpoint:** `POST /add-ons`

**Headers:** `Authorization: Bearer <admin-token>`

**Body:**
```json
{
  "name": "Protein Shake",
  "nameAr": "مشروب بروتين",
  "description": "Extra protein supplement",
  "descriptionAr": "مكمل بروتين",
  "price": 5.0,
  "isAvailable": true
}
```

**Response:** `201 Created`

### Update Add-on (Admin)
Updates an existing add-on.

**Endpoint:** `PATCH /add-ons/:id`

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`

### Delete Add-on (Admin)
Soft deletes an add-on.

**Endpoint:** `DELETE /add-ons/:id`

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`

---

## Delivery Endpoints

### Create Delivery Order
Creates a new delivery order.

**Endpoint:** `POST /deliveries`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "subscriptionId": "subscription-uuid",
  "deliveryAddressId": "address-uuid",
  "meals": [
    {
      "mealId": "meal-uuid-1",
      "quantity": 5
    },
    {
      "mealId": "meal-uuid-2",
      "quantity": 3
    }
  ],
  "addOns": [
    {
      "addOnId": "addon-uuid-1",
      "quantity": 2
    }
  ],
  "discountCode": "WELCOME10",
  "notes": "Please call before delivery"
}
```

**Validation:**
- Total meals must be between 5 and 20
- At least one meal required
- Meals and add-ons must be available
- Discount code is optional

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "subscriptionId": "uuid",
    "deliveryAddressId": "uuid",
    "scheduledDate": "2024-01-08T00:00:00.000Z",
    "totalMeals": 8,
    "totalPrice": 100.0,
    "discountAmount": 10.0,
    "finalPrice": 90.0,
    "status": "SCHEDULED",
    "deliveryMeals": [...],
    "deliveryAddOns": [...],
    "payment": {
      "id": "uuid",
      "amount": 90.0,
      "status": "PENDING"
    }
  },
  "message": "Delivery created successfully"
}
```

**Note:** First delivery activates the subscription and sets delivery weekday.

### Get User Deliveries
Gets all deliveries for the authenticated user.

**Endpoint:** `GET /deliveries/my-deliveries`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): SCHEDULED, CONFIRMED, PREPARING, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
- `page` (optional)
- `limit` (optional)

**Response:** `200 OK`

### Get Delivery by ID
Gets details of a specific delivery.

**Endpoint:** `GET /deliveries/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "scheduledDate": "2024-01-08T00:00:00.000Z",
    "confirmedDate": null,
    "status": "SCHEDULED",
    "totalMeals": 8,
    "totalPrice": 100.0,
    "discountAmount": 10.0,
    "finalPrice": 90.0,
    "verificationCode": null,
    "qrCode": null,
    "notes": "Please call before delivery",
    "deliveryMeals": [...],
    "deliveryAddOns": [...],
    "deliveryAddress": {...},
    "payment": {...}
  }
}
```

### Update Delivery
Updates a scheduled or confirmed delivery.

**Endpoint:** `PATCH /deliveries/:id`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "deliveryAddressId": "new-address-uuid",
  "meals": [
    {
      "mealId": "meal-uuid-1",
      "quantity": 7
    }
  ],
  "notes": "Updated notes"
}
```

**Note:** Can only update deliveries with status SCHEDULED or CONFIRMED.

**Response:** `200 OK`

### Confirm Delivery
Confirms or cancels a scheduled delivery.

**Endpoint:** `POST /deliveries/:id/confirm`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "confirmed": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "CONFIRMED",
    "confirmedDate": "2024-01-06T10:30:00.000Z",
    "verificationCode": "123456",
    "qrCode": "ABCD1234EF567890"
  },
  "message": "Delivery confirmed successfully"
}
```

**Note:** Generates QR code and 6-digit verification code upon confirmation.

### Get All Deliveries (Admin)
Gets all deliveries in the system.

**Endpoint:** `GET /deliveries`

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `status` (optional)
- `page` (optional)
- `limit` (optional)

**Response:** `200 OK`

### Update Delivery Status (Admin)
Updates the status of a delivery.

**Endpoint:** `PATCH /deliveries/:id/status`

**Headers:** `Authorization: Bearer <admin-token>`

**Body:**
```json
{
  "status": "PREPARING"
}
```

**Valid Statuses:**
- SCHEDULED
- CONFIRMED
- PREPARING
- OUT_FOR_DELIVERY
- DELIVERED
- CANCELLED

**Response:** `200 OK`

---

## Delivery Address Endpoints

### Create Delivery Address
Creates a new delivery address for the user.

**Endpoint:** `POST /addresses`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "label": "Home",
  "fullName": "John Doe",
  "phoneNumber": "12345678",
  "addressLine1": "123 Main Street",
  "addressLine2": "Apt 4B",
  "city": "Tunis",
  "state": "Tunis",
  "postalCode": "1000",
  "isDefault": true
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "userId": "uuid",
    "label": "Home",
    "fullName": "John Doe",
    "phoneNumber": "12345678",
    "addressLine1": "123 Main Street",
    "addressLine2": "Apt 4B",
    "city": "Tunis",
    "state": "Tunis",
    "postalCode": "1000",
    "isDefault": true
  },
  "message": "Delivery address created successfully"
}
```

### Get User Addresses
Gets all delivery addresses for the authenticated user.

**Endpoint:** `GET /addresses`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Update Delivery Address
Updates an existing delivery address.

**Endpoint:** `PATCH /addresses/:id`

**Headers:** `Authorization: Bearer <token>`

**Body:** (all fields optional)
```json
{
  "label": "Office",
  "addressLine1": "456 New Street",
  "isDefault": true
}
```

**Response:** `200 OK`

### Delete Delivery Address
Deletes a delivery address.

**Endpoint:** `DELETE /addresses/:id`

**Headers:** `Authorization: Bearer <token>`

**Note:** Cannot delete address if it's used in upcoming deliveries.

**Response:** `200 OK`

---

## QR Code Verification

### Get Verification Details
Gets QR code and verification code for a confirmed delivery.

**Endpoint:** `GET /deliveries/:id/verification`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "deliveryId": "uuid",
    "verificationCode": "123456",
    "qrCode": "ABCD1234EF567890",
    "scheduledDate": "2024-01-08T00:00:00.000Z",
    "status": "CONFIRMED"
  }
}
```

**Note:** Delivery must be confirmed first to generate verification details.

### Verify Delivery (Delivery Guy)
Verifies and marks a delivery as delivered using QR code or verification code.

**Endpoint:** `POST /deliveries/verify`

**Headers:** `Authorization: Bearer <delivery-guy-token>`

**Body:**
```json
{
  "qrCode": "ABCD1234EF567890"
}
```

**OR**

```json
{
  "verificationCode": "123456"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "DELIVERED",
    "subscription": {
      "nextDeliveryDate": "2024-01-15T00:00:00.000Z"
    }
  },
  "message": "Delivery verified and marked as delivered successfully"
}
```

**Note:** Automatically schedules next delivery for same weekday next week.

---

## Payment Endpoints

### Initiate Payment
Initiates a payment for a delivery.

**Endpoint:** `POST /payments/initiate`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "deliveryId": "delivery-uuid"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "amount": 90.0,
    "status": "PENDING"
  },
  "message": "Payment initiated"
}
```

### Process Payment
Processes a payment (customer completes payment).

**Endpoint:** `POST /payments/:id/process`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "transactionId": "TXN123456",
  "paymentMethod": "local_gateway"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "COMPLETED",
    "transactionId": "TXN123456",
    "paymentDate": "2024-01-06T10:30:00.000Z"
  },
  "message": "Payment processed successfully"
}
```

### Get Payment by ID
Gets details of a specific payment.

**Endpoint:** `GET /payments/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`

### Get User Payments
Gets all payments for the authenticated user.

**Endpoint:** `GET /payments/my-payments`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): PENDING, COMPLETED, FAILED, REFUNDED
- `page` (optional)
- `limit` (optional)

**Response:** `200 OK`

### Get Payment Statistics
Gets payment statistics for the authenticated user.

**Endpoint:** `GET /payments/stats`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "total": 15,
    "completed": 12,
    "pending": 2,
    "failed": 1,
    "totalAmount": 1260.0
  }
}
```

### Get All Payments (Admin)
Gets all payments in the system.

**Endpoint:** `GET /payments`

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `status` (optional)
- `page` (optional)
- `limit` (optional)

**Response:** `200 OK`

### Get All Payment Statistics (Admin)
Gets payment statistics for all users.

**Endpoint:** `GET /payments/admin/stats`

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`

### Get Pending Payments (Admin)
Gets all pending payments.

**Endpoint:** `GET /payments/pending/all`

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`

### Update Payment Status (Admin)
Updates the status of a payment.

**Endpoint:** `PATCH /payments/:id/status`

**Headers:** `Authorization: Bearer <admin-token>`

**Body:**
```json
{
  "status": "COMPLETED",
  "transactionId": "TXN123456"
}
```

**Response:** `200 OK`

### Refund Payment (Admin)
Refunds a completed payment.

**Endpoint:** `POST /payments/:id/refund`

**Headers:** `Authorization: Bearer <admin-token>`

**Body:**
```json
{
  "reason": "Customer cancelled delivery"
}
```

**Response:** `200 OK`

### Payment Gateway Callback
Handles callbacks from the payment gateway (webhook).

**Endpoint:** `POST /payments/callback`

**Note:** This is a public endpoint used by the payment gateway.

**Body:** (depends on payment gateway)
```json
{
  "transactionId": "TXN123456",
  "status": "success",
  "paymentId": "payment-uuid"
}
```

**Response:** `200 OK`

---

## Notification Endpoints

### Get Notifications
Gets all notifications for the authenticated user.

**Endpoint:** `GET /notifications`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` (optional): UNREAD, READ, ARCHIVED
- `type` (optional): DELIVERY_REMINDER, PAYMENT_COMPLETED, etc.
- `page` (optional)
- `limit` (optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "type": "DELIVERY_REMINDER",
      "title": "Upcoming Delivery Reminder",
      "message": "Your delivery is scheduled for Monday, January 8, 2024",
      "data": {
        "deliveryId": "uuid",
        "scheduledDate": "2024-01-08T00:00:00.000Z"
      },
      "status": "UNREAD",
      "readAt": null,
      "createdAt": "2024-01-06T09:00:00.000Z"
    }
  ],
  "unreadCount": 5,
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 20,
    "pages": 2
  }
}
```

**Notification Types:**
- DELIVERY_REMINDER
- DELIVERY_CONFIRMED
- DELIVERY_OUT_FOR_DELIVERY
- DELIVERY_DELIVERED
- PAYMENT_PENDING
- PAYMENT_COMPLETED
- PAYMENT_FAILED
- SUBSCRIPTION_PAUSED
- SUBSCRIPTION_RESUMED
- SUBSCRIPTION_CANCELLED
- REFERRAL_REWARD
- DISCOUNT_APPLIED
- SYSTEM_ANNOUNCEMENT

### Get Unread Count
Gets the count of unread notifications.

**Endpoint:** `GET /notifications/unread-count`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

### Mark as Read
Marks a specific notification as read.

**Endpoint:** `PATCH /notifications/:id/read`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "READ",
    "readAt": "2024-01-06T10:30:00.000Z"
  }
}
```

### Mark All as Read
Marks all unread notifications as read.

**Endpoint:** `PATCH /notifications/read-all`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

### Archive Notification
Archives a notification.

**Endpoint:** `PATCH /notifications/:id/archive`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "status": "ARCHIVED"
  }
}
```

### Delete Notification
Deletes a notification permanently.

**Endpoint:** `DELETE /notifications/:id`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Notification deleted successfully"
  }
}
```

### Broadcast Notification (Admin)
Sends a system announcement to all active users.

**Endpoint:** `POST /notifications/broadcast`

**Headers:** `Authorization: Bearer <admin-token>`

**Body:**
```json
{
  "title": "System Maintenance",
  "message": "The system will be under maintenance from 2 AM to 4 AM."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "count": 150
  },
  "message": "Notification broadcast to 150 users"
}
```

### Stream Notifications (SSE)
Real-time notification stream using Server-Sent Events.

**Endpoint:** `GET /notifications/stream`

**Headers:** `Authorization: Bearer <token>`

**Response:** `text/event-stream`

**Note:** This endpoint establishes a persistent connection for real-time notifications.

---

## Referral Endpoints

### Create Referral Code
Generates a unique referral code for the user.

**Endpoint:** `POST /referrals`

**Headers:** `Authorization: Bearer <token>`

**Body:** (optional)
```json
{
  "maxUsage": 5,
  "discountPercent": 10,
  "expiryDays": 90
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "referrerId": "uuid",
    "referralCode": "ABCD1234",
    "status": "PENDING",
    "usageCount": 0,
    "maxUsage": 5,
    "discountPercent": 10,
    "expiresAt": "2024-04-01T00:00:00.000Z",
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Referral code created successfully"
}
```

**Note:** If user already has an active referral code, returns existing code.

### Get My Referrals
Gets all referral codes created by the user.

**Endpoint:** `GET /referrals/my-referrals`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "referralCode": "ABCD1234",
      "status": "PENDING",
      "usageCount": 2,
      "maxUsage": 5,
      "discountPercent": 10,
      "expiresAt": "2024-04-01T00:00:00.000Z"
    }
  ]
}
```

### Get Referral Stats
Gets referral statistics for the user.

**Endpoint:** `GET /referrals/my-stats`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalReferrals": 3,
    "activeReferrals": 1,
    "completedReferrals": 2,
    "totalUses": 12
  }
}
```

### Get My Referral Discount
Checks if user has an active referral discount.

**Endpoint:** `GET /referrals/my-discount`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "hasDiscount": true,
    "discountPercent": 10,
    "referralCode": "XYZ9876"
  }
}
```

### Get Referral by Code
Gets referral details by code.

**Endpoint:** `GET /referrals/code/:code`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "referralCode": "ABCD1234",
    "discountPercent": 10,
    "usageCount": 2,
    "maxUsage": 5,
    "expiresAt": "2024-04-01T00:00:00.000Z",
    "referrer": {
      "firstName": "John",
      "lastName": "Doe"
    }
  }
}
```

### Apply Referral Code
Applies a referral code to the user's account.

**Endpoint:** `POST /referrals/apply`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "referralCode": "ABCD1234"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "referral": {
      "id": "uuid",
      "referralCode": "ABCD1234",
      "usageCount": 3
    },
    "discount": 10
  },
  "message": "Referral code applied successfully. You earned 10% discount!"
}
```

**Validation:**
- Cannot use own referral code
- Can only use one referral code per account
- Code must not be expired
- Code must not have reached max usage

### Get All Referrals (Admin)
Gets all referrals in the system.

**Endpoint:** `GET /referrals`

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `status` (optional): PENDING, COMPLETED, EXPIRED
- `page` (optional)
- `limit` (optional)

**Response:** `200 OK`

### Update Referral (Admin)
Updates a referral.

**Endpoint:** `PATCH /referrals/:id`

**Headers:** `Authorization: Bearer <admin-token>`

**Body:**
```json
{
  "maxUsage": 10,
  "discountPercent": 15
}
```

**Response:** `200 OK`

### Delete Referral (Admin)
Deletes a referral.

**Endpoint:** `DELETE /referrals/:id`

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`

---

## Discount Endpoints

### Validate Discount Code
Validates a discount code for an order.

**Endpoint:** `POST /discounts/validate`

**Headers:** `Authorization: Bearer <token>`

**Body:**
```json
{
  "code": "WELCOME10",
  "orderAmount": 100.0
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "discount": {
      "id": "uuid",
      "code": "WELCOME10",
      "type": "PERCENTAGE",
      "value": 10,
      "minOrderAmount": 50.0,
      "maxDiscount": 20.0
    },
    "discountAmount": 10.0,
    "finalAmount": 90.0
  },
  "message": "Discount code is valid"
}
```

**Validation:**
- Code must be active and not expired
- Usage limit not reached
- Minimum order amount met (if applicable)
- User hasn't used this code before

### Get Active Discounts
Gets all currently active discount codes.

**Endpoint:** `GET /discounts/active`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "code": "WELCOME10",
      "type": "PERCENTAGE",
      "value": 10,
      "minOrderAmount": 50.0,
      "maxDiscount": 20.0,
      "startsAt": "2024-01-01T00:00:00.000Z",
      "expiresAt": "2024-12-31T23:59:59.999Z"
    }
  ]
}
```

### Get My Discount Usages
Gets discount usage history for the user.

**Endpoint:** `GET /discounts/my-usages`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "amount": 10.0,
      "createdAt": "2024-01-05T10:00:00.000Z",
      "discount": {
        "code": "WELCOME10",
        "type": "PERCENTAGE",
        "value": 10
      },
      "delivery": {
        "id": "uuid",
        "scheduledDate": "2024-01-08T00:00:00.000Z",
        "totalPrice": 100.0
      }
    }
  ]
}
```

### Create Discount (Admin)
Creates a new discount code.

**Endpoint:** `POST /discounts`

**Headers:** `Authorization: Bearer <admin-token>`

**Body:**
```json
{
  "code": "SUMMER20",
  "type": "PERCENTAGE",
  "value": 20,
  "minOrderAmount": 75.0,
  "maxDiscount": 30.0,
  "usageLimit": 100,
  "startsAt": "2024-06-01T00:00:00.000Z",
  "expiresAt": "2024-08-31T23:59:59.999Z"
}
```

**Discount Types:**
- `PERCENTAGE` - Percentage discount (value = percentage)
- `FIXED_AMOUNT` - Fixed amount discount (value = amount in TND)

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "code": "SUMMER20",
    "type": "PERCENTAGE",
    "value": 20,
    "minOrderAmount": 75.0,
    "maxDiscount": 30.0,
    "usageLimit": 100,
    "usedCount": 0,
    "isActive": true,
    "startsAt": "2024-06-01T00:00:00.000Z",
    "expiresAt": "2024-08-31T23:59:59.999Z"
  },
  "message": "Discount created successfully"
}
```

### Get All Discounts (Admin)
Gets all discount codes.

**Endpoint:** `GET /discounts`

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `isActive` (optional): true or false
- `type` (optional): PERCENTAGE or FIXED_AMOUNT
- `page` (optional)
- `limit` (optional)

**Response:** `200 OK`

### Get Discount Stats (Admin)
Gets discount usage statistics.

**Endpoint:** `GET /discounts/stats`

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalDiscounts": 25,
    "activeDiscounts": 10,
    "totalUsages": 543,
    "totalSavings": 12650.0
  }
}
```

### Get Discount (Admin)
Gets details of a specific discount.

**Endpoint:** `GET /discounts/:id`

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`

### Get Discount Usages (Admin)
Gets usage history for a specific discount.

**Endpoint:** `GET /discounts/:id/usages`

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `page` (optional)
- `limit` (optional)

**Response:** `200 OK`

### Update Discount (Admin)
Updates a discount code.

**Endpoint:** `PATCH /discounts/:id`

**Headers:** `Authorization: Bearer <admin-token>`

**Body:**
```json
{
  "usageLimit": 200,
  "isActive": false
}
```

**Response:** `200 OK`

### Delete Discount (Admin)
Soft deletes a discount code.

**Endpoint:** `DELETE /discounts/:id`

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`

---

## Analytics Endpoints (Admin)

All analytics endpoints require admin authentication and view permission.

### Dashboard Overview
Gets high-level overview statistics.

**Endpoint:** `GET /admin/analytics/dashboard`

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "today": {
      "revenue": 450.0,
      "deliveries": 8,
      "newUsers": 3
    },
    "thisMonth": {
      "revenue": 12500.0,
      "deliveries": 245,
      "newUsers": 45
    },
    "activeUsers": 350,
    "activeSubscriptions": 280,
    "pendingDeliveries": 52,
    "pendingPayments": 18
  }
}
```

### Revenue Overview
Gets revenue analytics with growth rates.

**Endpoint:** `GET /admin/analytics/revenue`

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `startDate` (optional): Start date (YYYY-MM-DD)
- `endDate` (optional): End date (YYYY-MM-DD)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalRevenue": 25000.0,
    "totalDeliveries": 450,
    "totalNewUsers": 85,
    "revenueGrowth": 15.5,
    "dailyData": [
      {
        "date": "2024-01-01",
        "totalRevenue": 850.0,
        "deliveryCount": 15,
        "newUsers": 3,
        "activeSubscriptions": 280
      }
    ]
  }
}
```

### Popular Meals
Gets most ordered meals.

**Endpoint:** `GET /admin/analytics/popular-meals`

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)
- `limit` (optional): Default 10

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "meal": {
        "id": "uuid",
        "name": "Grilled Chicken",
        "category": "CUTTING",
        "price": 12.5
      },
      "ordersCount": 245,
      "quantitySold": 1850,
      "revenue": 23125.0
    }
  ]
}
```

### User Growth
Gets user growth statistics.

**Endpoint:** `GET /admin/analytics/user-growth`

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `period` (optional): daily, weekly, monthly (default: daily)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalUsers": 450,
    "growthRate": 12.5,
    "data": [
      {
        "date": "2024-01-01",
        "newUsers": 5
      }
    ]
  }
}
```

### Subscription Stats
Gets subscription statistics.

**Endpoint:** `GET /admin/analytics/subscriptions`

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalSubscriptions": 350,
    "activeSubscriptions": 280,
    "pausedSubscriptions": 45,
    "cancelledSubscriptions": 25,
    "planDistribution": {
      "FIVE_DAY": 180,
      "SEVEN_DAY": 100
    },
    "retentionRate": "80.00"
  }
}
```

### Payment Stats
Gets payment statistics.

**Endpoint:** `GET /admin/analytics/payments`

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalPayments": 580,
    "completedPayments": 545,
    "pendingPayments": 25,
    "failedPayments": 10,
    "totalRevenue": 68250.0,
    "successRate": 93.97,
    "methodDistribution": {
      "local_gateway": {
        "count": 545,
        "revenue": 68250.0
      }
    }
  }
}
```

### Delivery Stats
Gets delivery statistics.

**Endpoint:** `GET /admin/analytics/deliveries`

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `startDate` (optional)
- `endDate` (optional)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalDeliveries": 520,
    "deliveredCount": 485,
    "cancelledCount": 15,
    "completionRate": 93.27,
    "statusDistribution": {
      "DELIVERED": 485,
      "OUT_FOR_DELIVERY": 12,
      "CONFIRMED": 8,
      "SCHEDULED": 0,
      "CANCELLED": 15
    }
  }
}
```

### Expected Revenue
Gets future revenue projections.

**Endpoint:** `GET /admin/analytics/expected-revenue`

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `daysAhead` (optional): Default 30

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalExpectedRevenue": 15500.0,
    "scheduledDeliveriesCount": 125,
    "weeklyBreakdown": [
      {
        "week": "2024-01-08",
        "expectedRevenue": 3850.0
      }
    ]
  }
}
```

### Export Analytics
Exports analytics data in CSV or PDF format.

**Endpoint:** `GET /admin/analytics/export`

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `type` (required): revenue or meals
- `format` (required): csv or pdf
- `startDate` (optional)
- `endDate` (optional)

**Response:** `200 OK`
- Content-Type: `text/csv` or `application/pdf`
- Content-Disposition: `attachment; filename="..."`

**Example:**
```
GET /admin/analytics/export?type=revenue&format=csv&startDate=2024-01-01&endDate=2024-01-31
```

**Note:** PDF export requires additional configuration (pdfkit library).

---

## Webhook Endpoints (Admin)

All webhook endpoints require admin authentication with webhook permissions.

### Create Webhook
Creates a new webhook subscription.

**Endpoint:** `POST /admin/webhooks`

**Headers:** `Authorization: Bearer <admin-token>`

**Body:**
```json
{
  "url": "https://your-server.com/webhooks/baldi",
  "event": "DELIVERY_DELIVERED",
  "secret": "your-secret-key"
}
```

**Webhook Events:**
- DELIVERY_SCHEDULED
- DELIVERY_CONFIRMED
- DELIVERY_OUT_FOR_DELIVERY
- DELIVERY_DELIVERED
- DELIVERY_CANCELLED
- PAYMENT_COMPLETED
- PAYMENT_FAILED
- PAYMENT_REFUNDED
- SUBSCRIPTION_CREATED
- SUBSCRIPTION_CANCELLED
- USER_REGISTERED

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "url": "https://your-server.com/webhooks/baldi",
    "event": "DELIVERY_DELIVERED",
    "secret": "your-secret-key",
    "isActive": true,
    "failureCount": 0,
    "createdAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "Webhook created successfully"
}
```

**Webhook Payload Format:**
```json
{
  "event": "DELIVERY_DELIVERED",
  "timestamp": "2024-01-08T15:30:00.000Z",
  "data": {
    "deliveryId": "uuid",
    "deliveredDate": "2024-01-08T15:30:00.000Z"
  }
}
```

**Security:**
- Webhooks include `X-Webhook-Signature` header (HMAC-SHA256)
- Verify signature using your secret key

### Get All Webhooks
Gets all webhook subscriptions.

**Endpoint:** `GET /admin/webhooks`

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `event` (optional)
- `isActive` (optional): true or false
- `page` (optional)
- `limit` (optional)

**Response:** `200 OK`

### Get Webhook Stats
Gets webhook statistics.

**Endpoint:** `GET /admin/webhooks/stats`

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalWebhooks": 15,
    "activeWebhooks": 12,
    "totalLogs": 3542,
    "successfulLogs": 3485,
    "failedLogs": 57,
    "successRate": 98.39
  }
}
```

### Get Webhook
Gets details of a specific webhook.

**Endpoint:** `GET /admin/webhooks/:id`

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`

### Get Webhook Logs
Gets delivery logs for a webhook.

**Endpoint:** `GET /admin/webhooks/:id/logs`

**Headers:** `Authorization: Bearer <admin-token>`

**Query Parameters:**
- `success` (optional): true or false
- `page` (optional)
- `limit` (optional): Default 50

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "event": "DELIVERY_DELIVERED",
      "statusCode": 200,
      "response": "OK",
      "success": true,
      "createdAt": "2024-01-08T15:30:05.000Z"
    }
  ],
  "pagination": { ... }
}
```

### Test Webhook
Sends a test payload to the webhook URL.

**Endpoint:** `POST /admin/webhooks/:id/test`

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Test webhook sent successfully"
  }
}
```

### Retry Failed Webhook
Retries a failed webhook delivery.

**Endpoint:** `POST /admin/webhooks/:logId/retry`

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "success": true,
    "message": "Webhook retry successful"
  }
}
```

### Update Webhook
Updates webhook configuration.

**Endpoint:** `PATCH /admin/webhooks/:id`

**Headers:** `Authorization: Bearer <admin-token>`

**Body:**
```json
{
  "url": "https://new-url.com/webhooks",
  "isActive": false
}
```

**Response:** `200 OK`

### Delete Webhook
Soft deletes a webhook.

**Endpoint:** `DELETE /admin/webhooks/:id`

**Headers:** `Authorization: Bearer <admin-token>`

**Response:** `200 OK`

**Note:** Webhooks are automatically deactivated after 10 consecutive failures.

---

## Error Responses

All endpoints may return error responses in the following format:

### 400 Bad Request
```json
{
  "success": false,
  "error": "Invalid request data"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": "Not authorized, no token provided"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": "You do not have permission to perform this action"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Resource not found"
}
```

### 409 Conflict
```json
{
  "success": false,
  "error": "Email already registered"
}
```

### 422 Validation Error
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    {
      "field": "email",
      "message": "Please provide a valid email address"
    },
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": "Too many requests from this IP, please try again later"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Internal server error"
}
```

---

## Rate Limiting

### General API
- **Limit:** 100 requests per 15 minutes per IP
- **Applies to:** All endpoints except auth

### Authentication Endpoints
- **Limit:** 5 requests per 15 minutes per IP
- **Applies to:** `/auth/login`, `/auth/register`, `/auth/2fa/*`
- **Note:** Successful requests don't count toward the limit

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704196800
```

---

---

## Pagination

Endpoints that return lists support pagination:

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default varies by endpoint)

**Response Format:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 20,
    "pages": 8
  }
}
```

---

## Health Check

### Check API Health
Verifies that the API is running and responsive.

**Endpoint:** `GET /health`

**Authentication:** Not required

**Response:** `200 OK`
```json
{
  "success": true,
  "message": "Baldi API is running",
  "timestamp": "2024-01-08T10:30:00.000Z"
}
```

---

## Authentication Flows

### Standard Login Flow

```
1. POST /auth/login
   ├─ No 2FA → Returns access + refresh tokens
   └─ 2FA Required → Returns temp token
      └─ POST /auth/2fa/verify → Returns access + refresh tokens

2. Use access token for authenticated requests
   └─ Token expires after 7 days

3. POST /auth/refresh-token (before expiration)
   └─ Returns new access + refresh tokens
```

### First Time User Flow

```
1. POST /auth/register
   └─ Returns access + refresh tokens

2. POST /subscriptions
   └─ Create FIVE_DAY or SEVEN_DAY subscription (status: PENDING)

3. POST /addresses
   └─ Add delivery address

4. POST /deliveries
   └─ Create first delivery order
   └─ Subscription becomes ACTIVE
   └─ Payment created (status: PENDING)

5. POST /payments/:id/process
   └─ Complete payment
   └─ Payment status: COMPLETED

6. POST /deliveries/:id/confirm (with confirmed: true)
   └─ Delivery status: CONFIRMED
   └─ Generates QR code & verification code
   └─ Email sent with confirmation

7. Admin updates delivery status:
   - PREPARING → OUT_FOR_DELIVERY → DELIVERED

8. POST /deliveries/verify (by delivery guy)
   └─ Delivery status: DELIVERED
   └─ Next delivery scheduled automatically
```

### Admin Setup Flow

```
1. Register normal user via POST /auth/register

2. Update user role in database:
   UPDATE users SET role = 'SUPER_ADMIN' WHERE email = 'admin@example.com';

3. POST /auth/login
   └─ Login as admin

4. POST /auth/2fa/enable
   └─ Scan QR code with authenticator app

5. POST /auth/2fa/verify-setup (with 6-digit code)
   └─ 2FA enabled (mandatory for admins)

6. Future logins require 2FA:
   POST /auth/login → POST /auth/2fa/verify
```

---

## Webhook Implementation Guide

### Setting Up Webhooks

**1. Create Webhook Endpoint on Your Server**

```javascript
// Express.js example
const crypto = require('crypto');

app.post('/webhooks/baldi', (req, res) => {
  // Get signature from header
  const signature = req.headers['x-webhook-signature'];
  const event = req.headers['x-webhook-event'];
  
  // Verify signature
  const expectedSignature = crypto
    .createHmac('sha256', YOUR_WEBHOOK_SECRET)
    .update(JSON.stringify(req.body))
    .digest('hex');
  
  if (signature !== expectedSignature) {
    return res.status(401).send('Invalid signature');
  }
  
  // Process webhook event
  console.log('Webhook event:', event);
  console.log('Payload:', req.body);
  
  // Handle specific events
  switch (event) {
    case 'DELIVERY_DELIVERED':
      // Update your database, send notifications, etc.
      break;
    case 'PAYMENT_COMPLETED':
      // Process payment confirmation
      break;
    // ... handle other events
  }
  
  // Respond with 200 OK
  res.status(200).send('OK');
});
```

**2. Register Webhook in Baldi API**

```bash
curl -X POST https://api.baldimeals.com/api/v1/admin/webhooks \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://your-server.com/webhooks/baldi",
    "event": "DELIVERY_DELIVERED",
    "secret": "your-secret-key"
  }'
```

**3. Test Your Webhook**

```bash
curl -X POST https://api.baldimeals.com/api/v1/admin/webhooks/:id/test \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

### Webhook Payload Examples

**DELIVERY_DELIVERED:**
```json
{
  "event": "DELIVERY_DELIVERED",
  "timestamp": "2024-01-08T15:30:00.000Z",
  "data": {
    "deliveryId": "uuid",
    "deliveredDate": "2024-01-08T15:30:00.000Z"
  }
}
```

**PAYMENT_COMPLETED:**
```json
{
  "event": "PAYMENT_COMPLETED",
  "timestamp": "2024-01-06T10:30:00.000Z",
  "data": {
    "paymentId": "uuid",
    "amount": 90.0,
    "paymentDate": "2024-01-06T10:30:00.000Z",
    "transactionId": "TXN123456"
  }
}
```

**USER_REGISTERED:**
```json
{
  "event": "USER_REGISTERED",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "registeredDate": "2024-01-01T12:00:00.000Z"
  }
}
```

### Webhook Best Practices

1. **Always verify the signature** before processing the payload
2. **Respond quickly** (within 10 seconds) to avoid timeouts
3. **Process asynchronously** - queue the webhook for background processing
4. **Handle retries** - Baldi will retry failed webhooks automatically
5. **Log all webhooks** for debugging and audit purposes
6. **Use HTTPS** for your webhook endpoint
7. **Monitor failure rates** in the webhook dashboard

---

## Postman Collection Setup

### Environment Variables

Create a new environment in Postman with these variables:

```json
{
  "base_url": "http://localhost:5000/api/v1",
  "access_token": "",
  "refresh_token": "",
  "admin_token": "",
  "delivery_guy_token": "",
  "user_id": "",
  "subscription_id": "",
  "delivery_id": "",
  "address_id": "",
  "meal_id": "",
  "payment_id": ""
}
```

### Pre-request Scripts

**For authenticated requests:**
```javascript
pm.request.headers.add({
  key: 'Authorization',
  value: 'Bearer ' + pm.environment.get('access_token')
});
```

**Auto-save tokens after login:**
```javascript
// In the "Tests" tab of login request
const response = pm.response.json();

if (response.success && response.data.accessToken) {
  pm.environment.set('access_token', response.data.accessToken);
  pm.environment.set('refresh_token', response.data.refreshToken);
  pm.environment.set('user_id', response.data.user.id);
}
```

### Collection Structure

```
Baldi Meals API/
├── Auth/
│   ├── Register
│   ├── Login
│   ├── Refresh Token
│   ├── Get Profile
│   ├── Update Profile
│   ├── Change Password
│   └── 2FA/
│       ├── Enable 2FA
│       ├── Verify Setup
│       ├── Verify Login
│       └── Disable 2FA
├── Subscriptions/
│   ├── Create Subscription
│   ├── Get My Subscriptions
│   ├── Get Active Subscription
│   ├── Pause Subscription
│   ├── Resume Subscription
│   └── Cancel Subscription
├── Meals & Menus/
├── Deliveries/
├── Payments/
├── Notifications/
├── Referrals/
├── Discounts/
├── Analytics (Admin)/
└── Webhooks (Admin)/
```

---

## Testing Guide

### Unit Testing Example

```javascript
// Example using Jest and Supertest
const request = require('supertest');
const app = require('../src/app');

describe('Authentication', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'test@example.com',
        password: 'Test123!@#',
        confirmPassword: 'Test123!@#',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '12345678'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data).toHaveProperty('refreshToken');
  });

  it('should login successfully', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'test@example.com',
        password: 'Test123!@#'
      });
    
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});
```

### Manual Testing Checklist

**Authentication:**
- [ ] Register new user
- [ ] Login with valid credentials
- [ ] Login with invalid credentials
- [ ] Refresh access token
- [ ] Enable 2FA
- [ ] Login with 2FA
- [ ] Disable 2FA
- [ ] Change password

**Subscription Flow:**
- [ ] Create subscription
- [ ] Create first delivery (activates subscription)
- [ ] Pause subscription
- [ ] Resume subscription
- [ ] Cancel subscription

**Delivery Flow:**
- [ ] Create delivery order
- [ ] Update delivery before confirmation
- [ ] Confirm delivery
- [ ] Verify QR code can be generated
- [ ] Update delivery status (admin)
- [ ] Verify delivery (delivery guy)

**Payment Flow:**
- [ ] Initiate payment
- [ ] Process payment
- [ ] Verify payment completion triggers notification
- [ ] Admin: Refund payment

**Notifications:**
- [ ] Delivery reminder sent (2 days before)
- [ ] Payment reminder sent
- [ ] Confirm notification on delivery confirmation
- [ ] Mark notification as read
- [ ] Mark all as read

**Referrals:**
- [ ] Create referral code
- [ ] Apply referral code
- [ ] Verify discount applied
- [ ] Check referral usage limits

**Discounts:**
- [ ] Create discount code (admin)
- [ ] Validate discount code
- [ ] Apply discount to order
- [ ] Verify one-time use per user

---

## Best Practices

### Security

1. **Never expose tokens in URLs** - always use Authorization header
2. **Store tokens securely** - use secure storage (not localStorage for sensitive apps)
3. **Implement token refresh** before expiration to maintain seamless UX
4. **Enable 2FA for all admin accounts** - it's mandatory and enforced
5. **Rotate secrets regularly** - especially webhook secrets and JWT keys
6. **Use HTTPS in production** - never transmit tokens over HTTP
7. **Implement rate limiting** on client side to avoid hitting API limits
8. **Validate all inputs** client-side before sending to API
9. **Handle errors gracefully** - don't expose sensitive error details to users
10. **Log security events** - failed logins, permission denials, etc.

### Performance

1. **Use pagination** for all list endpoints to reduce payload size
2. **Cache responses** where appropriate (meals, menus, etc.)
3. **Implement request debouncing** for search/filter operations
4. **Batch operations** when possible instead of multiple single requests
5. **Compress images** before upload to reduce bandwidth
6. **Use conditional requests** (ETag, If-Modified-Since) when available
7. **Implement retry logic** with exponential backoff for failed requests
8. **Monitor API response times** and optimize slow endpoints
9. **Use CDN** for static assets (images, etc.)
10. **Implement request pooling** to reuse connections

### Error Handling

1. **Always check response status** before processing data
2. **Implement global error handler** to catch all API errors
3. **Display user-friendly messages** - translate technical errors
4. **Log errors** with context for debugging
5. **Implement offline mode** where possible
6. **Handle network failures** gracefully
7. **Validate data** before and after API calls
8. **Use try-catch blocks** for all async operations
9. **Implement fallback values** for failed requests
10. **Show appropriate error messages** based on status codes

### Data Management

1. **Normalize data** in client state management
2. **Update local state optimistically** for better UX
3. **Sync with server** after optimistic updates
4. **Handle conflicts** when optimistic updates fail
5. **Cache frequently accessed data** (user profile, active subscription)
6. **Invalidate cache** when data changes
7. **Implement background sync** for pending operations
8. **Use webhooks** for real-time updates when possible
9. **Batch notifications** to reduce API calls
10. **Clean up old data** regularly to free memory

### API Integration

1. **Create API client layer** to abstract API calls
2. **Use environment variables** for API URLs and keys
3. **Implement request interceptors** for common headers/auth
4. **Add response interceptors** for error handling
5. **Type all API responses** (TypeScript) for type safety
6. **Document all endpoints** used in your application
7. **Version your API client** separately from the app
8. **Test API integration** thoroughly
9. **Monitor API usage** and costs
10. **Have fallback strategies** for API downtime

---

## Common Use Cases

### Use Case 1: New Customer Registration & First Order

```bash
# 1. Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123!",
    "confirmPassword": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "phoneNumber": "12345678"
  }'
# Save access_token from response

# 2. Create subscription
curl -X POST http://localhost:5000/api/v1/subscriptions \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{"planType": "FIVE_DAY"}'
# Save subscription_id

# 3. Add delivery address
curl -X POST http://localhost:5000/api/v1/addresses \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "label": "Home",
    "fullName": "John Doe",
    "phoneNumber": "12345678",
    "addressLine1": "123 Main St",
    "city": "Tunis",
    "isDefault": true
  }'
# Save address_id

# 4. Create first delivery
curl -X POST http://localhost:5000/api/v1/deliveries \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "{subscription_id}",
    "deliveryAddressId": "{address_id}",
    "meals": [
      {"mealId": "{meal_id}", "quantity": 5}
    ],
    "notes": "Please call before delivery"
  }'
# Save delivery_id and payment_id

# 5. Process payment
curl -X POST http://localhost:5000/api/v1/payments/{payment_id}/process \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "transactionId": "TXN123456",
    "paymentMethod": "local_gateway"
  }'

# 6. Confirm delivery
curl -X POST http://localhost:5000/api/v1/deliveries/{delivery_id}/confirm \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{"confirmed": true}'
```

### Use Case 2: Weekly Order Management

```bash
# 1. Check active subscription
curl -X GET http://localhost:5000/api/v1/subscriptions/active \
  -H "Authorization: Bearer {access_token}"

# 2. View current week menu
curl -X GET http://localhost:5000/api/v1/weekly-menu/current

# 3. Create next week's delivery
curl -X POST http://localhost:5000/api/v1/deliveries \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "{subscription_id}",
    "deliveryAddressId": "{address_id}",
    "meals": [
      {"mealId": "{meal_id_1}", "quantity": 3},
      {"mealId": "{meal_id_2}", "quantity": 2}
    ]
  }'

# 4. Update delivery before confirmation
curl -X PATCH http://localhost:5000/api/v1/deliveries/{delivery_id} \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "meals": [
      {"mealId": "{meal_id_1}", "quantity": 5}
    ]
  }'
```

### Use Case 3: Apply Referral & Discount

```bash
# 1. Get referral code from friend
# Friend creates referral:
curl -X POST http://localhost:5000/api/v1/referrals \
  -H "Authorization: Bearer {friend_access_token}"
# Returns: {"referralCode": "ABCD1234"}

# 2. New user applies referral
curl -X POST http://localhost:5000/api/v1/referrals/apply \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{"referralCode": "ABCD1234"}'

# 3. Check discount
curl -X GET http://localhost:5000/api/v1/referrals/my-discount \
  -H "Authorization: Bearer {access_token}"

# 4. Apply additional discount code on order
curl -X POST http://localhost:5000/api/v1/deliveries \
  -H "Authorization: Bearer {access_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "subscriptionId": "{subscription_id}",
    "deliveryAddressId": "{address_id}",
    "meals": [...],
    "discountCode": "WELCOME10"
  }'
```

### Use Case 4: Delivery Guy Verification

```bash
# Delivery guy scans QR code and verifies delivery
curl -X POST http://localhost:5000/api/v1/deliveries/verify \
  -H "Authorization: Bearer {delivery_guy_token}" \
  -H "Content-Type: application/json" \
  -d '{"qrCode": "ABCD1234EF567890"}'

# OR verify with 6-digit code
curl -X POST http://localhost:5000/api/v1/deliveries/verify \
  -H "Authorization: Bearer {delivery_guy_token}" \
  -H "Content-Type: application/json" \
  -d '{"verificationCode": "123456"}'
```

---

## API Versioning

**Current Version:** v1

The API uses URL versioning: `/api/v1/`

### Version Compatibility

- **v1** - Current stable version
- Breaking changes will be introduced in new versions (v2, v3, etc.)
- Old versions will be supported for at least 6 months after new version release
- Deprecation notices will be sent via email and webhook

### Version Headers

All responses include version information:
```
X-API-Version: v1
```

---

## Support & Resources

### Documentation
- **API Docs:** This document
- **Setup Guide:** `SETUP_GUIDE.md`
- **Project Summary:** `PROJECT_SUMMARY.md`
- **README:** `README.md`

### Getting Help
- **Issues:** Create an issue in the repository
- **Email:** support@baldimeals.com
- **Response Time:** Within 24 hours for critical issues

### Rate Limits
If you need higher rate limits for your integration, contact support with:
- Your use case
- Expected request volume
- API endpoints you'll be using

### Status Page
Monitor API status and uptime: `https://status.baldimeals.com`

### Changelog
Subscribe to API updates: `https://baldimeals.com/api/changelog`

---

## Additional Notes

### Date Formats
All dates are in ISO 8601 format: `YYYY-MM-DDTHH:mm:ss.sssZ`

### Currency
All monetary values are in Tunisian Dinar (TND) with 2 decimal places.

### Timezones
All timestamps are in UTC. Convert to local timezone in your application.

### Image URLs
- Compressed images: `/uploads/compressed/filename.jpg`
- Original images: `/uploads/original/filename.jpg`
- Use compressed images for display, original for downloads

### Soft Deletes
Most resources use soft delete - they're marked as deleted but remain in database.
- Admin users can view deleted resources by adding `?includeDeleted=true`
- Permanently delete requires special permission

### Audit Logs
All sensitive operations are logged in audit logs (admin access only).

### Data Retention
- Active data: Indefinite
- Soft deleted data: 30 days before permanent deletion
- Logs: 90 days
- Analytics: 2 years

---

## Quick Reference

### Base URL
```
Development: http://localhost:5000/api/v1
Production: https://api.baldimeals.com/api/v1
```

### Authentication Header
```
Authorization: Bearer YOUR_ACCESS_TOKEN
```

### Content Type
```
Content-Type: application/json
```

### Common Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `422` - Validation Error
- `429` - Rate Limit Exceeded
- `500` - Server Error

### Rate Limits
- General: 100 req/15min
- Auth: 5 req/15min
- Admin: 200 req/15min

### Token Expiry
- Access Token: 7 days
- Refresh Token: 30 days
- Temp Token (2FA): 5 minutes

---

**End of Documentation**

For the most up-to-date information, always refer to the latest version of this documentation.

Last Updated: January 2024
Version: 1.0.0