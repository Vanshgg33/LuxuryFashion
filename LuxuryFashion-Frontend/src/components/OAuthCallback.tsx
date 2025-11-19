import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getOAuthUser } from '../api/LoginRegisterApi';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { logger } from '../utils/logger';

const OAuthCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login } = useAuth();
  const { refreshCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const token = searchParams.get('token');
        const email = searchParams.get('email');

        if (!token) {
          setError('No token received from OAuth');
          logger.error('OAuth callback: No token in URL');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        logger.info('OAuth callback: Token received', { hasToken: !!token, email });

        // Remove token from sessionStorage if it exists (migrate to localStorage)
        if (typeof window !== 'undefined' && window.sessionStorage) {
          const sessionToken = window.sessionStorage.getItem('authToken');
          if (sessionToken) {
            logger.info('OAuth callback: Removing token from sessionStorage');
            window.sessionStorage.removeItem('authToken');
          }
        }

        // Store token in localStorage (not sessionStorage)
        localStorage.setItem('authToken', token);

        // Get user data and cart from backend
        const response = await getOAuthUser(token);

        logger.info('OAuth callback: User data received', { hasUser: !!response.user, hasCart: !!response.cart });

        const { user: userData, cart: cartData, token: jwtToken } = response;

        if (!userData) {
          throw new Error('No user data received from server');
        }

        // Format user data for AuthContext
        const [firstName, ...lastNameParts] = (userData.name || userData.email || 'User').split(' ');
        const user = {
          id: userData.id?.toString() || '',
          email: userData.email || email || '',
          firstName: firstName || 'User',
          lastName: lastNameParts.join(' ') || '',
          role: userData.role || 'USER'
        };

        // Store the final token (use jwtToken from response if available, otherwise use token from URL)
        const finalToken = jwtToken || token;
        
        // Ensure token is stored in localStorage before updating context
        localStorage.setItem('authToken', finalToken);
        
        // Verify token was stored
        const storedToken = localStorage.getItem('authToken');
        if (!storedToken || storedToken !== finalToken) {
          logger.error('OAuth callback: Token storage verification failed');
          throw new Error('Failed to store authentication token');
        }
        
        logger.info('OAuth callback: Token stored successfully', { tokenLength: finalToken.length });
        
        // Update auth context with the token and user data
        login(finalToken, user);
        
        // Verify user is set in context
        logger.info('OAuth callback: User context updated', { userId: user.id, email: user.email });

        // Show success message about checking email for password
        setSuccessMessage('Please check your email for your password.');
        setSuccess(true);
        setLoading(false);

        // Update cart if available
        if (cartData) {
          // Cart will be refreshed automatically by CartContext when isAuthenticated becomes true
          // But we can also set it directly if needed
          setTimeout(() => {
            refreshCart().catch(err => {
              logger.warn('Failed to refresh cart after OAuth login', err);
            });
          }, 500);
        } else {
          // Refresh cart anyway to get empty cart or existing cart
          setTimeout(() => {
            refreshCart().catch(err => {
              logger.warn('Failed to refresh cart after OAuth login', err);
            });
          }, 500);
        }

        // Wait a moment to show success message, then redirect to home page
        logger.info('OAuth callback: Login successful, redirecting to home');
        setTimeout(() => {
          navigate('/');
        }, 3000);

      } catch (err: any) {
        logger.error('OAuth callback error', err);
        const errorMessage = err.response?.data?.error || 
                            err.response?.data?.message || 
                            err.message || 
                            'Failed to complete login';
        setError(errorMessage);
        
        // Clear invalid token
        localStorage.removeItem('authToken');
        
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  if (loading && !success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <h2 className="text-2xl font-serif font-medium text-black mb-2">Completing login...</h2>
          <p className="text-gray-600">Please wait while we set up your account.</p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-green-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif font-medium text-black mb-2">Login Successful!</h2>
          <p className="text-gray-700 mb-2 font-medium">{successMessage}</p>
          <p className="text-sm text-gray-500">Redirecting to home page...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-serif font-medium text-black mb-2">Login Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">Redirecting to login page...</p>
        </div>
      </div>
    );
  }

  return null;
};

export default OAuthCallback;

