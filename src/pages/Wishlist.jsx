import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Trash2, ShoppingCart } from 'lucide-react';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { formatCurrency } from '../utils/constants';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';
import Modal from '../components/common/Modal';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE}${imagePath}`;
};

const Wishlist = () => {
  const { wishlist, loading, removeFromWishlist, moveToCart } = useWishlist();
  const { fetchCart } = useCart();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedColor, setSelectedColor] = useState('');
  const [selectedSize, setSelectedSize] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [moving, setMoving] = useState(false);

  const handleMoveToCart = (product) => {
    // Get colors - handle both array of objects and array of strings
    const colors = product.available_colors || [];
    const sizes = product.available_sizes || [];
    
    if (colors.length > 0 && sizes.length > 0) {
      setSelectedProduct(product);
      // Handle color as object with 'value' or as string
      const firstColor = typeof colors[0] === 'object' ? colors[0].value : colors[0];
      const firstSize = typeof sizes[0] === 'object' ? sizes[0].value : sizes[0];
      setSelectedColor(firstColor);
      setSelectedSize(firstSize);
      setModalOpen(true);
    } else {
      alert('This product has no available variants');
    }
  };

  const confirmMoveToCart = async () => {
    if (!selectedColor || !selectedSize) {
      alert('Please select color and size');
      return;
    }

    setMoving(true);
    
    const result = await moveToCart(selectedProduct.product_id, {
      color: selectedColor,
      size: selectedSize,
      quantity: 1,
    });

    if (result.success) {
      await fetchCart();
      setModalOpen(false);
      setSelectedProduct(null);
    } else {
      alert(result.error || 'Failed to move to cart');
    }
    
    setMoving(false);
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Heart size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-serif text-gray-900 mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">Save your favorite items here!</p>
          <Link to="/">
            <Button variant="accent">Continue Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <h1 className="text-3xl font-serif text-gray-900 mb-8">My Wishlist</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist.map((item) => {
            return (
              <div key={item.product_id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <Link to={`/product/${item.product_id}`}>
                  <div className="relative aspect-square">
                    <img
                      src={getImageUrl(item.main_image)}
                      alt={item.name}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800';
                      }}
                    />
                    {item.on_sale && (
                      <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                        SALE
                      </div>
                    )}
                  </div>
                </Link>

                <div className="p-4">
                  <Link to={`/product/${item.product_id}`}>
                    <h3 className="font-medium text-gray-900 mb-1 hover:text-accent transition-colors">
                      {item.name}
                    </h3>
                  </Link>
                  <p className="text-sm text-gray-600 capitalize mb-2">{item.category}</p>

                  <div className="flex items-center gap-2 mb-4">
                    {item.on_sale && item.sale_price ? (
                      <>
                        <span className="text-lg font-bold text-accent">
                          {formatCurrency(item.sale_price)}
                        </span>
                        <span className="text-sm text-gray-500 line-through">
                          {formatCurrency(item.selling_price)}
                        </span>
                      </>
                    ) : (
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(item.selling_price)}
                      </span>
                    )}
                  </div>

                  {item.in_stock ? (
                    <p className="text-xs text-green-600 mb-4">✓ In Stock</p>
                  ) : (
                    <p className="text-xs text-red-600 mb-4">Out of Stock</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      disabled={!item.in_stock}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-accent text-white rounded hover:opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart size={16} />
                      <span className="text-sm">Add to Cart</span>
                    </button>

                    <button
                      onClick={() => removeFromWishlist(item.product_id)}
                      className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
                    >
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Move to Cart Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Select Options"
      >
        {selectedProduct && (
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-2">{selectedProduct.name}</h3>
              <p className="text-gray-600 text-sm">Select color and size to add to cart</p>
            </div>

            {/* Color Selection */}
            {selectedProduct.available_colors?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Color
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.available_colors.map((color) => {
                    const colorValue = typeof color === 'object' ? color.value : color;
                    const colorKey = typeof color === 'object' ? color.id : color;
                    return (
                      <button
                        key={colorKey}
                        onClick={() => setSelectedColor(colorValue)}
                        className={`px-4 py-2 border-2 rounded capitalize transition-all ${
                          selectedColor === colorValue
                            ? 'border-accent bg-accent text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {colorValue}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {selectedProduct.available_sizes?.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Size
                </label>
                <div className="flex flex-wrap gap-2">
                  {selectedProduct.available_sizes.map((size) => {
                    const sizeValue = typeof size === 'object' ? size.value : size;
                    const sizeKey = typeof size === 'object' ? size.id : size;
                    return (
                      <button
                        key={sizeKey}
                        onClick={() => setSelectedSize(sizeValue)}
                        className={`w-12 h-12 border-2 rounded flex items-center justify-center transition-all ${
                          selectedSize === sizeValue
                            ? 'border-accent bg-accent text-white'
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                      >
                        {sizeValue}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="accent" 
                onClick={confirmMoveToCart} 
                className="flex-1"
                disabled={moving}
              >
                {moving ? 'Adding...' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Wishlist;