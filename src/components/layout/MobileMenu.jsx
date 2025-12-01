import React from 'react';
import { Link } from 'react-router-dom';
import { X, Home, Info, ShoppingCart, Heart, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const MobileMenu = ({ isOpen, onClose }) => {
  const { isAuthenticated, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      ></div>

      {/* Menu */}
      <div className="fixed top-0 left-0 h-full w-64 bg-white z-50 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-serif">Menu</h2>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-900">
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4">
          <Link
            to="/"
            onClick={onClose}
            className="flex items-center space-x-3 py-3 text-gray-700 hover:text-accent transition-colors"
          >
            <Home size={20} />
            <span>Home</span>
          </Link>

          <Link
            to="/about"
            onClick={onClose}
            className="flex items-center space-x-3 py-3 text-gray-700 hover:text-accent transition-colors"
          >
            <Info size={20} />
            <span>About</span>
          </Link>

          <Link
            to="/cart"
            onClick={onClose}
            className="flex items-center space-x-3 py-3 text-gray-700 hover:text-accent transition-colors"
          >
            <ShoppingCart size={20} />
            <span>Cart</span>
          </Link>

          <Link
            to="/wishlist"
            onClick={onClose}
            className="flex items-center space-x-3 py-3 text-gray-700 hover:text-accent transition-colors"
          >
            <Heart size={20} />
            <span>Wishlist</span>
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/my-account"
                onClick={onClose}
                className="flex items-center space-x-3 py-3 text-gray-700 hover:text-accent transition-colors"
              >
                <User size={20} />
                <span>My Account</span>
              </Link>

              <button
                onClick={handleLogout}
                className="w-full flex items-center space-x-3 py-3 text-gray-700 hover:text-accent transition-colors"
              >
                <span>Logout</span>
              </button>

              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600">Logged in as:</p>
                <p className="text-sm font-medium text-gray-900">
                  {user?.fullName || user?.full_name}
                </p>
              </div>
            </>
          ) : (
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