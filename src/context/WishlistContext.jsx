// ============================================================================
// WishlistContext management
// ============================================================================
// Global wishlist state management
// Provides wishlist data and operations to the entire app via React Context
//
// Features:
// - Works for both authenticated users and guests
// - Syncs with backend on every operation
// - Listens for auth changes to merge guest wishlist on login
// - Quick lookup to check if product is in wishlist (for heart icons)
//
// KEY DIFFERENCE FROM CART:
// - Wishlist stores PRODUCTS (not specific variants)
// - When moving to cart, user must select size/color
// - Items don't have quantities (just saved or not saved)

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { wishlistAPI } from '../services/api';
import { getToken } from '../utils/constants';

// Create the context
const WishlistContext = createContext();

// --------------------------------------------------------------------------
// Custom hook for consuming wishlist context
// --------------------------------------------------------------------------
// Components use this instead of useContext(WishlistContext) directly
//
export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within WishlistProvider');
  }
  return context;
};


// --------------------------------------------------------------------------
// Wishlist Provider Component
// --------------------------------------------------------------------------
// Wrap your app with this to make wishlist state available everywhere
// Usually nested inside AuthProvider in main.jsx
//
export const WishlistProvider = ({ children }) => {
  // Wishlist is just an array of product objects (not variants)
  const [wishlist, setWishlist] = useState([]);
  
  // Loading state for showing spinners
  const [loading, setLoading] = useState(false);

  // ---------- FETCH WISHLIST FROM API ----------
  // useCallback keeps the function reference stable
  const fetchWishlist = useCallback(async () => {
    try {
      setLoading(true);
      const response = await wishlistAPI.get();
      setWishlist(response.data.items || []);
    } catch (error) {
      console.error('Fetch wishlist error:', error);
      // On error, reset to empty
      setWishlist([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // ---------- FETCH WISHLIST ON MOUNT ----------
  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  // ---------- LISTEN FOR AUTH CHANGES ----------
  // When user logs in, their wishlist merges with guest wishlist
  // When user logs out, start fresh
  useEffect(() => {
    // Handle storage events (login/logout in OTHER tabs)
    const handleStorageChange = (e) => {
      // sessionStorage (guest ID) doesn't fire cross-tab events
      // which is intentional - guest sessions are per-tab
      if (e.key === 'greenshoes_token') {
        fetchWishlist();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Handle auth changes in the SAME tab
    // AuthContext dispatches 'auth-change' after login/register
    const handleAuthChange = () => {
      fetchWishlist();
    };
    window.addEventListener('auth-change', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('auth-change', handleAuthChange);
    };
  }, [fetchWishlist]);

  // ---------- WISHLIST OPERATIONS ----------
  // All follow the same pattern: call API, then refetch to sync state

  // Add a product to wishlist
  // Note: just needs productId, not color/size (that's selected when moving to cart)
  const addToWishlist = async (productId) => {
    try {
      const response = await wishlistAPI.add(productId);
      await fetchWishlist();  // Refresh to get updated list
      return { success: true };
    } catch (error) {
      console.error('Add to wishlist error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to add to wishlist',
      };
    }
  };

  // Remove a product from wishlist
  const removeFromWishlist = async (productId) => {
    try {
      await wishlistAPI.remove(productId);
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

  // Move product from wishlist to cart
  // Requires variant (color + size) since cart needs specific variants
  const moveToCart = async (productId, variant) => {
    try {
      await wishlistAPI.moveToCart(productId, variant);
      await fetchWishlist();  // Item will be removed from wishlist
      return { success: true };
    } catch (error) {
      console.error('Move to cart error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Failed to move to cart',
      };
    }
  };

  // ---------- UTILITY: CHECK IF PRODUCT IS IN WISHLIST ----------
  // Used by ProductCard to show filled vs empty heart icon
  // This is a synchronous lookup against current state
  const isInWishlist = (productId) => {
    return wishlist.some((item) => item.product_id === productId);
  };

  // Clear wishlist locally (used after certain operations)
  const clearWishlist = () => {
    setWishlist([]);
  };

  // ---------- CONTEXT VALUE ----------
  // Everything that consuming components can access
  const value = {
    wishlist,           // Array of wishlist items (products)
    loading,            // Boolean for loading states
    fetchWishlist,      // Manual refresh function
    addToWishlist,      // Add product
    removeFromWishlist, // Remove product
    moveToCart,         // Move to cart (with variant selection)
    isInWishlist,       // Check if product is wishlisted
    clearWishlist,      // Empty wishlist locally
    itemCount: wishlist.length,  // Quick count for header badge
  };

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
};

// ----------------------------------------------------------------------------
// WISHLIST VS CART - KEY DIFFERENCES:
// ----------------------------------------------------------------------------
//
// WISHLIST:
// - Stores products (not variants)
// - No color/size selection needed to add
// - No quantity (product is either saved or not)
// - "I like this, might buy it later"
// - Heart icon toggle on product cards
//
// CART:
// - Stores specific variants (product + color + size)
// - Must select color/size to add
// - Has quantity per item
// - "I'm ready to buy this specific item"
// - Full checkout flow
//
// MOVING WISHLIST -> CART:
// 1. User clicks "Move to Cart" on wishlist item
// 2. Modal opens to select size (color comes from product)
// 3. Backend adds to cart with selected variant
// 4. Backend removes from wishlist
// 5. Both contexts refetch their data
//
// ----------------------------------------------------------------------------
// WISHLIST DATA STRUCTURE:
// ----------------------------------------------------------------------------
// [
//   {
//     wishlist_item_id: "uuid",
//     product_id: "uuid",
//     name: "Ocean Drift",
//     category: "sneakers",
//     selling_price: "129.99",
//     sale_price: "99.99",
//     on_sale: true,
//     image_url: "/images/...",
//     color: "blue",              // Default/first color
//     available_sizes: ["6", "7", "8", ...],  // For move-to-cart modal
//     available_colors: [...]     // For display
//   }
// ]
//
// Note: Unlike cart items, wishlist items don't have:
// - quantity
// - selected size (determined at move-to-cart time)
// - line_total (no pricing calculation needed)
// ----------------------------------------------------------------------------