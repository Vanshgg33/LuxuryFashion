import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getOrderDetails } from '../api/OrderApi';
import type { Order } from '../api/OrderApi';
import { CheckCircle, Package, Calendar, IndianRupee } from 'lucide-react';

const OrderConfirmation: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) {
        navigate('/orders');
        return;
      }

      try {
        const orderData = await getOrderDetails(parseInt(orderId));
        setOrder(orderData);
      } catch (error: any) {
        setError('Failed to load order details');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen pt-20 px-4">
        <div className="max-w-4xl mx-auto py-16 text-center">
          <p className="text-red-600">{error || 'Order not found'}</p>
          <button
            onClick={() => navigate('/orders')}
            className="mt-4 bg-black text-white px-6 py-2 rounded hover:bg-gray-800"
          >
            View All Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 px-4">
      <div className="max-w-4xl mx-auto py-6 sm:py-8">
        <div className="text-center mb-6 sm:mb-8">
          <CheckCircle className="w-12 h-12 sm:w-16 sm:h-16 text-green-500 mx-auto mb-3 sm:mb-4" />
          <h1 className="text-2xl sm:text-3xl font-serif mb-2">Order Confirmed!</h1>
          <p className="text-gray-600 text-sm sm:text-base">Thank you for your purchase</p>
        </div>

        <div className="bg-white border rounded-lg p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold">Order #{order.orderId || order.id}</h2>
              <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-2">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                  {new Date(order.orderDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1">
                  <Package className="w-3 h-3 sm:w-4 sm:h-4" />
                  {order.status}
                </div>
                {order.paymentStatus && (
                  <div className="flex items-center gap-1">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      order.paymentStatus === 'CAPTURED' ? 'bg-green-100 text-green-800' :
                      order.paymentStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      order.paymentStatus === 'FAILED' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      Payment: {order.paymentStatus}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="flex items-center gap-1 text-base sm:text-lg font-semibold">
                <IndianRupee className="w-4 h-4 sm:w-5 sm:h-5" />
                ₹{(order.totalPrice || order.totalAmount || 0).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="border-t pt-4 sm:pt-6">
            <h3 className="font-semibold mb-3 sm:mb-4 text-base sm:text-lg">Order Items</h3>
            <div className="space-y-3 sm:space-y-4">
              {order.items.map((item, index) => (
                <div key={index} className="flex gap-3 sm:gap-4">
                  <img
                    src={item.product.prod_images?.[0] || '/placeholder.jpg'}
                    alt={item.product.prod_name}
                    className="w-12 h-12 sm:w-16 sm:h-16 object-cover rounded flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm sm:text-base truncate">{item.product.prod_name}</h4>
                    <p className="text-gray-600 text-xs sm:text-sm">{item.product.prod_brand}</p>
                    {item.size && (
                      <p className="text-xs sm:text-sm text-gray-700">Size: <span className="font-semibold">{item.size}</span></p>
                    )}
                    <p className="text-xs sm:text-sm">Quantity: {item.quantity}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-sm sm:text-base">₹{(item.price * item.quantity).toFixed(2)}</p>
                    <p className="text-xs sm:text-sm text-gray-600">₹{item.price} each</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-center flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 sm:space-x-4">
          <button
            onClick={() => navigate('/orders')}
            className="bg-black text-white px-5 sm:px-6 py-2.5 sm:py-2 rounded hover:bg-gray-800 text-sm sm:text-base touch-manipulation"
          >
            View All Orders
          </button>
          <button
            onClick={() => navigate('/shop')}
            className="border border-black text-black px-5 sm:px-6 py-2.5 sm:py-2 rounded hover:bg-gray-50 text-sm sm:text-base touch-manipulation"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderConfirmation;