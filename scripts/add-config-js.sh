#!/bin/bash

# Script to add config.js to all HTML files that use JavaScript
echo "🔧 Adding config.js to HTML files..."

# List of HTML files that need config.js
html_files=(
    "public/shop.html"
    "public/product.html"
    "public/checkout.html"
    "public/profile.html"
    "public/my-orders.html"
    "public/about.html"
    "public/contact.html"
    "public/admin/admin.html"
)

for file in "${html_files[@]}"; do
    if [ -f "$file" ]; then
        echo "📄 Processing $file..."
        
        # Check if config.js is already included
        if ! grep -q "assets/js/config.js" "$file"; then
            # Find the line with scripts.js and add config.js before it
            if grep -q "assets/js/scripts.js" "$file"; then
                sed -i 's|<script src="assets/js/scripts.js"></script>|<script src="assets/js/config.js"></script>\n    <script src="assets/js/scripts.js"></script>|g' "$file"
                echo "✅ Added config.js to $file"
            elif grep -q "assets/js/main.js" "$file"; then
                sed -i 's|<script src="assets/js/main.js"></script>|<script src="assets/js/config.js"></script>\n    <script src="assets/js/main.js"></script>|g' "$file"
                echo "✅ Added config.js to $file"
            else
                echo "⚠️  No main JavaScript file found in $file"
            fi
        else
            echo "✅ config.js already included in $file"
        fi
    else
        echo "❌ File not found: $file"
    fi
done

# Handle admin HTML file separately
admin_file="public/admin/admin.html"
if [ -f "$admin_file" ]; then
    echo "📄 Processing $admin_file..."
    if ! grep -q "config.js" "$admin_file"; then
        # Add config.js before any admin JS files
        if grep -q "assets/js/admin" "$admin_file"; then
            # Find the first admin JS file and add config.js before it
            sed -i '0,/assets\/js\/admin/{s|<script src="assets/js/admin|<script src="../assets/js/config.js"></script>\n        <script src="assets/js/admin|;}' "$admin_file"
            echo "✅ Added config.js to $admin_file"
        fi
    else
        echo "✅ config.js already included in $admin_file"
    fi
fi

echo "🎉 Config.js setup complete!"