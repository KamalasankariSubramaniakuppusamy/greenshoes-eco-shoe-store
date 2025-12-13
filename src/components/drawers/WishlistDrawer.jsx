// ============================================================================
// WishlistDrawer.jsx
// ============================================================================
// Mini wishlist drawer - slides out from header when clicking heart icon
// Shows saved products and allows moving them to cart
//
// Key difference from cart:
// - Wishlist stores PRODUCTS, not specific variants
// - User must select size when moving to cart (color comes from product)
// - Items stay in wishlist until explicitly removed or moved to cart

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/constants';
import Button from '../common/Button';
import Modal from '../common/Modal';

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


const WishlistDrawer = ({ onClose }) => {
  const { wishlist, loading, removeFromWishlist, moveToCart } = useWishlist();
  const { fetchCart } = useCart();  // Need to refresh cart after moving item
  
  // ---------- STATE FOR MOVE TO CART MODAL ----------
  // When user clicks "Move to Cart", we show a modal to pick size
  // because wishlist doesn't store size preference
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [moving, setMoving] = useState(false);

  // ---------- HANDLERS ----------
  
  const handleRemove = async (productId) => {
    await removeFromWishlist(productId);
    // Item removed from wishlist state, UI updates automatically
  };

  // Open the size selection modal
  const openMoveModal = (item) => {
    setSelectedItem(item);
    // Default to first available size, or '6' as fallback
    setSelectedSize(item.available_sizes?.[0] || '6');
    setMoveModalOpen(true);
  };

  // Actually move the item to cart (after size is selected)
  const handleMoveToCart = async () => {
    if (!selectedItem || !selectedSize) return;
    
    setMoving(true);
    try {
      // Call API to move item from wishlist to cart
      // This removes from wishlist and adds to cart in one operation
      const result = await moveToCart(selectedItem.product_id, {
        color: selectedItem.color || 'black',  // Use product's color or default
        size: selectedSize                      // User-selected size from modal
      });
      
      if (result.success) {
        await fetchCart();  // Refresh cart to show new item
        setMoveModalOpen(false);
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Move to cart error:', error);
    } finally {
      setMoving(false);
    }
  };

  // ---------- LOADING STATE ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  // ---------- EMPTY WISHLIST STATE ----------
  if (wishlist.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-6">
        <Heart size={48} className="text-gray-300 mb-4" />
        <p 
          className="text-gray-500 mb-4"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Your wishlist is empty
        </p>
        <Button variant="accent" onClick={onClose}>
          Continue Shopping
        </Button>
      </div>
    );
  }

  // ---------- WISHLIST WITH ITEMS ----------
  return (
    <div className="flex flex-col h-full">
      
      {/* -------- WISHLIST ITEMS LIST -------- */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {wishlist.map((item) => (
          <div key={item.wishlist_item_id || item.product_id} className="flex gap-3 pb-4 border-b">
            
            {/* Product image - links to product page */}
            <Link to={`/product/${item.product_id}`} onClick={onClose}>
              <img
                src={getImageUrl(item.image_url || item.main_image)}
                alt={item.name}
                className="w-20 h-20 object-cover rounded"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800';
                }}
              />
            </Link>
            
            {/* Product details */}
            <div className="flex-1">
              {/* Product name - links to product page */}
              <Link 
                to={`/product/${item.product_id}`} 
                onClick={onClose}
                className="font-medium text-sm hover:text-accent"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {item.name}
              </Link>
              
              <p className="text-xs text-gray-500 capitalize">
                {item.category}
              </p>
              
              {/* Price - shows sale price if on sale */}
              <p className="text-sm font-medium text-accent mt-1">
                {formatCurrency(item.on_sale ? item.sale_price : item.selling_price)}
              </p>
              
              {/* Action buttons */}
              <div className="flex items-center gap-2 mt-2">
                {/* Move to cart - opens size selection modal */}
                <button
                  onClick={() => openMoveModal(item)}
                  className="flex items-center gap-1 text-xs text-accent hover:text-accent/80"
                >
                  <ShoppingCart size={14} />
                  Move to Cart
                </button>
                
                {/* Remove from wishlist */}
                <button
                  onClick={() => handleRemove(item.product_id)}
                  className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 ml-auto"
                >
                  <Trash2 size={14} />
                  Remove
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* -------- FOOTER -------- */}
      <div className="border-t p-4 bg-gray-50">
        {/* Item count */}
        <p className="text-sm text-gray-600 mb-3 text-center">
          {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} in wishlist
        </p>
        
        {/* Link to full wishlist page */}
        <Link to="/wishlist" onClick={onClose}>
          <Button variant="outline" fullWidth>
            View Full Wishlist
          </Button>
        </Link>
      </div>

      {/* -------- SIZE SELECTION MODAL -------- */}
      {/* When moving to cart, user needs to pick a size */}
      {/* Wishlist stores products not variants, so we need this extra step */}
      <Modal
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        title="Select Size"
      >
        {selectedItem && (
          <div className="p-4">
            <p className="mb-4 text-gray-600">
              Select a size for <strong>{selectedItem.name}</strong>
            </p>
            
            {/* Size selection grid */}
            <div className="flex flex-wrap gap-2 mb-6">
              {/* Use available_sizes from API, or fallback to common sizes */}
              {(selectedItem.available_sizes || ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9']).map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 border-2 rounded flex items-center justify-center transition-all ${
                    selectedSize === size
                      ? 'border-accent bg-accent text-white'   // Selected state
                      : 'border-gray-300 hover:border-gray-400' // Unselected
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            
            {/* Modal action buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setMoveModalOpen(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="accent"
                onClick={handleMoveToCart}
                disabled={moving || !selectedSize}
                className="flex-1"
              >
                {moving ? 'Moving...' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default WishlistDrawer;

// ----------------------------------------------------------------------------
// Why wishlist doesn't store size:
//
// Wishlist = "I like this product and might want to buy it later"
// Cart = "I'm ready to buy this specific variant (size + color)"
//
// When you save something to wishlist, you might not know what size yet
// Or you might be saving it for someone else
// So we only ask for size when you're actually ready to move it to cart
//
// ALL OF THESE IS FOR REGISTERED USERS ONLY
// Guests can't have wishlists since we can't track them easily!
// The modal flow:
// 1. User clicks "Move to Cart" on a wishlist item
// 2. Modal opens showing available sizes
// 3. User picks a size
// 4. We call moveToCart API with product + color + size
// 5. Backend adds to cart and removes from wishlist
// 6. We refresh cart state to reflect the change
// ----------------------------------------------------------------------------