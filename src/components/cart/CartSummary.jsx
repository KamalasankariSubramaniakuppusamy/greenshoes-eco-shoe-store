import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../utils/constants';
import Button from '../common/Button';

const CartSummary = ({ summary }) => {
  const navigate = useNavigate();

  if (!summary) return null;

  const subtotal = parseFloat(summary.subtotal);
  const tax = parseFloat(summary.tax);
  const shipping = parseFloat(summary.shipping);
  const total = parseFloat(summary.total);

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h2 className="text-lg font-serif mb-4">Order Summary</h2>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Subtotal</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Tax (6%)</span>
          <span className="font-medium">{formatCurrency(tax)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Shipping</span>
          <span className="font-medium">{formatCurrency(shipping)}</span>
        </div>

        <div className="border-t pt-3">
          <div className="flex justify-between">
            <span className="font-semibold">Total</span>
            <span className="font-bold text-lg">{formatCurrency(total)}</span>
          </div>
        </div>
      </div>

      <Button
        variant="accent"
        fullWidth
        onClick={() => navigate('/checkout')}
        className="mt-6"
      >
        Proceed to Checkout
      </Button>

      <p className="text-xs text-gray-500 text-center mt-4">
        * No returns or refunds on all purchases
      </p>
    </div>
  );
};

export default CartSummary;