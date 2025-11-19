import React from 'react';
import { Minus, Plus, Trash2, ShoppingBag, ArrowLeft, Shield } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Cart: React.FC = () => {
  const { cart, isLoading, updateQuantity, removeItem, clearCartItems, refreshCart } = useCart();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  // Fetch cart when component mounts
  React.useEffect(() => {
    console.log('Cart useEffect - isAuthenticated:', isAuthenticated, 'authLoading:', authLoading);
    if (isAuthenticated && !authLoading) {
      console.log('Calling refreshCart...');
      refreshCart();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, authLoading, refreshCart]); // Always refresh when authenticated

  // Wait for auth check to complete before showing login screen
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 px-4 transition-colors duration-200">
        <div className="max-w-4xl mx-auto py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-light">Loading...</p>
        </div>
      </div>
    );
  }

  console.log('Cart render - authLoading:', authLoading, 'isAuthenticated:', isAuthenticated, 'cart:', !!cart);
  
  if (!isAuthenticated) {
    console.log("no login");
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 px-4 transition-colors duration-200">
        <div className="max-w-4xl mx-auto text-center py-16">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-8 sm:p-12 rounded-lg shadow-lg slide-up">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-6 animate-pulse" />
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-black dark:text-white mb-4">Welcome Back</h2>
            <div className="w-16 h-0.5 bg-black dark:bg-white mx-auto mb-6"></div>
            <p className="text-gray-600 dark:text-gray-400 font-light text-base sm:text-lg mb-8">Sign in to access your cart</p>
            <button
              onClick={() => navigate('/login')}
              className="bg-black dark:bg-white text-white dark:text-black px-8 py-4 hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 font-medium rounded-lg active:scale-95 touch-manipulation shadow-lg hover:shadow-xl"
            >
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 px-4 transition-colors duration-200">
        <div className="max-w-4xl mx-auto py-16 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400 font-light">Loading cart...</p>
        </div>
      </div>
    );
  }

  const cartItems = cart?.items || cart?.cartItems || [];
  
  if (!cart || cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 px-4 transition-colors duration-200">
        <div className="max-w-4xl mx-auto text-center py-16">
          <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 p-8 sm:p-12 rounded-lg shadow-lg slide-up">
            <ShoppingBag className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-500 mb-6 animate-pulse" />
            <h2 className="text-3xl sm:text-4xl font-serif font-medium text-black dark:text-white mb-4">Your cart is empty</h2>
            <div className="w-16 h-0.5 bg-black dark:bg-white mx-auto mb-6"></div>
            <p className="text-gray-600 dark:text-gray-400 font-light text-base sm:text-lg mb-8">Discover our curated collection</p>
            <button
              onClick={() => navigate('/shop')}
              className="bg-black dark:bg-white text-white dark:text-black px-8 py-4 hover:bg-gray-800 dark:hover:bg-gray-200 transition-all duration-300 font-medium rounded-lg active:scale-95 touch-manipulation shadow-lg hover:shadow-xl"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  const handleQuantityChange = async (cartItemId: number, newQuantity: number) => {
    try {
      await updateQuantity(cartItemId, newQuantity);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const handleRemoveItem = async (cartItemId: number) => {
    try {
      await removeItem(cartItemId);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCartItems();
      } catch (error) {
        console.error('Failed to clear cart:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20 px-4">
      <div className="max-w-4xl mx-auto py-8">
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center space-x-2 text-gray-600 hover:text-black transition-colors mb-6 group"
          >
            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-light">Continue Shopping</span>
          </button>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif font-medium text-black mb-2">Shopping Cart</h1>
              <div className="w-12 sm:w-16 h-0.5 bg-black mb-3 sm:mb-4"></div>
              <p className="text-gray-600 font-light text-sm sm:text-base">{cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}</p>
            </div>
            <button
              onClick={handleClearCart}
              className="text-red-600 hover:text-red-800 text-xs sm:text-sm font-light border-b border-red-200 hover:border-red-600 transition-colors touch-manipulation"
            >
              Clear Cart
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item) => {
              console.log('Cart item product:', item.product.prod_name, 'imagenames:', item.product.imagenames);
              return (
              <div key={item.id || item.cartItemId} className="bg-white border border-gray-100 p-4 sm:p-6 hover:shadow-lg transition-shadow duration-300 rounded-lg">
                <div className="flex flex-col sm:flex-row gap-4">
                  <img
                    src={item.product.imagenames?.[0] || '/placeholder.jpg'}
                    alt={item.product.prod_name}
                    className="w-full sm:w-24 h-40 sm:h-24 object-cover rounded-lg"
                    onError={(e) => {
                      console.log('Image failed to load for:', item.product.prod_name, 'src:', item.product.imagenames?.[0]);
                      e.currentTarget.src = '/placeholder.jpg';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif text-base sm:text-lg font-medium text-black mb-1 truncate">{item.product.prod_name}</h3>
                    <p className="text-gray-600 font-light text-xs sm:text-sm mb-2">{item.product.prod_brand}</p>
                    {item.size && (
                      <p className="text-gray-700 font-medium text-xs sm:text-sm mb-2">
                        Size: <span className="font-semibold">{item.size}</span>
                      </p>
                    )}
                    <p className="text-lg sm:text-xl font-medium text-black">₹{item.product.selling_price}</p>
                  </div>
                  <div className="flex items-center justify-between sm:justify-start gap-4">
                    <div className="flex items-center border border-gray-200 rounded-lg">
                      <button
                        onClick={() => {
                          const cartItemId = item.cartItemId || item.id;
                          if (!cartItemId) {
                            console.error('No cartItemId found for item:', item);
                            return;
                          }
                          handleQuantityChange(cartItemId, item.quantity - 1);
                        }}
                        className="p-2 sm:p-2.5 hover:bg-gray-50 transition-colors touch-manipulation"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="w-10 sm:w-12 text-center font-medium text-sm sm:text-base">{item.quantity}</span>
                      <button
                        onClick={() => {
                          const cartItemId = item.cartItemId || item.id;
                          if (!cartItemId) {
                            console.error('No cartItemId found for item:', item);
                            return;
                          }
                          handleQuantityChange(cartItemId, item.quantity + 1);
                        }}
                        className="p-2 sm:p-2.5 hover:bg-gray-50 transition-colors touch-manipulation"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => {
                        const cartItemId = item.cartItemId || item.id;
                        if (!cartItemId) {
                          console.error('No cartItemId found for item:', item);
                          return;
                        }
                        handleRemoveItem(cartItemId);
                      }}
                      className="p-2 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );})}
          </div>

          <div className="bg-white border border-gray-100 p-4 sm:p-6 h-fit lg:sticky lg:top-4 rounded-lg">
            <h2 className="text-xl sm:text-2xl font-serif font-medium text-black mb-2">Order Summary</h2>
            <div className="w-12 sm:w-16 h-0.5 bg-black mb-4 sm:mb-6"></div>
            
            <div className="space-y-3 mb-4 sm:mb-6">
              <div className="flex justify-between items-center text-sm sm:text-base">
                <span className="text-gray-600 font-light">Items ({cart.totalItems || cartItems.reduce((sum, item) => sum + item.quantity, 0)})</span>
                <span className="font-medium">₹{(cart.totalAmount || cart.totalPrice || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm">
                <span className="text-gray-600 font-light">Shipping</span>
                <span className="font-light">Free</span>
              </div>
              <div className="border-t border-gray-200 pt-3">
                <div className="flex justify-between items-center">
                  <span className="text-base sm:text-lg font-medium">Total</span>
                  <span className="text-lg sm:text-xl font-medium text-black">
                    ₹{(cart.totalAmount || cart.totalPrice || 0).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-black text-white py-3 sm:py-4 hover:bg-gray-800 transition-colors duration-300 font-medium mb-4 text-sm sm:text-base touch-manipulation rounded-lg"
            >
              Proceed to Checkout
            </button>
            
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                <Shield className="w-3 h-3" />
                <span>SECURE CHECKOUT</span>
              </div>
              <p className="text-xs text-gray-400 font-light">Free shipping • 30-day returns</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;