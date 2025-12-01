import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { formatCurrency } from '../../utils/constants';
import { useWishlist } from '../../context/WishlistContext';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

const ProductCard = ({ product }) => {
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  // Handle image URL - prepend API URL if it's a relative path
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE}${imagePath}`;
  };

  const imageUrl = getImageUrl(product.main_image);

  // Check if entire product is out of stock (all variants have 0 quantity)
  const isCompletelyOutOfStock = product.status === 'out_of_stock';

  // Get stock alerts from the product data
  const stockAlerts = product.stock_alerts || [];
  const variantsRunningOut = product.variants_running_out || 0;
  const variantsOutOfStock = product.variants_out_of_stock || 0;

  // Render stock alerts
  const renderStockAlerts = () => {
    if (stockAlerts.length === 0) return null;

    // Show up to 2 specific alerts, then summarize
    const alertsToShow = stockAlerts.slice(0, 2);
    
    return (
      <div className="mt-1 space-y-0.5">
        {alertsToShow.map((alert, index) => (
          <p 
            key={index} 
            className={`text-xs ${
              alert.type === 'out_of_stock' 
                ? 'text-red-500' 
                : 'text-orange-500'
            }`}
          >
            {alert.message}
          </p>
        ))}
        {stockAlerts.length > 2 && (
          <p className="text-xs text-gray-500">
            +{stockAlerts.length - 2} more alerts
          </p>
        )}
      </div>
    );
  };

  return (
    <Link to={`/product/${product.id}`} className="group block">
    <div className="relative overflow-hidden bg-white rounded-lg aspect-[3/4]">        {/* Product Image */}
        <img
          src={imageUrl}
          alt={product.name}
            className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ${
                isCompletelyOutOfStock ? 'opacity-60' : ''
          }`}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400';
          }}
        />

        {/* Sale Badge */}
        {product.on_sale && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
            SALE
          </div>
        )}

        {/* Out of Stock Overlay - only for completely out of stock products */}
        {isCompletelyOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-3 py-1 rounded font-medium text-sm">
              Out of Stock
            </span>
          </div>
        )}

        {/* Stock Alert Badge - for partial stock issues */}
        {!isCompletelyOutOfStock && (variantsOutOfStock > 0 || variantsRunningOut > 0) && (
          <div className="absolute bottom-2 left-2 flex gap-1">
            {variantsOutOfStock > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded">
                {variantsOutOfStock} sold out
              </span>
            )}
            {variantsRunningOut > 0 && (
              <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded">
                {variantsRunningOut} low stock
              </span>
            )}
          </div>
        )}

        {/* Wishlist Button */}
        <button
          onClick={handleWishlistToggle}
          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-md hover:bg-gray-100 transition-colors"
        >
          <Heart
            size={18}
            className={inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-600'}
          />
        </button>
      </div>

      {/* Product Info */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <p className="text-xs text-gray-500 mt-1 capitalize">{product.category}</p>
        
        {/* Price */}
        <div className="mt-2 flex items-center space-x-2">
          {product.on_sale && product.sale_price ? (
            <>
              <span className="text-sm font-semibold text-accent">
                {formatCurrency(product.sale_price)}
              </span>
              <span className="text-xs text-gray-500 line-through">
                {formatCurrency(product.selling_price)}
              </span>
            </>
          ) : (
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(product.selling_price)}
            </span>
          )}
        </div>

        {/* Stock Status Alerts */}
        {isCompletelyOutOfStock ? (
          <p className="text-xs text-red-500 mt-1 font-medium">Out of Stock</p>
        ) : (
          renderStockAlerts()
        )}
      </div>
    </Link>
  );
};

export default ProductCard;