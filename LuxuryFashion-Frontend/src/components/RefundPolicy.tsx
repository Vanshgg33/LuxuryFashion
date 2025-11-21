import React from 'react';
import { RefreshCw, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const RefundPolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-black rounded-full">
              <RefreshCw className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mb-4">
            Refund & Cancellation Policy
          </h1>
          <p className="text-gray-600 text-sm sm:text-base">
            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 sm:p-8 lg:p-12 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
              Introduction
            </h2>
            <p className="text-gray-700 leading-relaxed">
              At Luxury Fashion, we want you to be completely satisfied with your purchase. This Refund & Cancellation Policy 
              outlines the terms and conditions for returns, refunds, and cancellations. All refunds are processed securely 
              through Razorpay, our payment gateway partner.
            </p>
          </section>

          {/* Cancellation Policy */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <XCircle className="w-6 h-6 text-black" />
              Order Cancellation
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Before Shipment</h3>
                <p className="text-gray-700 leading-relaxed">
                  You may cancel your order at any time before it is shipped. To cancel an order:
                </p>
                <ul className="list-disc list-inside text-gray-700 mt-2 space-y-1 ml-4">
                  <li>Contact us at support@luxuryfashion.com or call +1 (555) 123-4567</li>
                  <li>Provide your order number and reason for cancellation</li>
                  <li>We will process the cancellation and initiate a full refund</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">After Shipment</h3>
                <p className="text-gray-700 leading-relaxed">
                  Once your order has been shipped, you cannot cancel it. However, you may return the item(s) according to 
                  our return policy below.
                </p>
              </div>
            </div>
          </section>

          {/* Return Policy */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <RefreshCw className="w-6 h-6 text-black" />
              Return Policy
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Return Eligibility</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Items are eligible for return if they meet the following conditions:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Return request is initiated within 7 days of delivery</li>
                  <li>Items are unused, unwashed, and in original condition</li>
                  <li>Original tags and packaging are intact</li>
                  <li>Items are not damaged or altered</li>
                  <li>Items are not personalized or custom-made</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Non-Returnable Items</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  The following items cannot be returned:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Underwear, swimwear, and intimate apparel (for hygiene reasons)</li>
                  <li>Personalized or custom-made items</li>
                  <li>Items damaged due to misuse or normal wear</li>
                  <li>Items without original tags or packaging</li>
                  <li>Items purchased during final sale or clearance</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Return Process */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-black" />
              Return Process
            </h2>
            <div className="space-y-4">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">Step-by-Step Return Process</h3>
                <ol className="list-decimal list-inside text-gray-700 space-y-3 ml-2">
                  <li>
                    <strong>Initiate Return:</strong> Contact our customer service team at support@luxuryfashion.com or 
                    through your account dashboard within 7 days of delivery.
                  </li>
                  <li>
                    <strong>Receive Authorization:</strong> We will review your request and provide a Return Authorization (RA) number 
                    if your return is approved.
                  </li>
                  <li>
                    <strong>Package Items:</strong> Pack the items securely in their original packaging with all tags attached. 
                    Include the RA number in the package.
                  </li>
                  <li>
                    <strong>Ship Return:</strong> Send the package to the return address provided. We recommend using a trackable 
                    shipping method.
                  </li>
                  <li>
                    <strong>Inspection:</strong> Once we receive your return, we will inspect the items within 3-5 business days.
                  </li>
                  <li>
                    <strong>Refund Processing:</strong> If approved, your refund will be processed within 5-7 business days.
                  </li>
                </ol>
              </div>
            </div>
          </section>

          {/* Refund Policy */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <Clock className="w-6 h-6 text-black" />
              Refund Policy
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Refund Methods</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  Refunds will be processed to the original payment method used for the purchase through Razorpay:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Credit/Debit Card: Refund will appear on your statement within 5-10 business days</li>
                  <li>UPI: Refund will be processed within 3-5 business days</li>
                  <li>Net Banking: Refund will be credited to your bank account within 5-7 business days</li>
                  <li>Wallet: Refund will be credited to your wallet within 2-3 business days</li>
                </ul>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Refund Amount</h3>
                <p className="text-gray-700 leading-relaxed mb-3">
                  The refund amount will include:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
                  <li>Full product price</li>
                  <li>Original shipping charges (if applicable)</li>
                  <li>Taxes paid on the order</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  <strong>Note:</strong> Return shipping charges are the responsibility of the customer unless the item is defective 
                  or incorrect.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Processing Time</h3>
                <p className="text-gray-700 leading-relaxed">
                  Once we receive and inspect your returned items, we will process your refund within 5-7 business days. 
                  The time it takes for the refund to appear in your account depends on your payment method and bank processing times.
                </p>
              </div>
            </div>
          </section>

          {/* Exchange Policy */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
              Exchange Policy
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We currently do not offer direct exchanges. If you wish to exchange an item:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Return the original item following our return process</li>
              <li>Place a new order for the desired item</li>
              <li>We will process your refund once the return is approved</li>
            </ul>
          </section>

          {/* Defective or Damaged Items */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-black" />
              Defective or Damaged Items
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              If you receive a defective or damaged item:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Contact us immediately within 48 hours of delivery</li>
              <li>Provide photos of the defect or damage</li>
              <li>We will arrange for a replacement or full refund at no additional cost</li>
              <li>Return shipping for defective items is free of charge</li>
            </ul>
          </section>

          {/* Wrong Items Received */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
              Wrong Items Received
            </h2>
            <p className="text-gray-700 leading-relaxed">
              If you receive the wrong item, please contact us immediately. We will arrange for the correct item to be sent 
              to you at no additional cost, and we will cover the return shipping for the incorrect item. Alternatively, 
              you may return the incorrect item for a full refund.
            </p>
          </section>

          {/* Payment Gateway Refunds */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
              Payment Gateway Refunds (Razorpay)
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              All refunds are processed securely through Razorpay, our payment gateway partner:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Refunds are processed to the original payment method</li>
              <li>Razorpay handles the secure transfer of funds back to your account</li>
              <li>Refund status can be tracked through your order history</li>
              <li>You will receive email notifications regarding refund status</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              For questions about Razorpay refund processing, please visit{' '}
              <a href="https://razorpay.com/support" target="_blank" rel="noopener noreferrer" className="text-black underline hover:text-gray-700">
                Razorpay Support
              </a>.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              For questions about returns, refunds, or cancellations, please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> support@luxuryfashion.com</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              <p><strong>Address:</strong> 123 Fashion Street, New York, NY 10001, USA</p>
              <p><strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM EST</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default RefundPolicy;



