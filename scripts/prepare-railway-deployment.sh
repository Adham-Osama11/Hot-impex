#!/bin/bash

# HOT IMPEX Railway Deployment Preparation Script
echo "🚀 Preparing HOT IMPEX for Railway deployment..."

# Check if all required files exist
echo "📋 Checking deployment files..."

if [ ! -f "Procfile" ]; then
    echo "❌ Procfile not found!"
    exit 1
fi

if [ ! -f "railway.json" ]; then
    echo "❌ railway.json not found!"
    exit 1
fi

if [ ! -f "package.json" ]; then
    echo "❌ package.json not found!"
    exit 1
fi

if [ ! -f ".env.production" ]; then
    echo "❌ .env.production template not found!"
    exit 1
fi

echo "✅ All deployment files found!"

# Verify package.json has required scripts
echo "📦 Checking package.json scripts..."
if ! grep -q '"start":' package.json; then
    echo "❌ Missing 'start' script in package.json"
    exit 1
fi

echo "✅ package.json scripts are ready!"

# Check server structure
echo "🔍 Verifying server structure..."
if [ ! -f "server/server.js" ]; then
    echo "❌ server/server.js not found!"
    exit 1
fi

if [ ! -f "server/app.js" ]; then
    echo "❌ server/app.js not found!"
    exit 1
fi

echo "✅ Server structure verified!"

# Install dependencies to check for issues
echo "📥 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies!"
    exit 1
fi

echo "✅ Dependencies installed successfully!"

# Test server startup (for 5 seconds)
echo "🧪 Testing server startup..."
timeout 5s npm start &
SERVER_PID=$!

sleep 3

if ps -p $SERVER_PID > /dev/null; then
    echo "✅ Server starts successfully!"
    kill $SERVER_PID 2>/dev/null
else
    echo "❌ Server failed to start!"
    exit 1
fi

echo ""
echo "🎉 Railway deployment preparation complete!"
echo ""
echo "Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your repository to Railway"
echo "3. Set up environment variables from .env.production"
echo "4. Deploy your app!"
echo ""
echo "See RAILWAY_DEPLOYMENT_GUIDE.md for detailed instructions."