import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package } from 'lucide-react';
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

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await orderAPI.getAll();
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <Loading fullScreen />;
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package size={64} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-serif text-gray-900 mb-2">No orders yet</h2>
          <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
          <Link to="/">
            <Button variant="accent">Start Shopping</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom max-w-4xl">
        <h1 className="text-3xl font-serif text-gray-900 mb-8">Order History</h1>

        <div className="space-y-4">
          {orders.map((order) => {
            // Handle different field name possibilities
            const orderId = order.id || order.order_id;
            const orderNumber = order.order_number;
            const total = order.total_amount || order.total;
            const orderDate = order.created_at || order.order_date;
            const itemCount = order.items_count || order.item_count || order.items?.length || 0;
            const estimatedDelivery = order.estimated_delivery;
            const status = order.status;
            
            // Get first item image for preview
            const firstItem = order.items?.[0];
            const previewImage = firstItem?.image_url;

            return (
              <Link
                key={orderId}
                to={`/orders/${orderId}`}
                className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex gap-4">
                  {/* Order Image Preview */}
                  {previewImage && (
                    <div className="flex-shrink-0">
                      <img
                        src={getImageUrl(previewImage)}
                        alt="Order preview"
                        className="w-20 h-20 object-cover rounded"
                        onError={(e) => {
                          e.target.src = 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=800';
                        }}
                      />
                    </div>
                  )}

                  {/* Order Details */}
                  <div className="flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold text-lg">{orderNumber}</p>
                        <p className="text-sm text-gray-600">
                          Placed on {orderDate ? new Date(orderDate).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          }) : 'N/A'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg">{formatCurrency(total)}</p>
                        <span
                          className={`inline-block text-xs px-2 py-1 rounded mt-1 ${
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

                    <div className="border-t pt-3 mt-3">
                      <p className="text-sm text-gray-600">
                        {itemCount} {parseInt(itemCount) === 1 ? 'item' : 'items'}
                      </p>
                      {estimatedDelivery && (
                        <p className="text-sm text-gray-600">
                          Est. Delivery: {new Date(estimatedDelivery).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderHistory;