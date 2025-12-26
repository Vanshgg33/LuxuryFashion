# MongoDB Connection Troubleshooting Guide

## Common Issues and Solutions

### 1. **Missing Database Name in Connection String**
**Problem**: Connection string doesn't specify the database name.

**Solution**: Ensure your connection string includes the database name:
```
mongodb+srv://username:password@cluster.mongodb.net/database_name?retryWrites=true&w=majority
```

**Fixed**: Updated `.env` file to include `/rangeeladhaba` in the connection string.

---

### 2. **IP Address Not Whitelisted**
**Problem**: MongoDB Atlas blocks connections from IPs not in the whitelist.

**Solution**:
1. Go to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Click on "Network Access" in the left sidebar
3. Click "Add IP Address"
4. Click "Allow Access from Anywhere" (for development) or add your specific IP
5. Wait 1-2 minutes for changes to propagate

**Quick Fix**: Click "Allow Access from Anywhere" (0.0.0.0/0) for development

---

### 3. **Password Changed or Incorrect**
**Problem**: The password in the connection string doesn't match MongoDB Atlas.

**Solution**:
1. Go to MongoDB Atlas → Database Access
2. Find your user `jaiswalvansh96_db_user`
3. Click "Edit" → "Edit Password"
4. Update the password
5. Update the `.env` file with the new password

---

### 4. **MongoDB Atlas Cluster Paused**
**Problem**: Free tier clusters pause after 1 hour of inactivity.

**Solution**:
1. Go to MongoDB Atlas → Clusters
2. If cluster shows "Paused", click "Resume"
3. Wait 1-2 minutes for cluster to resume
4. Try connecting again

---

### 5. **Network/Firewall Issues**
**Problem**: Your network or firewall is blocking MongoDB connections.

**Solution**:
- Check if you're on a VPN (try disconnecting)
- Check if your firewall is blocking port 27017
- Try from a different network (mobile hotspot)
- Check if your ISP blocks MongoDB connections

---

### 6. **Connection String Format Issues**
**Problem**: Special characters in password not properly encoded.

**Solution**: If your password contains special characters, URL-encode them:
- `@` → `%40`
- `:` → `%3A`
- `/` → `%2F`
- `?` → `%3F`
- `#` → `%23`
- `[` → `%5B`
- `]` → `%5D`

---

## Testing the Connection

### Test from Command Line:
```bash
# Install MongoDB shell (if not installed)
# macOS: brew install mongosh

# Test connection
mongosh "mongodb+srv://jaiswalvansh96_db_user:rHyu9mr54H0D4r4l@rangeeladhaba.l20qyzs.mongodb.net/rangeeladhaba"
```

### Test from Backend:
```bash
cd RangeelaDhaba-backend
npm run start:dev
```

Look for:
- ✅ `Mongoose connected successfully` or similar success message
- ❌ `MongoServerError`, `MongoNetworkError`, or connection timeout

---

## Current Connection String Format

Your `.env` file should have:
```env
MONGO_URI=mongodb+srv://jaiswalvansh96_db_user:rHyu9mr54H0D4r4l@rangeeladhaba.l20qyzs.mongodb.net/rangeeladhaba?retryWrites=true&w=majority&appName=RangeelaDhaba
```

**Key Points**:
- ✅ Includes database name: `/rangeeladhaba`
- ✅ Includes connection options: `retryWrites=true&w=majority`
- ✅ Includes app name: `appName=RangeelaDhaba`

---

## Quick Checklist

Before reporting connection issues, check:

- [ ] Database name is included in connection string (`/rangeeladhaba`)
- [ ] IP address is whitelisted in MongoDB Atlas
- [ ] Password is correct (check MongoDB Atlas → Database Access)
- [ ] Cluster is not paused (check MongoDB Atlas → Clusters)
- [ ] Network/firewall is not blocking connections
- [ ] `.env` file exists and has correct `MONGO_URI`
- [ ] Backend server is restarted after `.env` changes

---

## Still Having Issues?

1. **Check MongoDB Atlas Logs**:
   - Go to MongoDB Atlas → Monitoring → Logs
   - Look for connection attempts and errors

2. **Check Backend Logs**:
   - Look at terminal output when starting the backend
   - Check for specific error messages

3. **Verify Credentials**:
   - Double-check username: `jaiswalvansh96_db_user`
   - Verify password in MongoDB Atlas dashboard

4. **Try Creating New Database User**:
   - MongoDB Atlas → Database Access → Add New Database User
   - Create new user with read/write permissions
   - Update `.env` with new credentials

---

## Updated Files

✅ **Fixed**: `src/app.module.ts` - Added database name and connection options
✅ **Fixed**: `.env` - Updated MONGO_URI to include database name

**Next Steps**:
1. Restart your backend server
2. Check MongoDB Atlas Network Access (whitelist your IP)
3. Verify cluster is running (not paused)






