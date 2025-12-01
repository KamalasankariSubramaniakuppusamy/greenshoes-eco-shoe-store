import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import Drawer from '../common/Drawer';
import CartDrawer from '../drawers/CartDrawer';
import WishlistDrawer from '../drawers/WishlistDrawer';
import AccountDrawer from '../drawers/AccountDrawer';

const CATEGORIES = [
  { value: 'sneakers', label: 'Sneakers' },
  { value: 'sandals', label: 'Sandals' },
  { value: 'boots', label: 'Boots' },
  { value: 'pumps', label: 'Pumps' },
  { value: 'heels', label: 'Heels' },
];

const SORT_OPTIONS = [
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'price_asc', label: 'Price (Low to High)' },
  { value: 'price_desc', label: 'Price (High to Low)' },
  { value: 'newest', label: 'Newest First' },
];

const Header = () => {
  const { isAuthenticated } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [saleOnly, setSaleOnly] = useState(false);
  
  // Drawer states
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  
  const shopDropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shopDropdownRef.current && !shopDropdownRef.current.contains(event.target)) {
        setShopDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync filters from URL on mount and URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('search') || '');
    setSelectedCategory(params.get('category') || '');
    setSortBy(params.get('sort') || '');
    setSaleOnly(params.get('sale') === 'true');
  }, [location.search]);

  // Check if we're on the home page to show filters
  const isHomePage = location.pathname === '/' || location.pathname === '/products';

  // Debounced search - triggers after user stops typing
  useEffect(() => {
    // Don't trigger on initial mount or when syncing from URL
    const urlParams = new URLSearchParams(location.search);
    const urlSearchValue = urlParams.get('search') || '';
    
    if (searchQuery === urlSearchValue) return;
    
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        // When searching, clear category filter
        setSelectedCategory('');
        const params = new URLSearchParams();
        params.set('search', searchQuery.trim());
        if (sortBy) params.set('sort', sortBy);
        if (saleOnly) params.set('sale', 'true');
        navigate(`/?${params.toString()}`);
      } else if (urlSearchValue) {
        // Clear search from URL if input is empty
        const params = new URLSearchParams(location.search);
        params.delete('search');
        navigate(`/?${params.toString()}`);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchQuery, location.search, sortBy, saleOnly, navigate]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Form submit is handled by the useEffect above
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShopDropdownOpen(false);
    // When selecting category, clear search to avoid conflicts
    setSearchQuery('');
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (sortBy) params.set('sort', sortBy);
    if (saleOnly) params.set('sale', 'true');
    navigate(`/?${params.toString()}`);
  };

  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    const params = new URLSearchParams(location.search);
    if (newSort) params.set('sort', newSort);
    else params.delete('sort');
    navigate(`/?${params.toString()}`);
  };

  const handleSaleToggle = () => {
    const newSaleOnly = !saleOnly;
    setSaleOnly(newSaleOnly);
    const params = new URLSearchParams(location.search);
    if (newSaleOnly) params.set('sale', 'true');
    else params.delete('sale');
    navigate(`/?${params.toString()}`);
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('');
    setSaleOnly(false);
    navigate('/');
  };

  return (
    <header className="bg-primary text-white sticky top-0 z-50">
      {/* Top Row - Logo */}
      <div className="container-custom py-6">
        <div className="flex justify-center">
          <Link to="/" className="text-center">
            <h1 
              className="text-3xl md:text-4xl tracking-[0.3em] text-white"
              style={{ fontFamily: "'Cinzel Decorative', cursive" }}
            >
              GREENSHOES
            </h1>
            <p 
              className="text-xs tracking-[0.4em] text-gray-300 mt-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              SCULPTED BY THE SEA
            </p>
          </Link>
        </div>
      </div>

      {/* Middle Row - Navigation Links */}
      <nav className="border-t border-gray-700">
        <div className="container-custom">
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center justify-center gap-8 py-4">
            <Link 
              to="/" 
              className={`text-sm tracking-wider hover:text-accent transition-colors ${
                location.pathname === '/' ? 'text-accent border-b-2 border-accent pb-1' : ''
              }`}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              HOME
            </Link>
            
            {/* Shop Now Dropdown */}
            <div className="relative" ref={shopDropdownRef}>
              <button
                onClick={() => setShopDropdownOpen(!shopDropdownOpen)}
                className={`flex items-center gap-1 text-sm tracking-wider hover:text-accent transition-colors ${
                  selectedCategory ? 'text-accent border-b-2 border-accent pb-1' : ''
                }`}
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                SHOP NOW
                <ChevronDown size={16} className={`transition-transform ${shopDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {shopDropdownOpen && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 bg-white text-gray-900 rounded-lg shadow-xl py-2 min-w-[180px] z-50">
                  <button
                    onClick={() => handleCategorySelect('')}
                    className="w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    All Categories
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => handleCategorySelect(cat.value)}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100 text-sm ${
                        selectedCategory === cat.value ? 'bg-gray-100 text-accent font-medium' : ''
                      }`}
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link 
              to="/about" 
              className={`text-sm tracking-wider hover:text-accent transition-colors ${
                location.pathname === '/about' ? 'text-accent border-b-2 border-accent pb-1' : ''
              }`}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              ABOUT
            </Link>
            
            {/* Cart Button - Opens Drawer */}
            <button 
              onClick={() => setCartDrawerOpen(true)}
              className={`relative text-sm tracking-wider hover:text-accent transition-colors ${
                cartDrawerOpen ? 'text-accent border-b-2 border-accent pb-1' : ''
              }`}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              CART
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            
            {/* Wishlist Button - Opens Drawer */}
            <button 
              onClick={() => setWishlistDrawerOpen(true)}
              className={`relative text-sm tracking-wider hover:text-accent transition-colors ${
                wishlistDrawerOpen ? 'text-accent border-b-2 border-accent pb-1' : ''
              }`}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              WISHLIST
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-4 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>
            
            {/* Account Button - Opens Drawer */}
            <button 
              onClick={() => setAccountDrawerOpen(true)}
              className={`text-sm tracking-wider hover:text-accent transition-colors ${
                accountDrawerOpen ? 'text-accent border-b-2 border-accent pb-1' : ''
              }`}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {isAuthenticated ? 'MY ACCOUNT' : 'LOGIN'}
            </button>
          </div>

          {/* Mobile Navigation Toggle */}
          <div className="md:hidden flex items-center justify-between py-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            <div className="flex items-center gap-4">
              <button onClick={() => setCartDrawerOpen(true)} className="relative">
                <ShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-accent text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </button>
              <button onClick={() => setWishlistDrawerOpen(true)} className="relative">
                <Heart size={20} />
                {wishlistCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-pink-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {wishlistCount}
                  </span>
                )}
              </button>
              <button onClick={() => setAccountDrawerOpen(true)}>
                <User size={20} />
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-700">
              <div className="flex flex-col gap-4">
                <Link 
                  to="/" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm tracking-wider"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  HOME
                </Link>
                
                <div className="space-y-2">
                  <p className="text-sm tracking-wider text-gray-400" style={{ fontFamily: "'Playfair Display', serif" }}>
                    SHOP BY CATEGORY
                  </p>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.value}
                      onClick={() => {
                        handleCategorySelect(cat.value);
                        setMobileMenuOpen(false);
                      }}
                      className="block text-sm pl-4 hover:text-accent"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
                
                <Link 
                  to="/about" 
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm tracking-wider"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  ABOUT
                </Link>
                
                <Link 
                  to={isAuthenticated ? "/account" : "/login"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-sm tracking-wider"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {isAuthenticated ? 'MY ACCOUNT' : 'LOGIN'}
                </Link>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Bottom Row - Search & Filters (shown on home/products page) */}
      {isHomePage && (
        <div className="border-t border-gray-700 bg-primary">
          <div className="container-custom py-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Search Bar - Centered */}
              <div className="w-full md:flex-1 md:max-w-md mx-auto order-1 md:order-2">
                <form onSubmit={handleSearch} className="relative">
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 pl-10 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-accent"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  />
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                </form>
              </div>

              {/* Left Filters */}
              <div className="flex items-center gap-3 order-2 md:order-1">
                {/* Category Dropdown */}
                <select
                  value={selectedCategory}
                  onChange={(e) => handleCategorySelect(e.target.value)}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  <option value="">All Categories</option>
                  {CATEGORIES.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Right Filters */}
              <div className="flex items-center gap-3 order-3">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={handleSortChange}
                  className="px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-accent"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  <option value="">Sort By</option>
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                {/* Sale Toggle */}
                <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={saleOnly}
                    onChange={handleSaleToggle}
                    className="w-4 h-4 accent-accent"
                  />
                  <span 
                    className="text-sm text-white"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Sale Only
                  </span>
                </label>

                {/* Clear Filters */}
                {(searchQuery || selectedCategory || sortBy || saleOnly) && (
                  <button
                    onClick={clearFilters}
                    className="px-3 py-2 text-sm text-accent hover:text-white transition-colors whitespace-nowrap"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Drawers */}
      <Drawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        title="Shopping Cart"
      >
        <CartDrawer onClose={() => setCartDrawerOpen(false)} />
      </Drawer>

      <Drawer
        isOpen={wishlistDrawerOpen}
        onClose={() => setWishlistDrawerOpen(false)}
        title="My Wishlist"
      >
        <WishlistDrawer onClose={() => setWishlistDrawerOpen(false)} />
      </Drawer>

      <Drawer
        isOpen={accountDrawerOpen}
        onClose={() => setAccountDrawerOpen(false)}
        title="My Account"
      >
        <AccountDrawer onClose={() => setAccountDrawerOpen(false)} />
      </Drawer>
    </header>
  );
};

export default Header;