# Cloud SQL Connection Troubleshooting Guide

## Current Configuration
- **Public IP**: `34.14.181.133`
- **Port**: `3306`
- **Database**: `rangeela`
- **Username**: `admin`
- **Password**: `40Lpa123.`

## Common Connection Issues and Solutions

### 1. **Firewall/Authorized Networks Issue** (Most Common)
Cloud SQL requires your IP address to be whitelisted.

**Solution:**
1. Go to Google Cloud Console → SQL → Your Instance (`rangeela`)
2. Click on "Connections" or "Networking"
3. Under "Authorized networks", click "Add network"
4. Add your current public IP address (find it at https://whatismyipaddress.com/)
5. Save and wait 1-2 minutes for changes to propagate

### 2. **Database Doesn't Exist**
The database `rangeela` might not exist in your Cloud SQL instance.

**Solution:**
1. Connect to Cloud SQL using Cloud Shell or MySQL client
2. Run: `CREATE DATABASE IF NOT EXISTS rangeela;`
3. Grant permissions: `GRANT ALL PRIVILEGES ON rangeela.* TO 'admin'@'%';`

### 3. **Password Incorrect**
Double-check the password is exactly: `40Lpa123.` (with the period at the end)

**Solution:**
1. Verify password in Google Cloud Console → SQL → Users
2. If needed, reset the password for user `admin`

### 4. **SSL Certificate Issues**
Try with simplified SSL settings.

**Test Connection:**
```bash
mysql -h 34.14.181.133 -u admin -p -P 3306 --ssl-mode=REQUIRED
```

### 5. **Connection Timeout**
If connection times out, check:
- Your internet connection
- Cloud SQL instance is running
- Firewall rules allow your IP

## Test Connection Manually

### Using MySQL Client:
```bash
mysql -h 34.14.181.133 -u admin -p -P 3306 rangeela
# Enter password: 40Lpa123.
```

### Using Cloud Shell:
```bash
gcloud sql connect rangeela --user=admin --database=rangeela
```

## Application Logs
Check your application logs for specific error messages:
- `Communications link failure` → Network/firewall issue
- `Access denied` → Wrong username/password
- `Unknown database` → Database doesn't exist
- `Connection timeout` → Firewall or network issue

## Quick Fixes to Try

1. **Simplify SSL settings** (already done in config)
2. **Add your IP to authorized networks** (most important!)
3. **Verify database exists**: `SHOW DATABASES;`
4. **Test connection manually** using MySQL client
5. **Check Cloud SQL instance status** in Google Cloud Console

## Updated Configuration Applied
The application.properties has been updated with:
- Connection timeout settings
- Simplified SSL configuration
- HikariCP connection pool settings
- Better error detection

Restart your application after ensuring your IP is whitelisted in Cloud SQL.



