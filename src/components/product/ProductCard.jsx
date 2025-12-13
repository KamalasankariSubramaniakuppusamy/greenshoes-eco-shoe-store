// ============================================================================
// ProductCard.jsx
// ============================================================================
// Product card component for catalog/grid displays
// Shows product image, name, price, sale status, stock status, and wishlist toggle
//
// Used on:
// - Home page product grid
// - Category listing pages
// - Search results

import React from 'react';
import { Link } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { formatCurrency } from '../../utils/constants';
import { useWishlist } from '../../context/WishlistContext';

// Base URL for product images
const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';


const ProductCard = ({ product }) => {
  // ---------- WISHLIST INTEGRATION ----------
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlist();
  const inWishlist = isInWishlist(product.id);

  // Toggle wishlist status when heart is clicked
  // preventDefault/stopPropagation prevents the Link from navigating
  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWishlist) {
      await removeFromWishlist(product.id);
    } else {
      await addToWishlist(product.id);
    }
  };

  // ---------- IMAGE URL HELPER ----------
  // Handles different image path formats
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400';
    if (imagePath.startsWith('http')) return imagePath;
    return `${API_BASE}${imagePath}`;
  };

  const imageUrl = getImageUrl(product.main_image);

  // ---------- STOCK STATUS ----------
  // Product can be completely out of stock or have partial availability
  const isCompletelyOutOfStock = product.status === 'out_of_stock';

  // Stock alerts from API - specific size/color combos that are low or out
  const stockAlerts = product.stock_alerts || [];
  const variantsRunningOut = product.variants_running_out || 0;
  const variantsOutOfStock = product.variants_out_of_stock || 0;

  // ---------- STOCK ALERTS RENDERER ----------
  // Shows specific alerts like "Size 7 in Black - Out of Stock"
  const renderStockAlerts = () => {
    if (stockAlerts.length === 0) return null;

    // Show up to 2 specific alerts, then summarize the rest
    const alertsToShow = stockAlerts.slice(0, 2);
    
    return (
      <div className="mt-1 space-y-0.5">
        {alertsToShow.map((alert, index) => (
          <p 
            key={index} 
            className={`text-xs ${
              alert.type === 'out_of_stock' 
                ? 'text-red-500'     // Sold out = red
                : 'text-orange-500'  // Low stock = orange/warning
            }`}
          >
            {alert.message}
          </p>
        ))}
        {/* If more than 2 alerts, show count */}
        {stockAlerts.length > 2 && (
          <p className="text-xs text-gray-500">
            +{stockAlerts.length - 2} more alerts
          </p>
        )}
      </div>
    );
  };

  return (
    // Entire card is wrapped in Link - clicking anywhere goes to product detail
    <Link to={`/product/${product.id}`} className="group block">
      
      {/* -------- IMAGE CONTAINER -------- */}
      {/* 3:4 aspect ratio maintains consistent card heights in grid */}
      <div className="relative overflow-hidden bg-white rounded-lg aspect-[3/4]">
        
        {/* Product image with hover zoom effect */}
        <img
          src={imageUrl}
          alt={product.name}
          className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ${
            isCompletelyOutOfStock ? 'opacity-60' : ''  // Dim if out of stock
          }`}
          onError={(e) => {
            // Fallback image if product image fails to load
            e.target.src = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400';
          }}
        />

        {/* -------- SALE BADGE -------- */}
        {/* Top-left corner, bright red to draw attention */}
        {product.on_sale && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded font-bold">
            SALE
          </div>
        )}

        {/* -------- OUT OF STOCK OVERLAY -------- */}
        {/* Only shown if ALL variants are out of stock */}
        {isCompletelyOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
            <span className="bg-white text-gray-900 px-3 py-1 rounded font-medium text-sm">
              Out of Stock
            </span>
          </div>
        )}

        {/* -------- PARTIAL STOCK BADGES -------- */}
        {/* Bottom-left corner, shows counts of problematic variants */}
        {/* Only shown if some (not all) variants have stock issues */}
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

        {/* -------- WISHLIST BUTTON -------- */}
        {/* Top-right corner, toggles wishlist status */}
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

      {/* -------- PRODUCT INFO -------- */}
      <div className="mt-4">
        {/* Product name - changes color on hover (group-hover) */}
        <h3 className="text-sm font-medium text-gray-900 group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        
        {/* Category */}
        <p className="text-xs text-gray-500 mt-1 capitalize">{product.category}</p>
        
        {/* -------- PRICE DISPLAY -------- */}
        <div className="mt-2 flex items-center space-x-2">
          {product.on_sale && product.sale_price ? (
            // Sale pricing - show sale price prominently, original crossed out
            <>
              <span className="text-sm font-semibold text-accent">
                {formatCurrency(product.sale_price)}
              </span>
              <span className="text-xs text-gray-500 line-through">
                {formatCurrency(product.selling_price)}
              </span>
            </>
          ) : (
            // Regular pricing
            <span className="text-sm font-semibold text-gray-900">
              {formatCurrency(product.selling_price)}
            </span>
          )}
        </div>

        {/* -------- STOCK STATUS TEXT -------- */}
        {isCompletelyOutOfStock ? (
          <p className="text-xs text-red-500 mt-1 font-medium">Out of Stock</p>
        ) : (
          // Detailed stock alerts for specific variants
          renderStockAlerts()
        )}
      </div>
    </Link>
  );
};

export default ProductCard;

// ----------------------------------------------------------------------------
// FEATURES:
// - Entire card is clickable (Link wrapper)
// - Wishlist toggle works without navigating (event.stopPropagation)
// - Sale badge and pricing automatically show when on_sale is true
// - Stock status at multiple levels:
//   1. Completely out of stock = full overlay + text
//   2. Some variants out = badge count + detailed alerts
//   3. Some variants low = warning badge + alerts
// - Image zoom on hover via group-hover
// - Fallback image if product image fails
//
// PROPS EXPECTED:
// product: {
//   id, name, category,
//   main_image,
//   selling_price, sale_price, on_sale,
//   status ('in_stock' | 'out_of_stock'),
//   stock_alerts: [{ type, message }],
//   variants_running_out, variants_out_of_stock
// }
// ----------------------------------------------------------------------------