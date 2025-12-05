import axios from 'axios'

/**
 * Axios instance configured for the backend API.
 * Uses VITE_API_URL env variable or defaults to localhost:8000.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  withCredentials: true,
})

export default api
