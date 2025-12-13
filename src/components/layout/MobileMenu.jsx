// ============================================================================
// MobileMenu - This is for the slide-in mobile navigation menu– requirement met for accessibility
// users on small screens can easily navigate the site
// ============================================================================
// Slide-out mobile navigation menu
// Appears from the left side on mobile devices
//
// Note: This component might be redundant - Header.jsx already has
// a built-in mobile menu. Check if both are needed or consolidate.

import React from 'react';
import { Link } from 'react-router-dom';
import { X, Home, Info, ShoppingCart, Heart, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MobileMenu = ({ isOpen, onClose }) => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();   // Clear auth state
    onClose();  // Close the menu
  };

  // Don't render anything if menu is closed
  if (!isOpen) return null;

  return (
    <>
      {/* -------- BACKDROP -------- */}
      {/* Semi-transparent overlay - click to close menu */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      ></div>

      {/* -------- MENU PANEL -------- */}
      {/* Slides in from left side */}
      <div className="fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-xl">
        
        {/* -------- HEADER -------- */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-serif">Menu</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <X size={24} />
          </button>
        </div>

        {/* -------- NAVIGATION LINKS -------- */}
        <nav className="p-4">
          {/* Home */}
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center space-x-3 py-3 text-gray-700 hover:text-accent transition-colors"
          >
            <Home size={20} />
            <span>Home</span>
          </Link>

          {/* About */}
          <Link
            to="/about"
            onClick={onClose}
            className="flex items-center space-x-3 py-3 text-gray-700 hover:text-accent transition-colors"
          >
            <Info size={20} />
            <span>About</span>
          </Link>

          {/* Cart */}
          <Link
            to="/cart"
            onClick={onClose}
            className="flex items-center space-x-3 py-3 text-gray-700 hover:text-accent transition-colors"
          >
            <ShoppingCart size={20} />
            <span>Cart</span>
          </Link>

          {/* Wishlist */}
          <Link
            to="/wishlist"
            onClick={onClose}
            className="flex items-center space-x-3 py-3 text-gray-700 hover:text-accent transition-colors"
          >
            <Heart size={20} />
            <span>Wishlist</span>
          </Link>

          {/* ---------- AUTHENTICATED USER SECTION ---------- */}
          {isAuthenticated ? (
            <>
              {/* My Account link */}
              <Link
                to="/my-account"
                onClick={onClose}
                className="flex items-center space-x-3 py-3 text-gray-700 hover:text-accent transition-colors"
              >
                <User size={20} />
                <span>My Account</span>
              </Link>

              {/* Logout button */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 py-3 text-gray-700 hover:text-accent transition-colors"
              >
                <span>Logout</span>
              </button>

              {/* User info display */}
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">Logged in as:</p>
                <p className="text-sm font-medium text-gray-900">
                  {user?.fullName || user?.full_name}
                </p>
              </div>
            </>
          ) : (
            /* ---------- GUEST USER SECTION ---------- */
            <>
              <Link
                to="/login"
                onClick={onClose}
                className="block py-3 text-gray-700 hover:text-accent transition-colors"
              >
                Login
              </Link>

              <Link
                to="/register"
                onClick={onClose}
                className="block py-3 text-gray-700 hover:text-accent transition-colors"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </>
  );
};

export default MobileMenu;

// ----------------------------------------------------------------------------
// USAGE NOTE:
// This component navigates to full pages (/cart, /wishlist, /login)
// whereas Header.jsx opens drawers for cart/wishlist/account
//
// Consider whether this is intentional (different UX on mobile)
// or if they should be consolidated for consistency
//
// If keeping both:
// - This one: traditional page navigation
// - Header mobile menu: drawer-based quick access
// ----------------------------------------------------------------------------