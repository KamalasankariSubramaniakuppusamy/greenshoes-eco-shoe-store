// ============================================================================
//  Cart items
// ============================================================================
// Individual cart item component - displays product with controls to modify it
// Used in the cart page to show each item the user has added
//
// Features:
// - Quantity adjustment (+/- buttons)
// - Color/size variant changing via dropdowns
// - Remove from cart
// - Move to wishlist (registered users only)
// - Links to product detail page

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Heart, Minus, Plus, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/constants';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

// Base URL for images - strips /api from the API URL since images are served from root
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

// ----------------------------------------------------------------------------
// Helper: Get full image URL
// ----------------------------------------------------------------------------
// Handles different image path formats:
// - null/undefined -> fallback placeholder
// - Already full URL (http...) -> use as-is
// - Relative path (/images/...) -> prepend API base
//
const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE}${imagePath}`;
};


const CartItem = ({ item }) => {
  // Cart actions from context
  const { increaseQuantity, decreaseQuantity, removeItem, changeVariant, moveToWishlist } = useCart();
  const { isAuthenticated } = useAuth();
  
  // Local loading state - disables buttons while API calls are in flight
  const [loading, setLoading] = useState(false);
  // Temporary state to show success message after moving to wishlist
  const [movedToWishlist, setMovedToWishlist] = useState(false);

  // ---------- QUANTITY HANDLERS ----------
  
  const handleIncrease = async () => {
    setLoading(true);
    await increaseQuantity(item.cart_item_id);
    setLoading(false);
  };

  const handleDecrease = async () => {
    setLoading(true);
    await decreaseQuantity(item.cart_item_id);
    setLoading(false);
    // Note: if quantity becomes 0, the backend removes the item automatically
  };

  // ---------- REMOVE HANDLER ----------
  
  const handleRemove = async () => {
    // Confirmation dialog - don't want accidental removals
    if (window.confirm('Remove this item from cart?')) {
      setLoading(true);
      await removeItem(item.cart_item_id);
      setLoading(false);
    }
  };

  // ---------- WISHLIST HANDLER ----------
  
  const handleMoveToWishlist = async () => {
    // Guests can't have wishlists (well, they can, but we're requiring login here)
    // Prompt them to log in first
    if (!isAuthenticated) {
      if (window.confirm('Please login to save items to your wishlist. Would you like to login now?')) {
        // Redirect to login with return URL so they come back to cart after
        window.location.href = '/login?redirect=/cart';
      }
      return;
    }
    
    setLoading(true);
    const result = await moveToWishlist(item.cart_item_id);
    if (result?.success) {
      setMovedToWishlist(true);
      // This state is temporary - the item gets removed from cart
      // so the whole component will unmount shortly
    }
    setLoading(false);
  };

  // ---------- VARIANT CHANGE HANDLERS ----------
  // When user changes color or size, we call the API to update the cart item
  // Backend handles the logic of finding the new inventory record
  
  const handleColorChange = async (e) => {
    setLoading(true);
    await changeVariant(item.cart_item_id, { color: e.target.value, size: item.size });
    setLoading(false);
  };

  const handleSizeChange = async (e) => {
    setLoading(true);
    await changeVariant(item.cart_item_id, { color: item.color, size: e.target.value });
    setLoading(false);
  };

  // Parse prices (come as strings from API)
  const effectivePrice = parseFloat(item.effective_price);  // Sale price if on sale, otherwise regular
  const lineTotal = parseFloat(item.line_total);            // effectivePrice * quantity

  return (
    <div className="flex gap-4 py-6 border-b">
      {/* -------- PRODUCT IMAGE -------- */}
      {/* Clickable - takes you to product detail page */}
      <Link to={`/product/${item.product_id}`} className="w-24 h-24 flex-shrink-0">
        <img
          src={getImageUrl(item.image_url)}
          alt={item.name}
          className="w-full h-full object-cover rounded hover:opacity-80 transition-opacity"
          onError={(e) => {
            // If image fails to load, show placeholder
            e.target.src = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800';
          }}
        />
      </Link>

      {/* -------- PRODUCT DETAILS -------- */}
      <div className="flex-1">
        {/* Product name - also links to product page */}
        <Link 
          to={`/product/${item.product_id}`} 
          className="font-medium text-gray-900 hover:text-accent transition-colors"
        >
          {item.name}
        </Link>
        <p className="text-sm text-gray-600 mt-1 capitalize">{item.category}</p>

        {/* -------- VARIANT SELECTORS -------- */}
        {/* Let user change color/size without removing and re-adding */}
        <div className="flex gap-4 mt-3">
          {/* Color dropdown */}
          <div>
            <label className="text-xs text-gray-600">Color:</label>
            <select
              value={item.color}
              onChange={handleColorChange}
              disabled={loading}
              className="ml-2 text-sm border border-gray-300 rounded px-2 py-1 capitalize"
            >
              {/* available_colors comes from the cart API response */}
              {item.available_colors?.map((color) => (
                <option key={color.id} value={color.value}>
                  {color.value}
                </option>
              ))}
            </select>
          </div>

          {/* Size dropdown */}
          <div>
            <label className="text-xs text-gray-600">Size:</label>
            <select
              value={item.size}
              onChange={handleSizeChange}
              disabled={loading}
              className="ml-2 text-sm border border-gray-300 rounded px-2 py-1"
            >
              {item.available_sizes?.map((size) => (
                <option key={size.id} value={size.value}>
                  {size.value}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* -------- QUANTITY CONTROLS -------- */}
        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleDecrease}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <Minus size={16} />
          </button>
          <span className="w-12 text-center">{item.quantity}</span>
          <button
            onClick={handleIncrease}
            disabled={loading}
            className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50"
          >
            <Plus size={16} />
          </button>
        </div>

        {/* -------- ACTION BUTTONS -------- */}
        <div className="flex gap-4 mt-3">
          {/* Move to Wishlist */}
          <button
            onClick={handleMoveToWishlist}
            disabled={loading || movedToWishlist}
            className={`text-sm flex items-center gap-1 transition-colors ${
              movedToWishlist 
                ? 'text-pink-500' 
                : 'text-gray-600 hover:text-pink-500'
            }`}
          >
            <Heart 
              size={16} 
              className={movedToWishlist ? 'fill-pink-500 text-pink-500' : ''} 
            />
            {movedToWishlist ? 'Moved to Wishlist!' : 'Move to Wishlist'}
          </button>
          
          {/* Remove from cart */}
          <button
            onClick={handleRemove}
            disabled={loading}
            className="text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            <Trash2 size={16} />
            Remove
          </button>
        </div>
      </div>

      {/* -------- PRICE -------- */}
      <div className="text-right">
        {/* Line total (price * quantity) */}
        <p className="font-semibold text-gray-900">{formatCurrency(lineTotal)}</p>
        {/* Show per-item price if quantity > 1 */}
        {item.quantity > 1 && (
          <p className="text-xs text-gray-600 mt-1">
            {formatCurrency(effectivePrice)} each
          </p>
        )}
      </div>
    </div>
  );
};

export default CartItem;