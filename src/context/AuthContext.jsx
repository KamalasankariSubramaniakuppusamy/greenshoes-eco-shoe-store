// ============================================================================
// AuthContext.jsx
// ============================================================================
// Global authentication state management
// Provides user data and auth methods to the entire app via React Context
//
// Features:
// - Persistent login (token stored in localStorage)
// - Login/register with API integration
// - Logout with complete session cleanup
// - Auth state broadcast for other contexts (cart, wishlist)

import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { saveAuth, clearAuth, getToken, getUser, regenerateGuestId } from '../utils/constants';

// Create the context
const AuthContext = createContext();

// --------------------------------------------------------------------------
// Custom hook for consuming auth context
// --------------------------------------------------------------------------
// Components use this instead of useContext(AuthContext) directly
// Throws a helpful error if used outside the provider
//
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};


// --------------------------------------------------------------------------
// Auth Provider Component
// --------------------------------------------------------------------------
// Wrap your app with this to make auth state available everywhere
// Usually in main.jsx or App.jsx: <AuthProvider><App /></AuthProvider>
//
export const AuthProvider = ({ children }) => {
  // Current user object (null if not logged in)
  const [user, setUser] = useState(null);
  
  // Loading state - true while checking for existing session on app load
  const [loading, setLoading] = useState(true);

  // ---------- CHECK FOR EXISTING SESSION ON MOUNT ----------
  // If user previously logged in and closed the tab, restore their session
  // Token and user data are stored in localStorage by saveAuth()
  useEffect(() => {
    const token = getToken();
    const userData = getUser();
    if (token && userData) {
      // User was logged in - restore their session
      setUser(userData);
      // Note: we trust the stored data here
      // Could add token validation API call for extra security
    }
    setLoading(false);  // Done checking, app can render
  }, []);

  // ---------- LOGIN ----------
  // Sends credentials to API, stores token and user if successful
  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      
      // Save to localStorage for persistence
      saveAuth(token, user);
      setUser(user);
      
      // Notify other contexts (CartContext, WishlistContext) that auth changed
      // They'll merge guest cart/wishlist with user's existing data
      window.dispatchEvent(new Event('auth-change'));
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  // ---------- REGISTER ----------
  // Creates new account, automatically logs user in if successful
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      
      // Save session (same as login - user is now authenticated)
      saveAuth(token, user);
      setUser(user);
      
      // Notify other contexts about new auth state
      window.dispatchEvent(new Event('auth-change'));
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
      };
    }
  };

  // ---------- LOGOUT ----------
  // Clears all auth state and starts a fresh guest session
  const logout = () => {
    // Clear token and user from localStorage
    clearAuth();
    setUser(null);
    
    // Generate a new guest ID for the fresh session
    // This ensures the old user's cart/wishlist isn't accessible
    // to whoever uses the browser next
    regenerateGuestId();
    
    // Hard reload to completely reset React state
    // This is simpler than manually resetting cart, wishlist, etc.
    // The timestamp busts any browser caching
    window.location.href = '/?logout=' + Date.now();
  };

  // ---------- CONTEXT VALUE ----------
  // Everything that consuming components can access
  const value = {
    user,                        // User object or null
    isAuthenticated: !!user,     // Boolean convenience property
    loading,                     // True during initial session check
    login,                       // Login function
    register,                    // Register function
    logout,                      // Logout function
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// ----------------------------------------------------------------------------
// HOW AUTH FLOW WORKS:
// ----------------------------------------------------------------------------
//
// INITIAL LOAD:
// 1. App starts, AuthProvider mounts
// 2. useEffect checks localStorage for existing token/user
// 3. If found, setUser() restores the session
// 4. loading becomes false, app renders with correct auth state
//
// LOGIN:
// 1. User submits credentials via LoginDrawer
// 2. login() sends to API
// 3. On success: token/user saved to localStorage, user state updated
// 4. 'auth-change' event dispatched - CartContext/WishlistContext listen
// 5. Those contexts merge guest data with user's saved data
// 6. Component returns { success: true }, UI updates
//
// LOGOUT:
// 1. User clicks logout
// 2. clearAuth() removes token/user from localStorage
// 3. regenerateGuestId() creates fresh guest session
// 4. Hard reload clears all React state and starts fresh
//
// TOKEN USAGE:
// - Token is automatically included in API requests via axios interceptor
// - See services/api.js for the implementation
// - Backend validates token and identifies user
//
// SECURITY NOTES:
// - Tokens expire after 1 hour (set on backend)
// - No refresh token implementation (user re-logs in after expiry)
// - Token stored in localStorage (vulnerable to XSS but simple)
// - Could upgrade to httpOnly cookies for better security
// ----------------------------------------------------------------------------