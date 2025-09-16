#!/bin/bash

# Test the fixed shop page
echo "🧪 Testing Shop Page Fix"
echo "========================="
echo ""

# Test the API URL configuration
echo "1️⃣  Testing API config..."
curl -s "https://hotimpex.netlify.app/assets/js/config.js" | head -n 10
echo ""

# Test the Railway API endpoint
echo "2️⃣  Testing Railway API..."
curl -s -w "HTTP Status: %{http_code}\n" "https://hot-impex-production.up.railway.app/api/products?limit=5" | head -n 5
echo ""

# Test CORS preflight
echo "3️⃣  Testing CORS..."
curl -s -I -X OPTIONS "https://hot-impex-production.up.railway.app/api/products" \
  -H "Origin: https://hotimpex.netlify.app" \
  -H "Access-Control-Request-Method: GET" | grep -i "access-control"
echo ""

echo "✅ All tests completed!"
echo ""
echo "🌐 Next Steps:"
echo "   1. Open https://hotimpex.netlify.app/shop.html"
echo "   2. Check browser console for success messages"
echo "   3. Products should load correctly now!"