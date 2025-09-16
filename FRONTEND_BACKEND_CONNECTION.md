# 🔗 Frontend-Backend Connection Guide

## 🚀 **STEP 1: Get Your Railway Backend URL**

1. Go to your Railway dashboard
2. Click on your deployed Hot Impex project
3. Find your **public URL** (looks like: `https://your-app-name.railway.app`)
4. Copy this URL - you'll need it for the next steps

## 🔧 **STEP 2: Update Configuration Files**

### 2.1 Update API Configuration
Edit `public/assets/js/config.js`:

```javascript
// REPLACE THIS LINE:
RAILWAY_API_URL: 'https://your-app-name.railway.app/api',

// WITH YOUR ACTUAL RAILWAY URL:
RAILWAY_API_URL: 'https://hot-impex-production.railway.app/api',
```

### 2.2 Update Netlify Configuration  
Edit `netlify.toml`:

```toml
# REPLACE THIS LINE:
to = "https://your-app.railway.app/api/:splat"

# WITH YOUR ACTUAL RAILWAY URL:
to = "https://hot-impex-production.railway.app/api/:splat"
```

## 🌐 **STEP 3: Update CORS in Railway**

1. Go to your Railway project settings
2. Go to **Variables** tab
3. Update `CORS_ORIGINS` to include your Netlify URL:

```bash
# If your Netlify site is: https://your-site.netlify.app
CORS_ORIGINS=https://your-site.netlify.app,https://yourdomain.com
```

## 🧪 **STEP 4: Test Your Setup**

### 4.1 Test Backend Health Check
Visit: `https://your-railway-url.railway.app/api/health`

Should return:
```json
{
  "status": "success",
  "message": "HOT IMPEX API is running!",
  "timestamp": "2025-01-16T..."
}
```

### 4.2 Test API Endpoints
- Products: `https://your-railway-url.railway.app/api/products`
- Health: `https://your-railway-url.railway.app/api/health`

### 4.3 Test Frontend
1. Deploy your updated frontend to Netlify
2. Open your Netlify site
3. Check browser console for API connection errors
4. Test adding items to cart
5. Test user registration/login

## 📁 **Files Modified for Railway Connection:**

✅ `public/assets/js/config.js` - Centralized API configuration  
✅ `public/assets/js/scripts.js` - Updated to use new config  
✅ `public/assets/js/modules/api-service.js` - Updated API calls  
✅ `public/assets/js/admin/api.js` - Updated admin API calls  
✅ `netlify.toml` - Updated API proxy redirects  
✅ All HTML files - Added config.js inclusion  

## 🚨 **Common Issues & Solutions**

### ❌ "CORS Error"
**Problem:** Frontend can't connect to backend  
**Solution:** 
1. Update `CORS_ORIGINS` in Railway environment variables
2. Include your exact Netlify URL (no trailing slash)

### ❌ "API calls not working"
**Problem:** API calls return 404 or timeout  
**Solution:**
1. Verify Railway URL in `config.js`
2. Check Railway deployment status
3. Test backend URL directly in browser

### ❌ "Netlify redirects not working"
**Problem:** API proxy not redirecting properly  
**Solution:**
1. Make sure `netlify.toml` has the correct Railway URL
2. Redeploy Netlify site after changes
3. Check Netlify function logs

## 🔄 **Quick Update Commands**

```bash
# After making changes, deploy updates:
git add .
git commit -m "Update frontend to connect with Railway backend"
git push origin main

# Netlify will automatically redeploy your frontend
```

## ✅ **Final Checklist**

- [ ] Railway backend is deployed and accessible
- [ ] Updated `RAILWAY_API_URL` in `config.js` 
- [ ] Updated `CORS_ORIGINS` in Railway environment variables
- [ ] Updated Netlify redirects in `netlify.toml`
- [ ] Pushed changes to GitHub
- [ ] Netlify has redeployed with changes
- [ ] Tested API health check
- [ ] Tested frontend functionality
- [ ] Cart operations work
- [ ] User authentication works

## 📞 **Need Your Railway URL?**

Please provide your Railway deployment URL so I can help you update the configuration files automatically!

Example: `https://hot-impex-production.railway.app`