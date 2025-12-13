// ============================================================================
// Drawer.jsx
// ============================================================================
// Slide-out drawer component - appears from the right side of screen
// Used for cart preview, filters, mobile navigation, etc.
// This is to not take over the whole screen like a modal and still allow context of the page behind so that the
// user knows where they are in the app and we can still keep them interested in the store content behind.
// Closeable by clicking outside or pressing Escape.

// Features:
// - Slides in from right with animation
// - Click backdrop to close
// - Press Escape to close
// - Prevents body scroll when open
// - Flexible width via prop

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Drawer = ({ 
  isOpen,              // Whether drawer is visible
  onClose,             // Function to call when closing
  title,               // Header text
  children,            // Drawer content
  width = 'max-w-md'   // Tailwind width class (max-w-sm, max-w-lg, etc)
}) => {
  
  // ---------- BODY SCROLL LOCK ----------
  // When drawer is open, prevent the page behind from scrolling
  // This is important for mobile where users might accidentally scroll the page
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    // Cleanup on unmount - restore scrolling
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // ---------- ESCAPE KEY HANDLER ----------
  // Standard UX pattern - pressing Escape closes modals/drawers
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    
    // Only listen when drawer is open
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }
    
    // Cleanup listener when drawer closes or component unmounts
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Don't render anything if closed
  // Could also use CSS to hide, but this is cleaner
  if (!isOpen) return null;

  return (
    // Fixed overlay covering entire viewport
    // z-[100] ensures it's above everything else (header, etc)
    <div className="fixed inset-0 z-[100]">
      
      {/* -------- BACKDROP -------- */}
      {/* Semi-transparent overlay behind the drawer */}
      {/* Clicking it closes the drawer */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />
      
      {/* -------- DRAWER PANEL -------- */}
      {/* The actual drawer that slides in from the right */}
      <div 
        className={`absolute right-0 top-0 h-full w-full ${width} bg-white shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col`}
        style={{ transform: isOpen ? 'translateX(0)' : 'translateX(100%)' }}
      >
        {/* -------- HEADER -------- */}
        {/* Title and close button */}
        <div className="flex items-center justify-between p-4 border-b bg-gray-50 shrink-0">
          <h2 
            className="text-xl font-semibold text-gray-900"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>
        
        {/* -------- CONTENT -------- */}
        {/* Scrollable area for drawer contents */}
        {/* flex-1 makes it fill remaining space, overflow-y-auto enables scrolling */}
        <div className="flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Drawer;

// ----------------------------------------------------------------------------
// Usage example:
//
//   const [cartOpen, setCartOpen] = useState(false);
//
//   <Drawer 
//     isOpen={cartOpen} 
//     onClose={() => setCartOpen(false)}
//     title="Your Cart"
//     width="max-w-lg"
//   >
//     <CartContents />
//   </Drawer>
//
// Width options (Tailwind classes):
//   max-w-sm  = 384px
//   max-w-md  = 448px (default)
//   max-w-lg  = 512px
//   max-w-xl  = 576px
// ----------------------------------------------------------------------------