import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const categories = [
    { name: 'Sneakers', path: '/?category=sneakers' },
    { name: 'Sandals', path: '/?category=sandals' },
    { name: 'Boots', path: '/?category=boots' },
    { name: 'Pumps', path: '/?category=pumps' },
    { name: 'Heels', path: '/?category=heels' },
  ];

  const customerCare = [
    { name: 'About Us', path: '/about' },
    { name: 'Shipping Info', path: '/about' },
    { name: 'No Returns/Refunds', path: '/about' },
  ];

  return (
    <footer className="bg-primary text-white">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <h3 
              className="text-2xl mb-4"
              style={{ fontFamily: "'Cinzel Decorative', cursive" }}
            >
              GREENSHOES
            </h3>
            <p 
              className="text-gray-400 mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Sculpted by the Sea
            </p>
            <p 
              className="text-gray-400 text-sm"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Luxury footwear inspired by nature's artistry.
            </p>
          </div>

          {/* Shop - Categories */}
          <div>
            <h4 
              className="text-lg font-medium mb-4 tracking-wider"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              SHOP
            </h4>
            <ul className="space-y-2">
              {categories.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-gray-400 hover:text-accent transition-colors text-sm"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 
              className="text-lg font-medium mb-4 tracking-wider"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              CUSTOMER CARE
            </h4>
            <ul className="space-y-2">
              {customerCare.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.path}
                    className="text-gray-400 hover:text-accent transition-colors text-sm"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t border-gray-800">
        <div className="container-custom py-6">
          <p 
            className="text-center text-gray-500 text-sm"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            © {new Date().getFullYear()} GreenShoes. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;