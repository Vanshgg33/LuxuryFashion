import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { placeOrder, createRazorpayOrder, type PlaceOrderResponse, type CreateRazorpayOrderResponse } from '../api/OrderApi';
import { getCart as getCartApi } from '../api/CartApi';
import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, CreditCard, Truck, Shield, MapPin, CheckCircle2, Edit } from 'lucide-react';
import axios, { type AxiosError } from 'axios';
import { baseApiUrl } from '../api/base';
import { logger } from '../utils/logger';

// Razorpay type declarations
declare global {
  interface Window {
    Razorpay: any;
  }
}

// Razorpay Key ID (Test credentials)
const RAZORPAY_KEY_ID = 'rzp_test_RdcgBs8hLIAVc7';

const Checkout: React.FC = () => {
  const { cart, refreshCart, updateQuantity, removeItem } = useCart();
  const { isAuthenticated, user, isLoading: authLoading, logout } = useAuth();  
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'USA',
    phoneNumber: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [userProfile, setUserProfile] = useState(null);
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [razorpayReady, setRazorpayReady] = useState(false);
  const pincodeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track if we're currently fetching to prevent loops - MUST be before early returns
  const isFetchingPincodeRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (pincodeTimeoutRef.current) {
        clearTimeout(pincodeTimeoutRef.current);
      }
    };
  }, []);

  // Suppress Razorpay SVG warnings (non-critical errors from Razorpay SDK)
  useEffect(() => {
    const originalError = console.error;
    const errorHandler = (message: any, ...args: any[]) => {
      // Suppress Razorpay SVG width/height "auto" warnings (non-critical)
      // These are known issues in Razorpay SDK and don't affect functionality
      if (
        (typeof message === 'string' && 
         (message.includes('Expected length') || message.includes('attribute width') || message.includes('attribute height')) &&
         message.includes('auto')) ||
        (args.length > 0 && typeof args[0] === 'string' && args[0].includes('v2-entry'))
      ) {
        // Silently ignore Razorpay SDK SVG warnings
        return;
      }
      originalError(message, ...args);
    };
    
    // Temporarily override console.error to filter Razorpay warnings
    if (typeof window !== 'undefined') {
      console.error = errorHandler;
    }
    
    return () => {
      // Restore original console.error on unmount
      if (typeof window !== 'undefined') {
        console.error = originalError;
      }
    };
  }, []);

  // Load Razorpay script with proper error handling
  useEffect(() => {
    // Check if script already exists
    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      logger.info('Razorpay script already loaded');
      // Check if Razorpay is available
      if (typeof (window as any).Razorpay !== 'undefined') {
        setRazorpayReady(true);
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    
    script.onload = () => {
      logger.info('Razorpay script loaded successfully');
      if (typeof (window as any).Razorpay !== 'undefined') {
        logger.info('Razorpay object is available');
        setRazorpayReady(true);
      } else {
        logger.error('Razorpay script loaded but object not available');
        setRazorpayReady(false);
      }
    };
    
    script.onerror = () => {
      logger.error('Failed to load Razorpay script');
      setRazorpayReady(false);
      // Error will be shown when user tries to place order
    };
    
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const scriptToRemove = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
      if (scriptToRemove && scriptToRemove.parentNode) {
        scriptToRemove.parentNode.removeChild(scriptToRemove);
      }
    };
  }, []);

  // Redirect to cart if empty - use useEffect to avoid render loop
  useEffect(() => {
    if (!cart || !cart.items || cart.items.length === 0) {
      navigate('/cart');
    }
  }, [cart, navigate]);

  // Fetch user profile
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        
        const response = await axios.get(`${baseApiUrl}/api/users/profile`, {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.data) {
          setUserProfile(response.data);
          if (response.data.address) {
            setFormData(prev => ({
              ...prev,
              street: response.data.address.street || '',
              city: response.data.address.city || '',
              state: response.data.address.state || '',
              zipCode: response.data.address.zipCode || '',
              country: response.data.address.country || 'USA'
            }));
          }
          if (response.data.phoneNumber) {
            setFormData(prev => ({ ...prev, phoneNumber: response.data.phoneNumber }));
          }
        }
      } catch (error) {
        const axiosError = error as AxiosError<{ error?: string }>;
        if (axiosError.response?.status === 401) {
          logger.warn('Authentication failed - token may be expired');
          localStorage.removeItem('authToken');
          // Don't navigate here as the auth check will handle it
        } else {
          logger.warn('Could not fetch user profile', { error: axiosError.response?.data || axiosError.message });
        }
      }
    };
    
    if (isAuthenticated && !authLoading) {
      fetchUserProfile();
    }
  }, [isAuthenticated, authLoading]);

  // Fetch city/state from pincode callback - MUST be before early returns
  const fetchCityStateFromPincode = useCallback(async (pincode: string, country?: string) => {
    if (!pincode || pincode.length < 5) {
      return;
    }

    // Prevent multiple simultaneous calls
    if (isFetchingPincodeRef.current) {
      return;
    }

    // Clean pincode - remove spaces and non-digits
    const cleanPincode = pincode.replace(/\D/g, '');
    
    if (cleanPincode.length < 5) {
      return;
    }

    isFetchingPincodeRef.current = true;
    setPincodeLoading(true);
    try {
      // For Indian pin codes (6 digits)
      if (cleanPincode.length === 6) {
        const response = await axios.get(`https://api.postalpincode.in/pincode/${cleanPincode}`, {
          timeout: 5000
        });
        
        if (response.data && response.data[0] && response.data[0].Status === 'Success' && response.data[0].PostOffice) {
          const postOffice = response.data[0].PostOffice[0];
          const city = postOffice.District || postOffice.Name || '';
          const state = postOffice.State || '';
          
          if (city || state) {
            setFormData(prev => {
              // Only update if values actually changed to prevent unnecessary re-renders
              if (prev.city === city && prev.state === state && prev.country === 'India') {
                return prev;
              }
              return {
                ...prev,
                city: city || prev.city,
                state: state || prev.state,
                country: 'India'
              };
            });
          }
        }
      } 
      // For US ZIP codes (5 digits)
      else if (cleanPincode.length === 5) {
        // Use country parameter, don't access formData directly
        const currentCountry = country || 'USA';
        if (currentCountry === 'USA' || currentCountry === 'United States' || currentCountry === 'US') {
          try {
            const response = await axios.get(`https://api.zippopotam.us/us/${cleanPincode}`, {
              timeout: 5000
            });
            
            if (response.data && response.data.places && response.data.places.length > 0) {
              const place = response.data.places[0];
              const city = place['place name'] || '';
              const state = place['state'] || '';
              
              if (city || state) {
                setFormData(prev => {
                  // Only update if values actually changed to prevent unnecessary re-renders
                  if (prev.city === city && prev.state === state) {
                    return prev;
                  }
                  return {
                    ...prev,
                    city: city || prev.city,
                    state: state || prev.state
                  };
                });
              }
            }
          } catch (zipError) {
            console.log('Could not fetch US ZIP code data:', zipError);
          }
        }
      }
    } catch (error) {
      // Silently fail - user can still manually enter city and state
      console.log('Could not fetch city/state from pincode:', error);
    } finally {
      setPincodeLoading(false);
      isFetchingPincodeRef.current = false;
    }
  }, []); // No dependencies - we pass all needed values as parameters

  // Watch for zipCode changes and auto-fill city/state - MUST be before early returns
  useEffect(() => {
    if (!formData.zipCode || formData.zipCode.length < 5) {
      return;
    }

    // Don't fetch if we're already fetching
    if (isFetchingPincodeRef.current) {
      return;
    }

    // Clear previous timeout
    if (pincodeTimeoutRef.current) {
      clearTimeout(pincodeTimeoutRef.current);
    }

    // Debounce the API call
    pincodeTimeoutRef.current = setTimeout(() => {
      fetchCityStateFromPincode(formData.zipCode, formData.country);
    }, 500);

    return () => {
      if (pincodeTimeoutRef.current) {
        clearTimeout(pincodeTimeoutRef.current);
      }
    };
  }, [formData.zipCode, formData.country, fetchCityStateFromPincode]);

  // Early returns after all hooks
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    return null; // Will redirect via useEffect
  }

  const hasCompleteProfile = () => {
    return userProfile?.address?.street && 
           userProfile?.address?.city && 
           userProfile?.address?.state && 
           userProfile?.address?.zipCode && 
           userProfile?.address?.country && 
           userProfile?.phoneNumber;
  };

  const validateForm = () => {
    const errors = {};
    // Only validate address fields if user doesn't have a complete profile
    if (!hasCompleteProfile()) {
      if (!formData.street.trim()) errors.street = 'Street address is required';
      if (!formData.city.trim()) errors.city = 'City is required';
      if (!formData.state.trim()) errors.state = 'State is required';
      if (!formData.zipCode.trim()) errors.zipCode = 'Zip code is required';
      if (!formData.country.trim()) errors.country = 'Country is required';
      if (!formData.phoneNumber.trim()) errors.phoneNumber = 'Phone number is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateUserProfile = async () => {
    const token = localStorage.getItem('authToken');
    if (!token) {
      setError('Authentication required. Please login again.');
      navigate('/login');
      return;
    }

    const updateData = {
      address: {
        street: formData.street,
        city: formData.city,
        state: formData.state,
        zipCode: formData.zipCode,
        country: formData.country
      },
      phoneNumber: formData.phoneNumber
    };
    
    try {
      const response = await axios.put(`${baseApiUrl}/api/users/profile`, updateData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      // Update local userProfile state
      if (response.data) {
        setUserProfile(response.data);
        setIsEditingAddress(false);
        setError(''); // Clear any previous errors
        setSuccessMessage('Address updated successfully!');
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
        logger.info('Address updated successfully');
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      if (axiosError.response?.status === 401) {
        setError('Session expired. Please login again.');
        localStorage.removeItem('authToken');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        throw error; // Re-throw to be handled by caller
      }
    }
  };

  const handleSaveAddress = async () => {
    if (!validateForm()) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      await updateUserProfile();
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      setError(axiosError.response?.data?.error || 'Failed to update address');
    }
  };

  /**
   * Handle Place Order Button Click
   * 
   * NEW FLOW (Payment First, Then APIs):
   * 1. User clicks "Complete Order" button
   * 2. Validate form and cart
   * 3. Open Razorpay payment gateway directly (without creating order first)
   * 4. IF payment is successful → Razorpay calls the handler callback
   * 5. THEN → Create Razorpay order API (to register the payment)
   * 6. THEN → Call placeOrder API to create the actual order
   * 
   * IMPORTANT: 
   * - createRazorpayOrder API is ONLY called after successful payment
   * - placeOrder API is ONLY called after successful payment
   * - If user cancels payment or payment fails, NO APIs are called
   */
  const handlePlaceOrder = async () => {
    logger.info('Place Order button clicked - Starting payment flow (payment first, then APIs)');
    
    if (!validateForm()) {
      logger.warn('Form validation failed');
      setError('Please fill in all required fields');
      return;
    }

    // Check if user is authenticated
    const token = localStorage.getItem('authToken');
    if (!token) {
      logger.warn('No auth token found');
      setError('Please login to continue');
      navigate('/login');
      return;
    }

    // Check if cart has items
    if (!cart || !cart.items || cart.items.length === 0) {
      logger.warn('Cart is empty');
      setError('Your cart is empty');
      navigate('/cart');
      return;
    }

    logger.info('Starting payment flow - Payment gateway will open first, APIs called only after success', {
      cartItems: cart.items.length,
      totalAmount: cart.totalAmount
    });

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      // If user has a saved address, use it; otherwise use form data
      let orderData;
      
      if (hasCompleteProfile()) {
        // User has saved address - use it
        orderData = {
          address: {
            street: userProfile.address.street,
            city: userProfile.address.city,
            state: userProfile.address.state,
            zipCode: userProfile.address.zipCode,
            country: userProfile.address.country
          },
          phoneNumber: userProfile.phoneNumber
        };
      } else {
        // User doesn't have saved address - use form data and optionally save it
        // Save the address to profile for future use
        try {
          await updateUserProfile();
        } catch (updateError) {
          logger.warn('Failed to save address to profile, but continuing with order', updateError);
          // Continue with order even if profile update fails
        }
        
        // Use form data for the order
        orderData = {
          address: {
            street: formData.street,
            city: formData.city,
            state: formData.state,
            zipCode: formData.zipCode,
            country: formData.country
          },
          phoneNumber: formData.phoneNumber
        };
      }

      // Calculate total amount with tax
      const totalAmount = (cart.totalAmount * 1.1).toFixed(2);
      const amountInPaise = Math.round(parseFloat(totalAmount) * 100); // Convert to paise

      // Check if Razorpay is loaded - wait a bit if not ready
      let retryCount = 0;
      const maxRetries = 10;
      while (typeof (window as any).Razorpay === 'undefined' && retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 200));
        retryCount++;
      }
      
      if (typeof (window as any).Razorpay === 'undefined') {
        logger.error('Razorpay not loaded after retries', { retryCount });
        setError('Payment gateway is not available. Please refresh the page and try again.');
        setLoading(false);
        return;
      }
      
      logger.info('Razorpay is ready', { retryCount });

      // ============================================
      // STEP 0: Refresh Cart to Ensure Backend Has Latest Cart Data
      // ============================================
      // Backend checks cart before creating Razorpay order
      // We need to ensure cart is synced with backend
      try {
        console.log('🔄 Refreshing cart before creating Razorpay order...');
        console.log('📦 Current cart before refresh:', {
          items: cart?.items?.length || 0,
          totalAmount: cart?.totalAmount || 0
        });
        
        logger.info('Refreshing cart to sync with backend', {
          currentCartItems: cart?.items?.length || 0
        });
        
        // Get fresh cart data directly from API (not from state)
        const freshCartData = await getCartApi();
        const normalizedCart = {
          ...freshCartData,
          items: freshCartData.cartItems || freshCartData.items || [],
          totalAmount: freshCartData.totalPrice || freshCartData.totalAmount || 0,
          totalItems: freshCartData.totalItems || (freshCartData.cartItems || freshCartData.items || []).reduce((sum: number, item: any) => sum + item.quantity, 0)
        };
        
        console.log('✅ Fresh cart data from API:', {
          items: normalizedCart.items.length,
          totalAmount: normalizedCart.totalAmount,
          cartItems: normalizedCart.items
        });
        
        // Verify cart has items
        if (!normalizedCart.items || normalizedCart.items.length === 0) {
          console.error('❌ Cart is empty on backend');
          logger.error('Cart is empty on backend', { normalizedCart });
          setError('Your cart is empty. Please add items to cart before checkout.');
          setLoading(false);
          return;
        }
        
        // Update local cart state
        await refreshCart();
        
        logger.info('Cart verified from backend', { 
          itemCount: normalizedCart.items.length,
          totalAmount: normalizedCart.totalAmount 
        });
      } catch (refreshError) {
        console.error('❌ Failed to refresh cart:', refreshError);
        logger.error('Failed to refresh cart', refreshError);
        
        // If cart fetch fails, check if it's because cart is empty
        const axiosError = refreshError as AxiosError<{ error?: string }>;
        if (axiosError.response?.status === 404 || 
            (axiosError.response?.data?.error && axiosError.response.data.error.includes('empty'))) {
          setError('Your cart is empty. Please add items to cart before checkout.');
          setLoading(false);
          return;
        }
        
        // For other errors, continue - backend will check cart and return error if empty
      }

      // ============================================
      // STEP 1: Create Razorpay Order First (Required for handler to work)
      // ============================================
      // Razorpay requires an order_id for the handler to be called properly
      // We'll create the Razorpay order first, then use it in payment
      let razorpayOrderData: CreateRazorpayOrderResponse | null = null;
      
      try {
        // Generate a unique receipt ID
        const receiptId = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        
        logger.info('Creating Razorpay order before payment', { 
          amount: amountInPaise, 
          currency: 'INR',
          receipt: receiptId,
          address: orderData.address,
          cartItems: cart?.items?.length || 0
        });
        
        console.log('📞 Calling createRazorpayOrder API with:', {
          amount: amountInPaise,
          currency: 'INR',
          receipt: receiptId,
          address: orderData.address,
          phoneNumber: orderData.phoneNumber
        });
        
        // Create Razorpay order with address (required by backend)
        razorpayOrderData = await createRazorpayOrder(
          amountInPaise, 
          'INR', 
          receiptId,
          orderData.address,
          orderData.phoneNumber
        );
        
        console.log('✅ Razorpay order response:', razorpayOrderData);
        console.log('📋 Response keys:', Object.keys(razorpayOrderData || {}));
        
        logger.info('Razorpay order created successfully', { 
          razorpay_order_id: razorpayOrderData?.razorpay_order_id,
          order_id: razorpayOrderData?.order_id,
          amount: razorpayOrderData?.amount,
          currency: razorpayOrderData?.currency,
          fullResponse: razorpayOrderData
        });
      } catch (razorpayOrderError) {
        console.error('❌ Failed to create Razorpay order:', razorpayOrderError);
        logger.error('Failed to create Razorpay order', razorpayOrderError);
        const razorpayAxiosError = razorpayOrderError as AxiosError<{ 
          error?: string; 
          message?: string;
          details?: any;
        }>;
        
        // Log detailed error information
        if (razorpayAxiosError.response) {
          console.error('❌ Razorpay order creation error details:', {
            status: razorpayAxiosError.response.status,
            statusText: razorpayAxiosError.response.statusText,
            data: razorpayAxiosError.response.data,
            headers: razorpayAxiosError.response.headers
          });
          logger.error('Razorpay order creation failed', {
            status: razorpayAxiosError.response.status,
            data: razorpayAxiosError.response.data,
            requestPayload: { 
              amount: amountInPaise, 
              currency: 'INR',
              address: orderData.address
            }
          });
        } else if (razorpayAxiosError.request) {
          console.error('❌ No response received from Razorpay order creation');
          logger.error('No response from Razorpay order creation', razorpayAxiosError.request);
        } else {
          console.error('❌ Error setting up Razorpay order request:', razorpayAxiosError.message);
          logger.error('Error setting up Razorpay order request', razorpayAxiosError.message);
        }
        
        const errorMessage = razorpayAxiosError.response?.data?.error || 
                           razorpayAxiosError.response?.data?.message || 
                           'Failed to initialize payment. Please try again.';
        setError(errorMessage);
        setLoading(false);
        return;
      }

      // Check if we got valid order data
      // Handle both razorpay_order_id and order_id field names
      const orderId = razorpayOrderData?.razorpay_order_id || razorpayOrderData?.order_id;
      
      console.log('🔍 Checking Razorpay order data:', {
        hasData: !!razorpayOrderData,
        orderId,
        orderIdType: typeof orderId,
        allKeys: razorpayOrderData ? Object.keys(razorpayOrderData) : [],
        fullResponse: razorpayOrderData
      });
      
      if (!razorpayOrderData || !orderId) {
        console.error('❌ Invalid Razorpay order data:', {
          razorpayOrderData,
          hasOrderId: !!orderId,
          allFields: razorpayOrderData ? Object.keys(razorpayOrderData) : []
        });
        logger.error('Invalid Razorpay order data', {
          razorpayOrderData,
          hasOrderId: !!orderId
        });
        setError('Payment initialization failed. Invalid response from payment gateway.');
        setLoading(false);
        return;
      }
      
      console.log('✅ Razorpay order validated, proceeding to open payment gateway...');

      // ============================================
      // STEP 2: Open Razorpay Payment Gateway
      // ============================================
      // Now open Razorpay with the order_id we created
      // This ensures the handler will be called properly
      
      // Ensure order_id is a string (Razorpay requires string)
      const orderIdString = String(orderId);
      
      // Ensure amount is a number (Razorpay requires number in paise)
      const finalAmount = Number(razorpayOrderData?.amount || amountInPaise);
      
      console.log('📋 Final Razorpay options values:', {
        key: razorpayOrderData?.key || RAZORPAY_KEY_ID,
        amount: finalAmount,
        amountType: typeof finalAmount,
        currency: razorpayOrderData?.currency || 'INR',
        order_id: orderIdString,
        orderIdType: typeof orderIdString
      });
      
      const options: any = {
        key: razorpayOrderData?.key || RAZORPAY_KEY_ID,
        amount: finalAmount, // Must be number in paise
        currency: razorpayOrderData?.currency || 'INR',
        order_id: orderIdString, // Must be string
        name: 'Luxury Fashion',
        description: `Order for ${cart.totalItems} items`,
        image: 'https://razorpay.com/favicon.png',
        handler: function (response: any) {
          // ============================================
          // STEP 2: Payment Successful - Now Call APIs
          // ============================================
          // This handler is called ONLY when Razorpay payment is successful
          // Razorpay automatically calls this after successful payment
          // NOW we call createRazorpayOrder API and placeOrder API
          // If payment fails or user cancels, this handler is NEVER called
          
          console.log('🎉 Razorpay handler called!', response);
          console.log('📋 Full response object:', JSON.stringify(response, null, 2));
          console.log('📋 Response keys:', Object.keys(response || {}));
          
          // Razorpay response can have fields with or without 'razorpay_' prefix
          // Handle both naming conventions and check all possible field names
          const paymentId = response.razorpay_payment_id || 
                           response.payment_id || 
                           response.razorpayPaymentId ||
                           response.paymentId ||
                           (response.metadata && response.metadata.payment_id) ||
                           '';
          
          const orderId = response.razorpay_order_id || 
                         response.order_id || 
                         response.razorpayOrderId ||
                         response.orderId ||
                         '';
          
          const signature = response.razorpay_signature || 
                           response.signature || 
                           response.razorpaySignature ||
                           '';
          
          logger.info('✅ Razorpay payment successful - Handler called', {
            payment_id: paymentId,
            order_id: orderId,
            signature: signature ? 'present' : 'missing',
            fullResponse: response,
            allKeys: Object.keys(response || {})
          });
          
          console.log('🔍 Extracted fields:', {
            paymentId,
            orderId,
            signature: signature ? 'present' : 'missing',
            allResponseKeys: Object.keys(response || {})
          });
          
          // Validate required fields from Razorpay response
          // paymentId is required, signature is optional (backend will verify)
          if (!paymentId || paymentId.trim() === '') {
            console.error('❌ Missing required payment_id', {
              paymentId,
              signature,
              fullResponse: response,
              allKeys: Object.keys(response || {})
            });
            logger.error('Missing required payment_id', {
              paymentId,
              signature,
              fullResponse: response,
              allKeys: Object.keys(response || {})
            });
            setError('Payment response is incomplete. Please contact support.');
            setLoading(false);
            return;
          }
          
          console.log('✅ Payment ID found, proceeding with order placement...');
          
          // Log warning if signature is missing (backend will verify)
          if (!signature) {
            console.warn('⚠️ Signature missing in response - backend will verify payment', {
              paymentId,
              fullResponse: response
            });
            logger.warn('Signature missing in Razorpay response - backend will verify');
          }
          
          // Execute async operations - wrap in immediate async function
          // Use setTimeout to ensure handler completes and async code runs
          setTimeout(async () => {
            try {
              console.log('🔄 Starting order placement process...');
              setLoading(true);
              
              // ============================================
              // STEP 3: Place Actual Order (AFTER payment success)
              // ============================================
              // THIS IS THE ONLY PLACE WHERE placeOrder API IS CALLED
              // It is ONLY called after successful Razorpay payment
              // We already have the razorpay_order_id from step 1
              
              // Use extracted fields (handle both naming conventions)
              const finalOrderId = orderId || razorpayOrderData.razorpay_order_id;
              
              console.log('📞 About to call placeOrder API...', {
                razorpay_payment_id: paymentId,
                razorpay_order_id: finalOrderId,
                signature: signature ? 'present' : 'missing',
                orderDataKeys: Object.keys(orderData || {})
              });
              
              logger.info('📦 Calling placeOrder API (only after successful payment)', {
                razorpay_payment_id: paymentId,
                razorpay_order_id: finalOrderId
              });
              
              const orderPayload = {
                ...orderData,
                paymentStatus: 'CAPTURED' as const, // Payment is already successful
                paymentMethod: 'razorpay',
                razorpay_order_id: finalOrderId || razorpayOrderData.razorpay_order_id || '',
                razorpay_payment_id: paymentId,
                razorpay_signature: signature || '' // Backend will verify if signature is missing
              };
              
              console.log('📦 Order payload before API call:', JSON.stringify(orderPayload, null, 2));
              
              console.log('📞 Making placeOrder API call now...');
              const orderResponse: PlaceOrderResponse = await placeOrder(orderPayload);

              console.log('✅ Order placed successfully:', orderResponse);
              
              if (orderResponse && orderResponse.order) {
                logger.info('Order placed successfully after payment', { 
                  orderId: orderResponse.order.id || orderResponse.order.orderId 
                });
                
                // Clear cart and redirect
                await refreshCart();
                setSuccessMessage('Payment successful! Order placed.');
                setTimeout(() => {
                  navigate('/orders');
                }, 1500);
              } else {
                throw new Error('Invalid order response structure');
              }
            } catch (error) {
              console.error('❌ Error in order placement:', error);
              console.error('❌ Error details:', {
                message: (error as any)?.message,
                stack: (error as any)?.stack,
                response: (error as any)?.response
              });
              logger.error('Failed to place order after payment', error);
              const axiosError = error as AxiosError<{ error?: string; message?: string }>;
              
              // Log detailed error information for debugging
              if (axiosError.response) {
                console.error('❌ Order placement failed:', {
                  status: axiosError.response.status,
                  statusText: axiosError.response.statusText,
                  data: axiosError.response.data,
                  headers: axiosError.response.headers
                });
                logger.error('Order placement failed', {
                  status: axiosError.response.status,
                  data: axiosError.response.data,
                  headers: axiosError.response.headers
                });
              } else if (axiosError.request) {
                console.error('❌ No response received:', axiosError.request);
                logger.error('No response from server', axiosError.request);
              } else {
                console.error('❌ Error setting up request:', axiosError.message);
                logger.error('Error setting up request', axiosError.message);
              }
              
              if (axiosError.response?.status === 401) {
                setError('Session expired. Please login again.');
                localStorage.removeItem('authToken');
                setTimeout(() => navigate('/login'), 2000);
              } else if (axiosError.response?.status === 400) {
                // Bad Request - show detailed error message
                const errorMessage = axiosError.response.data?.error || 
                                   axiosError.response.data?.message || 
                                   'Failed to place order. Please contact support.';
                setError(errorMessage);
                logger.error('Order placement 400 error details', {
                  responseData: axiosError.response.data
                });
              } else {
                setError(axiosError.response?.data?.error || 
                        axiosError.response?.data?.message || 
                        axiosError.message ||
                        'Failed to place order. Please contact support.');
              }
              setLoading(false);
            }
          }, 100); // Small delay to ensure handler completes
        },
        prefill: {
          name: `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Customer',
          email: user?.email || '',
          contact: orderData.phoneNumber || ''
        },
        theme: {
          color: '#000000'
        },
        modal: {
          ondismiss: function() {
            // ============================================
            // Payment Cancelled/Failed
            // ============================================
            // This is called when user closes the Razorpay modal without completing payment
            // IMPORTANT: placeOrder API is NOT called in this case
            // Order is NOT created if payment is cancelled
            console.log('❌ Razorpay payment modal dismissed by user');
            logger.info('❌ Razorpay payment modal dismissed by user - Order NOT placed');
            setLoading(false);
            setError('Payment cancelled. Order was not placed.');
          }
        },
        // Add callback_url as fallback (optional, but helps with webhook handling)
        callback_url: window.location.origin + '/checkout',
        // Ensure handler is called even if page reloads
        notes: {
          order_notes: 'Order from Luxury Fashion'
        }
      };

      logger.info('Initializing Razorpay checkout', {
        key: options.key,
        amount: options.amount,
        order_id: options.order_id,
        currency: options.currency
      });
      
      console.log('🔧 Razorpay options:', {
        key: options.key,
        amount: options.amount,
        order_id: options.order_id,
        hasHandler: typeof options.handler === 'function',
        razorpayAvailable: typeof (window as any).Razorpay !== 'undefined'
      });
      
      // Verify Razorpay is available before creating instance
      if (typeof (window as any).Razorpay === 'undefined') {
        console.error('❌ Razorpay is not available');
        logger.error('Razorpay is not available when trying to open payment');
        setError('Payment gateway is not loaded. Please refresh the page and try again.');
        setLoading(false);
        return;
      }
      
      try {
        console.log('🔧 Creating Razorpay instance...');
        console.log('📋 Options validation before creating instance:', {
          hasKey: !!options.key,
          hasAmount: typeof options.amount === 'number' && options.amount > 0,
          hasOrderId: !!options.order_id && typeof options.order_id === 'string' && options.order_id.length > 0,
          hasCurrency: !!options.currency,
          hasHandler: typeof options.handler === 'function',
          orderIdValue: options.order_id,
          amountValue: options.amount
        });
        
        // Validate options before creating instance
        if (!options.key || !options.amount || !options.order_id || options.order_id.trim() === '') {
          console.error('❌ Invalid Razorpay options:', options);
          setError('Payment gateway configuration error. Please try again.');
          setLoading(false);
          return;
        }
        
        const rzp1 = new (window as any).Razorpay(options);
        logger.info('Razorpay instance created, opening payment modal...');
        
        // Store handler reference for debugging
        (window as any).__razorpayHandler = options.handler;
        (window as any).__razorpayInstance = rzp1;
        
        console.log('🚀 Opening Razorpay payment modal...');
        console.log('📋 Razorpay instance:', {
          created: !!rzp1,
          hasOpen: typeof rzp1.open === 'function',
          hasOn: typeof rzp1.on === 'function'
        });
        
        // Verify rzp1 has open method
        if (typeof rzp1.open !== 'function') {
          console.error('❌ Razorpay instance does not have open method');
          setError('Payment gateway error. Please refresh the page and try again.');
          setLoading(false);
          return;
        }
        
        // Open payment modal - use setTimeout to ensure it's not blocked by browser
        // Also ensures the instance is fully initialized
        setTimeout(() => {
          try {
            console.log('🔄 Calling rzp1.open() now...');
            rzp1.open();
            console.log('✅ rzp1.open() called - modal should appear');
            logger.info('Razorpay modal opened successfully');
          } catch (openError) {
            console.error('❌ Error calling rzp1.open():', openError);
            setError('Failed to open payment gateway. Please try again.');
            setLoading(false);
          }
        }, 200);
        
        // Add event listeners for debugging
        try {
          rzp1.on('payment.success', function(response: any) {
            console.log('✅ Razorpay payment.success event fired:', response);
          });
          
          rzp1.on('payment.failed', function(response: any) {
            console.error('❌ Razorpay payment.failed event fired:', response);
            setError('Payment failed. Please try again.');
            setLoading(false);
          });
        } catch (eventError) {
          console.warn('⚠️ Could not attach Razorpay event listeners:', eventError);
          // Continue anyway - handler function will still work
        }
        
      } catch (rzpError) {
        console.error('❌ Failed to open Razorpay modal:', rzpError);
        console.error('❌ Error details:', {
          message: (rzpError as any)?.message,
          stack: (rzpError as any)?.stack,
          name: (rzpError as any)?.name
        });
        logger.error('Failed to open Razorpay modal', rzpError);
        setError('Failed to open payment gateway. Please refresh the page and try again.');
        setLoading(false);
        return;
      }
      
      // Don't set loading to false here as payment modal is open
      
    } catch (error) {
      const axiosError = error as AxiosError<{ error?: string }>;
      logger.error('Failed to initialize payment', axiosError);
      if (axiosError.response?.status === 400) {
        setError(axiosError.response.data?.error || 'Validation failed');
      } else {
        setError('Failed to initialize payment. Please try again.');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <div className="pt-20 px-4">
        <div className="max-w-6xl mx-auto py-8">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-light text-gray-900 mb-3 sm:mb-4">Checkout</h1>
            <div className="w-16 sm:w-24 h-0.5 bg-black mx-auto"></div>
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-6 py-4 rounded-r-lg mb-8 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{error}</p>
                </div>
              </div>
            </div>
          )}

          {successMessage && (
            <div className="bg-green-50 border-l-4 border-green-400 text-green-700 px-6 py-4 rounded-r-lg mb-8 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium">{successMessage}</p>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column - Forms */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              {/* Cart Items */}
              <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-gray-50 to-white px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100">
                  <h2 className="text-xl sm:text-2xl font-serif text-gray-900">Order Summary</h2>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">{cart.totalItems} items in your cart</p>
                </div>
                <div className="p-4 sm:p-6 lg:p-8">
                  <div className="space-y-4 sm:space-y-6">
                    {cart.items.map((item) => (
                      <div key={item.id || item.cartItemId} className="group relative bg-gray-50 rounded-lg sm:rounded-xl p-4 sm:p-6 hover:bg-gray-100 transition-all duration-300">
                        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                          <div className="relative overflow-hidden rounded-lg flex-shrink-0">
                            <img
                              src={
                                item.product.imagenames?.[0] 
                                  ? (item.product.imagenames[0].startsWith('http') || item.product.imagenames[0].startsWith('data:')
                                      ? item.product.imagenames[0]
                                      : `http://localhost:8081/uploads/${item.product.imagenames[0]}`)
                                  : '/placeholder.jpg'
                              }
                              alt={item.product.prod_name}
                              className="w-full sm:w-24 h-32 sm:h-24 object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => {
                                if (e.currentTarget.src !== '/placeholder.jpg') {
                                  e.currentTarget.src = '/placeholder.jpg';
                                }
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-base sm:text-lg text-gray-900 mb-1 truncate">{item.product.prod_name}</h3>
                            <p className="text-gray-600 text-xs sm:text-sm mb-2">{item.product.prod_brand}</p>
                            {item.size && (
                              <p className="text-gray-700 text-xs sm:text-sm mb-2 font-medium">
                                Size: <span className="font-semibold">{item.size}</span>
                              </p>
                            )}
                            <p className="text-xl sm:text-2xl font-bold text-gray-900">₹{item.product.selling_price}</p>
                          </div>
                          <div className="flex flex-col items-end justify-between">
                            <button
                              onClick={async () => {
                                try {
                                  const cartItemId = item.cartItemId || item.id;
                                  if (!cartItemId) {
                                    setError('Invalid cart item');
                                    return;
                                  }
                                  await removeItem(cartItemId);
                                } catch (error) {
                                  setError('Failed to remove item');
                                }
                              }}
                              className="text-gray-400 hover:text-red-500 transition-colors p-2 rounded-full hover:bg-red-50"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                            <div className="flex items-center gap-3 bg-white rounded-full px-4 py-2 shadow-sm border">
                              <button
                                onClick={async () => {
                                  try {
                                    const cartItemId = item.cartItemId || item.id;
                                    if (!cartItemId) {
                                      setError('Invalid cart item');
                                      return;
                                    }
                                    await updateQuantity(cartItemId, item.quantity - 1);
                                  } catch (error) {
                                    setError('Failed to update quantity');
                                  }
                                }}
                                className="text-gray-600 hover:text-black transition-colors p-1 rounded-full hover:bg-gray-100"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="font-semibold text-lg min-w-[2rem] text-center">{item.quantity}</span>
                              <button
                                onClick={async () => {
                                  try {
                                    const cartItemId = item.cartItemId || item.id;
                                    if (!cartItemId) {
                                      setError('Invalid cart item');
                                      return;
                                    }
                                    await updateQuantity(cartItemId, item.quantity + 1);
                                  } catch (error) {
                                    setError('Failed to update quantity');
                                  }
                                }}
                                className="text-gray-600 hover:text-black transition-colors p-1 rounded-full hover:bg-gray-100"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <div className="text-right mt-2">
                              <p className="text-xl font-bold text-gray-900">₹{(item.product.selling_price * item.quantity).toFixed(2)}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Shipping Information */}
              {hasCompleteProfile() && !isEditingAddress ? (
                // Display saved address if user has one
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h2 className="text-xl sm:text-2xl font-serif text-gray-900 flex items-center gap-2 sm:gap-3">
                          <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-green-600 flex-shrink-0" />
                          <span>Shipping Address</span>
                        </h2>
                        <p className="text-gray-600 mt-1 text-sm sm:text-base">Your saved delivery address</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsEditingAddress(true);
                          setError(''); // Clear any errors
                          setSuccessMessage(''); // Clear any success messages
                          // Pre-fill form with saved address
                          setFormData({
                            street: userProfile.address.street || '',
                            city: userProfile.address.city || '',
                            state: userProfile.address.state || '',
                            zipCode: userProfile.address.zipCode || '',
                            country: userProfile.address.country || 'USA',
                            phoneNumber: userProfile.phoneNumber || ''
                          });
                        }}
                        className="flex items-center gap-2 px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm sm:text-base w-full sm:w-auto justify-center touch-manipulation"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Edit Address</span>
                      </button>
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="bg-gray-50 rounded-xl p-6 border-2 border-green-100">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-green-100 rounded-full">
                          <MapPin className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="flex-1">
                          <div className="space-y-2">
                            <p className="text-gray-900 font-semibold text-lg">{userProfile.address.street}</p>
                            <p className="text-gray-700">
                              {userProfile.address.city}, {userProfile.address.state} {userProfile.address.zipCode}
                            </p>
                            <p className="text-gray-700">{userProfile.address.country}</p>
                            <p className="text-gray-700 mt-3 pt-3 border-t border-gray-200">
                              <span className="font-semibold">Phone:</span> {userProfile.phoneNumber}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                // Show form if user doesn't have address or is editing
                <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 border-b border-gray-100">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="flex-1">
                        <h2 className="text-xl sm:text-2xl font-serif text-gray-900 flex items-center gap-2 sm:gap-3">
                          <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-blue-600 flex-shrink-0" />
                          <span>{isEditingAddress ? 'Edit Shipping Address' : 'Shipping Information'}</span>
                        </h2>
                        <p className="text-gray-600 mt-1 text-sm sm:text-base">
                          {isEditingAddress ? 'Update your delivery address' : 'Where should we deliver your order?'}
                        </p>
                      </div>
                      {isEditingAddress && (
                        <button
                          onClick={() => {
                            setIsEditingAddress(false);
                            setError(''); // Clear any errors
                            setSuccessMessage(''); // Clear any success messages
                            // Reset form to saved address
                            if (userProfile?.address) {
                              setFormData({
                                street: userProfile.address.street || '',
                                city: userProfile.address.city || '',
                                state: userProfile.address.state || '',
                                zipCode: userProfile.address.zipCode || '',
                                country: userProfile.address.country || 'USA',
                                phoneNumber: userProfile.phoneNumber || ''
                              });
                            }
                          }}
                          className="px-3 sm:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm sm:text-base w-full sm:w-auto touch-manipulation"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-4 sm:p-6 lg:p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Street Address *</label>
                        <input
                          type="text"
                          value={formData.street}
                          onChange={(e) => handleInputChange('street', e.target.value)}
                          className={`w-full border-2 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 touch-manipulation ${
                            validationErrors.street ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                          }`}
                          placeholder="123 Main Street"
                        />
                        {validationErrors.street && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {validationErrors.street}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          City *
                          {formData.city && pincodeLoading && (
                            <span className="ml-2 text-xs text-green-600 font-normal">Auto-filled</span>
                          )}
                        </label>
                        <input
                          type="text"
                          value={formData.city}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          className={`w-full border-2 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 touch-manipulation ${
                            validationErrors.city ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                          }`}
                          placeholder="New York"
                        />
                        {validationErrors.city && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {validationErrors.city}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          State *
                          {formData.state && pincodeLoading && (
                            <span className="ml-2 text-xs text-green-600 font-normal">Auto-filled</span>
                          )}
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          className={`w-full border-2 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 touch-manipulation ${
                            validationErrors.state ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                          }`}
                          placeholder="NY"
                        />
                        {validationErrors.state && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {validationErrors.state}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                          {formData.country === 'India' ? 'Pin Code' : 'ZIP Code'} *
                          {pincodeLoading && (
                            <span className="ml-2 text-xs text-blue-600 font-normal">Looking up...</span>
                          )}
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={formData.zipCode}
                            onChange={(e) => handleInputChange('zipCode', e.target.value)}
                            className={`w-full border-2 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 touch-manipulation ${
                              validationErrors.zipCode ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                            }`}
                            placeholder={formData.country === 'India' ? '110001' : '10001'}
                            maxLength={formData.country === 'India' ? 6 : 10}
                          />
                          {pincodeLoading && (
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            </div>
                          )}
                        </div>
                        {validationErrors.zipCode && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {validationErrors.zipCode}
                          </p>
                        )}
                        {formData.country === 'India' && (
                          <p className="text-xs text-gray-500 mt-1">
                            Enter 6-digit pin code to auto-fill city and state
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">Country *</label>
                        <input
                          type="text"
                          value={formData.country}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          className={`w-full border-2 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 touch-manipulation ${
                            validationErrors.country ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                          }`}
                          placeholder="USA"
                        />
                        {validationErrors.country && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {validationErrors.country}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 sm:mb-3">Phone Number *</label>
                        <input
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                          className={`w-full border-2 rounded-lg sm:rounded-xl px-3 sm:px-4 py-2.5 sm:py-3 text-base sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-300 touch-manipulation ${
                            validationErrors.phoneNumber ? 'border-red-400 bg-red-50' : 'border-gray-200 focus:border-blue-400'
                          }`}
                          placeholder="+1 (555) 123-4567"
                        />
                        {validationErrors.phoneNumber && (
                          <p className="text-red-500 text-sm mt-2 flex items-center gap-2">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {validationErrors.phoneNumber}
                          </p>
                        )}
                      </div>
                      
                      {/* Save Address Button (when editing) */}
                      {isEditingAddress && (
                        <div className="md:col-span-2 flex justify-end mt-4">
                          <button
                            onClick={handleSaveAddress}
                            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm sm:text-base touch-manipulation w-full sm:w-auto"
                          >
                            Save Address
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Information */}
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 px-8 py-6 border-b border-gray-100">
                  <h2 className="text-2xl font-serif text-gray-900 flex items-center gap-3">
                    <CreditCard className="w-6 h-6 text-green-600" />
                    Payment
                  </h2>
                  <p className="text-gray-600 mt-1">Secure payment via Razorpay</p>
                </div>
                <div className="p-8">
                  <div className="bg-gray-50 rounded-xl p-6 border-2 border-green-100">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-100 rounded-full">
                        <Shield className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <span className="text-lg font-semibold text-gray-900">Secure Payment Gateway</span>
                        <p className="text-gray-600 text-sm mt-1">Your payment is secured with 256-bit SSL encryption</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden sticky top-8">
                <div className="bg-gradient-to-r from-gray-900 to-black px-8 py-6 text-white">
                  <h2 className="text-2xl font-serif">Order Total</h2>
                  <p className="text-gray-300 mt-1">Review your purchase</p>
                </div>
                
                {/* Customer Info */}
                <div className="p-6 border-b border-gray-100">
                  <h3 className="font-semibold text-gray-900 mb-3">Customer Details</h3>
                  <div className="space-y-2">
                    <p className="text-gray-700 font-medium">{user?.firstName} {user?.lastName}</p>
                    <p className="text-gray-600 text-sm">{user?.email}</p>
                  </div>
                </div>

                <div className="p-6">
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Subtotal ({cart.totalItems} items)</span>
                      <span className="font-semibold text-lg">₹{cart.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Shipping</span>
                      <span className="text-green-600 font-semibold">Free</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-700">Tax</span>
                      <span className="font-semibold">₹{(cart.totalAmount * 0.1).toFixed(2)}</span>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xl font-bold text-gray-900">Total</span>
                        <span className="text-2xl font-bold text-gray-900">₹{(cart.totalAmount * 1.1).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Security Features */}
                  <div className="mb-6 space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="p-2 bg-green-100 rounded-full">
                        <Shield className="w-4 h-4 text-green-600" />
                      </div>
                      <span>256-bit SSL Encryption</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-600">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <Truck className="w-4 h-4 text-blue-600" />
                      </div>
                      <span>Free Express Shipping</span>
                    </div>
                  </div>

          <button
            onClick={handlePlaceOrder}
            disabled={loading || !razorpayReady || (!hasCompleteProfile() && (!formData.street || !formData.city || !formData.state || !formData.zipCode || !formData.country || !formData.phoneNumber))}
            className="w-full bg-gradient-to-r from-black to-gray-800 text-white py-3 sm:py-4 px-4 sm:px-6 rounded-lg sm:rounded-xl font-semibold text-base sm:text-lg hover:from-gray-800 hover:to-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg touch-manipulation"
          >
                    {loading ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : !razorpayReady ? (
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Loading Payment Gateway...
                      </div>
                    ) : (
                      'Complete Order'
                    )}
                  </button>
                  
                  {!razorpayReady && !loading && (
                    <p className="text-xs text-amber-600 mt-2 text-center">
                      Please wait while we load the payment gateway...
                    </p>
                  )}

                  <p className="text-xs text-gray-500 mt-4 text-center leading-relaxed">
                    By placing your order, you agree to our terms and conditions. Your payment information is secure and encrypted.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;