# FleetFlow 🚀

**Modular Fleet & Logistics Management System** | Odoo Hackathon 2025

FleetFlow replaces paper logbooks with a live digital command center — real-time fleet tracking, driver safety monitoring, and operational analytics.

---

## 🏗️ Architecture

```
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
