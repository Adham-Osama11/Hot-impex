#!/bin/bash

# HOT IMPEX MongoDB Setup Script
echo "🚀 HOT IMPEX MongoDB Setup"
echo "=========================="
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    exit 1
fi

echo "📝 Please enter your MongoDB password:"
echo "   (This will replace <db_password> in your connection string)"
echo ""
read -s -p "Password: " db_password
echo ""

if [ -z "$db_password" ]; then
    echo "❌ Password cannot be empty!"
    exit 1
fi

# Replace the password in .env file
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/your_actual_password_here/$db_password/g" .env
    sed -i '' "s/<db_password>/$db_password/g" .env
else
    # Linux
    sed -i "s/your_actual_password_here/$db_password/g" .env
    sed -i "s/<db_password>/$db_password/g" .env
fi

echo "✅ MongoDB password configured successfully!"
echo ""
echo "🔄 Starting server..."
npm start
