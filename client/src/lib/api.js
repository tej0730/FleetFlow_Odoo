import axios from 'axios'
import { applyMockAdapter } from './mockApi';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Enable mock backend for testing without DB
applyMockAdapter(api);

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
