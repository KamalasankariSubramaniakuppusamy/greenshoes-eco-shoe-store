// ============================================================================
// Header component - site branding, navigation, search, filters, and drawers
// ============================================================================
// Main site header - navigation, search, filters, and drawer triggers
// This is a complex component that handles a lot:
// - Brand logo
// - Desktop and mobile navigation
// - Category dropdown
// - Search with debounce
// - Filters (category, sort, sale)
// - Cart/Wishlist/Account drawers
// - URL-based filter state (filters persist in URL)

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

// ---------- FILTER OPTIONS ----------
// These match the product categories in the database
const CATEGORIES = [
  { value: 'sneakers', label: 'Sneakers' },
  { value: 'sandals', label: 'Sandals' },
  { value: 'boots', label: 'Boots' },
  { value: 'pumps', label: 'Pumps' },
  { value: 'heels', label: 'Heels' },
];

// Sort options - values match what the API expects
const SORT_OPTIONS = [
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'name_desc', label: 'Name (Z-A)' },
  { value: 'price_asc', label: 'Price (Low to High)' },
  { value: 'price_desc', label: 'Price (High to Low)' },
  { value: 'newest', label: 'Newest First' },
];


const Header = () => {
  // ---------- CONTEXT HOOKS ----------
  const { isAuthenticated } = useAuth();
  const { itemCount: cartCount } = useCart();
  const { itemCount: wishlistCount } = useWishlist();
  
  // ---------- ROUTING ----------
  const navigate = useNavigate();
  const location = useLocation();
  
  // ---------- UI STATE ----------
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shopDropdownOpen, setShopDropdownOpen] = useState(false);
  
  // ---------- FILTER STATE ----------
  // These are synced with URL query params
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('');
  const [saleOnly, setSaleOnly] = useState(false);
  
  // ---------- DRAWER STATE ----------
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [wishlistDrawerOpen, setWishlistDrawerOpen] = useState(false);
  const [accountDrawerOpen, setAccountDrawerOpen] = useState(false);
  
  // Ref for click-outside detection on shop dropdown
  const shopDropdownRef = useRef(null);

  // ---------- CLICK OUTSIDE HANDLER ----------
  // Close the shop dropdown when clicking anywhere else
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shopDropdownRef.current && !shopDropdownRef.current.contains(event.target)) {
        setShopDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ---------- SYNC FILTERS FROM URL ----------
  // When URL changes (e.g., back button, direct link), update filter state to match
  // This makes filters bookmarkable and shareable
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchQuery(params.get('search') || '');
    setSelectedCategory(params.get('category') || '');
    setSortBy(params.get('sort') || '');
    setSaleOnly(params.get('sale') === 'true');
  }, [location.search]);

  // Only show filters on pages where they're useful
  const isHomePage = location.pathname === '/' || location.pathname === '/products';

  // ---------- DEBOUNCED SEARCH ----------
  // Wait 500ms after user stops typing before searching
  // Prevents API calls on every keystroke
  useEffect(() => {
    // Don't trigger on initial mount or when syncing from URL
    const urlParams = new URLSearchParams(location.search);
    const urlSearchValue = urlParams.get('search') || '';
    
    if (searchQuery === urlSearchValue) return;
    
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim()) {
        // When searching, clear category filter to avoid conflicts
        setSelectedCategory('');
        const params = new URLSearchParams();
        params.set('search', searchQuery.trim());
        if (sortBy) params.set('sort', sortBy);
        if (saleOnly) params.set('sale', 'true');
        navigate(`/?${params.toString()}`);
      } else if (urlSearchValue) {
        // If search was cleared, remove from URL
        const params = new URLSearchParams(location.search);
        params.delete('search');
        navigate(`/?${params.toString()}`);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, location.search, sortBy, saleOnly, navigate]);

  // Form submit handler (Enter key) - actual search happens via useEffect above
  const handleSearch = (e) => {
    e.preventDefault();
  };

  // ---------- FILTER HANDLERS ----------
  
  // Category selection - updates URL and clears search
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    setShopDropdownOpen(false);
    setSearchQuery('');  // Clear search when selecting category
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (sortBy) params.set('sort', sortBy);
    if (saleOnly) params.set('sale', 'true');
    navigate(`/?${params.toString()}`);
  };

  // Sort change - updates URL, preserves other filters
  const handleSortChange = (e) => {
    const newSort = e.target.value;
    setSortBy(newSort);
    const params = new URLSearchParams(location.search);
    if (newSort) params.set('sort', newSort);
    else params.delete('sort');
    navigate(`/?${params.toString()}`);
  };

  // Sale toggle - updates URL, preserves other filters
  const handleSaleToggle = () => {
    const newSaleOnly = !saleOnly;
    setSaleOnly(newSaleOnly);
    const params = new URLSearchParams(location.search);
    if (newSaleOnly) params.set('sale', 'true');
    else params.delete('sale');
    navigate(`/?${params.toString()}`);
  };

  // Clear all filters - resets to clean home page
  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSortBy('');
    setSaleOnly(false);
    navigate('/');
  };

  return (
    <header className="bg-primary text-white sticky top-0 z-50">
      
      {/* ================================================================== */}
      {/* TOP ROW - LOGO                                                     */}
      {/* ================================================================== */}
      <div className="container-custom py-6">
        <div className="flex justify-center">
          <Link to="/" className="text-center">
            {/* Brand name with decorative font */}
            <h1 
              className="text-3xl md:text-4xl tracking-[0.3em] text-white"
              style={{ fontFamily: "'Cinzel Decorative', cursive" }}
            >
              GREENSHOES
            </h1>
            {/* Tagline */}
            <p 
              className="text-xs tracking-[0.4em] text-gray-300 mt-1"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              SCULPTED BY THE SEA
            </p>
          </Link>
        </div>
      </div>

      {/* ================================================================== */}
      {/* MIDDLE ROW - NAVIGATION                                            */}
      {/* ================================================================== */}
      <nav className="border-t border-gray-700">
        <div className="container-custom">
          
          {/* ---------- DESKTOP NAVIGATION ---------- */}
          <div className="hidden md:flex items-center justify-center gap-8 py-4">
            
            {/* Home link with active state indicator */}
            <Link 
              to="/" 
              className={`text-sm tracking-wider hover:text-accent transition-colors ${
                location.pathname === '/' ? 'text-accent border-b-2 border-accent pb-1' : ''
              }`}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              HOME
            </Link>
            
            {/* Shop Now - Dropdown with categories */}
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
              
              {/* Dropdown menu - positioned below button */}
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

            {/* About link */}
            <Link 
              to="/about" 
              className={`text-sm tracking-wider hover:text-accent transition-colors ${
                location.pathname === '/about' ? 'text-accent border-b-2 border-accent pb-1' : ''
              }`}
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              ABOUT
            </Link>
            
            {/* Cart button - opens drawer, shows item count badge */}
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
            
            {/* Wishlist button - opens drawer, shows item count badge */}
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
            
            {/* Account button - opens drawer, text changes based on auth */}
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

          {/* ---------- MOBILE NAVIGATION TOGGLE ---------- */}
          <div className="md:hidden flex items-center justify-between py-3">
            {/* Hamburger / close button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            
            {/* Icon buttons for cart, wishlist, account */}
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

          {/* ---------- MOBILE MENU (EXPANDED) ---------- */}
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
                
                {/* Category links */}
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

      {/* ================================================================== */}
      {/* BOTTOM ROW - SEARCH & FILTERS (only on home/products page)         */}
      {/* ================================================================== */}
      {isHomePage && (
        <div className="border-t border-gray-700 bg-primary">
          <div className="container-custom py-4">
            <div className="flex flex-col md:flex-row items-center gap-4">
              
              {/* Search bar - centered on desktop */}
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

              {/* Left filters - category dropdown */}
              <div className="flex items-center gap-3 order-2 md:order-1">
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

              {/* Right filters - sort, sale toggle, clear */}
              <div className="flex items-center gap-3 order-3">
                {/* Sort dropdown */}
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

                {/* Sale only checkbox */}
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

                {/* Clear filters button - only shows when filters are active */}
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

      {/* ================================================================== */}
      {/* DRAWERS - Cart, Wishlist, Account                                  */}
      {/* ================================================================== */}
      
      {/* Cart drawer */}
      <Drawer
        isOpen={cartDrawerOpen}
        onClose={() => setCartDrawerOpen(false)}
        title="Shopping Cart"
      >
        <CartDrawer onClose={() => setCartDrawerOpen(false)} />
      </Drawer>

      {/* Wishlist drawer */}
      <Drawer
        isOpen={wishlistDrawerOpen}
        onClose={() => setWishlistDrawerOpen(false)}
        title="My Wishlist"
      >
        <WishlistDrawer onClose={() => setWishlistDrawerOpen(false)} />
      </Drawer>

      {/* Account drawer - shows login/register if not authenticated */}
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

// ----------------------------------------------------------------------------
// URL-BASED FILTER STATE
// ----------------------------------------------------------------------------
// All filters are stored in URL query params:
// - /?category=sneakers
// - /?search=ocean
// - /?sort=price_asc
// - /?sale=true
// - /?category=sandals&sort=newest&sale=true
//
// Benefits:
// - Filters persist on refresh
// - Users can bookmark or share filtered views
// - Back button works as expected
// - SEO friendly (if server-rendered)
//
// The HomePage component reads these params and passes them to the API
// ----------------------------------------------------------------------------