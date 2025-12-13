// ============================================================================
// RegisterDrawer - User registration form inside AccountDrawer
// ============================================================================
// Registration form component - displayed inside AccountDrawer when user wants to create account
// Includes real-time password validation feedback
//
// Features:
// - Password strength requirements with live checkmarks
// - Confirm password matching validation
// - Show/hide password toggles
// - Form validation before submit

import React, { useState, useMemo } from 'react';
import { Eye, EyeOff, Check, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Button from '../common/Button';

const RegisterDrawer = ({ 
  onClose,          // Close the drawer
  onSwitchToLogin   // Switch to login form
}) => {
  const { register } = useAuth();
  
  // Form field values
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  
  // Password visibility toggles (separate for each field)
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Loading and error states
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // ---------- PASSWORD VALIDATION RULES ----------
  // useMemo recalculates only when password changes
  // Each rule has a label and whether it's currently satisfied
  const passwordRules = useMemo(() => {
    const password = formData.password;
    return [
      { label: 'At least 8 characters', valid: password.length >= 8 },
      { label: 'Contains uppercase letter', valid: /[A-Z]/.test(password) },
      { label: 'Contains lowercase letter', valid: /[a-z]/.test(password) },
      { label: 'Contains a number', valid: /[0-9]/.test(password) },
      { label: 'Contains special character (!@#$%^&*)', valid: /[!@#$%^&*(),.?":{}|<>]/.test(password) },
    ];
  }, [formData.password]);

  // All password requirements met?
  const isPasswordValid = passwordRules.every(rule => rule.valid);
  
  // Do the two password fields match? (and confirm isn't empty)
  const doPasswordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';

  // ---------- FORM HANDLERS ----------
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');  // Clear error when user makes changes
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all fields are filled
    if (!formData.fullName || !formData.email || !formData.password || !formData.confirmPassword) {
      setError('All fields are required');
      return;
    }

    // Validate password meets requirements
    if (!isPasswordValid) {
      setError('Password does not meet requirements');
      return;
    }

    // Validate passwords match
    if (!doPasswordsMatch) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    // Call register from AuthContext
    // Sends data to API, stores token if successful
    const result = await register({
      name: formData.fullName,      // Some APIs expect 'name'
      fullName: formData.fullName,  // Some expect 'fullName' - send both to be safe
      email: formData.email,
      password: formData.password,
    });

    setLoading(false);

    if (result.success) {
      // Registration worked - close drawer
      // User is now logged in (register returns token)
      onClose();
    } else {
      // Show error (e.g., "Email already exists")
      setError(result.error || 'Registration failed');
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
          Create Account
        </h2>
        <p className="text-gray-500 text-sm mt-1">Join GreenShoes today</p>
      </div>

      {/* -------- ERROR MESSAGE -------- */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg">
          {error}
        </div>
      )}

      {/* -------- REGISTRATION FORM -------- */}
      <form onSubmit={handleSubmit} className="space-y-4">
        
        {/* Full Name field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-gray-900 bg-white"
          />
        </div>

        {/* Email field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
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

        {/* Password field with requirements checklist */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password <span className="text-red-500">*</span>
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
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          
          {/* Password Requirements Checklist */}
          {/* Only shows once user starts typing a password */}
          {formData.password && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-600 mb-2">Password must contain:</p>
              <ul className="space-y-1">
                {passwordRules.map((rule, index) => (
                  <li key={index} className="flex items-center gap-2 text-xs">
                    {/* Green check or red X based on whether rule is satisfied */}
                    {rule.valid ? (
                      <Check size={14} className="text-green-500" />
                    ) : (
                      <X size={14} className="text-red-400" />
                    )}
                    <span className={rule.valid ? 'text-green-600' : 'text-gray-500'}>
                      {rule.label}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Confirm Password field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              // Dynamic border color based on match status
              className={`w-full px-4 py-2 pr-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-gray-900 bg-white ${
                formData.confirmPassword && !doPasswordsMatch 
                  ? 'border-red-500'    // Doesn't match - red border
                  : formData.confirmPassword && doPasswordsMatch 
                  ? 'border-green-500'  // Matches - green border
                  : 'border-gray-300'   // Empty - default gray
              }`}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {/* Match status messages */}
          {formData.confirmPassword && !doPasswordsMatch && (
            <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
          )}
          {formData.confirmPassword && doPasswordsMatch && (
            <p className="mt-1 text-xs text-green-500 flex items-center gap-1">
              <Check size={12} /> Passwords match
            </p>
          )}
        </div>

        {/* Submit button - disabled until password is valid and matches */}
        <Button 
          type="submit" 
          variant="accent" 
          fullWidth 
          disabled={loading || !isPasswordValid || !doPasswordsMatch}
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>

      {/* -------- SWITCH TO LOGIN -------- */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-accent hover:underline font-medium"
          >
            Sign In
          </button>
        </p>
      </div>

      {/* -------- CONTINUE AS GUEST -------- */}
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

export default RegisterDrawer;

// ----------------------------------------------------------------------------
// Password validation provides immediate feedback as user types
// This is good UX because:
// 1. User knows requirements upfront (no guessing)
// 2. Can see progress as they type
// 3. Submit button stays disabled until valid (prevents wasted API calls)
// 4. Confirm password shows match status immediately
//
// The useMemo for passwordRules prevents unnecessary recalculation
// It only runs when formData.password actually changes
// ----------------------------------------------------------------------------