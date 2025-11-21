import React from 'react';
import { FileText, Scale, AlertCircle, CheckCircle } from 'lucide-react';

const TermsOfService: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-black rounded-full">
              <Scale className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mb-4">
            Terms of Service
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
              <FileText className="w-6 h-6 text-black" />
              Agreement to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using the Luxury Fashion website, you accept and agree to be bound by the terms and provision 
              of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          {/* Use License */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
              Use License
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              Permission is granted to temporarily access the materials on Luxury Fashion's website for personal, non-commercial 
              transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
            </ul>
          </section>

          {/* Account Registration */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-black" />
              Account Registration
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              To make purchases on our website, you must create an account. When you register, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide accurate, current, and complete information</li>
              <li>Maintain and update your information to keep it accurate</li>
              <li>Maintain the security of your password and account</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
          </section>

          {/* Products and Pricing */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
              Products and Pricing
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Product Information</h3>
                <p className="text-gray-700 leading-relaxed">
                  We strive to provide accurate product descriptions, images, and pricing. However, we do not warrant that 
                  product descriptions or other content on the site is accurate, complete, reliable, current, or error-free.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Pricing</h3>
                <p className="text-gray-700 leading-relaxed">
                  All prices are displayed in Indian Rupees (₹) unless otherwise stated. Prices are subject to change without 
                  notice. We reserve the right to correct any pricing errors, even after an order has been placed.
                </p>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Availability</h3>
                <p className="text-gray-700 leading-relaxed">
                  Product availability is subject to change. We reserve the right to limit quantities and refuse or cancel 
                  orders if products are unavailable or if we suspect fraudulent activity.
                </p>
              </div>
            </div>
          </section>

          {/* Payment Terms */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
              Payment Terms
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We accept payments through Razorpay, a secure payment gateway. By making a purchase, you agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide valid payment information</li>
              <li>Authorize us to charge your payment method for the total amount of your order</li>
              <li>Understand that payment processing is handled securely by Razorpay</li>
              <li>Accept that all payments are final unless otherwise stated in our Refund Policy</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              For more information about Razorpay's terms, please visit{' '}
              <a href="https://razorpay.com/terms" target="_blank" rel="noopener noreferrer" className="text-black underline hover:text-gray-700">
                Razorpay's Terms of Service
              </a>.
            </p>
          </section>

          {/* Shipping and Delivery */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
              Shipping and Delivery
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We offer shipping to various locations. Shipping terms include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Shipping costs and estimated delivery times are displayed at checkout</li>
              <li>Delivery times are estimates and not guaranteed</li>
              <li>We are not responsible for delays caused by shipping carriers</li>
              <li>You are responsible for providing accurate shipping addresses</li>
              <li>Risk of loss and title pass to you upon delivery to the carrier</li>
            </ul>
          </section>

          {/* Returns and Refunds */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
              Returns and Refunds
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Our return and refund policy is detailed in our{' '}
              <a href="/refund-policy" className="text-black underline hover:text-gray-700">Refund Policy</a>. 
              Please review it carefully before making a purchase. All returns must comply with the terms outlined in that policy.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
              Intellectual Property
            </h2>
            <p className="text-gray-700 leading-relaxed">
              All content on this website, including text, graphics, logos, images, and software, is the property of Luxury 
              Fashion or its content suppliers and is protected by copyright, trademark, and other intellectual property laws. 
              You may not use, reproduce, or distribute any content from this website without our prior written permission.
            </p>
          </section>

          {/* Prohibited Uses */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <AlertCircle className="w-6 h-6 text-black" />
              Prohibited Uses
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              You may not use our website:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>In any way that violates any applicable law or regulation</li>
              <li>To transmit any malicious code or viruses</li>
              <li>To attempt to gain unauthorized access to our systems</li>
              <li>To interfere with or disrupt the website or servers</li>
              <li>To collect or track personal information of others</li>
              <li>For any fraudulent or illegal purpose</li>
            </ul>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
              Limitation of Liability
            </h2>
            <p className="text-gray-700 leading-relaxed">
              To the fullest extent permitted by law, Luxury Fashion shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, 
              or any loss of data, use, goodwill, or other intangible losses resulting from your use of the website or products.
            </p>
          </section>

          {/* Indemnification */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
              Indemnification
            </h2>
            <p className="text-gray-700 leading-relaxed">
              You agree to indemnify, defend, and hold harmless Luxury Fashion and its officers, directors, employees, and 
              agents from any claims, damages, losses, liabilities, and expenses (including legal fees) arising out of or 
              relating to your use of the website, violation of these terms, or infringement of any rights of another.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
              Governing Law
            </h2>
            <p className="text-gray-700 leading-relaxed">
              These Terms of Service shall be governed by and construed in accordance with the laws of India, without regard 
              to its conflict of law provisions. Any disputes arising from these terms shall be subject to the exclusive 
              jurisdiction of the courts in India.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
              Changes to Terms
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these Terms of Service at any time. We will notify users of any material changes 
              by posting the new Terms of Service on this page and updating the "Last updated" date. Your continued use of 
              the website after such changes constitutes acceptance of the new terms.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              If you have any questions about these Terms of Service, please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> legal@luxuryfashion.com</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              <p><strong>Address:</strong> 123 Fashion Street, New York, NY 10001, USA</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;



