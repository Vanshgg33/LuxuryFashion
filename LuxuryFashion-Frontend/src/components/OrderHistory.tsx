import React, { useState, useEffect } from 'react';
import { getOrderHistory } from '../api/OrderApi';
import type { Order } from '../api/OrderApi';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Package, Calendar, IndianRupee } from 'lucide-react';

const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Wait for auth to finish loading
    if (authLoading) {
      return;
    }

    // Redirect to login if not authenticated
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError('');
        const orderData = await getOrderHistory();
        console.log('Order history data:', orderData);
        // Ensure orderData is an array
        setOrders(Array.isArray(orderData) ? orderData : []);
      } catch (error: any) {
        console.error('Error fetching order history:', error);
        console.error('Error response:', error.response);
        const errorMessage = error.response?.data?.message || error.message || 'Failed to load order history';
        setError(errorMessage);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isAuthenticated, authLoading, navigate]);

  // Show loading while auth is being checked
  if (authLoading || loading) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">{authLoading ? 'Checking authentication...' : 'Loading orders...'}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto py-16 text-center">
          <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
          <h2 className="text-xl font-serif mb-4 text-red-600">Error Loading Orders</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setError('');
              setLoading(true);
              getOrderHistory()
                .then((orderData) => {
                  setOrders(Array.isArray(orderData) ? orderData : []);
                })
                .catch((error: any) => {
                  console.error('Error fetching order history:', error);
                  setError(error.response?.data?.message || error.message || 'Failed to load order history');
                })
                .finally(() => {
                  setLoading(false);
                });
            }}
            className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-4xl mx-auto py-6 sm:py-8">
        <h1 className="text-2xl sm:text-3xl font-serif mb-6 sm:mb-8">Order History</h1>

        {orders.length === 0 ? (
          <div className="text-center py-16">
            <Package className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-xl font-serif mb-4">No orders yet</h2>
            <p className="text-gray-600 mb-6">Start shopping to see your orders here</p>
            <button
              onClick={() => navigate('/shop')}
              className="bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => {
              const orderId = order.orderId || (order as any).id || 'N/A';
              const orderDate = order.orderDate || (order as any).order_date || new Date().toISOString();
              const totalAmount = order.totalAmount || (order as any).total_amount || 0;
              const status = order.status || (order as any).order_status || 'UNKNOWN';
              
              return (
                <div key={orderId} className="bg-white border rounded-lg p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold">Order #{orderId}</h3>
                      <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                          {new Date(orderDate).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <IndianRupee className="w-3 h-3 sm:w-4 sm:h-4" />
                          ₹{totalAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
                        {status}
                      </span>
                      {order.paymentStatus && (
                        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-medium ${
                          order.paymentStatus === 'CAPTURED' ? 'bg-green-100 text-green-800' :
                          order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          Payment: {order.paymentStatus}
                        </span>
                      )}
                    </div>
                  </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {order.items && order.items.length > 0 ? (
                    order.items.map((item, index) => (
                      <div key={index} className="flex gap-2 sm:gap-3">
                        <img
                          src={
                            (item.product?.prod_images && item.product.prod_images.length > 0 && item.product.prod_images[0]) ||
                            '/placeholder.jpg'
                          }
                          alt={item.product?.prod_name || 'Product'}
                          className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = '/placeholder.jpg';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-xs sm:text-sm truncate">{item.product?.prod_name || 'Product'}</p>
                          {item.product?.prod_brand && (
                            <p className="text-xs text-gray-600 truncate">{item.product.prod_brand}</p>
                          )}
                          {item.size && (
                            <p className="text-xs text-gray-700">Size: <span className="font-semibold">{item.size}</span></p>
                          )}
                          <p className="text-xs">Qty: {item.quantity} × ₹{item.price?.toFixed(2) || '0.00'}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs sm:text-sm text-gray-500">No items found</p>
                  )}
                </div>

                  <div className="mt-4 pt-4 border-t flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
                    <button
                      onClick={() => navigate(`/order/${orderId}`)}
                      className="text-black hover:underline text-xs sm:text-sm text-center sm:text-left touch-manipulation"
                    >
                      View Details
                    </button>
                    <button className="bg-black text-white px-4 py-2 rounded text-xs sm:text-sm hover:bg-gray-800 touch-manipulation">
                      Reorder
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;