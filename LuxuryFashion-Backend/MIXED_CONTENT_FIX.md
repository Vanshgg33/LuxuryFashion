# Mixed Content Error Fix Guide

## Problem
You're seeing a **mixed-content error** when trying to login:
```
login (blocked:mixed-content) xhr
```

This happens when:
- Your frontend is served over **HTTPS** (e.g., `https://www.rangeelaboutique.com`)
- Your frontend tries to make requests to a **HTTP** backend (e.g., `http://localhost:8081`)
- Modern browsers **block** HTTP requests from HTTPS pages for security

## Solutions

### Solution 1: Use HTTPS Backend in Production (Recommended)

If your frontend is HTTPS, your backend must also be HTTPS.

1. **Configure SSL/TLS certificate** for your backend domain
2. **Update backend URL** in frontend to use HTTPS:
   ```typescript
   const API_BASE_URL = 'https://api.rangeelaboutique.com'; // HTTPS
   ```
3. **Set environment variable** for production:
   ```bash
   COOKIE_SECURE=true
   COOKIE_SAME_SITE=None
   BACKEND_URL=https://api.rangeelaboutique.com
   ```

### Solution 2: Use HTTP in Development

For local development, ensure both frontend and backend use HTTP:

1. **Frontend** should run on HTTP (not HTTPS):
   ```bash
   # Vite default is HTTP, which is correct
   npm run dev  # Runs on http://localhost:5173
   ```

2. **Backend** runs on HTTP:
   ```bash
   # Already configured for http://localhost:8081
   ```

3. **Environment variables** for development:
   ```bash
   COOKIE_SECURE=false
   COOKIE_SAME_SITE=Lax
   BACKEND_URL=http://localhost:8081
   ```

### Solution 3: Use a Reverse Proxy (Production)

If you can't enable HTTPS directly on the backend, use a reverse proxy:

1. **Nginx/Apache** in front of your backend
2. **SSL termination** at the proxy level
3. Proxy forwards to HTTP backend internally

Example Nginx config:
```nginx
server {
    listen 443 ssl;
    server_name api.rangeelaboutique.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Configuration Changes Made

The backend has been updated to support dynamic cookie configuration:

### application.properties
```properties
# Cookie security: true for HTTPS, false for HTTP (localhost)
app.cookie.secure=${COOKIE_SECURE:false}
app.cookie.same-site=${COOKIE_SAME_SITE:Lax}
```

### AuthController
- Now uses `app.cookie.secure` property (defaults to `false` for development)
- Now uses `app.cookie.same-site` property (defaults to `Lax` for development)

### Production Configuration
The `application-production.properties` already has:
```properties
app.cookie.secure=true
app.cookie.same-site=None
```

## Quick Fix for Current Issue

If you're in production and seeing this error:

1. **Check your frontend API URL** - it should be HTTPS:
   ```typescript
   // ❌ Wrong
   const API_BASE_URL = 'http://api.rangeelaboutique.com';
   
   // ✅ Correct
   const API_BASE_URL = 'https://api.rangeelaboutique.com';
   ```

2. **Set environment variables** on your backend:
   ```bash
   export COOKIE_SECURE=true
   export COOKIE_SAME_SITE=None
   export BACKEND_URL=https://api.rangeelaboutique.com
   ```

3. **Restart your backend** to apply changes

## Testing

### Development (HTTP)
```bash
# Frontend
http://localhost:5173

# Backend  
http://localhost:8081

# Environment
COOKIE_SECURE=false
COOKIE_SAME_SITE=Lax
```

### Production (HTTPS)
```bash
# Frontend
https://www.rangeelaboutique.com

# Backend
https://api.rangeelaboutique.com

# Environment
COOKIE_SECURE=true
COOKIE_SAME_SITE=None
```

## Additional Notes

- **SameSite=None** requires **Secure=true** (HTTPS only)
- **SameSite=Lax** works with both HTTP and HTTPS
- Browsers will **always block** HTTP requests from HTTPS pages
- This is a **browser security feature**, not a bug

## Need Help?

If you're still experiencing issues:
1. Check browser console for exact error message
2. Verify frontend API base URL matches backend protocol (HTTP/HTTPS)
3. Check network tab to see if requests are being blocked
4. Verify CORS configuration allows your frontend origin

