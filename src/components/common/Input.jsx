// ============================================================================
// Lets get the user to input data in forms!
// ============================================================================
// Reusable form input component with label and error display
// Keeps form styling consistent across the app

import React from 'react';

const Input = ({
  label,              // Label text above the input
  type = 'text',      // Input type: text, email, password, number, etc
  name,               // Field name (used for id, name attr, and form data)
  value,              // Controlled input value
  onChange,           // Change handler
  placeholder,        // Placeholder text
  required = false,   // Show asterisk and set required attr
  error,              // Error message to display below input
  disabled = false,   // Disable the input
  className = '',     // Additional CSS classes for the wrapper
}) => {
  return (
    // Wrapper div with margin bottom for spacing in forms
    <div className={`mb-4 ${className}`}>
      
      {/* -------- LABEL -------- */}
      {/* Only render if label prop is provided */}
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      
      {/* -------- INPUT FIELD -------- */}
      {/* input-field class is defined in global CSS for consistent styling */}
      <input
        type={type}
        id={name}         // Links to label's htmlFor
        name={name}       // For form submission
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={`input-field ${error ? 'border-red-500' : ''}`}
      />
      
      {/* -------- ERROR MESSAGE -------- */}
      {/* Only shows when error prop has a value */}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default Input;

// ----------------------------------------------------------------------------
// Usage example:
//
//   const [email, setEmail] = useState('');
//   const [emailError, setEmailError] = useState('');
//
//   <Input
//     label="Email Address"
//     type="email"
//     name="email"
//     value={email}
//     onChange={(e) => setEmail(e.target.value)}
//     placeholder="you@example.com"
//     required
//     error={emailError}
//   />
//
// This is a controlled component - parent manages the value state
// The input-field class handles padding, border, focus states, etc
// ----------------------------------------------------------------------------