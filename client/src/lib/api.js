import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// ─── Smart Backend Detection ───────────────────────────
// If the real backend is unreachable, fall back to mock data
// so the frontend can be demoed without PostgreSQL running.
// When the backend team merges and runs with a live DB,
// this mock adapter is automatically skipped.
// ────────────────────────────────────────────────────────
async function initApiMode() {
  try {
    // Quick health check — if the backend responds, use real API
    await axios.get('/api/vehicles', { timeout: 2000 })
    console.log('✅ Connected to real backend API')
  } catch {
    // Backend unreachable — enable mock adapter for offline demo
    console.warn('⚠️ Backend unreachable — using mock data for demo')
    const { applyMockAdapter } = await import('./mockApi')
    applyMockAdapter(api)
  }
}

initApiMode()

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('fleetflow_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('fleetflow_token')
      localStorage.removeItem('fleetflow_user')
      if (window.location.pathname !== '/login') {
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
