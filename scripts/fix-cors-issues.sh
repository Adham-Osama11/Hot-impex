#!/bin/bash

echo "🔧 Deploying CORS fixes and debug improvements..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Not in Hot Impex project directory"
    exit 1
fi

echo "📝 Summary of changes made:"
echo "✅ Enhanced API error handling with detailed logging"
echo "✅ Added CORS debug script for troubleshooting"  
echo "✅ Updated .env.production with correct Netlify domain"
echo "⚠️  You need to update Railway CORS_ORIGINS manually!"

echo ""
echo "🚂 CRITICAL: Update Railway Environment Variables"
echo "1. Go to: https://railway.app"
echo "2. Select your Hot Impex project"
echo "3. Go to Variables tab"  
echo "4. Update CORS_ORIGINS to:"
echo "   CORS_ORIGINS=https://hotimpex.netlify.app,http://localhost:3000,http://127.0.0.1:3000"
echo ""

echo "📤 Committing and pushing changes..."
git add .
git commit -m "Fix CORS issues and add debug logging for shop page"
git push origin main

echo ""
echo "🌐 After updating Railway CORS_ORIGINS:"
echo "1. Wait 1-2 minutes for Railway to redeploy"
echo "2. Visit your Netlify shop page"
echo "3. Check browser console for debug messages"
echo "4. Should see '✅ CORS test successful' message"
echo ""
echo "🎯 Next steps:"
echo "- Update Railway CORS_ORIGINS (REQUIRED)"
echo "- Test shop page after Railway redeploys"
echo "- Remove cors-debug.js after confirming it works"