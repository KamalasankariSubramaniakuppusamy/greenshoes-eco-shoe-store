import React from 'react';

const Button = ({ 
  children, 
  variant = 'primary', 
  type = 'button', 
  onClick, 
  disabled = false,
  className = '',
  fullWidth = false 
}) => {
  const baseClass = fullWidth ? 'w-full' : '';
  
  const variantClasses = {
    primary: 'btn-primary',
    accent: 'btn-accent',
    outline: 'btn-outline',
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