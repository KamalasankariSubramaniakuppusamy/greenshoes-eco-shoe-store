// Developer: Kamalasankari Subramaniakuppusamy
// This file may contain lots of comments and sometimes even commented out code snippets so that I can keep track of the changes made over time for future reference.
// Admin view for all orders placed on the platform - both guest and registered users
// This is read-only for now - admins can view order details but not modify them
//
// REQUIREMENTS SATISFIED:
// - "Each order shall be assigned a unique confirmation ID for identification and tracking purposes"
// - "The software shall display the order ID, shoe color, size, billing address, shipping address, and total amount paid"
// - "Single admin interface for product, inventory, and impact management" - Orders are part of that single interface

import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Calendar, Download } from 'lucide-react';
import { formatCurrency } from '../utils/constants';
import Button from '../components/common/Button';
import Loading from '../components/common/Loading';
import { useCart } from '../context/CartContext';
import { orderAPI } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE}${imagePath}`;
};

// Generate and download invoice as PDF
const downloadInvoice = (orderData, orderNum) => {
  const {
    items = [],
    shipping_address,
    price_breakdown,
    estimated_delivery,
    order_date,
    created_at,
    shipping_full_name,
    shipping_phone,
    shipping_address1,
    shipping_address2,
    shipping_city,
    shipping_state,
    shipping_postal_code,
    subtotal,
    tax,
    shipping_fee,
    shipping,
    total_amount,
    total
  } = orderData || {};

  // Extract values handling nested structures
  const shippingAddr = shipping_address || {};
  const name = shippingAddr.full_name || shipping_full_name || 'Customer';
  const phone = shippingAddr.phone || shipping_phone || '';
  const addr1 = shippingAddr.address1 || shipping_address1 || '';
  const addr2 = shippingAddr.address2 || shipping_address2 || '';
  const city = shippingAddr.city || shipping_city || '';
  const state = shippingAddr.state || shipping_state || '';
  const postal = shippingAddr.postal_code || shipping_postal_code || '';

  const priceInfo = price_breakdown || {};
  const subTotal = priceInfo.subtotal || subtotal || '0';
  const taxAmount = priceInfo.tax || tax || '0';
  const shippingAmount = priceInfo.shipping_fee || shipping_fee || shipping || '0';
  const totalAmount = priceInfo.total || total_amount || total || '0';

  // FIX: Include time in the order date formatting
  const orderDateSource = order_date || created_at;
  const formattedOrderDate = orderDateSource ? new Date(orderDateSource).toLocaleString('en-US', {
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  }) : new Date().toLocaleString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  const deliveryDate = estimated_delivery ? new Date(estimated_delivery).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  }) : 'TBD';

  // Build items HTML
  const itemsHtml = items.map((item, i) => `
    <tr style="border-bottom: 1px solid #e5e7eb;">
      <td style="padding: 12px 8px;">${i + 1}</td>
      <td style="padding: 12px 8px;">${item.name || 'Product'}</td>
      <td style="padding: 12px 8px; text-transform: capitalize;">${item.color || '-'} / ${item.size || '-'}</td>
      <td style="padding: 12px 8px; text-align: center;">${item.quantity || 1}</td>
      <td style="padding: 12px 8px; text-align: right;">$${parseFloat(item.price || item.price_at_purchase || 0).toFixed(2)}</td>
      <td style="padding: 12px 8px; text-align: right;">$${(parseFloat(item.price || item.price_at_purchase || 0) * (item.quantity || 1)).toFixed(2)}</td>
    </tr>
  `).join('');

  const invoiceHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice - ${orderNum}</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #333; line-height: 1.6; }
        .invoice { max-width: 800px; margin: 0 auto; padding: 40px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; border-bottom: 3px solid #d4a853; padding-bottom: 20px; }
        .logo { font-size: 28px; font-weight: bold; color: #1a1a1a; letter-spacing: 2px; }
        .logo-sub { font-size: 10px; color: #666; letter-spacing: 3px; margin-top: 4px; }
        .invoice-title { text-align: right; }
        .invoice-title h1 { font-size: 32px; color: #d4a853; margin-bottom: 8px; }
        .invoice-title p { color: #666; font-size: 14px; }
        .info-section { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .info-box { flex: 1; }
        .info-box h3 { font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 8px; letter-spacing: 1px; }
        .info-box p { font-size: 14px; margin-bottom: 4px; }
        .items-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .items-table th { background: #1a1a1a; color: white; padding: 12px 8px; text-align: left; font-size: 12px; text-transform: uppercase; letter-spacing: 1px; }
        .items-table th:nth-child(4), .items-table th:nth-child(5), .items-table th:nth-child(6) { text-align: right; }
        .items-table th:nth-child(4) { text-align: center; }
        .summary { margin-left: auto; width: 280px; }
        .summary-row { display: flex; justify-content: space-between; padding: 8px 0; font-size: 14px; }
        .summary-row.total { border-top: 2px solid #1a1a1a; margin-top: 8px; padding-top: 12px; font-size: 18px; font-weight: bold; }
        .summary-row.total span:last-child { color: #d4a853; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #666; font-size: 12px; }
        .thank-you { background: #f9fafb; padding: 20px; text-align: center; margin-top: 30px; border-radius: 8px; }
        .thank-you h3 { color: #1a1a1a; margin-bottom: 8px; }
        .thank-you p { color: #666; font-size: 14px; }
        @media print { .invoice { padding: 20px; } }
      </style>
    </head>
    <body>
      <div class="invoice">
        <div class="header">
          <div>
            <div class="logo">GREENSHOES</div>
            <div class="logo-sub">SCULPTED BY THE SEA</div>
          </div>
          <div class="invoice-title">
            <h1>INVOICE</h1>
            <p><strong>Order:</strong> ${orderNum}</p>
            <p><strong>Date:</strong> ${formattedOrderDate}</p>
          </div>
        </div>

        <div class="info-section">
          <div class="info-box">
            <h3>Ship To</h3>
            <p><strong>${name}</strong></p>
            ${phone ? `<p>${phone}</p>` : ''}
            <p>${addr1}</p>
            ${addr2 ? `<p>${addr2}</p>` : ''}
            <p>${city}, ${state} ${postal}</p>
          </div>
          <div class="info-box" style="text-align: right;">
            <h3>Delivery</h3>
            <p><strong>Estimated:</strong> ${deliveryDate}</p>
            <p style="margin-top: 16px;"><strong>Status:</strong> Processing</p>
          </div>
        </div>

        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 40px;">#</th>
              <th>Product</th>
              <th>Variant</th>
              <th style="width: 60px; text-align: center;">Qty</th>
              <th style="width: 100px; text-align: right;">Price</th>
              <th style="width: 100px; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div class="summary">
          <div class="summary-row">
            <span>Subtotal</span>
            <span>$${parseFloat(subTotal).toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Tax (6%)</span>
            <span>$${parseFloat(taxAmount).toFixed(2)}</span>
          </div>
          <div class="summary-row">
            <span>Shipping</span>
            <span>$${parseFloat(shippingAmount).toFixed(2)}</span>
          </div>
          <div class="summary-row total">
            <span>Total</span>
            <span>$${parseFloat(totalAmount).toFixed(2)}</span>
          </div>
        </div>

        <div class="thank-you">
          <h3>Thank You for Your Purchase!</h3>
          <p>Your support helps us continue our mission to create sustainable, ocean-friendly footwear.</p>
        </div>

        <div class="footer">
          <p>GREENSHOES | Luxury footwear inspired by nature's artistry</p>
          <p style="margin-top: 8px;">Questions? Contact us at support@greenshoes.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  // Create blob and download
  const blob = new Blob([invoiceHtml], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  
  // Open in new window for printing/saving as PDF
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.onload = () => {
      printWindow.print();
    };
  }
  
  // Cleanup
  setTimeout(() => URL.revokeObjectURL(url), 1000);
};

const OrderSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { clearCart, fetchCart } = useCart();
  const [order, setOrder] = useState(location.state?.order || null);
  const [orderNumber, setOrderNumber] = useState(location.state?.orderNumber || location.state?.order?.order_number || null);
  const [loading, setLoading] = useState(false);
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Check if this is a guest order (no token)
    const token = localStorage.getItem('greenshoes_token');
    setIsGuest(!token);
    
    // If no order in state and user is authenticated, try to fetch the most recent order
    const fetchLatestOrder = async () => {
      if (!location.state?.order && token) {
        setLoading(true);
        try {
          const response = await orderAPI.getAll();
          const orders = response.data.orders || [];
          if (orders.length > 0) {
            // Get the most recent order
            const latestOrder = orders[0];
            // Fetch full details
            const detailsResponse = await orderAPI.getById(latestOrder.id);
            setOrder(detailsResponse.data.order);
            setOrderNumber(detailsResponse.data.order?.order_number);
          }
        } catch (error) {
          console.error('Error fetching order:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchLatestOrder();
  }, [location.state]);

  useEffect(() => {
    // Clear the cart after successful order
    if (order || orderNumber) {
      clearCart();
      fetchCart(); // Refresh cart to get empty state from server
    }
  }, [order, orderNumber]);

  if (loading) {
    return <Loading fullScreen />;
  }

  // For guest orders or when order data is minimal, show simplified confirmation
  if (!order && orderNumber) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12">
        <div className="text-center max-w-md mx-auto px-4">
          <CheckCircle size={80} className="mx-auto text-green-500 mb-6" />
          <h1 className="text-3xl font-serif text-gray-900 mb-4">Order Confirmed!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
          <div className="bg-gray-100 rounded-lg p-6 mb-6">
            <p className="text-sm text-gray-600 mb-1">Order Number</p>
            <p className="text-2xl font-bold text-accent">{orderNumber}</p>
          </div>
          <p className="text-sm text-gray-500 mb-6">
            Please save your order number for reference. As a guest, you won't be able to track this order online.
          </p>
          <div className="space-y-3">
            <button 
              onClick={() => downloadInvoice(location.state?.order, orderNumber)}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-800 text-gray-800 rounded hover:bg-gray-100 transition-colors font-medium"
            >
              <Download size={18} />
              Download Invoice
            </button>
            <Link to="/">
              <Button variant="accent" fullWidth>Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If no order data at all, show generic thank you
  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle size={64} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-serif text-gray-900 mb-4">Thank you for your order!</h2>
          <p className="text-gray-600 mb-6">Your order has been placed successfully.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/orders">
              <Button variant="outline">View Order History</Button>
            </Link>
            <Link to="/">
              <Button variant="accent">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Extract order details
  const displayOrderNumber = order.order_number || orderNumber;
  const orderId = order.order_id || order.id;
  const orderDate = order.order_date || order.created_at;
  const estimatedDelivery = order.estimated_delivery;
  const estimatedDeliveryMessage = order.estimated_delivery_message;
  const items = order.items || [];
  
  // Price breakdown
  const priceBreakdown = order.price_breakdown || {};
  const subtotal = priceBreakdown.subtotal || order.subtotal;
  const tax = priceBreakdown.tax || order.tax;
  const shipping = priceBreakdown.shipping_fee || order.shipping_fee || order.shipping;
  const total = priceBreakdown.total || order.total_amount || order.total;
  
  // Shipping address
  const shippingAddr = order.shipping_address || {};
  const shippingName = shippingAddr.full_name || order.shipping_full_name;
  const shippingPhone = shippingAddr.phone || order.shipping_phone;
  const shippingAddress1 = shippingAddr.address1 || order.shipping_address1;
  const shippingAddress2 = shippingAddr.address2 || order.shipping_address2;
  const shippingCity = shippingAddr.city || order.shipping_city;
  const shippingState = shippingAddr.state || order.shipping_state;
  const shippingPostalCode = shippingAddr.postal_code || order.shipping_postal_code;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-3xl">
        {/* Success Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6 text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle size={64} className="text-green-500" />
          </div>
          <h1 className="text-3xl font-serif text-gray-900 mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 mb-4">
            Thank you for your purchase. Your order has been successfully placed.
          </p>
          <div className="bg-gray-50 rounded-lg p-4 inline-block">
            <p className="text-sm text-gray-600">Order Number</p>
            <p className="text-xl font-bold text-accent">{displayOrderNumber}</p>
          </div>
        </div>

        {/* Delivery Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Truck className="text-accent" size={24} />
            <h2 className="text-xl font-serif">Delivery Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Estimated Delivery */}
            <div className="flex items-start gap-3">
              <Calendar className="text-gray-400 mt-1" size={20} />
              <div>
                <p className="font-medium">Estimated Delivery</p>
                {estimatedDelivery && (
                  <p className="text-gray-600">
                    {new Date(estimatedDelivery).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
                {estimatedDeliveryMessage && (
                  <p className="text-sm text-gray-500">{estimatedDeliveryMessage}</p>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            <div>
              <p className="font-medium mb-1">Shipping To</p>
              <div className="text-gray-600 text-sm">
                <p>{shippingName}</p>
                {shippingPhone && <p>{shippingPhone}</p>}
                <p>{shippingAddress1}</p>
                {shippingAddress2 && <p>{shippingAddress2}</p>}
                <p>{shippingCity}, {shippingState} {shippingPostalCode}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="text-accent" size={24} />
            <h2 className="text-xl font-serif">Order Items ({items.length})</h2>
          </div>
          
          <div className="space-y-4">
            {items.map((item, index) => {
              const itemImage = item.image_url || item.main_image;
              const itemPrice = item.price || item.price_at_purchase;
              const itemSubtotal = item.subtotal || (parseFloat(itemPrice) * item.quantity);
              
              return (
                <div key={index} className="flex gap-4 pb-4 border-b last:border-b-0 last:pb-0">
                  <img
                    src={getImageUrl(itemImage)}
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded"
                    onError={(e) => {
                      e.target.src = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800';
                    }}
                  />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {item.color} / Size {item.size}
                    </p>
                    <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(itemSubtotal)}</p>
                    <p className="text-sm text-gray-500">
                      {formatCurrency(itemPrice)} each
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Summary */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h2 className="text-xl font-serif mb-4">Payment Summary</h2>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (6%)</span>
              <span>{formatCurrency(tax)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Shipping</span>
              <span>{formatCurrency(shipping)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
              <span>Total Paid</span>
              <span className="text-accent">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4">
          <button 
            onClick={() => downloadInvoice(order, displayOrderNumber)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-800 text-gray-800 rounded hover:bg-gray-100 transition-colors font-medium"
          >
            <Download size={18} />
            Download Invoice
          </button>
          <Link to={`/orders/${orderId}`} className="flex-1">
            <Button variant="outline" fullWidth>
              View Order Details
            </Button>
          </Link>
          <Link to="/" className="flex-1">
            <Button variant="accent" fullWidth>
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Email Notice */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
          <p className="text-sm text-blue-800">
            A confirmation email has been sent to your registered email address.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccess;