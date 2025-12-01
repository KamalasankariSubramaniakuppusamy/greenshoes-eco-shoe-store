import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { User, Package, MapPin, CreditCard, LogOut, Heart, ShoppingCart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import LoginDrawer from './LoginDrawer';
import RegisterDrawer from './RegisterDrawer';

const AccountDrawer = ({ onClose }) => {
  const { user, isAuthenticated, logout } = useAuth();
  const [view, setView] = useState('main'); // 'main', 'login', 'register'

  const handleLogout = () => {
    logout();
    onClose();
  };

  // Not logged in - show login/register options or forms
  if (!isAuthenticated) {
    if (view === 'login') {
      return (
        <LoginDrawer 
          onClose={onClose} 
          onSwitchToRegister={() => setView('register')} 
        />
      );
    }
    
    if (view === 'register') {
      return (
        <RegisterDrawer 
          onClose={onClose} 
          onSwitchToLogin={() => setView('login')} 
        />
      );
    }

    // Main view - show options
    return (
      <div className="flex flex-col items-center justify-center h-full p-6">
        <User size={48} className="text-gray-300 mb-4" />
        <p 
          className="text-gray-500 mb-6 text-center"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Sign in to access your account
        </p>
        <div className="w-full space-y-3">
          <button
            onClick={() => setView('login')}
            className="w-full py-3 bg-accent text-white rounded-lg font-medium hover:bg-accent/90 transition-colors"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Sign In
          </button>
          <button
            onClick={() => setView('register')}
            className="w-full py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-medium hover:border-gray-400 transition-colors"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Create Account
          </button>
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">or</span>
            </div>
          </div>
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

  // Get the user's name - check multiple possible field names
  const userName = user?.fullName || user?.full_name || user?.name || user?.username || 'User';
  const userInitial = userName !== 'User' ? userName.charAt(0).toUpperCase() : user?.email?.charAt(0).toUpperCase() || 'U';

  // Logged in view
  const menuItems = [
    { icon: Package, label: 'Order History', path: '/orders' },
    { icon: MapPin, label: 'Addresses', path: '/my-account' },
    { icon: CreditCard, label: 'Payment Methods', path: '/my-account' },
    { icon: Heart, label: 'Wishlist', path: '/wishlist' },
    { icon: ShoppingCart, label: 'Cart', path: '/cart' },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* User Info */}
      <div className="p-6 bg-gray-50 border-b">
        <div className="flex items-center gap-4">
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
            <p className="text-sm text-gray-500 truncate">{user?.email || ''}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex-1 overflow-y-auto">
        <nav className="p-4">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={onClose}
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

      {/* Logout Button */}
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