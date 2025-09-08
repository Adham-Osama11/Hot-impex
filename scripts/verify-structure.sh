#!/bin/bash

# Hot Impex - Link Verification Script
# This script checks if all referenced files exist

echo "🔍 Checking file structure and links..."
echo "=================================="

# Check main HTML files
echo "📄 Checking main pages..."
for file in public/index.html public/shop.html public/contact.html public/about.html public/product.html public/checkout.html public/profile.html; do
    if [ -f "$file" ]; then
        echo "✅ $file - Found"
    else
        echo "❌ $file - Missing"
    fi
done

# Check assets structure
echo ""
echo "📁 Checking assets structure..."
if [ -d "public/assets" ]; then
    echo "✅ public/assets/ - Found"
    
    # Check CSS files
    if [ -f "public/assets/css/styles.css" ]; then
        echo "✅ public/assets/css/styles.css - Found"
    else
        echo "❌ public/assets/css/styles.css - Missing"
    fi
    
    if [ -f "public/assets/css/admin-styles.css" ]; then
        echo "✅ public/assets/css/admin-styles.css - Found"
    else
        echo "❌ public/assets/css/admin-styles.css - Missing"
    fi
    
    # Check JS files
    if [ -f "public/assets/js/scripts.js" ]; then
        echo "✅ public/assets/js/scripts.js - Found"
    else
        echo "❌ public/assets/js/scripts.js - Missing"
    fi
    
    if [ -f "public/assets/js/admin.js" ]; then
        echo "✅ public/assets/js/admin.js - Found"
    else
        echo "❌ public/assets/js/admin.js - Missing"
    fi
    
    # Check logo files
    if [ -f "public/assets/images/logos/logo.png" ]; then
        echo "✅ public/assets/images/logos/logo.png - Found"
    else
        echo "❌ public/assets/images/logos/logo.png - Missing"
    fi
    
    # Check product images
    if [ -f "public/assets/images/racing sim seat_without BG.png" ]; then
        echo "✅ Product images - Found"
    else
        echo "❌ Product images - Missing"
    fi
    
else
    echo "❌ public/assets/ - Missing"
fi

# Check admin directory
echo ""
echo "🔧 Checking admin panel..."
if [ -f "public/admin/admin.html" ]; then
    echo "✅ public/admin/admin.html - Found"
else
    echo "❌ public/admin/admin.html - Missing"
fi

# Check configuration files
echo ""
echo "⚙️ Checking configuration files..."
if [ -f "tailwind.config.js" ]; then
    echo "✅ tailwind.config.js - Found"
else
    echo "❌ tailwind.config.js - Missing"
fi

if [ -f "database/products.json" ]; then
    echo "✅ database/products.json - Found"
else
    echo "❌ database/products.json - Missing"
fi

if [ -f "README.md" ]; then
    echo "✅ README.md - Found"
else
    echo "❌ README.md - Missing"
fi

echo ""
echo "🎉 File structure verification complete!"
echo "=================================="
