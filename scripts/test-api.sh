#!/bin/bash

# HOT IMPEX API Test Script
# This script tests various API endpoints

API_BASE="http://localhost:3000/api"

echo "🧪 Testing HOT IMPEX API..."
echo "=================================="

# Test 1: Health Check
echo "🔍 1. Health Check"
curl -s "$API_BASE/health" | jq .
echo -e "\n"

# Test 2: Get all products
echo "📦 2. Get Products (first 3)"
curl -s "$API_BASE/products?limit=3" | jq '.data.products[] | {id, name, price, category}'
echo -e "\n"

# Test 3: Get categories
echo "🏷️ 3. Get Categories"
curl -s "$API_BASE/products/categories" | jq '.data.categories'
echo -e "\n"

# Test 4: Search products
echo "🔍 4. Search Products (HDMI)"
curl -s "$API_BASE/products/search/hdmi" | jq '.results'
echo -e "\n"

# Test 5: Get products by category
echo "🏷️ 5. Get Gaming Products"
curl -s "$API_BASE/products/category/gaming" | jq '.results'
echo -e "\n"

# Test 6: Get single product
echo "📦 6. Get Single Product (cable-002)"
curl -s "$API_BASE/products/cable-002" | jq '.data.product | {id, name, price, inStock}'
echo -e "\n"

# Test 7: Try to register a user
echo "👤 7. Register Test User"
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "password": "password123",
    "phone": "+1234567890"
  }')

echo $REGISTER_RESPONSE | jq .
echo -e "\n"

# Test 8: Try to login with the test user
echo "🔐 8. Login Test User"
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo $LOGIN_RESPONSE | jq .
echo -e "\n"

# Extract token for authenticated requests
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token // empty')

if [ ! -z "$TOKEN" ]; then
    echo "🔑 Token received: ${TOKEN:0:20}..."
    
    # Test 9: Get user profile
    echo "👤 9. Get User Profile"
    curl -s "$API_BASE/users/profile" \
      -H "Authorization: Bearer $TOKEN" | jq .
    echo -e "\n"
    
    # Test 10: Create a test order
    echo "🛒 10. Create Test Order"
    curl -s -X POST "$API_BASE/orders" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d '{
        "customerInfo": {
          "firstName": "Test",
          "lastName": "User",
          "email": "test@example.com",
          "phone": "+1234567890"
        },
        "items": [
          {
            "productId": "cable-001",
            "quantity": 2
          },
          {
            "productId": "av-001",
            "quantity": 1
          }
        ],
        "shippingAddress": {
          "street": "123 Test Street",
          "city": "Cairo",
          "state": "Cairo",
          "country": "Egypt",
          "zipCode": "12345"
        },
        "paymentMethod": "cash_on_delivery"
      }' | jq .
    echo -e "\n"
else
    echo "❌ No token received, skipping authenticated tests"
fi

echo "✅ API Testing Complete!"
echo "=================================="
