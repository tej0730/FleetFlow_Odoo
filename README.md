# FleetFlow 🚀

**Modular Fleet & Logistics Management System** | Odoo Hackathon 2025

FleetFlow replaces paper logbooks with a live digital command center — real-time fleet tracking, driver safety monitoring, and operational analytics.

---

## 🏗️ Architecture

```text
FleetFlow_Odoo/
├── client/          → React 18 + Vite (Member B — Frontend Lead)
│   └── src/
│       ├── pages/      → 7 page components
│       ├── components/ → Reusable UI: StatusPill, KPICard, DataTable, Modal
│       ├── context/    → AuthContext (JWT-based auth)
│       └── lib/        → Axios instance, utility helpers
├── server/          → Node.js + Express (Member A — Backend Lead)
│   ├── routes/         → auth, vehicles, trips, drivers, maintenance
│   ├── controllers/
│   └── middleware/     → auth.js (JWT verify), validate.js (Joi)
└── db/
    └── migrations/     → 5 PostgreSQL table schemas
```

---

## ✨ Key Features & Wow Moments

| Feature | Behavior | Impact |
| :--- | :--- | :--- |
| **Real-time OTP Registration** | Two-step email verification using `nodemailer` and Ethereal Email before account activation. | Secure provisioning |
| **Live Trips Dashboard** | Interactive segmented control filtering active trips (Truck, Van, Bike) directly on the dashboard. | Real-time analytics |
| **Atomic Status Flips** | Maintenance log creation instantly sets a vehicle to "In Shop" across all dispatch dropdowns. | Deep data integrity |
| **Inline Cargo Validation** | Yellow warnings as you type; submit is blocked if trip cargo exceeds the vehicle's max capacity. | Prevents errors |
| **Global License Expiry** | Sticky red banner alerts follow managers across all pages for any driver whose license is expiring. | Proactive safety |

---

## 🏗️ Tech Stack & Dependencies

### Frontend Dependencies (`client/`)
- **react / react-dom** (^18.3.1) - Core UI library
- **react-router-dom** (^6.28.0) - Client-side routing
- **axios** (^1.7.7) - HTTP requests and interceptors
- **@tanstack/react-query** (^5.59.0) - Data fetching, caching, and polling server state
- **recharts** (^2.13.0) - Responsive analytics dashboards and charting
- **react-hook-form** (^7.53.0) - Performant form validation and handling
- **react-hot-toast** (^2.4.1) - Elegant toast notifications
- **lucide-react** (^0.451.0) - Crisp SVG UI icons
- **xlsx** (^0.18.5) - Excel/CSV data exports
- **clsx** (^2.1.1) / **tailwind-merge** (^2.5.3) - Conditional utility class merging
- **Vite & TailwindCSS** - Build tooling and styling (devDependencies)

### Backend Dependencies (`server/`)
- **express** (^5.2.1) - Node.js web framework and API routing
- **pg** (^8.18.0) - Native PostgreSQL client with connection pooling
- **bcrypt** (^6.0.0) - Password hashing encryption
- **jsonwebtoken** (^9.0.3) - Stateless JWT authentication
- **joi** (^18.0.2) - Strict declarative request payload validation
- **nodemailer** (^8.0.1) - OTP email delivery (via Ethereal SMTP)
- **dotenv** (^17.3.1) - Environment variable management
- **cors** (^2.8.6) / **helmet** (^8.1.0) - App security and cross-origin resource sharing headers
- **nodemon** (^3.1.14) - Live reloading (devDependencies)

---

## ⚡ Quick Start

### Prerequisites

- **Node.js** v18+ ([download](https://nodejs.org))
- **PostgreSQL** 14+ running locally
- **Git**

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

```bash
cp .env.example .env
# Edit .env and fill in your credentials:
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=fleetflow_dev
# JWT_SECRET=your_super_secret_key_here
```

### 4 — Backend (Member A's server)

```bash
cd server
npm install
npm run migrate    # Run all 5 DB migrations
npm run seed       # Seed: 5 vehicles, 5 drivers, 8 trips, 3 maintenance logs
npm run dev        # Runs on http://localhost:5000
```

### 5 — Frontend (in a new terminal)

```bash
cd client
npm install
npm run dev        # Runs on http://localhost:5173
```

### 6 — Open in browser

```
http://localhost:5173
```

**Demo credentials:** `admin@fleetflow.io` / `password123`

---

## 🌐 API Reference

| Method | Route                        | Auth | Description                                           |
| ------ | ---------------------------- | ---- | ----------------------------------------------------- |
| POST   | `/api/auth/login`            | ❌   | Login → returns `{ token, user }`                     |
| GET    | `/api/dashboard/stats`       | ✅   | 4 KPI values for dashboard                            |
| GET    | `/api/vehicles`              | ✅   | All vehicles (filter: `?status=Available&type=Truck`) |
| POST   | `/api/vehicles`              | ✅   | Register new vehicle                                  |
| PATCH  | `/api/vehicles/:id`          | ✅   | Update vehicle fields                                 |
| GET    | `/api/trips`                 | ✅   | All trips (`?status=` filter)                         |
| POST   | `/api/trips`                 | ✅   | Create trip (validates cargo ≤ capacity)              |
| PATCH  | `/api/trips/:id/status`      | ✅   | Update trip + atomically flip vehicle/driver status   |
| GET    | `/api/drivers`               | ✅   | All drivers (license_expiry included)                 |
| POST   | `/api/drivers`               | ✅   | Add driver                                            |
| PATCH  | `/api/drivers/:id`           | ✅   | Update duty_status, safety_score                      |
| GET    | `/api/drivers/expiring-soon` | ✅   | Drivers with expiry ≤ 30 days                         |
| GET    | `/api/maintenance`           | ✅   | All logs (`?vehicle_id=` filter)                      |
| POST   | `/api/maintenance`           | ✅   | Create log + set vehicle → In Shop (atomic)           |
| PATCH  | `/api/maintenance/:id/close` | ✅   | Close log + set vehicle → Available (atomic)          |
| GET    | `/api/analytics/summary`     | ✅   | Utilization %, status breakdown, avg fuel efficiency  |
| GET    | `/api/reports/monthly`       | ✅   | Monthly revenue, fuel, maintenance costs              |
| POST   | `/api/fuel-logs`             | ✅   | Record fuel liters, cost, odometer per trip (Member C)|

All protected routes require: `Authorization: Bearer <JWT_TOKEN>`

---

## 🌿 Git Workflow

```
main            ← Final release only (tagged v1.0 at Hour 5)
dev             ← Integration branch (everyone PRs here)
feat/frontend-core     ← Member B (this repo)
feat/apis-and-db       ← Member A
feat/vehicles-trips    ← Member C
feat/drivers-maint     ← Member D
```

**Commit format:** `feat: add dashboard KPI auto-refresh`  
**Merge schedule:** End of Hour 1 → `dev`, End of Hour 3 → `dev`, Hour 5 → `main`

> **Rule:** Every team member must have ≥ 6 individual commits. A single committer = disqualification.

---

## 🎨 Status Color Reference

| Status              | Color    | Meaning                        |
| ------------------- | -------- | ------------------------------ |
| Available           | 🟢 Green | Vehicle/Driver ready to assign |
| On Trip / On Duty   | 🔵 Blue  | Currently dispatched           |
| In Shop / Suspended | 🔴 Red   | Blocked from assignment        |
| Retired / Off Duty  | ⚫ Gray  | Decommissioned / resting       |
| Draft               | 🟡 Amber | Trip not yet dispatched        |
| Completed           | 🟢 Green | Trip finished                  |
| Cancelled           | ⚫ Gray  | Trip cancelled                 |

---

## ✨ Key Features & Wow Moments

| Feature                     | Behavior                                                               | Demo Impact                 |
| --------------------------- | ---------------------------------------------------------------------- | --------------------------- |
| **Auto-refresh Dashboard**  | React Query polls every 8 seconds                                      | Live system feel            |
| **Atomic Status Flip**      | Maintenance log → vehicle instantly becomes "In Shop" across all pages | Real connected state        |
| **Inline Cargo Validation** | Yellow warning as you type; submit blocked if over limit               | Prevents operational errors |
| **License Expiry Banner**   | Red sticky banner follows across ALL pages for any expiring driver     | Proactive safety thinking   |
| **Fleet Health Score**      | `(available/total)*100` shown as % on dashboard                        | One number, instant insight |
| **Fuel Logging on Complete**| Modal prompts for liters, cost, odometer when completing trip          | Tracks real fuel efficiency |
| **Vehicle Retire/Restore**  | One-click retire or restore button on Vehicle Registry                 | Full asset lifecycle mgmt   |

---

## 📂 Frontend File Reference (Member B Owns)

| File                            | Purpose                                                        |
| ------------------------------- | -------------------------------------------------------------- |
| `src/App.jsx`                   | React Router v6 with protected routes                          |
| `src/main.jsx`                  | Entry point with React Query + Toast providers                 |
| `src/lib/api.js`                | Axios instance with JWT auto-attach + 401 redirect             |
| `src/lib/utils.js`              | formatCurrency, formatDate, exportToCSV, license expiry checks |
| `src/context/AuthContext.jsx`   | Login, logout, isAuthenticated                                 |
| `src/components/Layout.jsx`     | Sidebar + global license expiry red banner                     |
| `src/components/StatusPill.jsx` | Color-coded status badge for all entities                      |
| `src/components/KPICard.jsx`    | Dashboard metric card with loading skeleton                    |
| `src/components/DataTable.jsx`  | Reusable table with loading rows + empty state                 |
| `src/components/Modal.jsx`      | Generic modal with ESC/backdrop close                          |
| `src/pages/Login.jsx`           | Auth page with validation + demo credentials                   |
| `src/pages/Dashboard.jsx`       | 4 KPI cards with 8s auto-refresh                               |
| `src/pages/VehicleRegistry.jsx` | Vehicle table + Add/Retire modal + fleet summary (Member C)    |
| `src/pages/Analytics.jsx`       | Recharts charts + Financial table + CSV export                 |
| `src/pages/TripDispatcher.jsx`  | Trip form + cargo validation + fuel logging modal (Member C)   |
| `src/pages/DriverProfiles.jsx`  | Driver table + duty toggle + license expiry (Member D)         |
| `src/pages/MaintenanceLogs.jsx` | Maintenance logs + atomic vehicle flip (Member D)              |

---

## 🚀 Demo Flow (5 Minutes)

| Time | Page                                               | Presenter    |
| ---- | -------------------------------------------------- | ------------ |
| 0:00 | Login page                                         | Member B     |
| 0:30 | Dashboard KPIs auto-refresh                        | Member B     |
| 1:00 | Vehicle Registry → Add Maintenance                 | Member C     |
| 1:30 | Trip Dispatcher — vehicle disappears from dropdown | Member D / C |
| 2:30 | Overweight cargo validation blocks submission      | Member C     |
| 3:00 | Driver Profiles — expired license red badge        | Member D     |
| 3:45 | Analytics — charts + CSV export                    | Member B     |
| 4:30 | Wrap up                                            | Any          |

---

_Built in 5 hours by a 4-member team. FleetFlow v1.0._
