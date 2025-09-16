#!/bin/bash

echo "🚀 Railway Deployment Script"
echo "============================"
echo ""

# Check if railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Please install it first:"
    echo "   npm install -g @railway/cli"
    echo "   Then run: railway login"
    exit 1
fi

# Check if logged in to railway
if ! railway whoami &> /dev/null; then
    echo "❌ Not logged in to Railway. Please run:"
    echo "   railway login"
    exit 1
fi

echo "1️⃣  Current Railway project status..."
railway status
echo ""

echo "2️⃣  Deploying to Railway..."
echo "   This will:"
echo "   • Deploy the latest code"
echo "   • Apply environment variables from .env.production"
echo "   • Update CORS_ORIGINS to include Netlify domain"
echo ""

# Deploy to Railway
railway up --detach

echo ""
echo "3️⃣  Waiting for deployment to complete..."
echo "   You can monitor the deployment at: https://railway.app/dashboard"
echo ""

echo "4️⃣  Once deployment is complete, test the API:"
echo "   curl -I 'https://hot-impex-production.up.railway.app/api/health' -H 'Origin: https://hotimpex.netlify.app'"
echo ""

echo "✅ Deployment initiated!"
echo ""
echo "📋 Next steps:"
echo "   1. Wait for Railway deployment to complete (2-3 minutes)"
echo "   2. Test the shop page: https://hotimpex.netlify.app/shop.html"
echo "   3. Check browser console - CORS errors should be resolved"