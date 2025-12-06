/**
 * API Client Module
 *
 * Centralized API client for communicating with the Django REST backend.
 * Handles JWT authentication, automatic token refresh, and provides
 * organized API methods for each feature domain.
 *
 * Features:
 * - Automatic JWT token attachment to all requests
 * - Automatic token refresh on 401 responses
 * - Redirect to login on authentication failure
 * - Organized API methods by domain (auth, habits, goals, journal)
 *
 * Usage:
 *   import { habitsAPI, goalsAPI, journalAPI } from './services/api'
 *
 *   // List all habits
 *   const response = await habitsAPI.list()
 *   console.log(response.data)
 *
 *   // Create a new habit
 *   await habitsAPI.create({ name: 'Exercise', category: 'health' })
 *
 * @module services/api
 */
import axios from 'axios'

/**
 * Axios instance configured for the backend API.
 * Base URL can be overridden via VITE_API_URL environment variable.
 */
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

/**
 * Request interceptor that attaches JWT access token to all outgoing requests.
 * Token is read from localStorage and added as Bearer token in Authorization header.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

/**
 * Response interceptor that handles JWT token refresh on 401 responses.
 *
 * When a request fails with 401 (Unauthorized):
 * 1. Attempts to refresh the access token using the refresh token
 * 2. If refresh succeeds, retries the original request with new token
 * 3. If refresh fails, clears tokens and redirects to login page
 *
 * The _retry flag prevents infinite refresh loops.
 */
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Only attempt refresh once per request (check _retry flag)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = localStorage.getItem('refresh_token')
      if (refreshToken) {
        try {
          // Request new access token using refresh token
          const response = await axios.post(
            `${api.defaults.baseURL}/auth/token/refresh/`,
            { refresh: refreshToken }
          )
          const { access } = response.data

          // Store new token and retry original request
          localStorage.setItem('access_token', access)
          originalRequest.headers.Authorization = `Bearer ${access}`
          return api(originalRequest)
        } catch (refreshError) {
          // Refresh failed - clear tokens and redirect to login
          localStorage.removeItem('access_token')
          localStorage.removeItem('refresh_token')
          window.location.href = '/login'
          return Promise.reject(refreshError)
        }
      }
    }

    return Promise.reject(error)
  }
)

/**
 * Authentication API methods.
 *
 * @property {Function} login - Authenticate user and obtain JWT tokens
 * @property {Function} register - Create a new user account
 * @property {Function} getUser - Get current authenticated user's profile
 * @property {Function} refreshToken - Manually refresh access token
 */
export const authAPI = {
  /** Login with username and password, returns { access, refresh } tokens */
  login: (username, password) => api.post('/auth/login/', { username, password }),

  /** Register new user account */
  register: (username, email, password) => api.post('/auth/register/', { username, email, password }),

  /** Get current user's profile (requires authentication) */
  getUser: () => api.get('/auth/user/'),

  /** Refresh access token using refresh token */
  refreshToken: (refresh) => api.post('/auth/token/refresh/', { refresh }),
}

/**
 * Habits API methods for managing habits and habit logs.
 *
 * Habits:
 * @property {Function} list - Get all user's habits
 * @property {Function} get - Get a specific habit by ID
 * @property {Function} create - Create a new habit
 * @property {Function} update - Update an existing habit
 * @property {Function} delete - Delete a habit
 *
 * Habit Logs (completions):
 * @property {Function} listLogs - Get all habit completion logs
 * @property {Function} createLog - Log a habit completion
 * @property {Function} deleteLog - Remove a habit completion log
 */
export const habitsAPI = {
  // Habit CRUD operations
  list: () => api.get('/habits/'),
  get: (id) => api.get(`/habits/${id}/`),
  create: (data) => api.post('/habits/', data),
  update: (id, data) => api.put(`/habits/${id}/`, data),
  delete: (id) => api.delete(`/habits/${id}/`),

  // Habit completion logs
  listLogs: () => api.get('/habits/logs/'),
  createLog: (data) => api.post('/habits/logs/', data),
  deleteLog: (id) => api.delete(`/habits/logs/${id}/`),
}

/**
 * Goals API methods for managing goals and progress updates.
 *
 * Goals:
 * @property {Function} list - Get all user's goals
 * @property {Function} get - Get a specific goal by ID
 * @property {Function} create - Create a new goal
 * @property {Function} update - Update an existing goal
 * @property {Function} delete - Delete a goal
 *
 * Goal Progress:
 * @property {Function} listProgress - Get all progress entries
 * @property {Function} createProgress - Log progress toward a goal
 * @property {Function} deleteProgress - Remove a progress entry
 */
export const goalsAPI = {
  // Goal CRUD operations
  list: () => api.get('/goals/'),
  get: (id) => api.get(`/goals/${id}/`),
  create: (data) => api.post('/goals/', data),
  update: (id, data) => api.put(`/goals/${id}/`, data),
  delete: (id) => api.delete(`/goals/${id}/`),

  // Goal progress tracking
  listProgress: () => api.get('/goals/progress/'),
  createProgress: (data) => api.post('/goals/progress/', data),
  deleteProgress: (id) => api.delete(`/goals/progress/${id}/`),
}

/**
 * Journal API methods for managing journal entries.
 *
 * @property {Function} list - Get all user's journal entries
 * @property {Function} get - Get a specific entry by ID
 * @property {Function} create - Create a new journal entry
 * @property {Function} update - Update an existing entry
 * @property {Function} delete - Delete a journal entry
 */
export const journalAPI = {
  list: () => api.get('/journal/'),
  get: (id) => api.get(`/journal/${id}/`),
  create: (data) => api.post('/journal/', data),
  update: (id, data) => api.put(`/journal/${id}/`, data),
  delete: (id) => api.delete(`/journal/${id}/`),
}

export default api
