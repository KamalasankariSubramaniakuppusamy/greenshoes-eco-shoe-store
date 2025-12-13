// ============================================================================
// Buttons
// ============================================================================
// Reusable button component with variant styling
// Keeps button styles consistent across the app

import React from 'react';

const Button = ({ 
  children,           // Button text/content
  variant = 'primary', // Style variant: 'primary', 'accent', or 'outline'
  type = 'button',    // HTML button type: 'button', 'submit', 'reset'
  onClick,            // Click handler
  disabled = false,   // Disable the button
  className = '',     // Additional CSS classes
  fullWidth = false   // Make button 100% width of container
}) => {
  // Full width for buttons in forms, modals, etc
  const baseClass = fullWidth ? 'w-full' : '';
  
  // Map variant prop to CSS classes
  // These classes are defined in the global CSS (probably index.css or similar)
  const variantClasses = {
    primary: 'btn-primary',   // Main action buttons (dark background)
    accent: 'btn-accent',     // Call-to-action buttons (brand color - coral/orange)
    outline: 'btn-outline',   // Secondary actions (border only, transparent bg)
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${variantClasses[variant]} ${baseClass} ${className}`}
    >
      {children}
    </button>
  );
};

export default Button;

// ----------------------------------------------------------------------------
// Usage examples:
//
//   <Button onClick={handleSave}>Save Changes</Button>
//   <Button variant="accent" fullWidth>Add to Cart</Button>
//   <Button variant="outline" onClick={handleCancel}>Cancel</Button>
//   <Button type="submit" disabled={!isValid}>Submit</Button>
//
// The actual button styles (colors, padding, hover states) are in CSS
// This component just handles the logic and class assignment
// ----------------------------------------------------------------------------