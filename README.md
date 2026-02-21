Below is the same cleaned README in pure **Markdown (.md) format** — no formatting tricks, just copy-paste into `README.md`.

---

```md
# FleetFlow 🚀
**Modular Fleet & Logistics Management System**

FleetFlow replaces paper logbooks with a live digital command center — real-time fleet tracking, driver safety monitoring, and operational analytics.

---

## 🏗️ Architecture
```

FleetFlow_Odoo/
├── client/          → React 18 + Vite
│   └── src/
│       ├── pages/
│       ├── components/
│       ├── context/
│       └── lib/
├── server/          → Node.js + Express
│   ├── routes/
│   ├── controllers/
│   └── middleware/
└── db/
└── migrations/

````

---

## ✨ Key Features

| Feature | Behavior | Impact |
| :--- | :--- | :--- |
| **Real-time OTP Registration** | Two-step email verification using `nodemailer` before account activation | Secure provisioning |
| **Live Trips Dashboard** | Interactive filtering of active trips (Truck, Van, Bike) | Real-time analytics |
| **Atomic Status Flips** | Maintenance log creation instantly sets vehicle to "In Shop" everywhere | Data integrity |
| **Inline Cargo Validation** | Blocks submission if cargo exceeds vehicle capacity | Prevents errors |
| **Global License Expiry Alert** | Alerts across all pages for drivers nearing expiry | Proactive safety |

---

## 🏗️ Tech Stack & Dependencies

### Frontend
- React 18
- React Router
- Axios
- React Query
- Recharts
- React Hook Form
- React Hot Toast
- Lucide Icons
- XLSX Export
- TailwindCSS + Vite

### Backend
- Express
- PostgreSQL (pg)
- bcrypt
- JWT Authentication
- Joi Validation
- Nodemailer
- dotenv
- cors / helmet

---

## ⚡ Quick Start

### Prerequisites
- Node.js v18+
- PostgreSQL 14+
- Git

### 1 — Clone
```bash
git clone git@github.com:tej0730/FleetFlow_Odoo.git
cd FleetFlow_Odoo
````

### 2 — Database Setup

```bash
createdb fleetflow_dev
```

### 3 — Environment Variables

```bash
cp .env.example .env
```

### 4 — Backend

```bash
cd server
npm install
npm run migrate
npm run seed
npm run dev
```

### 5 — Frontend

```bash
cd client
npm install
npm run dev
```

### 6 — Open

```
http://localhost:5173
```

Demo: `admin@fleetflow.io / password123`

---

## 🌐 API Reference

| Method | Route                      | Auth | Description        |
| ------ | -------------------------- | ---- | ------------------ |
| POST   | /api/auth/login            | ✅    | Login              |
| GET    | /api/dashboard/stats       | ✅    | Dashboard KPIs     |
| GET    | /api/vehicles              | ✅    | List vehicles      |
| POST   | /api/vehicles              | ✅    | Add vehicle        |
| PATCH  | /api/vehicles/:id          | ✅    | Update vehicle     |
| GET    | /api/trips                 | ✅    | List trips         |
| POST   | /api/trips                 | ✅    | Create trip        |
| PATCH  | /api/trips/:id/status      | ✅    | Update trip status |
| GET    | /api/drivers               | ✅    | List drivers       |
| POST   | /api/drivers               | ✅    | Add driver         |
| PATCH  | /api/drivers/:id           | ✅    | Update driver      |
| GET    | /api/drivers/expiring-soon | ✅    | Expiring drivers   |
| GET    | /api/maintenance           | ✅    | Maintenance logs   |
| POST   | /api/maintenance           | ✅    | Create maintenance |
| PATCH  | /api/maintenance/:id/close | ✅    | Close maintenance  |
| GET    | /api/analytics/summary     | ✅    | Utilization stats  |
| GET    | /api/reports/monthly       | ✅    | Monthly report     |
| POST   | /api/fuel-logs             | ✅    | Fuel logging       |

---

## 🎨 Status Reference

| Status    | Meaning         |
| --------- | --------------- |
| Available | Ready to assign |
| On Trip   | Active          |
| In Shop   | Blocked         |
| Retired   | Inactive        |
| Draft     | Not dispatched  |
| Completed | Finished        |
| Cancelled | Cancelled       |

---

## 📂 Frontend File Reference

| File                | Purpose         |
| ------------------- | --------------- |
| App.jsx             | Routing         |
| main.jsx            | Providers       |
| api.js              | Axios config    |
| utils.js            | Helpers         |
| AuthContext.jsx     | Authentication  |
| Layout.jsx          | Layout + alerts |
| StatusPill.jsx      | Status badge    |
| KPICard.jsx         | Metrics         |
| DataTable.jsx       | Tables          |
| Modal.jsx           | Modal           |
| Login.jsx           | Login           |
| Dashboard.jsx       | KPIs            |
| VehicleRegistry.jsx | Vehicles        |
| Analytics.jsx       | Charts          |
| TripDispatcher.jsx  | Trips           |
| DriverProfiles.jsx  | Drivers         |
| MaintenanceLogs.jsx | Maintenance     |

```

---

You can now paste this directly into `README.md` — it will render properly on GitHub.
```
