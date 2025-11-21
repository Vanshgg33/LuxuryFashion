# CORS Issue Fix Guide

## Problem
You're experiencing CORS (Cross-Origin Resource Sharing) errors when making requests from your frontend to the backend.

## Common CORS Error Messages
- `Access to XMLHttpRequest has been blocked by CORS policy`
- `No 'Access-Control-Allow-Origin' header is present`
- `The request client is not a secure context`
- `Credentials flag is 'true', but the 'Access-Control-Allow-Origin' header is '*'`

## Root Causes

### 1. **Wildcard with Credentials** (Most Common)
When `allowCredentials(true)` is set, you **CANNOT** use wildcard `"*"` for allowed origins. Browsers will reject this for security reasons.

**Solution:** Specify exact origins in `application.properties`:
```properties
app.cors.allowed-origins=http://localhost:5173,https://www.rangeelaboutique.com
```

### 2. **Missing Frontend URL**
Your frontend URL might not be in the allowed origins list.

**Solution:** Check that `app.frontend.url` matches your actual frontend URL.

### 3. **Protocol Mismatch**
HTTP frontend trying to access HTTPS backend (or vice versa) can cause issues.

**Solution:** Ensure both use the same protocol in the same environment.

## Configuration

### application.properties
```properties
# Frontend URL (must match your actual frontend URL)
app.frontend.url=${FRONTEND_URL:http://localhost:5173}

# CORS Allowed Origins (comma-separated, no wildcards when credentials=true)
app.cors.allowed-origins=${ALLOWED_ORIGINS:http://localhost:5173,https://www.rangeelaboutique.com}
```

### Environment Variables
```bash
# Development
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000

# Production
FRONTEND_URL=https://www.rangeelaboutique.com
ALLOWED_ORIGINS=https://www.rangeelaboutique.com,https://rangeelaboutique.com
```

## Quick Fixes

### Fix 1: Add Your Frontend URL
1. Check your frontend URL (check browser address bar)
2. Add it to `application.properties`:
   ```properties
   app.cors.allowed-origins=http://localhost:5173,https://your-frontend-domain.com
   ```
3. Restart backend

### Fix 2: Check Protocol Match
- **Development:** Both should be HTTP
  - Frontend: `http://localhost:5173`
  - Backend: `http://localhost:8081`
- **Production:** Both should be HTTPS
  - Frontend: `https://www.rangeelaboutique.com`
  - Backend: `https://api.rangeelaboutique.com`

### Fix 3: Verify No Wildcards
❌ **Wrong:**
```java
config.setAllowedOriginPatterns(List.of("*")); // Won't work with credentials
config.setAllowedOrigins(List.of("*")); // Won't work with credentials
```

✅ **Correct:**
```java
config.setAllowedOrigins(List.of("http://localhost:5173", "https://www.rangeelaboutique.com"));
```

## Testing CORS

### 1. Check Browser Console
Open browser DevTools → Console tab and look for CORS errors.

### 2. Check Network Tab
1. Open DevTools → Network tab
2. Make a request
3. Check the request headers:
   - `Origin: http://localhost:5173`
4. Check the response headers:
   - `Access-Control-Allow-Origin: http://localhost:5173`
   - `Access-Control-Allow-Credentials: true`

### 3. Test with curl
```bash
# Test OPTIONS preflight request
curl -X OPTIONS http://localhost:8081/auth/login \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v

# Should return:
# Access-Control-Allow-Origin: http://localhost:5173
# Access-Control-Allow-Credentials: true
```

## Common Scenarios

### Scenario 1: Local Development
**Frontend:** `http://localhost:5173`  
**Backend:** `http://localhost:8081`

**Configuration:**
```properties
app.frontend.url=http://localhost:5173
app.cors.allowed-origins=http://localhost:5173
```

### Scenario 2: Production
**Frontend:** `https://www.rangeelaboutique.com`  
**Backend:** `https://api.rangeelaboutique.com`

**Configuration:**
```properties
app.frontend.url=https://www.rangeelaboutique.com
app.cors.allowed-origins=https://www.rangeelaboutique.com,https://rangeelaboutique.com
```

### Scenario 3: Multiple Environments
**Frontend:** `http://localhost:5173` (dev), `https://staging.example.com` (staging), `https://www.example.com` (prod)

**Configuration:**
```properties
app.cors.allowed-origins=http://localhost:5173,https://staging.example.com,https://www.example.com
```

## Debugging Steps

1. **Check Backend Logs**
   - Look for "=== CORS Configuration ===" on startup
   - Verify allowed origins list

2. **Verify Frontend URL**
   - Check what URL your frontend is actually running on
   - Ensure it matches `app.frontend.url`

3. **Check Request Headers**
   - Open Network tab in browser
   - Check the `Origin` header in the request
   - Ensure it's in the allowed origins list

4. **Verify Response Headers**
   - Check `Access-Control-Allow-Origin` in response
   - Should match the `Origin` header from request

5. **Clear Browser Cache**
   - CORS preflight responses are cached
   - Clear cache or use incognito mode

## Frontend Configuration

Make sure your frontend is configured correctly:

```typescript
// axios.ts or api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8081', // Match your backend URL
  withCredentials: true, // Important for cookies
  headers: {
    'Content-Type': 'application/json',
  },
});
```

## Still Having Issues?

1. **Check exact error message** in browser console
2. **Verify backend is running** and accessible
3. **Check network tab** for actual request/response headers
4. **Verify no typos** in URLs (http vs https, localhost vs 127.0.0.1)
5. **Restart backend** after configuration changes
6. **Clear browser cache** and try again

## Important Notes

- ✅ **DO** specify exact origins when using credentials
- ✅ **DO** include protocol (http:// or https://) in origins
- ✅ **DO** include port number for localhost (e.g., `:5173`)
- ❌ **DON'T** use wildcard `"*"` with `allowCredentials(true)`
- ❌ **DON'T** mix `setAllowedOriginPatterns` and `setAllowedOrigins`
- ❌ **DON'T** forget to restart backend after config changes

