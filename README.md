# FleetFlow 

FleetFlow replaces inefficient manual logbooks with a centralized, rule-based digital hub that optimizes the lifecycle of a delivery fleet, monitors driver safety, and tracks financial performance. 

## Overview
- **Type**: Modular Fleet & Logistics Management System
- **Role Scopes**: Fleet Manager, Dispatcher, Safety Officer, Financial Analyst

## Tech Stack
- **Frontend**: React 18 + Vite, TailwindCSS, shadcn/ui, Recharts, Axios, React Query, React Router v6
- **Backend**: Node.js + Express.js, PostgreSQL (Database), JWT Auth

## Project Structure
```text
fleetflow/
├── client/          (React app)
├── server/          (Express app)
└── db/migrations/   (Database schemas)
```

## Quick Start Setup

### Prerequisites
- Node.js installed
- PostgreSQL installed and running
- Git installed

### 1. Database Setup
Create a local PostgreSQL database named `fleetflow_dev`:
```bash
createdb fleetflow_dev
```

### 2. Environment Variables
Copy `.env.example` to `.env` in the root directory:
```bash
cp .env.example .env
```
Ensure your database credentials match in the `.env` file.

### 3. Server Setup
Navigate into the server directory, install dependencies, run migrations and seeds:
```bash
cd server
npm install
# npm run migrate (after script is added)
# npm run seed (after script is added)
npm run dev
```
*Backend will run on http://localhost:5000*

### 4. Client Setup
Open a new terminal, navigate into the client directory, install, and start:
```bash
cd client
npm install
npm run dev
```
*Frontend will run on http://localhost:5173*
