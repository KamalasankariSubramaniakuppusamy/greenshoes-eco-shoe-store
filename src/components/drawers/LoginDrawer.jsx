// ============================================================================
// LoginDrawer- yet another slide-in drawer from the right for user login
// ============================================================================
// Login form component - displayed inside the AccountDrawer when user wants to sign in
// Inline login without navigating to a separate page

import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const LoginDrawer = ({ 
  onClose,            // Close the drawer (after successful login or cancel)
  onSwitchToRegister  // Switch to registration form
}) => {
  const { login } = useAuth();
  
  // Form field values
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  // Toggle password visibility (eye icon)
  const [showPassword, setShowPassword] = useState(false);
  
  // Loading state while API call is in progress
  const [loading, setLoading] = useState(false);
  
  // Error message to display (from API or validation)
  const [error, setError] = useState('');

  // ---------- FORM HANDLERS ----------
  
  // Update form data and clear any existing error
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');  // Clear error when user starts typing again
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation - both fields required
    if (!formData.email || !formData.password) {
      setError('All fields are required');
      return;
    }

    setLoading(true);
    setError('');

    // Call login from AuthContext
    // This sends credentials to API, stores token if successful
    const result = await login({
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);

    if (result.success) {
      // Login worked - close the drawer
      // AuthContext will update isAuthenticated, triggering UI updates
      onClose();
    } else {
      // Show error message from API (e.g., "Invalid credentials")
      setError(result.error || 'Login failed');
    }
  };

  return (
    <div className="p-6">
      {/* -------- HEADER -------- */}
      <div className="text-center mb-6">
        <h2 
          className="text-2xl font-semibold text-gray-900"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Welcome Back
        </h2>
        <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
      </div>

      {/* -------- ERROR MESSAGE -------- */}
      {/* Only shows when error state has a value */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* -------- LOGIN FORM -------- */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="your@email.com"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-gray-900 bg-white"
          />
        </div>

        {/* Password field with show/hide toggle */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-gray-900 bg-white"
            />
            {/* Eye icon to toggle password visibility */}
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* Submit button */}
        <Button type="submit" variant="accent" fullWidth disabled={loading}>
          {loading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>

      {/* -------- SWITCH TO REGISTER -------- */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-accent hover:underline font-medium"
          >
            Create Account
          </button>
        </p>
      </div>

      {/* -------- CONTINUE AS GUEST -------- */}
      {/* Just closes the drawer without logging in */}
      <div className="mt-4 text-center">
        <button
          onClick={onClose}
          className="text-sm text-gray-500 hover:text-gray-700"
        >
          Continue as Guest
        </button>
      </div>
    </div>
  );
};

export default LoginDrawer;

// ----------------------------------------------------------------------------
// This component is used inside AccountDrawer, not as a standalone page
// The flow is:
// 1. User clicks account icon -> AccountDrawer opens
// 2. User clicks "Sign In" -> AccountDrawer renders LoginDrawer
// 3. User submits form -> login() called via AuthContext
// 4. On success -> onClose() closes the drawer, user is now logged in
// 5. On failure -> error message shown, user can retry
//
// Could add in the future:
// - "Forgot password" link
// - "Remember me" checkbox
// - Social login buttons (Google, Apple, etc)
// ----------------------------------------------------------------------------