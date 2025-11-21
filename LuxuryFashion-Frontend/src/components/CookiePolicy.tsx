import React from 'react';
import { Cookie, Settings, Eye, Shield } from 'lucide-react';

const CookiePolicy: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white pt-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-black rounded-full">
              <Cookie className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold text-gray-900 mb-4">
            Cookie Policy
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
              This Cookie Policy explains how Luxury Fashion uses cookies and similar tracking technologies on our website. 
              By using our website, you consent to the use of cookies in accordance with this policy.
            </p>
          </section>

          {/* What Are Cookies */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <Cookie className="w-6 h-6 text-black" />
              What Are Cookies?
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files that are placed on your device (computer, tablet, or mobile) when you visit a website. 
              They are widely used to make websites work more efficiently and provide information to website owners. Cookies allow 
              websites to remember your actions and preferences over a period of time, so you don't have to keep re-entering them 
              whenever you come back to the site or browse from one page to another.
            </p>
          </section>

          {/* Types of Cookies We Use */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <Settings className="w-6 h-6 text-black" />
              Types of Cookies We Use
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Essential Cookies</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  These cookies are necessary for the website to function properly. They enable core functionality such as:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>User authentication and login sessions</li>
                  <li>Shopping cart functionality</li>
                  <li>Security and fraud prevention</li>
                  <li>Remembering your preferences</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-2">
                  These cookies cannot be disabled as they are essential for the website to work.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Performance Cookies</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  These cookies help us understand how visitors interact with our website by collecting and reporting information 
                  anonymously. They help us:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Count visits and traffic sources</li>
                  <li>Understand which pages are most popular</li>
                  <li>Identify and fix technical issues</li>
                  <li>Improve website performance</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Functionality Cookies</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  These cookies allow the website to remember choices you make and provide enhanced, personalized features:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Language preferences</li>
                  <li>Region or location settings</li>
                  <li>User interface preferences</li>
                  <li>Remembering items in your shopping cart</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Targeting/Advertising Cookies</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  These cookies may be set through our site by advertising partners to build a profile of your interests and 
                  show you relevant advertisements on other sites:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Track your browsing habits across websites</li>
                  <li>Show personalized advertisements</li>
                  <li>Measure advertising effectiveness</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Third-Party Cookies */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <Eye className="w-6 h-6 text-black" />
              Third-Party Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              In addition to our own cookies, we may also use various third-party cookies to report usage statistics and deliver 
              advertisements. These include:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>
                <strong>Razorpay:</strong> Payment processing cookies to ensure secure transactions
              </li>
              <li>
                <strong>Google Analytics:</strong> To analyze website traffic and user behavior
              </li>
              <li>
                <strong>Social Media Platforms:</strong> For social sharing and login functionality
              </li>
              <li>
                <strong>Advertising Networks:</strong> To deliver relevant advertisements
              </li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-4">
              These third parties may use cookies to collect information about your online activities across different websites. 
              We do not control these third-party cookies, and you should check the respective privacy policies of these third 
              parties for more information.
            </p>
          </section>

          {/* How We Use Cookies */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
              How We Use Cookies
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use cookies for the following purposes:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>To enable essential website functionality</li>
              <li>To remember your preferences and settings</li>
              <li>To analyze website usage and improve performance</li>
              <li>To provide personalized content and recommendations</li>
              <li>To process secure payments through Razorpay</li>
              <li>To prevent fraud and ensure security</li>
              <li>To deliver targeted advertisements (with your consent)</li>
            </ul>
          </section>

          {/* Managing Cookies */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4 flex items-center gap-3">
              <Shield className="w-6 h-6 text-black" />
              Managing Cookies
            </h2>
            <div className="space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Browser Settings</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  Most web browsers allow you to control cookies through their settings preferences. You can:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li>Block all cookies</li>
                  <li>Block third-party cookies only</li>
                  <li>Delete cookies when you close your browser</li>
                  <li>View and delete cookies stored on your device</li>
                </ul>
                <p className="text-gray-700 leading-relaxed mt-3">
                  <strong>Note:</strong> Blocking or deleting cookies may impact your experience on our website. Some features 
                  may not function properly if cookies are disabled.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Cookie Consent</h3>
                <p className="text-gray-700 leading-relaxed">
                  When you first visit our website, you may see a cookie consent banner. You can choose to accept or reject 
                  non-essential cookies. You can also change your cookie preferences at any time through your browser settings 
                  or by contacting us.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">Browser-Specific Instructions</h3>
                <p className="text-gray-700 leading-relaxed mb-2">
                  To manage cookies in your browser:
                </p>
                <ul className="list-disc list-inside text-gray-700 space-y-1 ml-4">
                  <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                  <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                  <li><strong>Edge:</strong> Settings → Privacy, Search, and Services → Cookies</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Do Not Track Signals */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
              Do Not Track Signals
            </h2>
            <p className="text-gray-700 leading-relaxed">
              Some browsers include a "Do Not Track" (DNT) feature that signals to websites you visit that you do not want 
              to have your online activity tracked. Currently, there is no standard for how DNT signals should be interpreted. 
              Our website does not currently respond to DNT browser signals or mechanisms.
            </p>
          </section>

          {/* Updates to Cookie Policy */}
          <section>
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
              Updates to This Cookie Policy
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Cookie Policy from time to time to reflect changes in technology, legislation, or our practices. 
              We will notify you of any material changes by posting the new Cookie Policy on this page and updating the "Last updated" 
              date. We encourage you to review this policy periodically.
            </p>
          </section>

          {/* Contact Information */}
          <section className="bg-gray-50 rounded-xl p-6 border border-gray-200">
            <h2 className="text-2xl font-serif font-semibold text-gray-900 mb-4">
              Contact Us
            </h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              If you have any questions about our use of cookies or this Cookie Policy, please contact us:
            </p>
            <div className="space-y-2 text-gray-700">
              <p><strong>Email:</strong> privacy@luxuryfashion.com</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
              <p><strong>Address:</strong> 123 Fashion Street, New York, NY 10001, USA</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;



