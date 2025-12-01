import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import { saveAuth, clearAuth, getToken, getUser, regenerateGuestId } from '../utils/constants';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    const userData = getUser();
    if (token && userData) {
      setUser(userData);
    }
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      const response = await authAPI.login(credentials);
      const { token, user } = response.data;
      saveAuth(token, user);
      setUser(user);
      
      // Dispatch custom event to notify CartContext and WishlistContext
      window.dispatchEvent(new Event('auth-change'));
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      const { token, user } = response.data;
      saveAuth(token, user);
      setUser(user);
      
      // Dispatch custom event to notify CartContext and WishlistContext
      window.dispatchEvent(new Event('auth-change'));
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed',
      };
    }
  };

  const logout = () => {
    // Clear authentication
    clearAuth();
    setUser(null);
    
    // Generate a new guest ID so the new session is completely fresh
    // This prevents the old user's cart/wishlist from being accessible
    regenerateGuestId();
    
    // Force a complete hard reload to reset all React state (cart, wishlist, etc.)
    // Add timestamp to bust any caching
    window.location.href = '/?logout=' + Date.now();
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};