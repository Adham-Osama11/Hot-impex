# 🚀 Railway Deployment Guide for HOT IMPEX Backend

## Prerequisites ✅

- [x] GitHub account with your repository
- [x] Railway account ([railway.app](https://railway.app))
- [x] MongoDB Atlas cluster set up (you already have this!)

## Files Created for Railway Deployment

### 📄 Configuration Files Added:
- `Procfile` - Tells Railway how to start your app
- `railway.json` - Railway-specific configuration
- `.env.production` - Production environment variables template
- `scripts/prepare-railway-deployment.sh` - Deployment preparation script

## Step 1: Prepare Your Repository 📦

### 1.1 Run the Preparation Script
```bash
# Run the preparation script to verify everything is ready
chmod +x scripts/prepare-railway-deployment.sh
./scripts/prepare-railway-deployment.sh
```

### 1.2 Commit and Push to GitHub
```bash
# Add all deployment files
git add Procfile railway.json .env.production scripts/

# Commit the changes
git commit -m "Add Railway deployment configuration"

# Push to GitHub
git push origin main
```

## Step 2: Deploy to Railway 🚂

### 2.1 Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Authorize Railway to access your repositories

### 2.2 Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your **Hot-impex** repository
4. Railway will automatically detect it's a Node.js project

### 2.3 Configure Environment Variables
In your Railway dashboard, go to **Variables** and add these:

**REQUIRED VARIABLES:**
```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://adham:hotimpex@hotimpex.8l4tdag.mongodb.net/?retryWrites=true&w=majority&appName=Hotimpex
DB_NAME=hotimpex
JWT_SECRET=your-super-secure-jwt-secret-key-change-this
JWT_EXPIRE=30d
ADMIN_EMAIL=admin@hotimpex.com
ADMIN_PASSWORD=secure-admin-password-change-this
CORS_ORIGINS=https://your-netlify-site.netlify.app,https://your-domain.com
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./public/assets/images/uploads
RATE_LIMIT_WINDOW_MS=600000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=info
```

**⚠️ IMPORTANT SECURITY NOTES:**
- **Change `JWT_SECRET`** to a random 32+ character string
- **Change `ADMIN_PASSWORD`** to a secure password
- **Update `CORS_ORIGINS`** with your Netlify/domain URLs

### 2.4 Deploy!
1. Railway will automatically build and deploy your app
2. You'll get a Railway URL like: `https://your-app.railway.app`
3. Check the **Deployments** tab for build status

## Step 3: Update Frontend Configuration 🔄

### 3.1 Update API Endpoints
In your frontend files, update API calls to use your Railway URL:

```javascript
// In your frontend JavaScript files
const API_BASE_URL = 'https://your-app.railway.app/api';

// Example API calls
fetch(`${API_BASE_URL}/products`)
  .then(response => response.json())
  .then(data => console.log(data));
```

### 3.2 Update CORS Configuration
Make sure your `CORS_ORIGINS` environment variable in Railway includes:
- Your Netlify URL: `https://your-site.netlify.app`
- Your custom domain (if any): `https://yourdomain.com`

## Step 4: Testing Your Deployment 🧪

### 4.1 Health Check
Visit: `https://your-app.railway.app/api/health`

You should see:
```json
{
  "status": "success",
  "message": "HOT IMPEX API is running!",
  "timestamp": "2025-01-16T...",
  "environment": "production"
}
```

### 4.2 Test API Endpoints
- Products: `https://your-app.railway.app/api/products`
- Users: `https://your-app.railway.app/api/users/profile` (with auth)
- Orders: `https://your-app.railway.app/api/orders` (with auth)

## Step 5: Connect Frontend to Backend 🔗

### 5.1 Update Frontend Environment
Create a `config.js` in your frontend:

```javascript
// public/assets/js/config.js
const config = {
  apiUrl: 'https://your-app.railway.app/api',
  environment: 'production'
};

// Use in your API calls
fetch(`${config.apiUrl}/products`)
```

### 5.2 Update Netlify Redirects
In your `netlify.toml`, update the API redirect:

```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-app.railway.app/api/:splat"
  status = 200
```

## Step 6: Custom Domain (Optional) 🌐

### 6.1 Add Custom Domain in Railway
1. Go to your project **Settings**
2. Click **Domains**
3. Add your custom domain
4. Update your DNS records as instructed

### 6.2 Update Environment Variables
Update `CORS_ORIGINS` to include your custom domain.

## Troubleshooting 🔧

### Common Issues:

**❌ "Application failed to start"**
- Check Railway logs for error details
- Verify all environment variables are set
- Check MongoDB connection string

**❌ "CORS Error"**
- Make sure `CORS_ORIGINS` includes your frontend URL
- Check for trailing slashes in URLs

**❌ "Database connection failed"**
- Verify MongoDB Atlas IP whitelist (should be 0.0.0.0/0 for Railway)
- Check MongoDB URI format

**❌ "502 Bad Gateway"**
- Check if your app is listening on the correct PORT
- Railway automatically provides PORT environment variable

### Getting Help:
1. Check Railway deployment logs
2. Test your API endpoints individually
3. Verify MongoDB Atlas connection from Railway

## Costs 💰

**Railway Pricing:**
- **$5/month** for the Hobby plan (sufficient for most small projects)
- Includes: 512MB RAM, shared vCPU, 1GB storage
- MongoDB Atlas: **Free tier** (512MB) is sufficient for testing

## Next Steps After Deployment ✅

1. **Monitor your application** in Railway dashboard
2. **Set up error tracking** (optional: Sentry integration)
3. **Configure auto-deployments** for continuous deployment
4. **Set up backups** for your MongoDB data
5. **Add custom domain** for professional appearance

---

## Quick Deployment Checklist 📋

- [ ] Run preparation script
- [ ] Push code to GitHub
- [ ] Create Railway account
- [ ] Deploy from GitHub repo
- [ ] Set environment variables
- [ ] Test health endpoint
- [ ] Update frontend API URLs
- [ ] Update Netlify CORS settings
- [ ] Test full application
- [ ] Set up custom domain (optional)

Your HOT IMPEX backend will be live at: `https://your-app.railway.app` 🎉

---

**Need help?** Check the Railway documentation or open an issue in your repository.