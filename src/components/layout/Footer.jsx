// ============================================================================
// Footer - a mini site map with brand info and navigation links
// ============================================================================
// Site footer - appears at the bottom of every page
// Contains brand info, navigation links, and copyright

import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  // ---------- NAVIGATION DATA ----------
  // Category links - these apply filters to the home page catalog
  const categories = [
    { name: 'Sneakers', path: '/?category=sneakers' },
    { name: 'Sandals', path: '/?category=sandals' },
    { name: 'Boots', path: '/?category=boots' },
    { name: 'Pumps', path: '/?category=pumps' },
    { name: 'Heels', path: '/?category=heels' },
  ];

  // Customer care links - all point to about page for now
  // Could split these into separate pages later if content grows
  const customerCare = [
    { name: 'About Us', path: '/about' },
    { name: 'Shipping Info', path: '/about' },
    { name: 'No Returns/Refunds', path: '/about' },  // Per requirements: no returns policy
  ];

  return (
    <footer className="bg-primary text-white">
      {/* -------- MAIN FOOTER CONTENT -------- */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* -------- BRAND COLUMN -------- */}
          {/* Logo, tagline, and brief description */}
          <div>
            <h3 
              className="text-2xl mb-4"
              style={{ fontFamily: "'Cinzel Decorative', cursive" }}
            >
              GREENSHOES
            </h3>
            {/* Brand tagline */}
            <p 
              className="text-gray-400 mb-2"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Sculpted by the Sea
            </p>
            {/* Brief brand description - eco-friendly luxury positioning */}
            <p 
              className="text-gray-400 text-sm"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Luxury footwear inspired by nature's artistry.
            </p>
          </div>

          {/* -------- SHOP COLUMN -------- */}
          {/* Category quick links */}
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

          {/* -------- CUSTOMER CARE COLUMN -------- */}
          {/* Support and policy links */}
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

      {/* -------- COPYRIGHT BAR -------- */}
      {/* Separated by border, auto-updates year */}
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

// ----------------------------------------------------------------------------
// Design notes:
// - bg-primary gives the dark background matching the header
// - Three-column grid on desktop, stacks on mobile
// - Fonts match the luxury brand aesthetic (Cinzel Decorative for logo, Playfair Display for body)
// - hover:text-accent provides visual feedback on links
//
// Could add in the future:
// - Social media icons
// - Newsletter signup
// - Contact information
// - Additional policy pages (Privacy, Terms of Service)
// ----------------------------------------------------------------------------