// ============================================================================
// ProductGrid.jsx
// ============================================================================
// Responsive grid layout for displaying product cards
// Handles loading and empty states
//
// Used on home page, category pages, and search results

import React from 'react';
import ProductCard from './ProductCard';
import Loading from '../common/Loading';

const ProductGrid = ({ products, loading }) => {
  
  // ---------- LOADING STATE ----------
  // Show spinner while products are being fetched
  if (loading) {
    return <Loading />;
  }

  // ---------- EMPTY STATE ----------
  // No products found (empty category, no search results, etc)
  if (!products || products.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No products found</p>
      </div>
    );
  }

  // ---------- PRODUCT GRID ----------
  // Responsive grid:
  // - Mobile (default): 2 columns
  // - Tablet (md): 3 columns
  // - Desktop (lg): 4 columns
  // gap-6 provides consistent spacing between cards
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;

// ----------------------------------------------------------------------------
// This is a simple presentational component - it just arranges ProductCards
// All the logic for loading, filtering, and fetching happens in the parent
//
// Usage:
//   <ProductGrid products={products} loading={isLoading} />
//
// The responsive breakpoints match Tailwind defaults:
// - sm: 640px
// - md: 768px  (3 columns)
// - lg: 1024px (4 columns)
// - xl: 1280px
//
// Could extend with:
// - Different grid layouts (list view vs grid view toggle)
// - Pagination or infinite scroll
// - Skeleton loading instead of spinner
// ----------------------------------------------------------------------------