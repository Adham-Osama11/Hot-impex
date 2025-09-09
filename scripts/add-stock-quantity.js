#!/usr/bin/env node

/**
 * Script to add stockQuantity field to all existing products
 * This ensures backward compatibility for existing products
 */

const fs = require('fs').promises;
const path = require('path');

async function addStockQuantityToProducts() {
    try {
        const productsPath = path.join(__dirname, '../database/products.json');
        
        // Read the current products file
        const data = await fs.readFile(productsPath, 'utf8');
        const productsData = JSON.parse(data);
        
        let updatedCount = 0;
        
        // Add stockQuantity field to products that don't have it
        productsData.products = productsData.products.map(product => {
            if (product.stockQuantity === undefined) {
                product.stockQuantity = 0; // Default to 0 for existing products
                updatedCount++;
            }
            return product;
        });
        
        // Write the updated data back to the file
        await fs.writeFile(productsPath, JSON.stringify(productsData, null, 2));
        
        console.log(`✅ Successfully updated ${updatedCount} products with stockQuantity field`);
        console.log(`📊 Total products: ${productsData.products.length}`);
        
    } catch (error) {
        console.error('❌ Error updating products:', error.message);
        process.exit(1);
    }
}

// Run the script
addStockQuantityToProducts();
