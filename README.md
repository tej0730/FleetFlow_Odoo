# FleetFlow — Fleet & Logistics Management System

> Centralized fleet management system built during a 5-hour hackathon sprint. Replaces manual logbooks with a digital command center for dispatchers, managers, safety officers, and analysts.

---

## 🚀 Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/tej0730/FleetFlow_Odoo.git
cd FleetFlow_Odoo

# 2. Install backend dependencies
cd server && npm install

# 3. Install frontend dependencies
cd ../client && npm install

# 4. Set up environment variables
#    Copy .env.example to .env in the root and fill in:
#    DB_HOST=localhost  DB_PORT=5432  DB_NAME=fleetflow_dev  JWT_SECRET=your_secret

# 5. Create database and run migrations (requires PostgreSQL running)
cd ../server && npm run migrate

# 6. Start backend server (port 5000)
npm run dev

# 7. Start frontend server (port 5173) — in a new terminal
cd ../client && npm run dev

# 8. Open http://localhost:5173 in your browser
```

### 🔑 Login Credentials (Seed Data)

| Role       | Email                        | Password     |
|------------|------------------------------|--------------|
| Dispatcher | `dispatcher@fleetflow.com`   | `password123`|
| Manager    | `manager@fleetflow.com`      | `password123`|
| Safety     | `safety@fleetflow.com`       | `password123`|
| Analyst    | `analyst@fleetflow.com`      | `password123`|

> **Note:** If PostgreSQL is not running, the app automatically falls back to mock data so you can still demo the frontend.

---

## 🏗 Tech Stack

| Layer       | Technology                           |
|-------------|--------------------------------------|
| Frontend    | React 18 + Vite                      |
| Styling     | TailwindCSS 3 + Custom Design System|
| State       | React Query (auto-refresh every 8s)  |
| HTTP Client | Axios                                |
| Routing     | React Router v6                      |
| Charts      | Recharts                             |
| Icons       | Lucide React                         |
| Backend     | Node.js + Express.js                 |
| Database    | PostgreSQL                           |
| Auth        | JWT + bcrypt                         |
| Validation  | Joi (backend) + React Hook Form      |
| Export      | xlsx library                         |

---

## 👥 Team Roles & Responsibilities

### Member A — Backend Lead
- All Express.js API routes (`auth`, `vehicles`, `drivers`, `trips`, `maintenance`, `analytics`)
- PostgreSQL database schema (5 tables) + migrations + seed data
- Joi validation on all POST/PATCH routes
- Atomic status flips (dispatching a trip → vehicle becomes "On Trip")

### Member B — Frontend Lead
- React + Vite project setup with TailwindCSS dark theme design system
- Login page with JWT authentication flow
- Dashboard with 4 KPI cards (auto-refresh every 8s)
- Sidebar layout + protected routing
- Analytics page with Recharts + CSV export
- Shared components: `StatusPill`, `KPICard`, `DataTable`, `Modal`, `LoadingSpinner`

### Member C — Trip Dispatcher & Vehicle Registry (This Branch)
- **Trip Dispatcher page** (`/trips`)
  - Vehicle dropdown (only Available vehicles)
  - Driver dropdown (only On Duty + valid license drivers)
  - Cargo weight input with live capacity bar + overweight blocking
  - Trips table with status pills + action buttons (Dispatch / Complete / Cancel)
  - Wired to `PATCH /api/trips/:id/status` for atomic status updates
- **Vehicle Registry page** (`/vehicles`)
  - Full vehicle data table with status pills
  - Add Vehicle modal with form validation + license plate uniqueness check
- **Fleet Health Score** (Dashboard KPI)
  - Formula: `(availableVehicles / totalVehicles) × 100`
  - Color-coded: 🟢 ≥75%, 🟡 ≥50%, 🔴 <50%
- **Mock API adapter** (`mockApi.js`)
  - Allows full frontend demo without a running PostgreSQL database
  - Smart auto-detection: tries real backend first, falls back to mock data
  - Simulates atomic status flips (dispatch → vehicle/driver go "On Trip")

### Member D — Driver Profiles & Maintenance Logs
- Driver Profiles page with duty status management
- License expiry tracking with expiry badge + system-wide red banner
- Maintenance Logs page with open/close workflow
- Atomic maintenance flip: creating a log → vehicle status becomes "In Shop"

---

## 📁 Project Structure

```
FleetFlow_Odoo/
├── client/                      ← React Frontend
│   ├── src/
│   │   ├── pages/               ← Page components
│   │   │   ├── Dashboard.jsx          (Member B)
│   │   │   ├── Login.jsx              (Member B)
│   │   │   ├── Analytics.jsx          (Member B)
│   │   │   ├── VehicleRegistry.jsx    (Member C) ★
│   │   │   ├── TripDispatcher.jsx     (Member C) ★
│   │   │   ├── DriverProfiles.jsx     (Member D)
│   │   │   └── MaintenanceLogs.jsx    (Member D)
│   │   ├── components/          ← Shared UI components
│   │   │   ├── FleetHealthScore.jsx   (Member C) ★
│   │   │   ├── StatusPill.jsx         (Member B)
│   │   │   ├── KPICard.jsx            (Member B)
│   │   │   ├── Modal.jsx              (Member B)
│   │   │   ├── Layout.jsx             (Member B)
│   │   │   └── ProtectedRoute.jsx     (Member B)
│   │   ├── hooks/               ← React Query custom hooks
│   │   │   ├── useVehicles.js         (Member C) ★
│   │   │   ├── useTrips.js            (Member C) ★
│   │   │   ├── useDrivers.js          (Member C) ★
│   │   │   └── useDashboardStats.js   (Member B)
│   │   ├── lib/
│   │   │   ├── api.js                 (Member B + C)
│   │   │   ├── mockApi.js             (Member C) ★
│   │   │   └── utils.js               (Member B)
│   │   └── context/
│   │       └── AuthContext.jsx        (Member B)
├── server/                      ← Express Backend
│   ├── routes/                  ← API route handlers (Member A)
│   ├── middleware/              ← auth.js, validate.js (Member A)
│   └── server.js
├── db/
│   └── migrations/              ← Schema + seed SQL (Member A)
└── .env                         ← Environment variables
```

---

## 🔌 API Reference

| Method | Route                     | Auth | Purpose                            |
|--------|---------------------------|------|------------------------------------|
| POST   | `/api/auth/login`         | ❌   | JWT login                          |
| GET    | `/api/dashboard/stats`    | ✅   | 4 KPI values                       |
| GET    | `/api/vehicles`           | ✅   | List vehicles (supports `?status=`)|
| POST   | `/api/vehicles`           | ✅   | Create vehicle                     |
| PATCH  | `/api/vehicles/:id`       | ✅   | Update vehicle                     |
| GET    | `/api/drivers`            | ✅   | List drivers                       |
| GET    | `/api/trips`              | ✅   | List trips                         |
| POST   | `/api/trips`              | ✅   | Create trip (cargo validation)     |
| PATCH  | `/api/trips/:id/status`   | ✅   | Update status (atomic flip)        |
| POST   | `/api/maintenance`        | ✅   | Create log (vehicle → In Shop)     |
| PATCH  | `/api/maintenance/:id/close` | ✅| Close log (vehicle → Available)    |
| GET    | `/api/analytics/summary`  | ✅   | Fleet utilization + costs          |

---

## 🧪 How the Mock API Works

When PostgreSQL is **not running**, the frontend automatically uses `mockApi.js`:

```
App starts → api.js tries GET /api/vehicles (2s timeout)
  ↓ Backend responds? → Use real backend (all API calls go to Express)
  ↓ Backend offline?  → Load mockApi.js (all data served from memory)
```

**Mock data includes:** 4 vehicles, 3 drivers, 1 dispatched trip, dashboard stats.  
**To disable mock mode:** Just start PostgreSQL and restart the app.

---

## 🌿 Git Branch Strategy

| Branch                | Owner    | Purpose                          |
|-----------------------|----------|----------------------------------|
| `main`                | Team     | Final working version            |
| `dev`                 | Team     | Integration branch               |
| `feat/trip-dispatcher`| Member C | Trip Dispatcher + Vehicle Registry|
| `feat/frontend-ui`    | Member B | Frontend scaffolding + design    |
| `feat/apis-and-db`    | Member A | Backend APIs + database          |
| `feat/drivers-maint`  | Member D | Driver Profiles + Maintenance    |

---

## 📋 License

This project was built for a hackathon. MIT License.
