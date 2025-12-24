# MongoDB Atlas Connection Fix

## 🔴 Current Issue

The backend cannot connect to MongoDB Atlas because your **IP address is not whitelisted**.

**Error Message:**
```
MongooseServerSelectionError: Could not connect to any servers in your MongoDB Atlas cluster. 
One common reason is that you're trying to access the database from an IP that isn't whitelisted.
```

## ✅ Solution: Whitelist Your IP Address

### Step 1: Get Your Current IP Address
Your current public IP address is needed. You can find it by:
- Running: `curl https://api.ipify.org`
- Or visiting: https://whatismyipaddress.com/

### Step 2: Whitelist IP in MongoDB Atlas

1. **Go to MongoDB Atlas Dashboard**
   - Visit: https://cloud.mongodb.com/
   - Log in with your MongoDB Atlas account

2. **Navigate to Network Access**
   - Click on your project/cluster
   - In the left sidebar, click **"Network Access"** (under Security)

3. **Add IP Address**
   - Click the **"Add IP Address"** button (green button)
   - You have two options:

   **Option A: Add Current IP (Recommended for Production)**
   - Click **"Add Current IP Address"** button
   - This automatically adds your current IP
   - Click **"Confirm"**

   **Option B: Allow All IPs (For Development Only)**
   - Click **"Allow Access from Anywhere"**
   - This adds `0.0.0.0/0` (allows all IPs)
   - ⚠️ **Warning:** Only use this for development/testing
   - Click **"Confirm"**

4. **Wait for Changes**
   - It may take 1-2 minutes for changes to propagate
   - The status will change from "Pending" to "Active"

### Step 3: Verify Connection

After whitelisting, the backend should automatically reconnect. Check:

```bash
# Check if backend connected successfully
tail -f /tmp/backend-startup.log | grep -i "mongo\|connected\|error"
```

Or restart the backend:
```bash
cd RangeelaDhaba-backend
npm run start:dev
```

You should see:
```
✅ MongoDB connection successful!
RangeelaDhaba API running on port 8080
```

## 🔍 Connection Details

**MongoDB Connection String:**
```
mongodb+srv://jaiswalvansh96_db_user:rHyu9mr54H0D4r4l@rangeeladhaba.l20qyzs.mongodb.net/?appName=RangeelaDhaba
```

**Cluster:** RangeelaDhaba  
**Database User:** jaiswalvansh96_db_user

## 🛠️ Troubleshooting

### If connection still fails after whitelisting:

1. **Check IP Address Changed**
   - If you're on a dynamic IP (home network), your IP may have changed
   - Re-run: `curl https://api.ipify.org` to get new IP
   - Add the new IP to MongoDB Atlas

2. **Check MongoDB Credentials**
   - Verify username: `jaiswalvansh96_db_user`
   - Verify password is correct
   - Check if user has proper database permissions

3. **Check Network/Firewall**
   - Ensure no firewall is blocking MongoDB connections (port 27017)
   - Try from a different network to test

4. **Check MongoDB Atlas Status**
   - Visit: https://status.mongodb.com/
   - Ensure MongoDB Atlas services are operational

### Test Connection Manually

```bash
cd RangeelaDhaba-backend
node -e "const mongoose = require('mongoose'); mongoose.connect('mongodb+srv://jaiswalvansh96_db_user:rHyu9mr54H0D4r4l@rangeeladhaba.l20qyzs.mongodb.net/?appName=RangeelaDhaba').then(() => { console.log('✅ Connected!'); process.exit(0); }).catch(err => { console.error('❌ Failed:', err.message); process.exit(1); });"
```

## 📝 Quick Fix (Development Only)

If you want to quickly test and don't mind security (development only):

1. Go to MongoDB Atlas → Network Access
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (adds `0.0.0.0/0`)
4. Click "Confirm"
5. Wait 1-2 minutes
6. Restart backend

**⚠️ Remember:** Remove `0.0.0.0/0` and add specific IPs for production!

## ✅ Success Indicators

Once connected, you'll see in the backend logs:
- ✅ No more "Unable to connect" errors
- ✅ "RangeelaDhaba API running on port 8080"
- ✅ Frontend can successfully fetch data from `/dishes`, `/cart`, etc.





