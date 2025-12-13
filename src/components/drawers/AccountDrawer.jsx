// ============================================================================
// This drawer component handles user account interactions and is made for easy access from anywhere in the app.
// ============================================================================
// Account drawer component - slides out from header when clicking account icon
// Shows different content based on authentication state:
// - Logged out: Sign in/Register options, or inline login/register forms
// - Logged in: User info, account menu links, logout button
//
// This is like a mini account hub accessible from anywhere in the app

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, MapPin, CreditCard, LogOut, Heart, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoginDrawer from './LoginDrawer';
import RegisterDrawer from './RegisterDrawer';

const AccountDrawer = ({ onClose }) => {
  const { user, isAuthenticated, logout } = useAuth();
  
  // Track which view to show for non-authenticated users
  // 'main' = buttons to choose login or register
  // 'login' = login form
  // 'register' = registration form
  const [view, setView] = useState('main');

  const handleLogout = () => {
    logout();  // Clear auth state (removes token, etc)
    onClose(); // Close the drawer
  };

  // ==========================================================================
  // NOT LOGGED IN - Show auth options
  // ==========================================================================
  if (!isAuthenticated) {
    
    // ---------- LOGIN FORM VIEW ----------
    if (view === 'login') {
      return (
        <LoginDrawer 
          onClose={onClose} 
          onSwitchToRegister={() => setView('register')} 
        />
      );
    }
    
    // ---------- REGISTER FORM VIEW ----------
    if (view === 'register') {
      return (
        <RegisterDrawer 
          onClose={onClose} 
          onSwitchToLogin={() => setView('login')} 
        />
      );
    }

    // ---------- MAIN VIEW - Auth options ----------
    // Show buttons to choose between login, register, or continue as guest
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        {/* Placeholder icon */}
        <User size={48} className="text-gray-300 mb-4" />
        <p 
          className="text-gray-500 mb-6 text-center"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Sign in to access your account
        </p>
        
        <div className="w-full space-y-3">
          {/* Sign In button - primary action */}
          <button
            onClick={() => setView('login')}
            className="w-full py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Sign In
          </button>
          
          {/* Create Account button - secondary action */}
          <button
            onClick={() => setView('register')}
            className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 transition-colors"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Create Account
          </button>
          
          {/* Divider with "or" text */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>
          
          {/* Continue as Guest - just closes the drawer */}
          <button
            onClick={onClose}
            className="w-full text-center text-gray-600 hover:text-accent transition-colors py-2"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    );
  }

  // ==========================================================================
  // LOGGED IN - Show account menu
  // ==========================================================================
  
  // Get display name - handle various field name formats from API
  // Backend might return fullName, full_name, name, or username depending on context
  const userName = user?.fullName || user?.full_name || user?.name || user?.username || 'User';
  
  // Get initial for avatar circle
  // Fall back to first char of email if name isn't available
  const userInitial = userName !== 'User' 
    ? userName.charAt(0).toUpperCase() 
    : user?.email?.charAt(0).toUpperCase() || 'U';

  // Menu items with icons and navigation paths
  const menuItems = [
    { icon: Package, label: 'Order History', path: '/orders' },
    { icon: MapPin, label: 'Addresses', path: '/my-account' },
    { icon: CreditCard, label: 'Payment Methods', path: '/my-account' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart' },
  ];

  return (
    <div className="flex flex-col h-full">
      
      {/* -------- USER INFO HEADER -------- */}
      <div className="p-6 bg-gray-50 border-b">
        <div className="flex items-center gap-4">
          {/* Avatar circle with initial */}
          <div className="w-14 h-14 bg-accent rounded-full flex items-center justify-center text-white text-xl font-semibold shrink-0">
            {userInitial}
          </div>
          <div className="min-w-0 flex-1">
            <p 
              className="text-sm text-gray-500"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Welcome back,
            </p>
            <p 
              className="font-semibold text-lg text-gray-900"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {userName}
            </p>
            {/* truncate prevents long emails from breaking layout */}
            <p className="text-sm text-gray-500 truncate">{user?.email || ''}</p>
          </div>
        </div>
      </div>

      {/* -------- MENU ITEMS -------- */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={onClose}  // Close drawer when navigating
              className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <item.icon size={20} className="text-gray-600" />
              <span 
                className="text-gray-700"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {item.label}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      {/* -------- LOGOUT BUTTON -------- */}
      {/* Pinned to bottom with border separator */}
      <div className="border-t p-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={20} />
          <span style={{ fontFamily: "'Playfair Display', serif" }}>
            Sign Out
          </span>
        </button>
      </div>
    </div>
  );
};

export default AccountDrawer;

// ----------------------------------------------------------------------------
// How the auth flow works:
//
// 1. User clicks account icon in header
// 2. Drawer opens with this component
// 3. If not logged in:
//    - Shows Sign In / Create Account buttons
//    - Clicking either switches view to show inline form
//    - On successful login/register, AuthContext updates, component re-renders
//    - Now shows logged-in view automatically
// 4. If logged in:
//    - Shows user info and menu links
//    - Clicking a link navigates and closes drawer
//    - Clicking logout clears auth and closes drawer
//
// The LoginDrawer and RegisterDrawer components handle the actual forms
// They call onClose after successful auth, and drawer closes
// ----------------------------------------------------------------------------