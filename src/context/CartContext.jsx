import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { getToken } from '../utils/constants';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({ items: [], summary: null });
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await cartAPI.get();
      setCart({
        items: response.data.items || [],
        summary: response.data.summary || null,
      });
    } catch (error) {
      console.error('Fetch cart error:', error);
      setCart({ items: [], summary: null });
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // Listen for storage changes (login/logout in other tabs or same tab)
  useEffect(() => {
    const handleStorageChange = (e) => {
      // If token changed (login/logout), refetch cart
      // Note: sessionStorage doesn't fire 'storage' events across tabs, which is fine
      // because guest sessions should be tab-specific anyway
      if (e.key === 'greenshoes_token') {
        fetchCart();
      }
    };

    // Listen for storage events (works for other tabs - only for localStorage items like token)
    window.addEventListener('storage', handleStorageChange);

    // Also create a custom event listener for same-tab auth changes
    const handleAuthChange = () => {
      fetchCart();
    };
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [fetchCart]);

  const addToCart = async (item) => {
    try {
      await cartAPI.add(item);
      await fetchCart();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to add to cart',
      };
    }
  };

  const increaseQuantity = async (itemId) => {
    try {
      await cartAPI.increase(itemId);
      await fetchCart();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update quantity',
      };
    }
  };

  const decreaseQuantity = async (itemId) => {
    try {
      await cartAPI.decrease(itemId);
      await fetchCart();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to update quantity',
      };
    }
  };

  const removeItem = async (itemId) => {
    try {
      await cartAPI.remove(itemId);
      await fetchCart();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to remove item',
      };
    }
  };

  const changeVariant = async (itemId, variant) => {
    try {
      await cartAPI.changeVariant(itemId, variant);
      await fetchCart();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to change variant',
      };
    }
  };

  const moveToWishlist = async (itemId) => {
    try {
      await cartAPI.moveToWishlist(itemId);
      await fetchCart();
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to move to wishlist',
      };
    }
  };

  const clearCart = () => {
    setCart({ items: [], summary: null });
  };

  const value = {
    cart,
    loading,
    fetchCart,
    addToCart,
    increaseQuantity,
    decreaseQuantity,
    removeItem,
    changeVariant,
    moveToWishlist,
    clearCart,
    itemCount: cart.items?.length || 0,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};