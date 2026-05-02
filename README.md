# Saloon Booking Scheduler

> **A full-stack, production-ready appointment management platform built for modern salon operations.**

Saloon Booking Scheduler is a role-based web application that lets administrators manage salon services, working hours, and bookings — while customers can register, browse available slots, and confirm appointments in a sleek self-service flow.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Features](#features)
3. [Tech Stack](#tech-stack)
4. [Folder Structure](#folder-structure)
5. [Installation](#installation)
   - [Backend Setup](#backend-setup)
   - [Frontend Setup](#frontend-setup)
6. [Environment Variables](#environment-variables)
7. [API Overview](#api-overview)
8. [User Roles](#user-roles)
9. [Full System Flow](#full-system-flow)
   - [Admin Flow](#admin-flow)
   - [Customer Flow](#customer-flow)
10. [Screens Explanation](#screens-explanation)
11. [Database Design](#database-design)
12. [Slot Generation Logic](#slot-generation-logic)
13. [Authentication Flow](#authentication-flow)
14. [Validation Rules](#validation-rules)
15. [Error Handling](#error-handling)
16. [Testing Instructions (Playwright)](#testing-instructions-playwright)
17. [Deployment Guide](#deployment-guide)

---

## Project Overview

The repository contains two primary applications:

| Directory | Purpose |
|---|---|
| `smart-booking-backend` | Laravel 12 REST API — auth, categories, services, bookings, slots, working-time rules |
| `smart-booking-frontend` | React 19 + Vite SPA — admin panel and customer booking UI |

**Key design decisions:**
- **Token-based auth** via Laravel Sanctum (Bearer tokens, stored in `localStorage`)
- **Role-based routing** — React routes are protected by role (`admin` / `customer`)
- **Slot generation on-demand** — slots are computed live from working-time rules at request time, not pre-stored
- **SQLite** by default for zero-config local development; swap to MySQL/PostgreSQL for production

---

## Features

### Admin Features
- ✅ Secure admin login with role guard
- ✅ **Categories CRUD** — create, edit (name + status), delete categories
- ✅ **Services CRUD** — create, edit, delete services with duration, price, and category linking
- ✅ **Working-Time Rules** — add weekly (Mon–Sun) or specific-date override rules; delete rules
- ✅ **Booking Management** — view all appointments with client details; cancel any booking
- ✅ **Slot Overview by Date** — see all generated slots and their availability for any date
- ✅ Dark / Light mode toggle persisted per session

### Customer Features
- ✅ Self-registration with name, email, password
- ✅ Secure login / logout
- ✅ Forgot password + reset password email flow
- ✅ **Category-first booking flow** — select category → filter services → pick date → view slots
- ✅ **Real-time slot grid** — slots generated on-demand, greyed-out if booked or in the past
- ✅ Auto-populates name/email from authenticated user session
- ✅ Phone number capture with validation
- ✅ Booking confirmation message + instant slot state refresh

### System-Wide
- ✅ Health-check endpoint (`GET /api/health`)
- ✅ CORS pre-configured for local dev
- ✅ Sanctum token authentication with automatic cleanup on logout
- ✅ Full Playwright E2E test covering admin + customer flows in one recording
- ✅ Code-split lazy loading on all page components (Suspense)
- ✅ Responsive design with mobile-friendly layouts

---

## Tech Stack

### Backend
| Tool | Version | Role |
|---|---|---|
| PHP | 8.2+ | Runtime |
| Laravel | 12.x | Framework |
| Laravel Sanctum | 4.x | Token authentication |
| Eloquent ORM | (Laravel) | Database abstraction |
| SQLite | default | Database (swappable) |

### Frontend
| Tool | Version | Role |
|---|---|---|
| React | 19.x | UI library |
| React Router | 7.x | Client-side routing |
| Axios | 1.x | HTTP client |
| Vite | 8.x | Build tool / dev server |

### Testing
| Tool | Version | Role |
|---|---|---|
| Playwright | 1.59+ | End-to-end browser testing |

---

## Folder Structure

```text
smart-booking-system/                    ← Repository root
├── smart-booking-backend/               ← Laravel API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   │   ├── AppointmentController.php
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── AvailabilityController.php
│   │   │   │   ├── CategoryController.php
│   │   │   │   ├── PasswordResetController.php
│   │   │   │   ├── ServiceController.php
│   │   │   │   └── WorkingTimeRuleController.php
│   │   │   ├── Middleware/
│   │   │   └── Requests/
│   │   ├── Models/
│   │   │   ├── Appointment.php
│   │   │   ├── Category.php
│   │   │   ├── Service.php
│   │   │   ├── User.php
│   │   │   └── WorkingTimeRule.php
│   │   ├── Providers/
│   │   └── Services/
│   │       └── BookingService.php
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   │       └── DemoDataSeeder.php
│   ├── routes/
│   │   └── api.php
│   ├── .env
│   └── composer.json
│
├── smart-booking-frontend/              ← React SPA
│   ├── src/
│   │   ├── api.js                       ← Axios instance with Bearer token interceptor
│   │   ├── App.jsx                      ← Root router + navigation bar
│   │   ├── App.css                      ← Global styles + design tokens
│   │   ├── components/
│   │   │   ├── AdminSection.jsx         ← Working rules + slot/booking overview
│   │   │   ├── BookingSection.jsx       ← Customer booking flow
│   │   │   ├── DataTable.jsx            ← Reusable CRUD table
│   │   │   └── ProtectedRoute.jsx       ← Role-based route guard
│   │   ├── context/
│   │   │   ├── AuthContext.jsx          ← Auth state + login/register/logout
│   │   │   └── ThemeContext.jsx         ← Dark/Light mode
│   │   ├── hooks/
│   │   │   └── useBookingData.js        ← Shared data fetching hook
│   │   └── pages/
│   │       ├── Login.jsx
│   │       ├── Register.jsx
│   │       ├── ForgotPassword.jsx
│   │       ├── ResetPassword.jsx
│   │       └── admin/
│   │           ├── AdminLayout.jsx      ← Admin tab navigation
│   │           ├── CategoriesAdmin.jsx
│   │           ├── ServicesAdmin.jsx
│   │           └── BookingsAdmin.jsx
│   ├── tests/
│   │   ├── full-system.spec.js          ← Playwright E2E (admin + customer)
│   │   └── booking.spec.js
│   ├── playwright.config.js
│   ├── index.html
│   └── package.json
│
├── README.md
├── SaloonBookingSchedulerDocumentation.docx
└── generate_saloon_doc.py
```

---

## Installation

### Prerequisites

- PHP 8.2+, Composer
- Node.js 20+ (LTS), npm
- Git

### Backend Setup

```bash
# 1. Navigate into backend
cd smart-booking-backend

# 2. Install PHP dependencies
composer install

# 3. Create environment file
copy .env.example .env        # Windows
# cp .env.example .env        # Linux/macOS

# 4. Generate application key
php artisan key:generate --force

# 5. Run migrations (creates SQLite DB automatically)
php artisan migrate --force

# 6. Seed demo data (admin user + categories + services + working rules)
php artisan db:seed --class=DemoDataSeeder --force

# 7. Start development server
php artisan serve --host=127.0.0.1 --port=8000
```

> **Demo admin credentials seeded:**
> - Email: `admin@example.com`
> - Password: `password123`

### Frontend Setup

```bash
# 1. Navigate into frontend (separate terminal)
cd smart-booking-frontend

# 2. Install Node dependencies
npm install

# 3. Start Vite dev server
npm run dev -- --host 127.0.0.1 --port 5173
```

Open `http://localhost:5173` in your browser.

---

## Environment Variables

### Backend (`smart-booking-backend/.env`)

| Variable | Default | Description |
|---|---|---|
| `APP_NAME` | `SaloonBookingSystem` | Application display name |
| `APP_ENV` | `local` | Environment (`local` / `production`) |
| `APP_KEY` | generated | Laravel encryption key |
| `APP_DEBUG` | `true` | Show detailed errors |
| `APP_URL` | `http://localhost` | Backend base URL |
| `DB_CONNECTION` | `sqlite` | Database driver |
| `DB_DATABASE` | `database/database.sqlite` | SQLite file path |
| `DB_FOREIGN_KEYS` | `true` | Enable FK constraints for SQLite |
| `APP_TIMEZONE` | `UTC` | Server timezone for slot calculations |
| `SANCTUM_STATEFUL_DOMAINS` | — | Add frontend domain in production |
| `SESSION_DRIVER` | `database` | Session storage |
| `MAIL_MAILER` | `log` | Mail driver (set SMTP for production) |

### Frontend

| Variable | Default | Description |
|---|---|---|
| `VITE_API_BASE_URL` | `http://127.0.0.1:8000/api` | Backend API base (set in `.env` at frontend root) |

Create `smart-booking-frontend/.env` with:
```env
VITE_API_BASE_URL=http://127.0.0.1:8000/api
```

---

## API Overview

### Base URL
```
http://127.0.0.1:8000/api
```

### Public Endpoints (no authentication required)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Health check |
| `POST` | `/register` | Customer registration |
| `POST` | `/login` | Login (returns Bearer token) |
| `POST` | `/forgot-password` | Send password reset link |
| `GET` | `/reset-password/{token}` | Validate reset token |
| `POST` | `/reset-password` | Perform password reset |
| `GET` | `/categories` | List all categories |
| `GET` | `/services` | List all services (with category) |
| `GET` | `/available-slots?date=YYYY-MM-DD&service_id=N` | Get available slots for date + service |

### Authenticated Endpoints (requires `Authorization: Bearer <token>`)

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/user` | Get current authenticated user |
| `POST` | `/appointments` | Create a new appointment |
| `POST` | `/logout` | Revoke current token |

### Admin-only Endpoints (requires auth + `admin` role)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/categories` | Create a category |
| `PUT` | `/categories/{id}` | Update a category |
| `DELETE` | `/categories/{id}` | Delete a category |
| `POST` | `/services` | Create a service |
| `PUT` | `/services/{id}` | Update a service |
| `DELETE` | `/services/{id}` | Delete a service |
| `GET` | `/appointments` | List all appointments (optionally by `?date=`) |
| `DELETE` | `/appointments/{id}` | Cancel an appointment |
| `GET` | `/working-time-rules` | List all working-time rules |
| `POST` | `/working-time-rules` | Create a working-time rule |
| `DELETE` | `/working-time-rules/{id}` | Delete a working-time rule |

### Example Request: Create Appointment

```http
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "date": "2026-05-10",
  "start_time": "10:00",
  "service_id": 1,
  "client_email": "customer@example.com",
  "client_name": "Jane Doe",
  "client_phone": "+91 98765 43210"
}
```

### Example Response

```json
{
  "message": "Appointment booked successfully.",
  "data": {
    "id": 42,
    "service_id": 1,
    "start_at": "2026-05-10T10:00:00.000000Z",
    "end_at": "2026-05-10T10:30:00.000000Z",
    "status": "pending",
    "client_name": "Jane Doe",
    "client_email": "customer@example.com",
    "client_phone": "+91 98765 43210"
  }
}
```

---

## User Roles

### Admin
- Created via `DemoDataSeeder` (email: `admin@example.com`)
- Has access to all admin routes: `/admin`, `/admin/categories`, `/admin/services`, `/admin/bookings`
- Can perform CRUD on categories and services
- Can create and delete working-time rules
- Can view and cancel any appointment
- Cannot access the customer booking page while logged in as admin

### Customer
- Self-registers via `/register`
- Auto-assigned `role = 'customer'`
- Can access only `/booking` route
- Can create appointments for themselves
- Cannot access admin routes (returns 403 if attempted via API, redirect if via UI)

---

## Full System Flow

### Admin Flow

```
1. Navigate to /login
2. Enter admin credentials (admin@example.com / password123)
3. System validates credentials → issues Sanctum Bearer token
4. Token stored in localStorage → Admin redirected to /admin (Dashboard)
5. Admin Dashboard shows:
   - Working-Time Rules form (create rules by day-of-week or specific date)
   - Existing rules table with delete action
   - Slot & Booking overview (pick a date to see all slots + booked appointments)
6. Admin navigates to /admin/categories
   → Create category (name + active status)
   → Edit existing category
   → Delete category
7. Admin navigates to /admin/services
   → Create service (name, category, duration in minutes, price, status)
   → Edit service
   → Delete service
8. Admin navigates to /admin/bookings
   → View all appointments (client, email, phone, service, start/end time, status)
   → Cancel any appointment (DELETE /api/appointments/{id})
9. Admin logs out → token deleted from localStorage
```

### Customer Flow

```
1. Navigate to /register
2. Fill name, email, password → POST /api/register
3. Auto-logged in → redirected to /booking
4. Booking page:
   a. Select Category (dropdown, only active categories shown)
   b. Select Service (filtered by category, shows duration + price)
   c. Select Appointment Date (min: today)
   d. Slots load automatically via GET /api/available-slots
   e. Slot grid shows:
      - Available slots (clickable)
      - Past/booked slots (disabled, greyed out)
   f. Click a slot to select it
5. Fill contact details (name auto-populated from auth, email read-only)
6. Click "Confirm Appointment" → POST /api/appointments
7. Success message displayed, slot grid refreshes (selected slot now disabled)
8. Customer logs out
```

---

## Screens Explanation

| Screen | Route | Access | Purpose |
|---|---|---|---|
| Login | `/login` | Public | Email + password auth |
| Register | `/register` | Public | New customer account creation |
| Forgot Password | `/forgot-password` | Public | Request password reset email |
| Reset Password | `/reset-password` | Public | Set new password via token |
| Booking | `/booking` | Customer only | Full appointment booking flow |
| Admin Dashboard | `/admin` | Admin only | Working rules + slot/booking date view |
| Categories | `/admin/categories` | Admin only | Category CRUD |
| Services | `/admin/services` | Admin only | Service CRUD with category linking |
| Bookings | `/admin/bookings` | Admin only | All appointments list + cancel |

---

## Database Design

### Tables

#### `users`
| Column | Type | Description |
|---|---|---|
| `id` | bigint PK | Auto-increment |
| `name` | string | Full name |
| `email` | string unique | Email (login) |
| `password` | string | Bcrypt hash |
| `role` | string | `admin` or `customer` |
| `created_at` / `updated_at` | timestamp | Timestamps |

#### `categories`
| Column | Type | Description |
|---|---|---|
| `id` | bigint PK | Auto-increment |
| `name` | string | Category label (e.g. "Hair Care") |
| `is_active` | boolean | Show/hide in customer UI |

#### `services`
| Column | Type | Description |
|---|---|---|
| `id` | bigint PK | Auto-increment |
| `name` | string | Service name |
| `category_id` | FK → categories | Linked category |
| `duration_minutes` | integer | Service slot duration |
| `price` | decimal | Service price |
| `is_active` | boolean | Show/hide in booking UI |

#### `appointments`
| Column | Type | Description |
|---|---|---|
| `id` | bigint PK | Auto-increment |
| `service_id` | FK → services | Booked service |
| `category_id` | FK → categories | Service category |
| `user_id` | FK → users (nullable) | Authenticated customer |
| `client_name` | string | Customer full name |
| `client_phone` | string | Customer phone |
| `client_email` | string | Customer email |
| `start_at` | datetime | Appointment start |
| `end_at` | datetime | Appointment end |
| `status` | string | `pending` / `confirmed` / `cancelled` |

#### `working_time_rules`
| Column | Type | Description |
|---|---|---|
| `id` | bigint PK | Auto-increment |
| `day_of_week` | integer (1–7, nullable) | ISO day: 1=Mon … 7=Sun |
| `date` | date (nullable) | Specific date override |
| `start_time` | time | Rule start time |
| `end_time` | time | Rule end time |
| `is_active` | boolean | Enable/disable rule |

> **Rule priority:** Specific-date rules take precedence over day-of-week rules.

#### `personal_access_tokens` (Sanctum)
Standard Sanctum token table — stores all Bearer tokens with expiry support.

---

## Slot Generation Logic

Slots are generated **on-demand** by `BookingService::getAvailableSlots()`:

```
1. Load service → get duration_minutes
2. Load working-time rules for the requested date:
   - If specific-date rule exists → use it
   - Else → use day-of-week rule
   - If no rules → return [] (no slots available)
3. Load all existing appointments for that date
4. For each rule window:
   - Start at rule.start_time
   - While (current + duration) <= rule.end_time:
       - Check if slot overlaps any existing appointment → mark unavailable
       - Check if slot is in the past → mark unavailable
       - Append slot (start, end, label, available flag)
       - Advance current by duration_minutes
5. Sort slots by start_at ascending
6. Return array of slot objects
```

**Overlap detection** uses strict interval logic: `start_at < slotEnd AND end_at > slotStart`.

---

## Authentication Flow

```
Customer/Admin Login:
  POST /api/login { email, password }
  ↓
  Laravel validates credentials (Hash::check)
  ↓
  User::createToken('auth_token') → plaintext token
  ↓
  Response: { access_token, user, token_type: "Bearer" }
  ↓
  Frontend stores token in localStorage ('auth_token')
  ↓
  Axios interceptor attaches Bearer header to all subsequent requests

Logout:
  POST /api/logout (with Bearer header)
  ↓
  currentAccessToken()->delete() removes token from DB
  ↓
  Frontend clears localStorage + resets auth state

Page Refresh:
  AuthContext calls GET /api/user with stored token
  ↓
  If valid → restore user session
  If 401 → clear localStorage, show login
```

---

## Validation Rules

### Register
- `name`: required, string, max 255
- `email`: required, email, unique in users
- `password`: required, min 8, confirmed

### Login
- `email`: required, email
- `password`: required

### Create Appointment
- `date`: required, date format YYYY-MM-DD, not in past
- `start_time`: required, HH:MM format, within working hours, not overlapping existing booking
- `service_id`: required, exists in services
- `client_email`: required, valid email
- `client_name`: required, string
- `client_phone`: frontend validated — `+?[0-9\s\-()]{7,20}`

### Working-Time Rule
- `day_of_week` OR `date`: at least one required
- `start_time`: required, HH:MM
- `end_time`: required, HH:MM, after start_time
- No overlapping rule for same day/date allowed

### Category
- `name`: required, string, max 255
- `is_active`: optional boolean

### Service
- `name`: required, string, max 255
- `duration_minutes`: required, integer, min 1
- `price`: numeric, min 0
- `category_id`: nullable, must exist in categories
- `is_active`: optional boolean

---

## Error Handling

| Scenario | HTTP Status | Response |
|---|---|---|
| Invalid credentials | 422 | `{ errors: { email: ["Invalid credentials."] } }` |
| Slot already booked | 422 | `{ errors: { start_time: ["This time slot is already booked."] } }` |
| Outside working hours | 422 | `{ errors: { start_time: ["This time is outside of working hours."] } }` |
| Booking in the past | 422 | `{ errors: { start_time: ["Cannot book in the past."] } }` |
| Unauthenticated | 401 | `{ message: "Unauthenticated." }` |
| Non-admin access to admin route | 403 | `{ message: "Forbidden." }` |
| Resource not found | 404 | `{ message: "...not found." }` |
| Validation failure | 422 | `{ message: "...", errors: { field: [...] } }` |

Frontend displays all errors via:
- `.error` class paragraph below form fields
- `.success` class paragraph for success confirmations

---

## Testing Instructions (Playwright)

### Prerequisites

Ensure backend is running on port `8000` with demo data seeded:

```bash
cd smart-booking-backend
php artisan serve --host=127.0.0.1 --port=8000
```

### Run Full E2E Suite

```bash
cd smart-booking-frontend

# Run the complete admin + customer flow test
npx playwright test tests/full-system.spec.js

# Or run all tests
npx playwright test
```

### What the full-system test covers

1. **Admin login** → navigates to dashboard
2. **Add working-time rule** for a specific future date
3. **Categories CRUD** — create, edit, delete cycle
4. **Create service** linked to a category
5. **View bookings page**
6. **Admin logout**
7. **Customer registration** (fresh account)
8. **Customer login**
9. **Booking flow** — select category → service → date → slot → fill details → confirm
10. **Slot state validation** — confirm booked slot becomes disabled
11. **Admin re-login** → verify booking appears in bookings list
12. **Admin cancel booking** → confirm removal

### Test Artifacts

After test run:
```
smart-booking-frontend/
├── playwright-report/        ← HTML test report
├── test-results/
│   └── full-system-*/
│       └── video.webm        ← Screen recording of full test
```

View the report:
```bash
npx playwright show-report
```

---

## Deployment Guide

### Backend (Production)

```bash
# 1. Set environment
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-api-domain.com

# 2. Switch database (MySQL example)
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=saloon_booking
DB_USERNAME=root
DB_PASSWORD=secret

# 3. Configure mail
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=your@email.com
MAIL_PASSWORD=secret

# 4. Configure CORS for your frontend domain
# In config/cors.php → allowed_origins: ['https://your-frontend.com']

# 5. Sanctum stateful domains
SANCTUM_STATEFUL_DOMAINS=your-frontend.com

# 6. Run production commands
composer install --optimize-autoloader --no-dev
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan migrate --force
php artisan db:seed --class=DemoDataSeeder --force
```

### Frontend (Production Build)

```bash
cd smart-booking-frontend

# Set production API URL
echo "VITE_API_BASE_URL=https://your-api-domain.com/api" > .env

# Build
npm run build

# Output in dist/ → deploy to Nginx/Apache/Netlify/Vercel
```

### Nginx Configuration (SPA)

```nginx
server {
    listen 80;
    server_name your-frontend.com;
    root /var/www/saloon-booking/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

---

## Performance Considerations

- **Code splitting**: All page components are lazy-loaded via `React.lazy()` + `<Suspense>` — initial bundle is minimal
- **Slot computation**: Done server-side on-demand — no slot pre-computation or caching overhead
- **Appointment overlap check**: Uses direct DB query with indexed `start_at` / `end_at` columns
- **Category/Service lists**: Fetched once on mount and reused throughout the session
- **Axios timeout**: Set to `10000ms` globally to prevent hanging requests
- **SQLite → MySQL**: For production with concurrent users, swap to MySQL for proper row-level locking during booking

---

## Edge Cases Handled

| Scenario | Handling |
|---|---|
| Customer books a slot that gets booked between page load and submit | Server-side overlap check → 422 error returned, slots refresh |
| Admin deletes a service that has existing appointments | Appointment records remain (soft historical data) |
| Working-time rule overlaps existing rule | Backend returns 422; frontend also pre-validates client-side |
| Customer tries to access `/admin` | `ProtectedRoute` redirects to `/booking` |
| Admin tries to access `/booking` | `ProtectedRoute` redirects to `/admin` |
| No working rules defined for a date | `GET /available-slots` returns `{ data: [] }` |
| Past date slot selection | Slots marked `available: false`, button disabled |
| Token expired / invalid | 401 → frontend clears token, redirects to login |

---

*Built with ❤️ for the Saloon Booking Scheduler project.*