import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'

// Pages
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import VehicleRegistry from './pages/VehicleRegistry'
import TripDispatcher from './pages/TripDispatcher'
import DriverProfiles from './pages/DriverProfiles'
import MaintenanceLogs from './pages/MaintenanceLogs'
import Analytics from './pages/Analytics'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />

        {/* Protected — wrapped in Layout sidebar */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/"            element={<Dashboard />} />
            <Route path="/vehicles"    element={<VehicleRegistry />} />
            <Route path="/trips"       element={<TripDispatcher />} />
            <Route path="/drivers"     element={<DriverProfiles />} />
            <Route path="/maintenance" element={<MaintenanceLogs />} />
            <Route path="/analytics"   element={<Analytics />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  )
}
