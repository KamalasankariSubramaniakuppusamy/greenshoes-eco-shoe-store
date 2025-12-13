// ============================================================================
// Cart stuff
// ============================================================================
// Global shopping cart state management
// Provides cart data and operations to the entire app via React Context
//
// Features:
// - Works for both authenticated users and guests
// - Syncs with backend on every operation (not optimistic updates)
// - Listens for auth changes to merge guest cart on login
// - Cross-tab sync via storage events

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { cartAPI } from '../services/api';
import { getToken } from '../utils/constants';

// Create the context
const CartContext = createContext();

// --------------------------------------------------------------------------
// Custom hook for consuming cart context
// --------------------------------------------------------------------------
// Components use this instead of useContext(CartContext) directly
//
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};


// --------------------------------------------------------------------------
// Cart Provider Component
// --------------------------------------------------------------------------
// Wrap your app with this to make cart state available everywhere
// Usually nested inside AuthProvider in main.jsx
//
export const CartProvider = ({ children }) => {
  // Cart state - items array and summary (totals, tax, shipping)
  const [cart, setCart] = useState({ items: [], summary: null });
  
  // Loading state for showing spinners during operations
  const [loading, setLoading] = useState(false);

  // ---------- FETCH CART FROM API ----------
  // useCallback ensures this function reference is stable
  // (won't cause unnecessary re-renders in useEffect dependencies)
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
      // On error, reset to empty cart
      setCart({ items: [], summary: null });
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- FETCH CART ON MOUNT ----------
  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  // ---------- LISTEN FOR AUTH CHANGES ----------
  // When user logs in/out, we need to fetch the appropriate cart
  // - Login: API returns user's cart (merged with guest cart on backend)
  // - Logout: Start fresh with new guest cart
  useEffect(() => {
    // Handle storage events (login/logout in OTHER tabs)
    // This is for localStorage items like the auth token
    const handleStorageChange = (e) => {
      if (e.key === 'greenshoes_token') {
        fetchCart();
      }
    };

    // Handle auth changes in the SAME tab
    // AuthContext dispatches this custom event after login/register
    const handleAuthChange = () => {
      fetchCart();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('auth-change', handleAuthChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [fetchCart]);

  // ---------- CART OPERATIONS ----------
  // All operations follow the same pattern:
  // 1. Call API
  // 2. Re-fetch cart to get updated state
  // 3. Return success/error result
  //
  // This is NOT optimistic updating - we wait for the server
  // Simpler but slightly slower UX

  // Add item to cart (product + color + size + quantity)
  const addToCart = async (item) => {
    try {
      await cartAPI.add(item);
      await fetchCart();  // Refresh cart state
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to add to cart',
      };
    }
  };

  // Increase quantity by 1
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

  // Decrease quantity by 1 (removes item if quantity becomes 0)
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

  // Remove item from cart entirely
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

  // Change color/size of an item (finds new inventory record)
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

  // Move item to wishlist (removes from cart, adds to wishlist)
  // Only works for authenticated users
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

  // Clear cart locally (used after successful checkout)
  const clearCart = () => {
    setCart({ items: [], summary: null });
  };

  // ---------- CONTEXT VALUE ----------
  // Everything that consuming components can access
  const value = {
    cart,                // { items: [], summary: { subtotal, tax, shipping, total } }
    loading,             // Boolean for showing loading states
    fetchCart,           // Manual refresh function
    addToCart,           // Add new item
    increaseQuantity,    // +1 quantity
    decreaseQuantity,    // -1 quantity
    removeItem,          // Delete item
    changeVariant,       // Change size/color
    moveToWishlist,      // Move to wishlist
    clearCart,           // Empty cart locally
    itemCount: cart.items?.length || 0,  // Quick count for header badge
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// ----------------------------------------------------------------------------
// HOW CART WORKS FOR GUESTS VS USERS:
// ----------------------------------------------------------------------------
//
// GUESTS:
// - Identified by x-guest-id header (UUID stored in sessionStorage)
// - Cart stored in DB with user_id = NULL, guest_id = UUID
// - Cart persists for the browser session (until tab/window closed)
// - Each tab gets its own guest ID (sessionStorage is per-tab)
//
// AUTHENTICATED USERS:
// - Identified by JWT token in Authorization header
// - Cart stored in DB with user_id = their ID
// - Cart persists across sessions (tied to account)
//
// GUEST -> USER TRANSITION (LOGIN):
// 1. User browses as guest, adds items to cart
// 2. User logs in
// 3. Backend merges guest cart into user's existing cart
// 4. CartContext receives 'auth-change' event
// 5. fetchCart() gets the merged cart
//
// USER -> GUEST TRANSITION (LOGOUT):
// 1. User logs out
// 2. AuthContext clears token, regenerates guest ID
// 3. Hard page reload clears all state
// 4. New session starts with empty guest cart
//
// ----------------------------------------------------------------------------
// CART DATA STRUCTURE:
// ----------------------------------------------------------------------------
// {
//   items: [
//     {
//       cart_item_id: "uuid",
//       product_id: "uuid",
//       name: "Ocean Drift",
//       category: "sneakers",
//       color: "blue",
//       size: "8",
//       quantity: 2,
//       selling_price: "129.99",
//       effective_price: "99.99",  // Sale price if on sale
//       line_total: "199.98",      // effective_price * quantity
//       image_url: "/images/...",
//       available_colors: [...],   // For variant selector
//       available_sizes: [...]     // For variant selector
//     }
//   ],
//   summary: {
//     subtotal: "199.98",
//     tax: "12.00",       // 6%
//     shipping: "11.99",  // Flat rate
//     total: "223.93"
//   }
// }
// ----------------------------------------------------------------------------