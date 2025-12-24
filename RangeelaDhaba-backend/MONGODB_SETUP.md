# MongoDB Setup Guide

## MongoDB Atlas Connection

Your MongoDB credentials:
- **Username**: `jaiswalvansh96_db_user`
- **Password**: `rHyu9mr54H0D4r4l`

## Connection String Format

For MongoDB Atlas (cloud), use this format:
```
mongodb+srv://jaiswalvansh96_db_user:rHyu9mr54H0D4r4l@<your-cluster-url>/rangeeladhaba?retryWrites=true&w=majority
```

### Steps to Get Your Cluster URL:

1. Log in to [MongoDB Atlas](https://cloud.mongodb.com/)
2. Go to your cluster
3. Click "Connect"
4. Choose "Connect your application"
5. Copy the connection string (it will look like: `mongodb+srv://cluster0.xxxxx.mongodb.net/`)
6. Replace `<your-cluster-url>` in the connection string above with your actual cluster URL

### Example Connection String:
```
mongodb+srv://jaiswalvansh96_db_user:rHyu9mr54H0D4r4l@cluster0.xxxxx.mongodb.net/rangeeladhaba?retryWrites=true&w=majority
```

## Local MongoDB (Alternative)

If you're using local MongoDB instead:
```
mongodb://localhost:27017/rangeeladhaba
```

## Environment Variable

Add this to your `.env` file in the `RangeelaDhaba-backend` directory:

```env
MONGO_URI=mongodb+srv://jaiswalvansh96_db_user:rHyu9mr54H0D4r4l@<your-cluster-url>/rangeeladhaba?retryWrites=true&w=majority
```

## Security Notes

⚠️ **Important**: 
- Never commit your `.env` file to Git
- The `.env` file is already in `.gitignore`
- Keep your MongoDB credentials secure
- If credentials are compromised, rotate them immediately in MongoDB Atlas

## Testing Connection

After setting up, test the connection by starting the backend:
```bash
npm run start
```

If connected successfully, you'll see the server start without database connection errors.





