#!/bin/bash

# Script to update Railway URL in frontend configuration
# Usage: ./update-railway-url.sh https://your-app.railway.app

if [ $# -eq 0 ]; then
    echo "❌ Please provide your Railway URL"
    echo "Usage: $0 https://your-app.railway.app"
    exit 1
fi

RAILWAY_URL=$1

# Remove trailing slash if present
RAILWAY_URL=${RAILWAY_URL%/}

echo "🔄 Updating frontend configuration with Railway URL: $RAILWAY_URL"

# Update config.js
echo "📝 Updating public/assets/js/config.js..."
if [ -f "public/assets/js/config.js" ]; then
    sed -i "s|RAILWAY_API_URL: 'https://your-app-name.railway.app/api'|RAILWAY_API_URL: '$RAILWAY_URL/api'|g" public/assets/js/config.js
    echo "✅ Updated config.js"
else
    echo "❌ config.js not found!"
    exit 1
fi

# Update netlify.toml
echo "📝 Updating netlify.toml..."
if [ -f "netlify.toml" ]; then
    sed -i "s|to = \"https://your-app.railway.app/api/:splat\"|to = \"$RAILWAY_URL/api/:splat\"|g" netlify.toml
    echo "✅ Updated netlify.toml"
else
    echo "❌ netlify.toml not found!"
    exit 1
fi

echo ""
echo "🎉 Frontend configuration updated successfully!"
echo ""
echo "Next steps:"
echo "1. Update CORS_ORIGINS in Railway environment variables"
echo "2. Commit and push changes:"
echo "   git add ."
echo "   git commit -m 'Connect frontend to Railway backend'"
echo "   git push origin main"
echo ""
echo "3. Your Netlify site will automatically redeploy"
echo ""
echo "Railway Backend: $RAILWAY_URL"
echo "API Health Check: $RAILWAY_URL/api/health"