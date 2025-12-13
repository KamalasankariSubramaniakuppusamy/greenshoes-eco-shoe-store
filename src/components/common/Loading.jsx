// ============================================================================
// The purpose of this component is to show a loading spinner
// while async operations are in progress, either inline within content
// or as a fullscreen overlay blocking user interaction
// ============================================================================
// Loading spinner component - shows while async operations are in progress
// Two modes: inline (within content) or fullScreen (overlay entire page)

import React from 'react';

const Loading = ({ fullScreen = false }) => {
  
  // ---------- FULLSCREEN MODE ----------
  // Covers the entire viewport with semi-transparent overlay
  // Used when loading an entire page or blocking user interaction
  // Example: initial app load, route transitions
  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
        <div className="text-center">
          {/* Spinning circle - border-b creates the partial border effect */}
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-accent mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // ---------- INLINE MODE (DEFAULT) ----------
  // Just a spinner with some vertical padding
  // Used within components, sections, etc
  // Example: loading products in a grid, fetching order details
  return (
    <div className="flex items-center justify-center py-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-accent"></div>
    </div>
  );
};

export default Loading;

// ----------------------------------------------------------------------------
// Usage examples:
//
//   // Fullscreen - blocks everything while page loads
//   if (loading) return <Loading fullScreen />;
//
//   // Inline - shows within a section
//   {loading ? <Loading /> : <ProductGrid products={products} />}
//
// The spinner uses Tailwind's animate-spin for the rotation
// border-b-2 border-accent creates the partial colored border that spins
// ----------------------------------------------------------------------------