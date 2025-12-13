// ============================================================================
// Cart Summary Component
// ============================================================================
// Order summary box shown on the cart page
// Displays price breakdown and checkout button
//
// REQUIREMENTS:
// - Tax 6% per product
// - Flat shipping $11.99
// - "No returns or refunds" policy notice

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/constants';
import Button from '../common/Button';

const CartSummary = ({ summary }) => {
  const navigate = useNavigate();

  // No summary data yet (cart still loading or empty)
  if (!summary) return null;

  // Parse values - API returns these as strings
  const subtotal = parseFloat(summary.subtotal);  // Sum of all line totals
  const tax = parseFloat(summary.tax);            // 6% of subtotal
  const shipping = parseFloat(summary.shipping);  // Flat $11.95
  const total = parseFloat(summary.total);        // subtotal + tax + shipping

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-lg font-serif mb-4">Order Summary</h2>

      {/* -------- PRICE BREAKDOWN -------- */}
      <div className="space-y-3">
        {/* Subtotal - sum of all items before tax/shipping */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>

        {/* Tax - 6% flat rate per requirements */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (6%)</span>
          <span className="font-medium">{formatCurrency(tax)}</span>
        </div>

        {/* Shipping - flat $11.95 per requirements */}
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">{formatCurrency(shipping)}</span>
        </div>

        {/* Total with divider line */}
        <div className="border-t pt-3">
          <div className="flex justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-lg">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      {/* -------- CHECKOUT BUTTON -------- */}
      <Button
        variant="accent"
        fullWidth
        onClick={() => navigate('/checkout')}
        className="mt-6"
      >
        Proceed to Checkout
      </Button>

      {/* -------- POLICY NOTICE -------- */}
      {/* Per requirements: no returns or refunds */}
      {/* Important to show this BEFORE checkout so customers know */}
      <p className="text-xs text-gray-500 text-center mt-4">
        * No returns or refunds on all purchases
      </p>
    </div>
  );
};

export default CartSummary;

// ----------------------------------------------------------------------------
// This component is "dumb" - it just displays data passed to it
// All the calculation happens on the backend (cartController.getCart)
// Frontend just shows what the API returns
//
// The summary object from API looks like:
// {
//   subtotal: "149.99",
//   tax: "9.00",
//   shipping: "11.95",
//   total: "170.94"
// }
// ----------------------------------------------------------------------------