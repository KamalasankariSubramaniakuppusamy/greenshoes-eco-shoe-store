import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderAPI } from '../services/api';
import { formatCurrency } from '../utils/constants';
import Loading from '../components/common/Loading';
import Button from '../components/common/Button';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:4000';

const getImageUrl = (imagePath) => {
  if (!imagePath) return 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800';
  if (imagePath.startsWith('http')) return imagePath;
  return `${API_BASE}${imagePath}`;
};

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reordering, setReordering] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getById(id);
      // Handle both response.data.order and response.data directly
      setOrder(response.data.order || response.data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReorder = async () => {
    try {
      setReordering(true);
      await orderAPI.reorder(id);
      alert('Items added to cart!');
      navigate('/cart');
    } catch (error) {
      alert(error.response?.data?.error || 'Failed to reorder');
    } finally {
      setReordering(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <Button onClick={() => navigate('/orders')}>Back to Orders</Button>
        </div>
      </div>
    );
  }

  // Map field names (handle both flat and nested structures)
  const orderNumber = order.order_number;
  const orderDate = order.order_date || order.created_at;
  const status = order.status;
  const estimatedDelivery = order.estimated_delivery;
  const items = order.items || [];
  
  // Price breakdown - handle nested structure
  const priceBreakdown = order.price_breakdown || {};
  const subtotal = priceBreakdown.subtotal || order.subtotal;
  const tax = priceBreakdown.tax || order.tax;
  const shipping = priceBreakdown.shipping_fee || order.shipping_fee || order.shipping;
  const total = priceBreakdown.total || order.total_amount || order.total;
  
  // Shipping address - handle nested structure
  const shippingAddr = order.shipping_address || {};
  const shippingName = shippingAddr.full_name || order.shipping_full_name || order.shipping_name;
  const shippingPhone = shippingAddr.phone || order.shipping_phone;
  const shippingAddress1 = shippingAddr.address1 || order.shipping_address1;
  const shippingAddress2 = shippingAddr.address2 || order.shipping_address2;
  const shippingCity = shippingAddr.city || order.shipping_city;
  const shippingState = shippingAddr.state || order.shipping_state;
  const shippingPostalCode = shippingAddr.postal_code || order.shipping_postal_code || order.shipping_zip;
  
  // Payment info - handle nested structure
  const payment = order.payment || {};
  const paymentMethod = payment.payment_method || order.payment_method;
  const cardLastFour = payment.card_last_four || order.card_last_four;
  const cardType = payment.card_type || order.card_type;
  const transactionId = payment.transaction_id;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-4xl">
        <div className="mb-6">
          <Button variant="outline" onClick={() => navigate('/orders')}>
            ← Back to Orders
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-8">
          {/* Order Header */}
          <div className="border-b pb-6 mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-serif mb-2">{orderNumber}</h1>
                <p className="text-gray-600">
                  Placed on {orderDate ? new Date(orderDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  }) : 'N/A'}
                </p>
              </div>
              <span
                className={`px-4 py-2 rounded text-sm font-medium ${
                  status === 'DELIVERED'
                    ? 'bg-green-100 text-green-800'
                    : status === 'SHIPPED'
                    ? 'bg-blue-100 text-blue-800'
                    : status === 'CANCELLED'
                    ? 'bg-red-100 text-red-800'
                    : 'bg-yellow-100 text-yellow-800'
                }`}
              >
                {status}
              </span>
            </div>
          </div>

          {/* Estimated Delivery */}
          {estimatedDelivery && status !== 'DELIVERED' && status !== 'CANCELLED' && (
            <div className="mb-6 p-4 bg-blue-50 rounded">
              <p className="text-blue-800">
                <strong>Estimated Delivery:</strong>{' '}
                {new Date(estimatedDelivery).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </p>
            </div>
          )}

          {/* Order Items */}
          <div className="mb-6">
            <h2 className="text-xl font-serif mb-4">Order Items ({items.length})</h2>
            <div className="space-y-4">
              {items.map((item, index) => {
                const itemImage = item.image_url || item.main_image;
                const itemPrice = item.price || item.price_at_purchase;
                
                return (
                  <div key={item.order_item_id || index} className="flex gap-4 border-b pb-4 last:border-b-0">
                    <img
                      src={getImageUrl(itemImage)}
                      alt={item.name}
                      className="w-24 h-24 object-cover rounded"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800';
                      }}
                    />
                    <div className="flex-1">
                      <p className="font-medium text-lg">{item.name}</p>
                      <p className="text-sm text-gray-600 capitalize">
                        Color: {item.color} | Size: {item.size}
                      </p>
                      <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(itemPrice)}</p>
                      {item.quantity > 1 && (
                        <p className="text-sm text-gray-500">
                          {formatCurrency(parseFloat(itemPrice) * item.quantity)} total
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Two Column Layout for Address and Payment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Shipping Address */}
            <div>
              <h2 className="text-xl font-serif mb-4">Shipping Address</h2>
              <div className="bg-gray-50 p-4 rounded">
                {shippingName && <p className="font-medium">{shippingName}</p>}
                {shippingPhone && <p className="text-sm text-gray-600">{shippingPhone}</p>}
                {shippingAddress1 && <p className="text-sm text-gray-600">{shippingAddress1}</p>}
                {shippingAddress2 && <p className="text-sm text-gray-600">{shippingAddress2}</p>}
                <p className="text-sm text-gray-600">
                  {[shippingCity, shippingState, shippingPostalCode].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>

            {/* Payment Information */}
            <div>
              <h2 className="text-xl font-serif mb-4">Payment Method</h2>
              <div className="bg-gray-50 p-4 rounded">
                {cardLastFour ? (
                  <>
                    <p className="font-medium">{cardType || 'Card'} ending in {cardLastFour}</p>
                    <p className="text-sm text-gray-600 capitalize">{paymentMethod?.replace(/_/g, ' ').toLowerCase() || 'Credit Card'}</p>
                  </>
                ) : paymentMethod ? (
                  <p className="font-medium capitalize">{paymentMethod.replace(/_/g, ' ').toLowerCase()}</p>
                ) : (
                  <p className="text-gray-600">Card payment</p>
                )}
                {transactionId && (
                  <p className="text-xs text-gray-500 mt-2">Transaction: {transactionId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-serif mb-4">Order Summary</h2>
            <div className="space-y-2 max-w-sm ml-auto">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Tax (6%)</span>
                <span>{formatCurrency(tax)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Shipping</span>
                <span>{formatCurrency(shipping)}</span>
              </div>
              <div className="flex justify-between font-bold text-lg border-t pt-2 mt-2">
                <span>Total</span>
                <span>{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Reorder Button */}
          <div className="mt-8">
            <Button 
              variant="accent" 
              fullWidth 
              onClick={handleReorder}
              disabled={reordering}
            >
              {reordering ? 'Adding to Cart...' : 'Reorder Items'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;