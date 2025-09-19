import React, { useState } from 'react';
import {  Star} from 'lucide-react';
import type { Product } from '../../api/base';



interface DashboardProps {
  products?: Product[];

}

const Dashboard: React.FC<DashboardProps> = ({ }) => {
  // Initialize with mock data if not provided
  const [dashboardProducts] = useState<Product[]>([
  {

      id: '1',

      name: 'Cashmere Oversized Coat',

      price: 1299,

      image: 'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',

      images: [

        'https://images.unsplash.com/photo-1539008835657-9e8e9680c956?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'

      ],

      originalPrice: undefined,

      quantity: 15,

      badge: 'New',

      rating: 4.9,

      reviewCount: 124,

      brand: 'LUNA',

      category: 'Outerwear',

      description: 'Luxurious cashmere blend coat with oversized silhouette',

      sizes: undefined,

      colors: undefined,

      inStock: true,

      prodStatus: 'ACTIVE',

    },

    {

      id: '2',

      name: 'Silk Midi Dress',

      price: 899,

      image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',

      images: [

        'https://images.unsplash.com/photo-1595777457583-95e059d581b8?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'

      ],

      originalPrice: 1199,

      quantity: 8,

      badge: 'Sale',

      rating: 4.8,

      reviewCount: 89,

      brand: 'AURORA',

      category: 'Dresses',

      description: 'Elegant silk midi dress with contemporary cut',

      sizes: undefined,

      colors: undefined,

      inStock: true,

      prodStatus: 'ACTIVE',

    }

  ]);


  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-serif font-medium text-gray-900">Dashboard Overview</h1>
        <div className="text-sm text-gray-500">Last updated: {new Date().toLocaleDateString()}</div>
      </div>


      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 border border-gray-200">
          <h3 className="text-xl font-serif font-medium text-gray-900 mb-6">Recent Orders</h3>
          <div className="space-y-4">
            {[
              { id: '#1234', customer: 'Sarah Johnson', amount: '$299', status: 'Completed' },
              { id: '#1235', customer: 'Michael Chen', amount: '$599', status: 'Processing' },
              { id: '#1236', customer: 'Emma Wilson', amount: '$199', status: 'Shipped' }
            ].map((order) => (
              <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                <div>
                  <p className="font-medium text-gray-900">{order.id}</p>
                  <p className="text-gray-600 text-sm">{order.customer}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">{order.amount}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    order.status === 'Completed' ? 'bg-green-100 text-green-800' :
                    order.status === 'Processing' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 border border-gray-200">
          <h3 className="text-xl font-serif font-medium text-gray-900 mb-6">Top Products</h3>
          <div className="space-y-4">
            {dashboardProducts.slice(0, 3).map((product) => (
              <div key={product.id} className="flex items-center space-x-4 p-4 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                <img src={product.image || product.image} alt={product.name || product.name} className="w-12 h-12 object-cover" />
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{product.name || product.name}</p>
                  <p className="text-gray-600 text-sm">${product.price || product.price}</p>
                </div>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span className="text-sm text-gray-600">{product.rating || 4.5}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;