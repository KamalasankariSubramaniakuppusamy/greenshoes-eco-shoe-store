// ============================================================================
// I want to keep this moda to get a confirmation from the user before deleting an item
// so that they don't accidentally delete something important and still get a chance to back out
// ============================================================================
// Reusable modal dialog component - centered overlay for focused content
// Used for confirmations, forms, detail views, etc.
//
// Features:
// - Multiple size options
// - Click backdrop to close
// - Prevents body scroll when open
// - Scrollable content if taller than viewport

import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ 
  isOpen,           // Whether modal is visible
  onClose,          // Function to call when closing
  title,            // Header text
  children,         // Modal content
  size = 'md'       // Size: 'sm', 'md', 'lg', 'xl'
}) => {
  
  // ---------- BODY SCROLL LOCK ----------
  // Prevent background page from scrolling while modal is open
  // Same pattern as Drawer component
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Don't render anything if closed
  if (!isOpen) return null;

  // Map size prop to Tailwind max-width classes
  const sizeClasses = {
    sm: 'max-w-md',   // 448px - small dialogs, confirmations
    md: 'max-w-lg',   // 512px - default, forms
    lg: 'max-w-2xl',  // 672px - more content
    xl: 'max-w-4xl',  // 896px - large forms, previews
  };

  return (
    // Fixed overlay covering viewport
    // overflow-y-auto allows scrolling if modal is taller than screen
    <div className="fixed inset-0 z-50 overflow-y-auto">
      
      {/* -------- BACKDROP -------- */}
      {/* Dark overlay behind modal - click to close */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>

      {/* -------- MODAL CONTAINER -------- */}
      {/* Flexbox centers the modal vertically and horizontally */}
      <div className="flex min-h-full items-center justify-center p-4">
        
        {/* -------- MODAL PANEL -------- */}
        {/* The actual modal box */}
        {/* max-h-[90vh] prevents modal from being taller than viewport */}
        {/* overflow-y-auto adds scrollbar if content overflows */}
        <div
          className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full max-h-[90vh] overflow-y-auto`}
        >
          {/* -------- HEADER -------- */}
          <div className="flex items-center justify-between p-6 border-b">
            <h3 className="text-xl font-serif text-gray-900">{title}</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          {/* -------- CONTENT -------- */}
          {/* Whatever you pass as children goes here */}
          <div className="p-6">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;

// ----------------------------------------------------------------------------
// Usage example:
//
//   const [showModal, setShowModal] = useState(false);
//
//   <Modal 
//     isOpen={showModal} 
//     onClose={() => setShowModal(false)}
//     title="Confirm Delete"
//     size="sm"
//   >
//     <p>Are you sure you want to delete this item?</p>
//     <div className="flex gap-4 mt-4">
//       <Button onClick={() => setShowModal(false)}>Cancel</Button>
//       <Button variant="accent" onClick={handleDelete}>Delete</Button>
//     </div>
//   </Modal>
//
// Note: This modal doesn't have Escape key handling like Drawer does
// Could add that for better accessibility
// ----------------------------------------------------------------------------