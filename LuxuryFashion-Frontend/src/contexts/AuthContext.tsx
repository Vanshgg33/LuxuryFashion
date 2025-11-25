import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { validateToken, type ValidateTokenResponse } from '../api/LoginRegisterApi';
import { logger } from '../utils/logger';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, userData: User) => void;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: () => {},
  logout: () => {},
  checkAuth: async () => {},
});

export const useAuth = () => {
  return useContext(AuthContext);
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Helper function to save user to localStorage
  const saveUserToStorage = (userData: User) => {
    try {
      localStorage.setItem('userData', JSON.stringify(userData));
    } catch (error) {
      logger.warn('Failed to save user data to localStorage', error);
    }
  };

  // Helper function to load user from localStorage
  const loadUserFromStorage = (): User | null => {
    try {
      const stored = localStorage.getItem('userData');
      if (stored) {
        return JSON.parse(stored) as User;
      }
    } catch (error) {
      logger.warn('Failed to load user data from localStorage', error);
    }
    return null;
  };

  const login = (token: string, userData: User) => {
    // Remove token from sessionStorage if it exists (migrate to localStorage)
    if (typeof window !== 'undefined' && window.sessionStorage) {
      const sessionToken = window.sessionStorage.getItem('authToken');
      if (sessionToken) {
        logger.debug('Removing token from sessionStorage, migrating to localStorage');
        window.sessionStorage.removeItem('authToken');
      }
    }
    
    // Store token and user data in localStorage (not sessionStorage)
    localStorage.setItem('authToken', token);
    saveUserToStorage(userData);
    setUser(userData);
  };

  const logout = () => {
    // Remove token and user data from both localStorage and sessionStorage
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    if (typeof window !== 'undefined' && window.sessionStorage) {
      window.sessionStorage.removeItem('authToken');
    }
    setUser(null);
  };

  const checkAuth = async () => {
    // Check for token in localStorage first
    let token = localStorage.getItem('authToken');
    
    // If not in localStorage, check sessionStorage and migrate to localStorage
    if (!token && typeof window !== 'undefined' && window.sessionStorage) {
      const sessionToken = window.sessionStorage.getItem('authToken');
      if (sessionToken) {
        logger.debug('Migrating token from sessionStorage to localStorage');
        window.sessionStorage.removeItem('authToken');
        localStorage.setItem('authToken', sessionToken);
        token = sessionToken;
      }
    }
    
    logger.debug('Checking auth, token exists', { hasToken: !!token, tokenLength: token?.length });
    
    // Restore user from localStorage immediately (optimistic restore) - don't block render
    const storedUser = loadUserFromStorage();
    if (storedUser) {
      logger.debug('Restoring user from localStorage', { userId: storedUser.id, email: storedUser.email });
      setUser(storedUser);
      setIsLoading(false); // Allow UI to render immediately with cached user
    } else if (!token) {
      logger.debug('No token found, user not authenticated');
      // Clear any stale user data
      localStorage.removeItem('userData');
      setIsLoading(false);
      return;
    } else {
      // Token exists but no stored user - still allow render, validate in background
      setIsLoading(false);
    }

    // Validate token with backend in the background (non-blocking)
    if (!token) {
      return;
    }

    try {
      logger.debug('Validating token with backend');
      const response: ValidateTokenResponse = await validateToken();
      
      logger.debug('Token validation response', { message: response.message, hasUser: !!response.user });
      
      // Check if message contains "Token valid" (not exact match, as backend might return "Token valid for user: ...")
      const isTokenValid = response.message && response.message.toLowerCase().includes('token valid');
      
      if (isTokenValid && response.user) {
        const userData = response.user.user || response.user;
        
        if (typeof userData === 'object' && userData !== null && 'name' in userData && 'email' in userData && 'id' in userData) {
          const user = userData as { id: number | string; email: string; name: string; role?: string };
          const [firstName, ...lastNameParts] = user.name.split(' ');
          const userObj = {
            id: user.id.toString(),
            email: user.email,
            firstName: firstName,
            lastName: lastNameParts.join(' '),
            role: user.role
          };
          // Update user state and localStorage with fresh data from backend
          saveUserToStorage(userObj);
          setUser(userObj);
          logger.debug('User restored from token validation', { userId: userObj.id, email: userObj.email });
        } else {
          logger.warn('Invalid user data structure in token validation response', userData);
          // If validation response is invalid but we have stored user, keep it
          if (!storedUser) {
            logout();
          }
        }
      } else {
        logger.warn('Token validation response invalid', { message: response.message, hasUser: !!response.user });
        // If validation fails but we have stored user and token, keep user logged in
        // This handles cases where backend message format changed but token is still valid
        if (!storedUser) {
          logger.debug('No stored user and validation failed, logging out');
          logout();
        }
      }
    } catch (error) {
      logger.error('Token validation failed', error);
      // Only logout if it's an authentication error (401, 403), not network errors
      const errorStatus = (error as any)?.response?.status;
      if (errorStatus === 401 || errorStatus === 403) {
        logger.debug('Authentication error, logging out');
        logout();
      } else {
        // For other errors (network, etc.), keep the user logged in if we have stored data
        // This prevents users from being logged out due to temporary network issues
        if (!storedUser) {
          logger.warn('Token validation error (non-auth) and no stored user', error);
        } else {
          logger.debug('Token validation error (non-auth), keeping user logged in with stored data', error);
        }
      }
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);



  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};