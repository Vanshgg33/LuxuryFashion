# Production HTTPS Setup Guide

## Current Issue
Your frontend at `https://www.rangeelaboutique.com` is trying to access backend at `http://13.234.226.138:8081`, which browsers block due to mixed content policy.

## Solution Options

### Option 1: Use HTTPS Backend URL (Recommended)

**Update your frontend API configuration:**

```typescript
// In your frontend code (e.g., api.ts or axios.ts)
const API_BASE_URL = 'https://13.234.226.138:8081';  // Use HTTPS
// OR better: use a domain name
const API_BASE_URL = 'https://api.rangeelaboutique.com';
```

**Requirements:**
1. Backend must have SSL certificate installed
2. Backend must be accessible via HTTPS on port 8081 (or 443)
3. Update backend configuration:

```properties
# application.properties or environment variables
app.backend.url=https://api.rangeelaboutique.com
BACKEND_URL=https://api.rangeelaboutique.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=None
```

### Option 2: Use Reverse Proxy with SSL (Best Practice)

Set up Nginx/Apache in front of your backend:

**Nginx Configuration:**
```nginx
server {
    listen 443 ssl http2;
    server_name api.rangeelaboutique.com;
    
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/key.pem;
    
    location / {
        proxy_pass http://13.234.226.138:8081;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

**Then update frontend:**
```typescript
const API_BASE_URL = 'https://api.rangeelaboutique.com';
```

### Option 3: Quick Fix - Update Backend URL in Frontend

If you have a domain name pointing to your backend IP:

1. **Get SSL certificate** (Let's Encrypt is free):
   ```bash
   # Install certbot
   sudo apt-get install certbot
   
   # Get certificate
   sudo certbot certonly --standalone -d api.rangeelaboutique.com
   ```

2. **Configure Spring Boot for HTTPS:**
   ```properties
   # application.properties
   server.port=8443
   server.ssl.key-store=/path/to/keystore.p12
   server.ssl.key-store-password=your-password
   server.ssl.key-store-type=PKCS12
   ```

3. **Update frontend:**
   ```typescript
   const API_BASE_URL = 'https://api.rangeelaboutique.com:8443';
   ```

## Immediate Workaround (Not Recommended for Production)

If you need a quick temporary fix, you can configure the backend to allow HTTP, but this is **NOT SECURE** and browsers will still block it:

**This won't work** - browsers will still block HTTP from HTTPS pages. You **MUST** use HTTPS for the backend.

## Configuration Updates Needed

### Backend (application.properties)
```properties
# Production settings
app.frontend.url=https://www.rangeelaboutique.com
app.backend.url=https://api.rangeelaboutique.com
app.cors.allowed-origins=https://www.rangeelaboutique.com,https://rangeelaboutique.com
app.cookie.secure=true
app.cookie.same-site=None
```

### Environment Variables (Production)
```bash
export FRONTEND_URL=https://www.rangeelaboutique.com
export BACKEND_URL=https://api.rangeelaboutique.com
export ALLOWED_ORIGINS=https://www.rangeelaboutique.com,https://rangeelaboutique.com
export COOKIE_SECURE=true
export COOKIE_SAME_SITE=None
```

## Testing

After setting up HTTPS:

1. **Test backend HTTPS:**
   ```bash
   curl https://api.rangeelaboutique.com/luxuryfashion/fetch-gallery
   ```

2. **Check browser console** - should no longer see mixed content errors

3. **Verify CORS headers:**
   ```bash
   curl -H "Origin: https://www.rangeelaboutique.com" \
        -H "Access-Control-Request-Method: GET" \
        -X OPTIONS \
        https://api.rangeelaboutique.com/luxuryfashion/fetch-gallery \
        -v
   ```

## Important Notes

- ⚠️ **Mixed content is a browser security feature** - you cannot bypass it
- ✅ **HTTPS is required** when frontend is HTTPS
- ✅ **SSL certificates are free** with Let's Encrypt
- ✅ **Reverse proxy** (Nginx) is the recommended approach
- ❌ **HTTP backend will NOT work** with HTTPS frontend

## Next Steps

1. Set up SSL certificate for your backend domain/IP
2. Configure backend to use HTTPS
3. Update frontend API URL to use HTTPS
4. Update CORS configuration to include HTTPS origins
5. Test and verify

