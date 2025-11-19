# OAuth Login Frontend Integration Guide

## Overview
After OAuth login through Google, the backend now:
1. ✅ Checks if user exists in database
2. ✅ Creates new user if doesn't exist
3. ✅ Returns JWT token in URL redirect
4. ✅ Provides endpoint to get user data + cart

---

## OAuth Flow

### Step 1: Initiate OAuth Login
```typescript
// Redirect user to Google OAuth
const handleGoogleLogin = () => {
  window.location.href = 'http://localhost:8081/oauth2/authorization/google';
};
```

### Step 2: Handle OAuth Callback
After Google authentication, backend redirects to:
```
http://localhost:5173/oauth/callback?token=JWT_TOKEN&email=user@example.com
```

### Step 3: Extract Token and Get User Data
```typescript
// OAuthCallback.tsx or similar component
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from './api';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (token) {
      // Store token in localStorage (NOT sessionStorage)
      localStorage.setItem('authToken', token);
      
      // Get user data and cart
      fetchUserData(token);
    } else {
      navigate('/login');
    }
  }, []);

  const fetchUserData = async (token: string) => {
    try {
      const response = await api.get('/auth/oauth/user', {
        params: { token },
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const { user, cart, token: jwtToken } = response.data;

      // Store in context/state
      setUser(user);
      setCart(cart);
      setToken(jwtToken);

      // Redirect to shop
      navigate('/shop');
    } catch (error) {
      console.error('Failed to get user data:', error);
      navigate('/login');
    }
  };

  return <div>Processing login...</div>;
};
```

---

## API Endpoints

### 1. OAuth User Data Endpoint
**GET/POST** `/auth/oauth/user`

**Query Parameters (GET):**
- `token` (optional): JWT token from OAuth redirect

**Headers (POST):**
- `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "OAuth login successful",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "USER",
    "gender": "UNKNOWN",
    "phoneNumber": null,
    "address": {...}
  },
  "cart": {
    "id": 1,
    "cartItems": [
      {
        "id": 1,
        "product": {...},
        "quantity": 2,
        "price": 1999.00,
        "size": "M"
      }
    ],
    "totalPrice": 3998.00
  }
}
```

---

## Complete Frontend Implementation

### 1. OAuth Callback Route
```typescript
// App.tsx or Router setup
import { Route, Routes } from 'react-router-dom';
import OAuthCallback from './pages/OAuthCallback';

<Routes>
  <Route path="/oauth/callback" element={<OAuthCallback />} />
  {/* other routes */}
</Routes>
```

### 2. OAuth Callback Component
```typescript
// pages/OAuthCallback.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const OAuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { setUser, setToken } = useAuth();
  const { setCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOAuthCallback = async () => {
      try {
        const token = searchParams.get('token');
        
        if (!token) {
          setError('No token received from OAuth');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        // Store token in localStorage (NOT sessionStorage)
        localStorage.setItem('authToken', token);

        // Get user data and cart
        const response = await api.get('/auth/oauth/user', {
          params: { token },
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        const { user, cart, token: jwtToken } = response.data;

        // Update context/state
        setUser(user);
        setToken(jwtToken);
        if (cart) {
          setCart(cart);
        }

        // Store token in localStorage (NOT sessionStorage)
        localStorage.setItem('authToken', jwtToken);

        // Redirect to shop
        navigate('/shop');
      } catch (err: any) {
        console.error('OAuth callback error:', err);
        setError(err.response?.data?.error || 'Failed to complete login');
        setTimeout(() => navigate('/login'), 3000);
      } finally {
        setLoading(false);
      }
    };

    handleOAuthCallback();
  }, [searchParams, navigate, setUser, setToken, setCart]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Completing login...</h2>
        <p>Please wait while we set up your account.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Login Error</h2>
        <p>{error}</p>
        <p>Redirecting to login page...</p>
      </div>
    );
  }

  return null;
};

export default OAuthCallback;
```

### 3. Google Login Button
```typescript
// components/GoogleLoginButton.tsx
const GoogleLoginButton = () => {
  const handleGoogleLogin = () => {
    // Redirect to backend OAuth endpoint
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:8081'}/oauth2/authorization/google`;
  };

  return (
    <button 
      onClick={handleGoogleLogin}
      style={{
        padding: '10px 20px',
        backgroundColor: '#4285F4',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '10px'
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18">
        {/* Google icon SVG */}
      </svg>
      Sign in with Google
    </button>
  );
};
```

### 4. Update API Service
```typescript
// services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8081',
  withCredentials: true, // Important for cookies
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
```

---

## Key Points

1. **Token Storage**: Token is passed in URL after OAuth, then stored in **localStorage** (NOT sessionStorage). Always use `localStorage.setItem('authToken', token)` and `localStorage.getItem('authToken')` for OAuth tokens.
2. **User Data**: Call `/auth/oauth/user` to get complete user data + cart
3. **Cart Data**: Cart is automatically included in OAuth user response
4. **Existing Users**: If email exists, user data and cart are returned
5. **New Users**: New user is created automatically, cart will be empty initially

---

## Testing

1. Click "Sign in with Google"
2. Complete Google authentication
3. Should redirect to `/oauth/callback?token=...&email=...`
4. Frontend extracts token and calls `/auth/oauth/user`
5. User data and cart are loaded
6. Redirect to `/shop`

---

## Error Handling

```typescript
try {
  const response = await api.get('/auth/oauth/user', { params: { token } });
  // Success
} catch (error: any) {
  if (error.response?.status === 401) {
    // Invalid token - redirect to login
    navigate('/login');
  } else {
    // Other error - show message
    setError(error.response?.data?.error || 'Login failed');
  }
}
```

---

## Security Notes

- Token is passed in URL temporarily (only during redirect)
- Token is immediately stored in **localStorage** (NOT sessionStorage) for persistence across browser sessions
- All subsequent API calls use Authorization header
- Cookie is also set by backend for additional security

## Important: Token Storage

⚠️ **Always use localStorage for OAuth tokens, NOT sessionStorage:**
- `localStorage.setItem('authToken', token)` - persists across browser sessions
- `sessionStorage.setItem('authToken', token)` - cleared when browser tab closes (DO NOT USE)

