import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../../context/WishlistContext';
import { useCart } from '../../context/CartContext';
import { formatCurrency } from '../../utils/constants';
import Button from '../common/Button';
import Modal from '../common/Modal';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE}${imagePath}`;
};

const WishlistDrawer = ({ onClose }) => {
  const { wishlist, loading, removeFromWishlist, moveToCart } = useWishlist();
  const { fetchCart } = useCart();
  
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [moving, setMoving] = useState(false);

  const handleRemove = async (productId) => {
    await removeFromWishlist(productId);
  };

  const openMoveModal = (item) => {
    setSelectedItem(item);
    setSelectedSize(item.available_sizes?.[0] || '6');
    setMoveModalOpen(true);
  };

  const handleMoveToCart = async () => {
    if (!selectedItem || !selectedSize) return;
    
    setMoving(true);
    try {
      const result = await moveToCart(selectedItem.product_id, {
        color: selectedItem.color || 'black',
        size: selectedSize
      });
      
      if (result.success) {
        await fetchCart();
        setMoveModalOpen(false);
        setSelectedItem(null);
      }
    } catch (error) {
      console.error('Move to cart error:', error);
    } finally {
      setMoving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
      </div>
    );
  }

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

  return (
    <div className="flex flex-col h-full">
      {/* Wishlist Items */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {wishlist.map((item) => (
          <div key={item.wishlist_item_id || item.product_id} className="flex gap-3 pb-4 border-b">
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
            <div className="flex-1">
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
              <p className="text-sm font-medium text-accent mt-1">
                {formatCurrency(item.on_sale ? item.sale_price : item.selling_price)}
              </p>
              
              {/* Actions */}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={() => openMoveModal(item)}
                  className="flex items-center gap-1 text-xs text-accent hover:text-accent/80"
                >
                  <ShoppingCart size={14} />
                  Move to Cart
                </button>
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

      {/* Footer */}
      <div className="border-t p-4 bg-gray-50">
        <p className="text-sm text-gray-600 mb-3 text-center">
          {wishlist.length} item{wishlist.length !== 1 ? 's' : ''} in wishlist
        </p>
        <Link to="/wishlist" onClick={onClose}>
          <Button variant="outline" fullWidth>
            View Full Wishlist
          </Button>
        </Link>
      </div>

      {/* Move to Cart Modal */}
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
            
            <div className="flex flex-wrap gap-2 mb-6">
              {(selectedItem.available_sizes || ['5', '5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9']).map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`w-12 h-12 border-2 rounded flex items-center justify-center transition-all ${
                    selectedSize === size
                      ? 'border-accent bg-accent text-white'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
            
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