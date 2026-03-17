# FleetFlow
**Modular Fleet & Logistics Management System**

FleetFlow replaces paper logbooks with a live digital command center — real-time fleet tracking, driver safety monitoring, and operational analytics.

---

## Architecture

```
FleetFlow_Odoo/
├── client/                  → React 18 + Vite (frontend)
│   └── src/
│       ├── pages/           → Full-page views (Dashboard, Trips, etc.)
│       ├── components/      → Shared UI components
│       ├── context/         → AuthContext (JWT state)
│       ├── hooks/           → Custom React hooks
│       └── lib/             → Axios config, utilities
├── server/                  → Node.js + Express (REST API)
│   ├── routes/              → Route definitions
│   ├── controllers/         → Business logic
│   ├── middleware/          → Auth guard, validation
│   └── models/              → DB query helpers
└── db/
    └── migrations/          → SQL schema files
```

---

## Key Features

| Feature | Behavior | Impact |
| :--- | :--- | :--- |
| **Two-step OTP Registration** | Email OTP via Nodemailer before account activation | Secure provisioning |
| **Live Trips Dashboard** | Interactive filtering of active trips by vehicle type (Truck, Van, Bike) | Real-time analytics |
| **Atomic Status Flips** | Closing a maintenance log instantly sets the vehicle back to "Available" | Data integrity |
| **Inline Cargo Validation** | Blocks trip submission if cargo exceeds vehicle capacity | Prevents overload errors |
| **Global License Expiry Alert** | Banner alert on all pages for drivers with licences expiring within 30 days | Proactive safety |
| **Role-Based Access** | Roles: `manager`, `dispatcher`, `safety`, `analyst` | Least-privilege access |

---

## Tech Stack

### Frontend
| Package | Version | Purpose |
| :--- | :--- | :--- |
| React | 18.3 | UI framework |
| React Router DOM | 6.28 | Client-side routing |
| Axios | 1.7 | HTTP client |
| TanStack React Query | 5.59 | Server state & polling |
| Recharts | 2.13 | Charts and analytics |
| React Hook Form | 7.53 | Form state & validation |
| React Hot Toast | 2.4 | Notifications |
| Lucide React | 0.451 | Icon library |
| XLSX | 0.18 | Excel export |
| TailwindCSS | 3.4 | Utility-first styling |
| Vite | 5.4 | Build tool & dev server |

### Backend
| Package | Version | Purpose |
| :--- | :--- | :--- |
| Express | 5.2 | HTTP framework |
| pg (node-postgres) | 8.18 | PostgreSQL client |
| bcrypt | 6.0 | Password hashing |
| jsonwebtoken | 9.0 | JWT auth tokens |
| Joi | 18.0 | Request schema validation |
| Nodemailer | 8.0 | Email OTP delivery |
| helmet | 8.1 | HTTP security headers |
| cors | 2.8 | Cross-origin requests |
| dotenv | 17.3 | Environment config |
| nodemon | 3.1 | Dev auto-restart |

---

## Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- Git

### 1 — Clone
```bash
git clone git@github.com:tej0730/FleetFlow_Odoo.git
cd FleetFlow_Odoo
```

### 2 — Database Setup
```bash
createdb fleetflow_dev
```

### 3 — Environment Variables

Create a `.env` file in the project root (or copy the example):
```bash
cp .env.example .env
```

Required variables:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=fleetflow_dev
JWT_SECRET=your_jwt_secret_here
```

> **Local email (OTP testing):** Nodemailer auto-creates a free [Ethereal](https://ethereal.email) test account on startup. OTP preview URLs are printed to the server console — no SMTP config needed for development.

### 4 — Backend
```bash
cd server
npm install
npm run migrate    # Creates tables
npm run seed       # Seeds initial data
npm run dev        # Starts on http://localhost:5000
```

### 5 — Frontend
```bash
cd client
npm install
npm run dev        # Starts on http://localhost:5173
```

### 6 — Open
```
http://localhost:5173
```

Demo credentials: `admin@fleetflow.io` / `password123`

---

## API Reference

### Authentication
| Method | Route | Auth | Description |
| ------ | ----- | ---- | ----------- |
| POST | /api/auth/register | — | Step 1: register & send OTP |
| POST | /api/auth/verify-otp | — | Step 2: verify OTP, activate account |
| POST | /api/auth/login | — | Login, returns JWT |
| POST | /api/auth/forgot-password | — | Send password reset OTP |
| POST | /api/auth/reset-password | — | Reset password with OTP |

### Fleet Operations
| Method | Route | Auth | Description |
| ------ | ----- | ---- | ----------- |
| GET | /api/dashboard/stats | JWT | Dashboard KPIs |
| GET | /api/vehicles | JWT | List vehicles |
| POST | /api/vehicles | JWT | Add vehicle |
| PATCH | /api/vehicles/:id | JWT | Update vehicle |
| GET | /api/trips | JWT | List trips |
| POST | /api/trips | JWT | Create trip |
| PATCH | /api/trips/:id/status | JWT | Update trip status |
| GET | /api/drivers | JWT | List drivers |
| POST | /api/drivers | JWT | Add driver |
| PATCH | /api/drivers/:id | JWT | Update driver |
| GET | /api/drivers/expiring-soon | JWT | Drivers with expiring licences |
| GET | /api/maintenance | JWT | Maintenance logs |
| POST | /api/maintenance | JWT | Create maintenance log |
| PATCH | /api/maintenance/:id/close | JWT | Close log & restore vehicle status |
| POST | /api/fuel | JWT | Log fuel fill-up |
| GET | /api/analytics/summary | JWT | Fleet utilisation stats |
| GET | /api/reports/monthly | JWT | Monthly trip report |

---

## Status Reference

### Vehicle Status
| Status | Meaning |
| ------ | ------- |
| Available | Ready to assign to a trip |
| On Trip | Currently in use |
| In Shop | Under maintenance — blocked from dispatch |
| Retired | Permanently decommissioned |

### Trip Status
| Status | Meaning |
| ------ | ------- |
| Draft | Created, not yet dispatched |
| Active | In progress |
| Completed | Successfully finished |
| Cancelled | Abandoned before completion |

---

## Frontend File Reference

| File | Purpose |
| ---- | ------- |
| `App.jsx` | Route definitions |
| `main.jsx` | React root, providers |
| `lib/api.js` | Axios instance + JWT interceptor |
| `lib/utils.js` | Shared helpers (dates, formatting) |
| `context/AuthContext.jsx` | Auth state (login/logout/token) |
| `components/Layout.jsx` | App shell + global expiry alert banner |
| `components/StatusPill.jsx` | Colour-coded status badge |
| `components/KPICard.jsx` | Dashboard metric card |
| `components/DataTable.jsx` | Reusable sortable table |
| `components/Modal.jsx` | Generic modal wrapper |
| `pages/Login.jsx` | Login form |
| `pages/Register.jsx` | Two-step OTP registration flow |
| `pages/Dashboard.jsx` | KPI overview + charts |
| `pages/VehicleRegistry.jsx` | Vehicle CRUD |
| `pages/TripDispatcher.jsx` | Trip creation and status management |
| `pages/DriverProfiles.jsx` | Driver CRUD + safety scores |
| `pages/MaintenanceLogs.jsx` | Maintenance log CRUD |
| `pages/Analytics.jsx` | Utilisation charts and reports |

---

## Project Structure Notes

- **JWT tokens** expire after 24 hours. The Axios interceptor in `lib/api.js` automatically attaches the `Authorization: Bearer <token>` header to every request.
- **React Query** polls key endpoints every 10 seconds for a live-dashboard feel without WebSockets.
- **Atomic maintenance close**: `PATCH /api/maintenance/:id/close` wraps both the log update and vehicle status reset in a single DB transaction.
- **OTP store**: The OTP map is in-memory (`Map`) on the server process. Restarting the server clears pending registrations. For production, move this to Redis or a `pending_users` DB table.
