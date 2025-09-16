# Netlify Deployment Guide for Hot Impex

## Quick Deployment Steps

### Method 1: Drag & Drop (Easiest)
1. **Build your project** (if needed):
   ```bash
   # No build process needed for this static site
   ```

2. **Prepare deployment folder**:
   - The `public` folder contains all files to be deployed
   - Make sure all assets, images, CSS, and JS files are in the `public` directory

3. **Deploy to Netlify**:
   - Go to [netlify.com](https://netlify.com)
   - Sign up or log in
   - Drag and drop the entire `public` folder onto the Netlify dashboard
   - Your site will be deployed instantly!

### Method 2: Git Integration (Recommended)
1. **Push to GitHub** (if not already done):
   ```bash
   git add .
   git commit -m "Prepare for Netlify deployment"
   git push origin main
   ```

2. **Connect to Netlify**:
   - Go to [netlify.com](https://netlify.com) and sign in
   - Click "New site from Git"
   - Choose GitHub and authorize Netlify
   - Select your `Hot-impex` repository

3. **Configure build settings**:
   - **Build command**: Leave empty or use `echo "Static site - no build needed"`
   - **Publish directory**: `public`
   - **Branch to deploy**: `main`

4. **Deploy**:
   - Click "Deploy site"
   - Netlify will automatically deploy and provide you with a URL

## Configuration Files Created

1. **`netlify.toml`** - Main configuration file with:
   - Build settings
   - Redirect rules for SPA-like behavior
   - Security headers
   - Cache settings

2. **`public/404.html`** - Custom 404 error page

## Important Notes

### API Endpoints
- Your current backend server won't run on Netlify (static hosting only)
- For API functionality, consider:
  - **Netlify Functions** (serverless functions)
  - **External API service** (like Railway, Render, or Heroku)
  - **Backend as a Service** (like Firebase, Supabase)

### Database
- MongoDB won't run on Netlify
- Consider cloud database services:
  - MongoDB Atlas (recommended)
  - PlanetScale
  - Supabase

### Environment Variables
If you need environment variables:
1. Go to Site Settings → Environment Variables in Netlify
2. Add your variables (API URLs, keys, etc.)

## Post-Deployment

1. **Custom Domain** (optional):
   - Go to Site Settings → Domain Management
   - Add your custom domain
   - Update DNS records as instructed

2. **HTTPS**: Automatically enabled by Netlify

3. **Continuous Deployment**: 
   - Automatic deployments on git push (if using Git method)

## Troubleshooting

- **Images not loading**: Check file paths are relative to `public` folder
- **API calls failing**: Update API endpoints to your backend service URL
- **Routing issues**: The `netlify.toml` handles SPA redirects
- **Cache issues**: Use Netlify's cache purge feature

## Your Site Will Be Available At
- Netlify will provide a URL like: `https://your-site-name.netlify.app`
- You can customize the subdomain in Site Settings