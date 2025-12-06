/**
 * Authentication Hook and Context Provider
 *
 * Provides authentication state management for the application using React Context.
 * Handles JWT token storage, user session management, and authentication operations.
 *
 * Features:
 * - Automatic session restoration on app load
 * - JWT token storage in localStorage
 * - Login, register, and logout functionality
 * - Loading state for initial auth check
 *
 * Usage:
 *   // In App.jsx or main.jsx
 *   import { AuthProvider } from './hooks/useAuth'
 *   <AuthProvider>
 *     <App />
 *   </AuthProvider>
 *
 *   // In components
 *   import { useAuth } from './hooks/useAuth'
 *   const { user, login, logout, isAuthenticated } = useAuth()
 *
 * @module hooks/useAuth
 */
import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

/**
 * React Context for authentication state.
 * Should not be used directly - use useAuth() hook instead.
 */
const AuthContext = createContext(null)

/**
 * Authentication Provider Component
 *
 * Wraps the application and provides authentication context to all children.
 * On mount, checks for existing JWT token and attempts to restore the session.
 *
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to wrap
 *
 * @example
 * <AuthProvider>
 *   <App />
 * </AuthProvider>
 */
export function AuthProvider({ children }) {
  /** Current authenticated user object, or null if not logged in */
  const [user, setUser] = useState(null)

  /** Loading state during initial authentication check */
  const [loading, setLoading] = useState(true)

  /**
   * On mount, check for existing token and restore session if valid.
   * If no token exists, immediately set loading to false.
   */
  useEffect(() => {
    const token = localStorage.getItem('access_token')
    if (token) {
      fetchUser()
    } else {
      setLoading(false)
    }
  }, [])

  /**
   * Fetch current user profile from the API.
   * On success, sets user state. On failure, clears tokens and user.
   */
  const fetchUser = async () => {
    try {
      const response = await api.get('/auth/user/')
      setUser(response.data)
    } catch (error) {
      // Token invalid or expired - clear auth state
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Authenticate user with username and password.
   * Stores JWT tokens and fetches user profile on success.
   *
   * @param {string} username - User's username
   * @param {string} password - User's password
   * @returns {Promise<Object>} Response containing access and refresh tokens
   * @throws {Error} If login fails (invalid credentials, network error, etc.)
   */
  const login = async (username, password) => {
    const response = await api.post('/auth/login/', { username, password })
    const { access, refresh } = response.data
    localStorage.setItem('access_token', access)
    localStorage.setItem('refresh_token', refresh)
    await fetchUser()
    return response.data
  }

  /**
   * Register a new user account.
   * Does NOT automatically log in the user after registration.
   *
   * @param {string} username - Desired username
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Promise<Object>} Created user data
   * @throws {Error} If registration fails (username taken, validation error, etc.)
   */
  const register = async (username, email, password) => {
    const response = await api.post('/auth/register/', { username, email, password })
    return response.data
  }

  /**
   * Log out the current user.
   * Clears JWT tokens from localStorage and resets user state.
   */
  const logout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    setUser(null)
  }

  /** Context value provided to consumers */
  const value = {
    /** Current user object or null */
    user,
    /** True during initial auth check */
    loading,
    /** Login function */
    login,
    /** Registration function */
    register,
    /** Logout function */
    logout,
    /** Convenience boolean for auth state */
    isAuthenticated: !!user,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

/**
 * Hook to access authentication context.
 *
 * Must be used within an AuthProvider. Throws error if used outside.
 *
 * @returns {Object} Authentication context with user, login, logout, etc.
 * @throws {Error} If used outside of AuthProvider
 *
 * @example
 * function MyComponent() {
 *   const { user, login, logout, isAuthenticated } = useAuth()
 *
 *   if (!isAuthenticated) {
 *     return <LoginForm onSubmit={login} />
 *   }
 *
 *   return <div>Welcome, {user.username}!</div>
 * }
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
