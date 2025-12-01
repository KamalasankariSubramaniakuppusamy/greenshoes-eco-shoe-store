import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistAPI } from '../services/api';
import { getToken } from '../utils/constants';

const WishlistContext = createContext();

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};

export const WishlistProvider = ({ children }) => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await wishlistAPI.get();
      setWishlist(response.data.items || []);
    } catch (error) {
      console.error('Fetch wishlist error:', error);
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch wishlist on mount
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // Listen for storage changes (login/logout in other tabs) and auth-change event (same tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      // Note: sessionStorage doesn't fire 'storage' events across tabs, which is fine
      // because guest sessions should be tab-specific anyway
      if (e.key === 'greenshoes_token') {
        fetchWishlist();
      }
    };
    
    // Listen for storage events (works for other tabs - only for localStorage items like token)
    window.addEventListener('storage', handleStorageChange);
    
    // Also create a custom event listener for same-tab auth changes
    const handleAuthChange = () => {
      fetchWishlist();
    };
    window.addEventListener('auth-change', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [fetchWishlist]);

  const addToWishlist = async (productId) => {
    try {
      const response = await wishlistAPI.add(productId);
      // Immediately refetch the wishlist
      await fetchWishlist();
      return { success: true };
    } catch (error) {
      console.error('Add to wishlist error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to add to wishlist',
      };
    }
  };

  const removeFromWishlist = async (productId) => {
    try {
      await wishlistAPI.remove(productId);
      // Immediately refetch the wishlist
      await fetchWishlist();
      return { success: true };
    } catch (error) {
      console.error('Remove from wishlist error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to remove from wishlist',
      };
    }
  };

  const moveToCart = async (productId, variant) => {
    try {
      await wishlistAPI.moveToCart(productId, variant);
      // Immediately refetch the wishlist
      await fetchWishlist();
      return { success: true };
    } catch (error) {
      console.error('Move to cart error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to move to cart',
      };
    }
  };

  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.product_id === productId);
  };

  const clearWishlist = () => {
    setWishlist([]);
  };

  const value = {
    wishlist,
    loading,
    fetchWishlist,
    addToWishlist,
    removeFromWishlist,
    moveToCart,
    isInWishlist,
    clearWishlist,
    itemCount: wishlist.length,
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};