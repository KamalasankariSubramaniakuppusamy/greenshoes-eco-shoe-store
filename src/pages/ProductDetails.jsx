// ============================================================================
// (Product Detail Page - PDP)
// ============================================================================
// Full product page with all details, variant selection, and purchase options
// This is one of the most complex pages in the app
//
// Features:
// - Image gallery with color-filtered thumbnails
// - Color and size selection (inventory-aware)
// - Real-time stock status per variant
// - Add to cart / Remove from cart toggle
// - Buy Now (skip cart, go direct to checkout)
// - Wishlist toggle
// - Environmental impact display
// - Shipping info and policies

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Heart, ShoppingCart, Truck, Shield, ChevronLeft, ChevronRight, Zap } from 'lucide-react';
import { productAPI } from '../services/api';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/constants';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import ImpactStory from '../components/product/ImpactStory';

// Base URL for product images
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

// Helper to construct full image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE}${imagePath}`;
};


const ProductDetails = () => {
  // ---------- ROUTING ----------
  const { id } = useParams();  // Product ID from URL
  const navigate = useNavigate();
  
  // ---------- PRODUCT STATE ----------
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // ---------- SELECTION STATE ----------
  // User's current selections for the variant they want
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [quantity, setQuantity] = useState(1);
  
  // ---------- IMAGE GALLERY STATE ----------
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // ---------- ACTION STATES ----------
  // Track loading states for various buttons
  const [addingToCart, setAddingToCart] = useState(false);
  const [isInCart, setIsInCart] = useState(false);
  const [buyingNow, setBuyingNow] = useState(false);
  const [removingFromCart, setRemovingFromCart] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  
  // Prevent duplicate wishlist API calls (race condition protection)
  const wishlistActionInProgress = useRef(false);

  // ---------- CONTEXT HOOKS ----------
  const { cart, addToCart, removeItem } = useCart();
  const { wishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();

  // ==========================================================================
  // DERIVED STATE
  // ==========================================================================
  
  // Check if product is in wishlist (simple boolean derived from wishlist array)
  const isProductInWishlist = product 
    ? wishlist.some(item => item.product_id === product.id) 
    : false;
  
  // Check if currently selected variant is already in cart
  useEffect(() => {
    if (product && selectedColor && selectedSize && cart.items) {
      const inCart = cart.items.some(item => 
        item.product_id === product.id && 
        item.color === selectedColor.value && 
        item.size === selectedSize.size_value
      );
      setIsInCart(inCart);
    }
  }, [product, selectedColor, selectedSize, cart.items]);

  // ==========================================================================
  // DATA FETCHING
  // ==========================================================================
  
  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await productAPI.getById(id);
      
      // API returns product data split into sections
      const { product: productData, colors, images, sizes } = response.data;
      
      if (!productData || !productData.id) {
        setError('Product not found');
        return;
      }
      
      // Combine everything into one product object
      const fullProduct = {
        ...productData,
        colors: colors || [],
        images: images || [],
        sizes: sizes || [],  // This is actually inventory data (size + color + quantity)
      };
      
      setProduct(fullProduct);
      
      // Auto-select first color and size
      if (colors?.length > 0) {
        setSelectedColor(colors[0]);
      }
      if (sizes?.length > 0) {
        setSelectedSize(sizes[0]);
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.response?.data?.error || 'Failed to load product');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================================
  // STOCK/INVENTORY HELPERS
  // ==========================================================================
  
  // Get stock info for the currently selected color + size combination
  const getSelectedVariantStock = () => {
    if (!product || !selectedColor || !selectedSize) {
      return { quantity: 0, status: 'unknown' };
    }

    // Find the inventory record matching selected color and size
    // product.sizes is actually inventory data with color_id, size_value, quantity
    const variant = product.sizes.find(s => 
      s.color_id === selectedColor.id && 
      (s.size_value === selectedSize.size_value || s.size === selectedSize.size_value)
    );

    if (!variant) {
      return { quantity: 0, status: 'out_of_stock' };
    }

    const qty = variant.quantity || 0;
    let status = 'in_stock';
    if (qty === 0) status = 'out_of_stock';
    else if (qty < 10) status = 'running_out';  // Low stock threshold

    return { quantity: qty, status };
  };

  // Get stock status for current selection
  const variantStock = getSelectedVariantStock();
  const isVariantOutOfStock = variantStock.status === 'out_of_stock';
  const isVariantRunningOut = variantStock.status === 'running_out';
  const isVariantInStock = variantStock.status === 'in_stock';

  // Get sizes available for the selected color
  // (not all sizes are available in all colors due to inventory)
  const getSizesForColor = () => {
    if (!product || !selectedColor) return [];
    return product.sizes.filter(s => s.color_id === selectedColor.id);
  };

  const availableSizes = getSizesForColor();

  // When color changes, auto-select first available size for that color
  useEffect(() => {
    if (selectedColor && product) {
      const sizesForColor = product.sizes.filter(s => s.color_id === selectedColor.id);
      if (sizesForColor.length > 0) {
        setSelectedSize(sizesForColor[0]);
      } else {
        setSelectedSize(null);
      }
    }
  }, [selectedColor, product]);

  // ==========================================================================
  // IMAGE GALLERY HELPERS
  // ==========================================================================
  
  // Filter images to show only those matching selected color
  const getFilteredImages = () => {
    if (!product) return [];
    
    let filteredImages = [];
    
    // First, try to get images for selected color
    if (selectedColor && product.images?.length > 0) {
      filteredImages = product.images
        .filter(img => img.color_id === selectedColor.id)
        .map(img => img.image_url);
    }
    
    // Fallback to all images if none match color
    if (filteredImages.length === 0 && product.images?.length > 0) {
      filteredImages = product.images.map(img => img.image_url);
    }
    
    // Last resort: use main_image
    if (filteredImages.length === 0 && product.main_image) {
      filteredImages = [product.main_image];
    }
    
    return filteredImages.length > 0 ? filteredImages : [];
  };

  const images = getFilteredImages();

  // Reset to first image when color changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [selectedColor]);

  // ==========================================================================
  // ACTION HANDLERS
  // ==========================================================================
  
  // ---------- ADD TO CART ----------
  const handleAddToCart = async () => {
    // Validate selections
    if (!selectedColor || !selectedSize) {
      alert('Please select color and size');
      return;
    }

    if (isVariantOutOfStock) {
      alert('This variant is out of stock');
      return;
    }

    setAddingToCart(true);
    
    try {
      const result = await addToCart({
        productId: product.id,
        color: selectedColor.value,
        size: selectedSize.size_value || selectedSize.size,
        quantity: quantity,
      });

      if (result.success) {
        setIsInCart(true);
      } else {
        alert(result.error || 'Failed to add to cart');
      }
    } catch (err) {
      console.error('Add to cart error:', err);
      alert('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  // ---------- REMOVE FROM CART ----------
  const handleRemoveFromCart = async () => {
    if (!selectedColor || !selectedSize) return;
    
    // Find the cart item that matches current selection
    const cartItem = cart.items.find(item => 
      item.product_id === product.id && 
      item.color === selectedColor.value && 
      (item.size === selectedSize.size_value || item.size === selectedSize.size)
    );
    
    if (!cartItem) {
      setIsInCart(false);
      return;
    }
    
    setRemovingFromCart(true);
    
    try {
      const itemId = cartItem.cart_item_id || cartItem.id;
      const result = await removeItem(itemId);
      if (result.success) {
        setIsInCart(false);
      } else {
        alert(result.error || 'Failed to remove from cart');
      }
    } catch (err) {
      console.error('Remove from cart error:', err);
      alert('Failed to remove from cart');
    } finally {
      setRemovingFromCart(false);
    }
  };

  // ---------- BUY NOW ----------
  // Skip cart, go directly to checkout with this item
  const handleBuyNow = () => {
    if (!selectedColor || !selectedSize) {
      alert('Please select color and size');
      return;
    }

    if (isVariantOutOfStock) {
      alert('This variant is out of stock');
      return;
    }

    setBuyingNow(true);
    
    // Navigate to checkout with product info in state
    // Checkout page will handle this as a "buy now" flow
    navigate('/checkout', { 
      state: { 
        buyNow: true,
        product: {
          id: product.id,
          name: product.name,
          price: product.on_sale && product.sale_price ? product.sale_price : product.selling_price,
          color: selectedColor.value,
          size: selectedSize.size_value || selectedSize.size,
          quantity: quantity,
          image: images[0] || product.main_image
        }
      }
    });
  };

  // ---------- WISHLIST TOGGLE ----------
  const handleWishlistToggle = async () => {
    // Prevent duplicate calls (debounce via ref)
    if (wishlistActionInProgress.current) {
      return;
    }

    wishlistActionInProgress.current = true;
    setWishlistLoading(true);

    try {
      if (isProductInWishlist) {
        await removeFromWishlist(product.id);
      } else {
        const result = await addToWishlist(product.id);
        if (!result.success && result.error) {
          alert(result.error);
        }
      }
    } catch (err) {
      console.error('Wishlist error:', err);
    } finally {
      setWishlistLoading(false);
      wishlistActionInProgress.current = false;
    }
  };

  // ==========================================================================
  // RENDER: LOADING STATE
  // ==========================================================================
  if (loading) return <Loading fullScreen />;

  // ==========================================================================
  // RENDER: ERROR STATE
  // ==========================================================================
  if (error || !product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">{error || 'Product not found'}</p>
          <Button onClick={() => navigate('/')}>Back to Home</Button>
        </div>
      </div>
    );
  }

  // Wishlist button text (changes based on state)
  const wishlistButtonText = wishlistLoading
    ? (isProductInWishlist ? 'Removing...' : 'Adding...')
    : isProductInWishlist
      ? 'Remove from Wishlist'
      : 'Add to Wishlist';

  // ==========================================================================
  // RENDER: PRODUCT PAGE
  // ==========================================================================
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        {/* Two-column layout: Images on left, Info on right */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* ============================================================== */}
          {/* LEFT COLUMN: IMAGE GALLERY                                      */}
          {/* ============================================================== */}
          <div>
            {/* Main Image */}
            <div className="relative bg-white rounded-lg overflow-hidden aspect-square mb-4">
              {images.length > 0 ? (
                <img
                  src={getImageUrl(images[currentImageIndex])}
                  alt={product.name}
                  className={`w-full h-full object-cover ${isVariantOutOfStock ? 'opacity-60' : ''}`}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
              
              {/* Sale badge */}
              {product.on_sale && (
                <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded font-bold">
                  SALE
                </div>
              )}

              {/* Out of Stock overlay */}
              {isVariantOutOfStock && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                  <span className="bg-white text-gray-900 px-4 py-2 rounded font-medium">
                    Out of Stock
                  </span>
                </div>
              )}

              {/* Image navigation arrows (only if multiple images) */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white rounded-full p-2 shadow-lg"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 ${
                      index === currentImageIndex ? 'border-accent' : 'border-transparent'
                    }`}
                  >
                    <img
                      src={getImageUrl(img)}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ============================================================== */}
          {/* RIGHT COLUMN: PRODUCT INFO                                      */}
          {/* ============================================================== */}
          <div>
            {/* Category */}
            <p className="text-sm text-gray-500 uppercase tracking-widest mb-2">
              {product.category}
            </p>
            
            {/* Product name */}
            <h1 className="text-3xl font-serif text-gray-900 mb-4">{product.name}</h1>

            {/* -------- PRICE -------- */}
            <div className="mb-6">
              {product.on_sale && product.sale_price ? (
                // Sale pricing: show sale price, original crossed out, discount badge
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-3xl font-bold text-accent">
                    {formatCurrency(product.sale_price)}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    {formatCurrency(product.selling_price)}
                  </span>
                  <span className="bg-red-100 text-red-600 px-2 py-1 text-sm font-medium rounded">
                    {product.discount_percentage || Math.round((1 - product.sale_price / product.selling_price) * 100)}% OFF
                  </span>
                </div>
              ) : (
                // Regular pricing
                <span className="text-3xl font-bold text-gray-900">
                  {formatCurrency(product.selling_price)}
                </span>
              )}
            </div>

            {/* -------- DESCRIPTION -------- */}
            <div className="mb-6">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-gray-700 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>

            {/* -------- ENVIRONMENTAL IMPACT -------- */}
            {/* Shows materials, waste recycled, social contribution */}
            <ImpactStory product={product} />

            {/* -------- COLOR SELECTION -------- */}
            {product.colors?.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Color: <span className="font-normal text-gray-600 capitalize">{selectedColor?.value}</span>
                </label>
                <div className="flex flex-wrap gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 border-2 rounded capitalize transition-all ${
                        selectedColor?.id === color.id
                          ? 'border-accent bg-accent text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {color.value}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* -------- SIZE SELECTION -------- */}
            {/* Only shows sizes available for the selected color */}
            {availableSizes.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-900 mb-3">
                  Size: <span className="font-normal text-gray-600">{selectedSize?.size_value || selectedSize?.size}</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => {
                    const sizeValue = size.size_value || size.size;
                    const sizeQty = size.quantity || 0;
                    const isSizeOutOfStock = sizeQty === 0;
                    const isSizeRunningOut = sizeQty > 0 && sizeQty < 10;
                    
                    return (
                      <button
                        key={size.inventory_id || `${size.color_id}-${size.size_id}`}
                        onClick={() => !isSizeOutOfStock && setSelectedSize(size)}
                        disabled={isSizeOutOfStock}
                        className={`w-12 h-12 border-2 rounded flex items-center justify-center transition-all relative ${
                          isSizeOutOfStock
                            ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                            : (selectedSize?.inventory_id === size.inventory_id || 
                               (selectedSize?.size_value === sizeValue && selectedSize?.color_id === size.color_id))
                              ? 'border-accent bg-accent text-white'
                              : 'border-gray-300 hover:border-gray-400'
                        }`}
                        title={isSizeOutOfStock ? 'Out of Stock' : isSizeRunningOut ? `Only ${sizeQty} left` : 'In Stock'}
                      >
                        {sizeValue}
                        {/* Orange dot indicator for low stock */}
                        {isSizeRunningOut && !isSizeOutOfStock && (
                          <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-500 rounded-full"></span>
                        )}
                      </button>
                    );
                  })}
                </div>
                {/* Legend for orange dot */}
                {availableSizes.some(s => (s.quantity || 0) > 0 && (s.quantity || 0) < 10) && (
                  <p className="text-xs text-orange-500 mt-2 flex items-center gap-1">
                    <span className="w-2 h-2 bg-orange-500 rounded-full inline-block"></span>
                    Orange dot indicates low stock
                  </p>
                )}
              </div>
            )}

            {/* No sizes available message */}
            {availableSizes.length === 0 && selectedColor && (
              <div className="mb-6 p-4 bg-gray-100 rounded-lg">
                <p className="text-gray-600 text-sm">No sizes available for {selectedColor.value}</p>
              </div>
            )}

            {/* -------- QUANTITY -------- */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-900 mb-3">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={isVariantOutOfStock}
                  className="w-10 h-10 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  -
                </button>
                <span className="w-16 text-center font-medium text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(variantStock.quantity, quantity + 1))}
                  disabled={isVariantOutOfStock || quantity >= variantStock.quantity}
                  className="w-10 h-10 border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  +
                </button>
                {/* Low stock warning next to quantity */}
                {isVariantRunningOut && (
                  <span className="text-sm text-orange-500">
                    Only {variantStock.quantity} left
                  </span>
                )}
              </div>
            </div>

            {/* -------- STOCK STATUS -------- */}
            <div className="mb-6">
              {isVariantInStock && (
                <p className="text-green-600 text-sm font-medium">✓ In Stock</p>
              )}
              {isVariantRunningOut && (
                <p className="text-orange-500 text-sm font-medium">⚠ Running Out - Only {variantStock.quantity} left</p>
              )}
              {isVariantOutOfStock && (
                <p className="text-red-600 text-sm font-medium">✗ Out of Stock</p>
              )}
            </div>

            {/* -------- ACTION BUTTONS -------- */}
            <div className="space-y-3 mb-8">
              
              {/* BUY NOW - Skip cart, go to checkout */}
              <button
                onClick={handleBuyNow}
                disabled={isVariantOutOfStock || buyingNow || !selectedColor || !selectedSize}
                className={`w-full py-3 px-6 rounded font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                  isVariantOutOfStock
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-gray-900 text-white hover:bg-gray-800'
                }`}
              >
                {buyingNow ? (
                  'Processing...'
                ) : isVariantOutOfStock ? (
                  <>
                    <Zap size={20} />
                    Unavailable
                  </>
                ) : (
                  <>
                    <Zap size={20} />
                    Buy Now
                  </>
                )}
              </button>

              {/* ADD TO CART / REMOVE FROM CART toggle */}
              {isInCart ? (
                <button
                  onClick={handleRemoveFromCart}
                  disabled={removingFromCart}
                  className="w-full py-3 px-6 rounded font-medium flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 text-white hover:bg-red-700"
                >
                  {removingFromCart ? (
                    'Removing...'
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      Remove from Cart
                    </>
                  )}
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={isVariantOutOfStock || addingToCart || !selectedColor || !selectedSize}
                  className={`w-full py-3 px-6 rounded font-medium flex items-center justify-center gap-2 transition-all duration-300 ${
                    isVariantOutOfStock
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-accent text-white hover:opacity-90'
                  }`}
                >
                  {addingToCart ? (
                    'Adding...'
                  ) : isVariantOutOfStock ? (
                    <>
                      <ShoppingCart size={20} />
                      Unavailable
                    </>
                  ) : (
                    <>
                      <ShoppingCart size={20} />
                      Add to Cart
                    </>
                  )}
                </button>
              )}

              {/* WISHLIST - Always enabled (even if out of stock) */}
              <button
                onClick={handleWishlistToggle}
                disabled={wishlistLoading}
                className={`w-full py-3 px-6 rounded font-medium flex items-center justify-center gap-2 transition-all duration-300 border-2 ${
                  isProductInWishlist
                    ? 'bg-pink-50 border-pink-500 text-pink-600'
                    : 'bg-white border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <Heart 
                  size={20} 
                  className={isProductInWishlist ? 'fill-pink-500 text-pink-500' : ''} 
                />
                {wishlistButtonText}
              </button>

              {/* Helper text for out of stock items */}
              {isVariantOutOfStock && (
                <p className="text-center text-sm text-gray-500">
                  Add to wishlist to get notified when this item is back in stock
                </p>
              )}
            </div>

            {/* -------- SHIPPING & POLICY INFO -------- */}
            <div className="border-t pt-6 space-y-4">
              {/* Shipping info */}
              <div className="flex items-center gap-3">
                <Truck className="text-accent" size={24} />
                <div>
                  <p className="font-medium text-gray-900">Shipping: $11.95</p>
                  <p className="text-sm text-gray-600">Delivery in 5-7 business days</p>
                </div>
              </div>

              {/* Quality guarantee */}
              <div className="flex items-center gap-3">
                <Shield className="text-accent" size={24} />
                <div>
                  <p className="font-medium text-gray-900">Quality Guarantee</p>
                  <p className="text-sm text-gray-600">Premium craftsmanship</p>
                </div>
              </div>

              {/* No returns policy (per requirements) */}
              <div className="bg-yellow-50 p-4 rounded">
                <p className="text-sm text-yellow-800">
                  <strong>Note:</strong> No returns or refunds on all purchases
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;

// ----------------------------------------------------------------------------
// COMPONENT COMPLEXITY NOTE:
// ----------------------------------------------------------------------------
// This is a complex page with many interrelated pieces:
// 
// VARIANT SELECTION:
// - Each product has multiple colors
// - Each color has multiple sizes with individual inventory counts
// - Changing color auto-selects first available size for that color
// - Stock status updates based on selected color + size combination
//
// IMAGE GALLERY:
// - Images are filtered by selected color
// - Thumbnails show all images for current color
// - Main image has prev/next navigation
//
// CART INTEGRATION:
// - Checks if current variant is already in cart
// - Shows "Remove from Cart" if item is in cart
// - Shows "Add to Cart" if not (or if out of stock, shows disabled)
//
// BUY NOW:
// - Bypasses cart entirely
// - Passes product info via React Router state to checkout
// - Checkout page detects this and handles it as single-item purchase
//
// COULD BE IMPROVED:
// - Break into smaller sub-components (ImageGallery, VariantSelector, etc.)
// - Add reviews section
// - Related products carousel
// - Recently viewed products
// - Size guide modal
// - Stock notification signup for out-of-stock items
// ----------------------------------------------------------------------------