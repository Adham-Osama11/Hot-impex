# 🚂 Manual Railway Deployment Guide

## 📋 **CRITICAL: Railway Environment Variables Need Update**

The shop page is still showing CORS errors because Railway hasn't been updated with the new CORS configuration.

### 🛠️ **Method 1: Railway Dashboard (Recommended)**

1. **Go to Railway Dashboard:**
   - Visit: https://railway.app/dashboard
   - Find your `hot-impex-production` project

2. **Update Environment Variables:**
   - Click on your project → Settings → Variables
   - Find `CORS_ORIGINS` variable
   - Update it to: `https://hotimpex.netlify.app,https://your-custom-domain.com`
   - Or add it if it doesn't exist

3. **Redeploy:**
   - Go to Deployments tab
   - Click "Deploy" or trigger a new deployment

### 🛠️ **Method 2: Git Push (Alternative)**

```bash
# If you have Railway connected to your GitHub repo
git add .
git commit -m "Update CORS configuration for Netlify"
git push origin main
```

Railway will automatically redeploy when it detects new commits.

### 🛠️ **Method 3: Railway CLI (If Installed)**

```bash
# Run the deployment script
./scripts/deploy-to-railway.sh
```

## ✅ **Verify the Fix**

Once Railway redeploys (takes 2-3 minutes):

1. **Test CORS directly:**
   ```bash
   curl -I "https://hot-impex-production.up.railway.app/api/health" \
     -H "Origin: https://hotimpex.netlify.app"
   ```

2. **Test the shop page:**
   - Open: https://hotimpex.netlify.app/shop.html
   - Check browser console - CORS errors should be gone
   - Products should load successfully

## 🎯 **Expected Result**

After Railway redeploys with the updated CORS configuration:
- ✅ Shop page loads products successfully
- ✅ No CORS errors in browser console
- ✅ API requests work from Netlify to Railway

---

**The key issue:** Railway is still using the old CORS configuration. Once you update the `CORS_ORIGINS` environment variable in Railway and redeploy, everything should work perfectly! 🚀