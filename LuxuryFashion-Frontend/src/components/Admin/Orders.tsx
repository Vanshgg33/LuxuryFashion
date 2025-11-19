import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Eye,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Truck,
  Package,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { fetchOrdersApi, updateOrderStatusApi } from '../../api/AdminApi';

interface Order {
  id: number;
  user: {
    id: number;
    username?: string;
    name?: string;
    email: string;
    phoneNumber?: string;
  };
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  items: Array<{
    id: number;
    product: {
      prod_id: number;
      prod_name: string;
      prod_price: number;
      selling_price: number;
      prod_brand: string;
      prod_category: string;
      imageUrl?: string;
    };
    quantity: number;
    price: number;
  }>;
  totalPrice: number;
  orderDate: string;
  status: string;
  // Payment fields (now directly on Order object)
  paymentStatus?: 'PENDING' | 'CAPTURED' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentMethod?: string;
  paymentBank?: string;
  paymentWallet?: string;
  paymentVpa?: string;
  paidAt?: string;
  paymentFailureReason?: string;
}

interface OrdersContextType {
  showNotification: (type: 'success' | 'error' | 'warning', message: string) => void;
}

const Orders: React.FC = () => {
  const { showNotification } = useOutletContext<OrdersContextType>();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<{show: boolean, order: Order | null, newStatus: string}>({show: false, order: null, newStatus: ''});
  const [expandedOrders, setExpandedOrders] = useState<Set<number>>(new Set());

  const statusOptions = ['PENDING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await fetchOrdersApi();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      showNotification('error', 'Failed to fetch orders');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.id.toString().includes(searchTerm) ||
        order.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-800';
      case 'SHIPPED': return 'bg-orange-100 text-orange-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status?: string) => {
    switch (status) {
      case 'CAPTURED': return 'bg-green-100 text-green-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'FAILED': return 'bg-red-100 text-red-800';
      case 'REFUNDED': return 'bg-gray-100 text-gray-800';
      case 'PARTIALLY_REFUNDED': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusUpdate = async (order: Order, newStatus: string) => {
    setShowConfirmDialog({show: true, order, newStatus});
  };

  const confirmStatusUpdate = async () => {
    if (!showConfirmDialog.order || !showConfirmDialog.newStatus) return;

    try {
      await updateOrderStatusApi(showConfirmDialog.order.id, showConfirmDialog.newStatus);
      setOrders(orders.map(o => 
        o.id === showConfirmDialog.order!.id 
          ? {...o, status: showConfirmDialog.newStatus} 
          : o
      ));
      showNotification('success', 'Order status updated successfully');
    } catch (error) {
      showNotification('error', 'Failed to update order status');
    }
    setShowConfirmDialog({show: false, order: null, newStatus: ''});
  };

  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };

  const toggleOrderExpansion = (orderId: number) => {
    const newExpanded = new Set(expandedOrders);
    if (newExpanded.has(orderId)) {
      newExpanded.delete(orderId);
    } else {
      newExpanded.add(orderId);
    }
    setExpandedOrders(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Loading orders...</span>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
          <p className="text-gray-600 mt-1">Manage customer orders and status</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <ShoppingBag className="w-4 h-4" />
          <span>Total: {orders.length}</span>
          <span>•</span>
          <span>Pending: {Array.isArray(orders) ? orders.filter(o => o.status === 'PENDING').length : 0}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by order ID or customer..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="All">All Status</option>
            {statusOptions.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Address</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Items</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{order.user.name || order.user.username}</div>
                        <div className="text-sm text-gray-500">{order.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900 max-w-xs">
                        {order.address ? (
                          <div>
                            {order.address.street && <div>{order.address.street}</div>}
                            <div>
                              {order.address.city && `${order.address.city}, `}
                              {order.address.state && `${order.address.state} `}
                              {order.address.zipCode}
                            </div>
                            {order.address.country && <div className="text-xs text-gray-500">{order.address.country}</div>}
                          </div>
                        ) : (
                          <span className="text-gray-400 text-xs">No address</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleOrderExpansion(order.id)}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-900"
                      >
                        <span className="text-sm">{order.items?.length || 0} items</span>
                        {expandedOrders.has(order.id) ? 
                          <ChevronUp className="w-4 h-4" /> : 
                          <ChevronDown className="w-4 h-4" />
                        }
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">₹{(order.totalPrice || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(order.orderDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(order.paymentStatus)}`}>
                          {order.paymentStatus || 'N/A'}
                        </span>
                        {order.paymentMethod && (
                          <div className="text-xs text-gray-500">{order.paymentMethod}</div>
                        )}
                        {order.paidAt && (
                          <div className="text-xs text-gray-500">
                            {new Date(order.paidAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {order.status === 'PENDING' && (
                          <button
                            onClick={() => handleStatusUpdate(order, 'CONFIRMED')}
                            className="text-green-600 hover:text-green-900"
                            title="Confirm Order"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {order.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleStatusUpdate(order, 'SHIPPED')}
                            className="text-orange-600 hover:text-orange-900"
                            title="Ship Order"
                          >
                            <Truck className="w-4 h-4" />
                          </button>
                        )}
                        {order.status === 'SHIPPED' && (
                          <button
                            onClick={() => handleStatusUpdate(order, 'DELIVERED')}
                            className="text-green-600 hover:text-green-900"
                            title="Mark as Delivered"
                          >
                            <Package className="w-4 h-4" />
                          </button>
                        )}
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusUpdate(order, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1"
                        >
                          {statusOptions.map(status => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                  {expandedOrders.has(order.id) && (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 bg-gray-50">
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Order Items</h4>
                          <div className="grid gap-3">
                            {(order.items || []).map((item) => (
                              <div key={item.id} className="bg-white p-3 rounded border flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  {item.product.imageUrl && (
                                    <img
                                      src={item.product.imageUrl}
                                      alt={item.product.prod_name}
                                      className="w-12 h-12 object-cover rounded"
                                    />
                                  )}
                                  <div>
                                    <div className="font-medium text-sm">{item.product.prod_name}</div>
                                    <div className="text-xs text-gray-600">Brand: {item.product.prod_brand}</div>
                                    <div className="text-xs text-gray-600">Unit Price: ₹{(item.product.selling_price || 0).toFixed(2)}</div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-medium">₹{(item.price || 0).toFixed(2)}</div>
                                  <div className="text-xs text-gray-600">Qty: {item.quantity}</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {showDetailsModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Order Details #{selectedOrder.id}</h3>
              <button onClick={() => setShowDetailsModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Customer Information</h4>
                <div className="space-y-1 text-sm">
                  <p><span className="font-medium">Name:</span> {selectedOrder.user.name}</p>
                  <p><span className="font-medium">Email:</span> {selectedOrder.user.email}</p>
                  {selectedOrder.user.phoneNumber && (
                    <p><span className="font-medium">Phone:</span> {selectedOrder.user.phoneNumber}</p>
                  )}
                </div>
              </div>

              {/* Shipping Address */}
              {selectedOrder.address && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Shipping Address</h4>
                  <div className="text-sm text-gray-700">
                    {selectedOrder.address.street && <p>{selectedOrder.address.street}</p>}
                    <p>
                      {selectedOrder.address.city && `${selectedOrder.address.city}, `}
                      {selectedOrder.address.state && `${selectedOrder.address.state} `}
                      {selectedOrder.address.zipCode}
                    </p>
                    {selectedOrder.address.country && <p>{selectedOrder.address.country}</p>}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div>
                <h4 className="font-medium mb-3">Order Items</h4>
                <div className="space-y-2">
                  {(selectedOrder.items || []).map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 border rounded">
                      <div className="flex items-center space-x-3">
                        {item.product.imageUrl && (
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.prod_name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div>
                          <div className="font-medium">{item.product.prod_name}</div>
                          <div className="text-sm text-gray-600">Brand: {item.product.prod_brand}</div>
                          <div className="text-sm text-gray-600">Quantity: {item.quantity}</div>
                          <div className="text-sm text-gray-600">Unit Price: ₹{(item.product.selling_price || 0).toFixed(2)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">₹{(item.price || 0).toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">Total Amount:</span>
                  <span className="text-lg font-bold">₹{(selectedOrder.totalPrice || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-medium">Order Date:</span>
                  <span>{new Date(selectedOrder.orderDate).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="font-medium">Status:</span>
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>

              {/* Payment Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-3">Payment Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Payment Status:</span>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(selectedOrder.paymentStatus)}`}>
                      {selectedOrder.paymentStatus || 'N/A'}
                    </span>
                  </div>
                  {selectedOrder.paymentMethod && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Payment Method:</span>
                      <span>{selectedOrder.paymentMethod}</span>
                    </div>
                  )}
                  {selectedOrder.razorpayOrderId && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Razorpay Order ID:</span>
                      <span className="text-xs font-mono">{selectedOrder.razorpayOrderId}</span>
                    </div>
                  )}
                  {selectedOrder.razorpayPaymentId && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Razorpay Payment ID:</span>
                      <span className="text-xs font-mono">{selectedOrder.razorpayPaymentId}</span>
                    </div>
                  )}
                  {selectedOrder.paidAt && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Paid At:</span>
                      <span>{new Date(selectedOrder.paidAt).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedOrder.paymentFailureReason && (
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-red-600">Failure Reason:</span>
                      <span className="text-red-600">{selectedOrder.paymentFailureReason}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      {showConfirmDialog.show && showConfirmDialog.order && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <AlertCircle className="w-6 h-6 text-orange-500 mr-3" />
              <h3 className="text-lg font-semibold">Confirm Status Change</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to change order #{showConfirmDialog.order.id} status to "{showConfirmDialog.newStatus}"?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirmDialog({show: false, order: null, newStatus: ''})}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;