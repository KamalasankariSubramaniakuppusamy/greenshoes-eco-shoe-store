// ============================================================================
// CartDrawer - jUST ANOTHER slide in drawer from the right for the cart
// ============================================================================
// Mini cart drawer - slides out from header when clicking cart icon
// Shows a quick preview of cart contents without going to full cart page
//
// Features:
// - Item list with images, names, variants, prices
// - Quantity adjustment (+/- buttons)
// - Remove items
// - Order summary (subtotal, tax, shipping, total)
// - Quick links to checkout or full cart page

import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/constants';
import Button from '../common/Button';

// Base URL for product images
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

// ----------------------------------------------------------------------------
// Helper: Get full image URL
// ----------------------------------------------------------------------------
const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE}${imagePath}`;
};


const CartDrawer = ({ onClose }) => {
  const { cart, loading, increaseQuantity, decreaseQuantity, removeItem } = useCart();
  const items = cart.items || [];

  // ---------- HELPER FUNCTIONS ----------
  // API response structure can vary slightly, these handle the differences
  
  // Get the unique identifier for a cart item
  const getItemId = (item) => item.cart_item_id || item.id;
  
  // Get the price - handle different field names from API
  const getItemPrice = (item) => {
    const price = item.selling_price || item.price || item.sale_price || item.unit_price || 0;
    return parseFloat(price) || 0;
  };

  // ---------- EVENT HANDLERS ----------
  
  const handleQuantityChange = async (itemId, action) => {
    if (action === 'increase') {
      await increaseQuantity(itemId);
    } else {
      await decreaseQuantity(itemId);
    }
  };

  const handleRemove = async (itemId) => {
    await removeItem(itemId);
  };

  // ---------- LOADING STATE ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
      </div>
    );
  }

  // ---------- EMPTY CART STATE ----------
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6">
        <ShoppingCart size={48} className="text-gray-300 mb-4" />
        <p 
          className="text-gray-500 mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Your cart is empty
        </p>
        <Button variant="accent" onClick={onClose}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  // ---------- CART WITH ITEMS ----------
  return (
    <div className="flex flex-col h-full">
      
      {/* -------- CART ITEMS LIST -------- */}
      {/* Scrollable area for items */}
      <div className="flex-1 overflow-y-auto p-4">
        {items.map((item) => {
          const itemId = getItemId(item);
          const itemPrice = getItemPrice(item);
          
          return (
            <div key={itemId} className="flex gap-4 py-4 border-b border-gray-200">
              
              {/* Product Image - links to product page */}
              <Link to={`/product/${item.product_id}`} onClick={onClose} className="shrink-0">
                <img
                  src={getImageUrl(item.image_url || item.image || item.main_image)}
                  alt={item.name || 'Product'}
                  className="w-20 h-20 object-cover rounded bg-gray-100"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800';
                  }}
                />
              </Link>
              
              {/* Product Details */}
              <div className="flex-1 flex flex-col">
                {/* Product name - also links to product page */}
                <Link 
                  to={`/product/${item.product_id}`} 
                  onClick={onClose}
                  className="font-medium text-gray-900 hover:text-accent text-sm leading-tight"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {item.name || 'Unknown Product'}
                </Link>
                
                {/* Color and size */}
                <p className="text-xs text-gray-500 capitalize mt-1">
                  {item.color} / Size {item.size}
                </p>
                
                {/* Unit price */}
                <p className="text-sm font-semibold text-accent mt-1">
                  {formatCurrency(itemPrice)}
                </p>
                
                {/* Quantity controls and remove button */}
                <div className="flex items-center mt-3">
                  {/* +/- stepper */}
                  <div className="inline-flex items-center border border-gray-300 rounded overflow-hidden bg-white">
                    <button
                      onClick={() => handleQuantityChange(itemId, 'decrease')}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 font-bold text-lg"
                      disabled={item.quantity <= 1}  // Can't go below 1 (use remove for that)
                    >
                      -
                    </button>
                    <span className="w-10 text-center text-sm font-medium border-l border-r border-gray-300 h-8 flex items-center justify-center bg-gray-50 text-gray-900">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(itemId, 'increase')}
                      className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 transition-colors text-gray-700 font-bold text-lg"
                    >
                      +
                    </button>
                  </div>
                  
                  {/* Remove button - pushed to right with ml-auto */}
                  <button
                    onClick={() => handleRemove(itemId)}
                    className="text-red-500 hover:text-red-700 p-2 ml-auto"
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* -------- ORDER SUMMARY -------- */}
      {/* Pinned to bottom of drawer */}
      <div className="border-t p-4 bg-gray-50 shrink-0">
        {/* Price breakdown */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Subtotal</span>
            <span className="text-gray-900">{formatCurrency(cart.summary?.subtotal || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Tax</span>
            <span className="text-gray-900">{formatCurrency(cart.summary?.tax || 0)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Shipping</span>
            <span className="text-gray-900">{formatCurrency(cart.summary?.shipping || 0)}</span>
          </div>
          {/* Total with emphasis */}
          <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-2 mt-2">
            <span className="text-gray-900">Total</span>
            <span className="text-accent">{formatCurrency(cart.summary?.total || 0)}</span>
          </div>
        </div>
        
        {/* Action buttons */}
        <Link to="/checkout" onClick={onClose}>
          <Button variant="accent" fullWidth>
            Checkout
          </Button>
        </Link>
        
        {/* Link to full cart page for more options (variant changes, move to wishlist, etc) */}
        <Link to="/cart" onClick={onClose} className="block mt-2">
          <Button variant="outline" fullWidth>
            View Full Cart
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default CartDrawer;

// ----------------------------------------------------------------------------
// This is the "quick" cart view - good for:
// - Seeing what's in cart without leaving current page
// - Adjusting quantities
// - Quick checkout
//
// For more advanced operations (changing color/size, move to wishlist),
// user should click "View Full Cart" to go to the dedicated cart page
// where CartItem.jsx provides those additional controls
// ----------------------------------------------------------------------------