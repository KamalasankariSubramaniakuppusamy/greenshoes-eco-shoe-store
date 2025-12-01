import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, Heart, Minus, Plus, Check } from 'lucide-react';
import { formatCurrency } from '../../utils/constants';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE}${imagePath}`;
};

const CartItem = ({ item }) => {
  const { increaseQuantity, decreaseQuantity, removeItem, changeVariant, moveToWishlist } = useCart();
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [movedToWishlist, setMovedToWishlist] = useState(false);

  const handleIncrease = async () => {
    setLoading(true);
    await increaseQuantity(item.cart_item_id);
    setLoading(false);
  };

  const handleDecrease = async () => {
    setLoading(true);
    await decreaseQuantity(item.cart_item_id);
    setLoading(false);
  };

  const handleRemove = async () => {
    if (window.confirm('Remove this item from cart?')) {
      setLoading(true);
      await removeItem(item.cart_item_id);
      setLoading(false);
    }
  };

  const handleMoveToWishlist = async () => {
    if (!isAuthenticated) {
      // For guests, show a message or redirect to login
      if (window.confirm('Please login to save items to your wishlist. Would you like to login now?')) {
        window.location.href = '/login?redirect=/cart';
      }
      return;
    }
    
    setLoading(true);
    const result = await moveToWishlist(item.cart_item_id);
    if (result?.success) {
      setMovedToWishlist(true);
      // Item will be removed from cart, so this state is temporary
    }
    setLoading(false);
  };

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

  const effectivePrice = parseFloat(item.effective_price);
  const lineTotal = parseFloat(item.line_total);

  return (
    <div className="flex gap-4 py-6 border-b">
      {/* Product Image - Clickable */}
      <Link to={`/product/${item.product_id}`} className="w-24 h-24 flex-shrink-0">
        <img
          src={getImageUrl(item.image_url)}
          alt={item.name}
          className="w-full h-full object-cover rounded hover:opacity-80 transition-opacity"
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800';
          }}
        />
      </Link>

      {/* Product Details */}
      <div className="flex-1">
        <Link 
          to={`/product/${item.product_id}`} 
          className="font-medium text-gray-900 hover:text-accent transition-colors"
        >
          {item.name}
        </Link>
        <p className="text-sm text-gray-600 mt-1 capitalize">{item.category}</p>

        {/* Variant Selectors */}
        <div className="flex gap-4 mt-3">
          {/* Color */}
          <div>
            <label className="text-xs text-gray-600">Color:</label>
            <select
              value={item.color}
              onChange={handleColorChange}
              disabled={loading}
              className="ml-2 text-sm border border-gray-300 rounded px-2 py-1 capitalize"
            >
              {item.available_colors?.map((color) => (
                <option key={color.id} value={color.value}>
                  {color.value}
                </option>
              ))}
            </select>
          </div>

          {/* Size */}
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

        {/* Quantity Controls */}
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

        {/* Actions */}
        <div className="flex gap-4 mt-3">
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

      {/* Price */}
      <div className="text-right">
        <p className="font-semibold text-gray-900">{formatCurrency(lineTotal)}</p>
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