import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import ProductGrid from '../components/product/ProductGrid';
import { productAPI } from '../services/api';
import { formatCurrency } from '../utils/constants';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

// Handle image URL
const getImageUrl = (imagePath) => {
  if (!imagePath) {
    return 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800';
  }
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  return `${API_BASE}${imagePath}`;
};

const Home = () => {
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [saleProducts, setSaleProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Parse sort parameter into sortBy and sortOrder
  const parseSortParam = (sortParam) => {
    switch (sortParam) {
      case 'name_asc':
        return { sortBy: 'name', sortOrder: 'asc' };
      case 'name_desc':
        return { sortBy: 'name', sortOrder: 'desc' };
      case 'price_asc':
        return { sortBy: 'price', sortOrder: 'asc' };
      case 'price_desc':
        return { sortBy: 'price', sortOrder: 'desc' };
      case 'newest':
        return { sortBy: 'created_at', sortOrder: 'desc' };
      default:
        return { sortBy: 'name', sortOrder: 'asc' };
    }
  };

  // Fetch products whenever URL params change
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        // Read filters from URL
        const category = searchParams.get('category') || '';
        const search = searchParams.get('search') || '';
        const sort = searchParams.get('sort') || '';
        const saleOnly = searchParams.get('sale') === 'true';
        
        const { sortBy, sortOrder } = parseSortParam(sort);
        
        const params = {};
        if (category) params.category = category;
        if (search) params.search = search;
        if (sortBy) params.sortBy = sortBy;
        if (sortOrder) params.sortOrder = sortOrder;
        if (saleOnly) params.onSale = true;

        const response = await productAPI.getAll(params);
        setProducts(response.data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [searchParams]); // Re-fetch when URL params change

  useEffect(() => {
    const fetchSaleProducts = async () => {
      try {
        const response = await productAPI.getAll({ onSale: true });
        setSaleProducts(response.data.products || []);
      } catch (error) {
        console.error('Error fetching sale products:', error);
        setSaleProducts([]);
      }
    };
    
    fetchSaleProducts();
  }, []);

  // Auto-slide every 5 seconds
  useEffect(() => {
    if (saleProducts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % saleProducts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [saleProducts.length]);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % saleProducts.length);
  }, [saleProducts.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + saleProducts.length) % saleProducts.length);
  }, [saleProducts.length]);

  // Get active filter description
  const getFilterDescription = () => {
    const parts = [];
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const saleOnly = searchParams.get('sale') === 'true';
    
    if (category) parts.push(category.charAt(0).toUpperCase() + category.slice(1));
    if (search) parts.push(`"${search}"`);
    if (saleOnly) parts.push('On Sale');
    
    return parts.length > 0 ? parts.join(' • ') : 'All Products';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section - Sale Products Slider */}
      {saleProducts.length > 0 ? (
        <div className="relative h-[600px] md:h-[700px] bg-gray-100 overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {saleProducts.map((product) => (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="min-w-full h-full flex flex-col md:flex-row"
              >
                {/* Product Image */}
                <div className="w-full md:w-2/3 h-[60%] md:h-full relative bg-gray-200">
                  <img
                    src={getImageUrl(product.main_image)}
                    alt={product.name}
                    className="w-full h-full object-contain object-center"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800';
                    }}
                  />
                  <div className="absolute top-6 left-6 bg-red-600 text-white px-4 py-2 text-sm font-bold uppercase">
                    Sale
                  </div>
                </div>

                {/* Product Info */}
                <div className="w-full md:w-1/3 h-[40%] md:h-full bg-white flex flex-col justify-center p-8 md:p-12">
                  <p className="text-sm text-gray-500 uppercase tracking-widest mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {product.category}
                  </p>
                  <h2 className="text-3xl md:text-4xl font-serif mb-4" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {product.name}
                  </h2>
                  <p className="text-gray-600 mb-6 line-clamp-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                    {product.description}
                  </p>
                  
                  <div className="flex items-center gap-4 mb-6 flex-wrap">
                    <span className="text-3xl font-bold text-accent">
                      {formatCurrency(product.sale_price)}
                    </span>
                    <span className="text-xl text-gray-400 line-through">
                      {formatCurrency(product.selling_price)}
                    </span>
                    <span className="bg-red-100 text-red-600 px-2 py-1 text-sm font-medium rounded">
                      {product.discount_percentage || Math.round((1 - product.sale_price / product.selling_price) * 100)}% OFF
                    </span>
                  </div>

                  <span 
                    className="inline-block bg-primary text-white px-8 py-3 font-medium hover:bg-gray-800 transition-colors text-center"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    SHOP NOW
                  </span>
                </div>
              </Link>
            ))}
          </div>

          {/* Navigation Arrows */}
          {saleProducts.length > 1 && (
            <>
              <button
                onClick={(e) => { e.preventDefault(); prevSlide(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-3 shadow-lg z-10"
              >
                <ChevronLeft size={24} />
              </button>
              <button
                onClick={(e) => { e.preventDefault(); nextSlide(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-full p-3 shadow-lg z-10"
              >
                <ChevronRight size={24} />
              </button>
            </>
          )}

          {/* Dots */}
          {saleProducts.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
              {saleProducts.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => { e.preventDefault(); setCurrentSlide(index); }}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSlide ? 'bg-accent w-8' : 'bg-gray-400'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="h-[400px] bg-primary flex items-center justify-center">
          <div className="text-center text-white">
            <h1 
              className="text-4xl md:text-5xl mb-4"
              style={{ fontFamily: "'Cinzel Decorative', cursive" }}
            >
              GREENSHOES
            </h1>
            <p 
              className="text-lg text-gray-300"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Sculpted by the Sea
            </p>
          </div>
        </div>
      )}

      {/* Products Catalog */}
      <div className="container-custom py-12">
        <h2 
          className="text-3xl text-center mb-2"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          Our Collection
        </h2>
        
        {/* Active Filter Description */}
        <p 
          className="text-center text-gray-500 mb-8"
          style={{ fontFamily: "'Playfair Display', serif" }}
        >
          {getFilterDescription()}
        </p>

        <div className="mb-6">
          <p 
            className="text-gray-600"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {loading ? 'Loading...' : `${products.length} products found`}
          </p>
        </div>
        
        <ProductGrid products={products} loading={loading} />
      </div>
    </div>
  );
};

export default Home;