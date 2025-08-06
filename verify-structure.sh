#!/bin/bash

# Hot Impex - Link Verification Script
# This script checks if all referenced files exist

echo "🔍 Checking file structure and links..."
echo "=================================="

# Check main HTML files
echo "📄 Checking main pages..."
for file in index.html shop.html contact.html about.html product.html; do
    if [ -f "$file" ]; then
        echo "✅ $file - Found"
    else
        echo "❌ $file - Missing"
    fi
done

# Check assets structure
echo ""
echo "📁 Checking assets structure..."
if [ -d "assets" ]; then
    echo "✅ assets/ - Found"
    
    # Check CSS files
    if [ -f "assets/css/styles.css" ]; then
        echo "✅ assets/css/styles.css - Found"
    else
        echo "❌ assets/css/styles.css - Missing"
    fi
    
    if [ -f "assets/css/admin-styles.css" ]; then
        echo "✅ assets/css/admin-styles.css - Found"
    else
        echo "❌ assets/css/admin-styles.css - Missing"
    fi
    
    # Check JS files
    if [ -f "assets/js/scripts.js" ]; then
        echo "✅ assets/js/scripts.js - Found"
    else
        echo "❌ assets/js/scripts.js - Missing"
    fi
    
    if [ -f "assets/js/admin.js" ]; then
        echo "✅ assets/js/admin.js - Found"
    else
        echo "❌ assets/js/admin.js - Missing"
    fi
    
    # Check logo files
    if [ -f "assets/images/logos/logo.png" ]; then
        echo "✅ assets/images/logos/logo.png - Found"
    else
        echo "❌ assets/images/logos/logo.png - Missing"
    fi
    
    # Check product images
    if [ -f "assets/images/racing sim seat_without BG.png" ]; then
        echo "✅ Product images - Found"
    else
        echo "❌ Product images - Missing"
    fi
    
else
    echo "❌ assets/ - Missing"
fi

# Check admin directory
echo ""
echo "🔧 Checking admin panel..."
if [ -f "admin/admin.html" ]; then
    echo "✅ admin/admin.html - Found"
else
    echo "❌ admin/admin.html - Missing"
fi

# Check configuration files
echo ""
echo "⚙️ Checking configuration files..."
if [ -f "tailwind.config.js" ]; then
    echo "✅ tailwind.config.js - Found"
else
    echo "❌ tailwind.config.js - Missing"
fi

if [ -f "products.json" ]; then
    echo "✅ products.json - Found"
else
    echo "❌ products.json - Missing"
fi

if [ -f "README.md" ]; then
    echo "✅ README.md - Found"
else
    echo "❌ README.md - Missing"
fi

echo ""
echo "🎉 File structure verification complete!"
echo "=================================="
