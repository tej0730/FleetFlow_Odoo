import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token storage
let authToken = localStorage.getItem('fleetflow_token');
let loginPromise = null;

// Auto-attach JWT token to every request
api.interceptors.request.use(async (config) => {
  // If no token yet and not a login request, wait for auto-login
  if (!authToken && !config.url.includes('/auth/login')) {
    await ensureAuth();
  }
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

// Auto-login function — fetches a JWT token using seed credentials
async function ensureAuth() {
  if (authToken) return;
  if (loginPromise) return loginPromise;

  loginPromise = (async () => {
    try {
      // Use the api instance itself (which has baseURL = '/api')
      const res = await axios.post('/api/auth/login', {
        email: 'dispatcher@fleetflow.test',
        password: 'password123',
      }, {
        // Manually proxy — in dev, Vite proxies /api to localhost:5000
        // But since we're inside an interceptor, we use a direct baseURL fallback
        baseURL: '',
      });
      authToken = res.data.token;
      localStorage.setItem('fleetflow_token', authToken);
      console.log('✅ Auto-logged in as:', res.data.user.name);
    } catch (err) {
      console.error('❌ Auto-login failed:', err.message);
      // Try with explicit backend URL as fallback
      try {
        const res = await axios.post('http://localhost:5000/api/auth/login', {
          email: 'dispatcher@fleetflow.test',
          password: 'password123',
        });
        authToken = res.data.token;
        localStorage.setItem('fleetflow_token', authToken);
        console.log('✅ Auto-logged in (fallback) as:', res.data.user.name);
      } catch (err2) {
        console.error('❌ Auto-login fallback also failed:', err2.message);
      }
    } finally {
      loginPromise = null;
    }
  })();

  return loginPromise;
}

// On 401 response, try to re-authenticate
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401 && !error.config._retry) {
      error.config._retry = true;
      authToken = null;
      localStorage.removeItem('fleetflow_token');
      await ensureAuth();
      if (authToken) {
        error.config.headers.Authorization = `Bearer ${authToken}`;
        return api(error.config);
      }
    }
    return Promise.reject(error);
  }
);

// Kick off auto-login immediately
ensureAuth();

export default api;
