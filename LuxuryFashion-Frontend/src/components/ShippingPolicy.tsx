import React from 'react';
import { Truck, Package, Clock, MapPin, Shield, AlertCircle } from 'lucide-react';

const ShippingPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-black rounded-full">
              <Truck className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mb-4">
            Shipping Policy
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 lg:p-12 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <Package className="w-6 h-6 text-black" />
              Shipping Information
            </h2>
            <p className="text-gray-700 leading-relaxed">
              At Luxury Fashion, we are committed to delivering your orders safely and on time. This Shipping Policy 
              outlines our shipping methods, delivery times, and related information to help you understand how 
              we handle your orders.
            </p>
          </section>

          {/* Shipping Methods */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <Truck className="w-6 h-6 text-black" />
              Shipping Methods & Delivery Times
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Standard Shipping</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Delivery Time: 5-7 business days</li>
                  <li>Shipping Cost: ₹99 (Free for orders above ₹2,999)</li>
                  <li>Available for all locations in India</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Express Shipping</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Delivery Time: 2-3 business days</li>
                  <li>Shipping Cost: ₹199</li>
                  <li>Available for major cities</li>
                </ul>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Same Day Delivery</h3>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Delivery Time: Same day (Order before 12 PM)</li>
                  <li>Shipping Cost: ₹299</li>
                  <li>Available only in select metro cities</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Processing Time */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <Clock className="w-6 h-6 text-black" />
              Order Processing
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              All orders are processed within 1-2 business days (excluding weekends and holidays) after we receive 
              your order confirmation and payment verification.
            </p>
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
              <p className="text-gray-700 text-sm">
                <strong>Note:</strong> Processing time may be longer during sale periods or holidays. 
                You will receive an email notification once your order has been shipped.
              </p>
            </div>
          </section>

          {/* Shipping Locations */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <MapPin className="w-6 h-6 text-black" />
              Shipping Locations
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We currently ship to all locations within India. International shipping is not available at this time.
            </p>
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-gray-800">Serviceable Areas:</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                <li>All major cities and towns in India</li>
                <li>Remote areas may take additional 2-3 business days</li>
                <li>Some locations may have restricted delivery options</li>
              </ul>
            </div>
          </section>

          {/* Tracking */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-black" />
              Order Tracking
            </h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              Once your order is shipped, you will receive a tracking number via email and SMS. You can track your 
              order status in real-time through:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
              <li>Your order confirmation email</li>
              <li>The "Track Order" section on our website</li>
              <li>Direct tracking link provided by the courier service</li>
            </ul>
          </section>

          {/* Delivery Issues */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-black" />
              Delivery Issues & Delays
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Failed Delivery Attempts</h3>
                <p className="text-gray-700 leading-relaxed">
                  If delivery is attempted and you are not available, the courier will make up to 2 additional 
                  attempts. After 3 failed attempts, the package will be returned to us, and a return shipping 
                  fee may apply.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Incorrect Address</h3>
                <p className="text-gray-700 leading-relaxed">
                  Please ensure your shipping address is correct. If an order is returned due to an incorrect 
                  address, you will be responsible for the return shipping charges. Contact us immediately if 
                  you need to update your shipping address.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Delayed Shipments</h3>
                <p className="text-gray-700 leading-relaxed">
                  While we strive to deliver on time, delays may occur due to weather conditions, natural 
                  disasters, or other unforeseen circumstances. We will notify you of any significant delays 
                  and work to resolve the issue promptly.
                </p>
              </div>
            </div>
          </section>

          {/* Shipping Charges */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
              Shipping Charges
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Order Value</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Standard Shipping</th>
                    <th className="border border-gray-300 px-4 py-3 text-left font-semibold text-gray-900">Express Shipping</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">Below ₹2,999</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">₹99</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">₹199</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">₹2,999 and above</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700 font-semibold text-green-600">FREE</td>
                    <td className="border border-gray-300 px-4 py-3 text-gray-700">₹199</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Contact */}
          <section className="bg-gray-50 rounded-lg p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-3">Need Help?</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              If you have any questions about shipping or need assistance with your order, please don't hesitate 
              to contact our customer service team.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <a 
                href="mailto:support@luxuryfashion.com" 
                className="text-black hover:underline font-medium"
              >
                Email: support@luxuryfashion.com
              </a>
              <a 
                href="tel:+91981260291" 
                className="text-black hover:underline font-medium"
              >
                Phone: +91 98126 0291
              </a>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default ShippingPolicy;

