# Hot Impex Catalog API - Quick Reference

Quick reference for catalog display features only.

## 🔗 Configuration

**Base URL:** `http://backend.hotimpex.net.162-222-225-82.plesk-web7.webhostbox.net`

**API Prefix:** `/api-frontend/`

---

## 🛍️ Products

```javascript
// Home page products (featured)
await nopAPI.getHomePageProducts();

// Product details
await nopAPI.getProductById(123);

// Search products
await nopAPI.searchProducts({ q: 'cable', pageSize: 12 });

// Search autocomplete
await nopAPI.getSearchAutocomplete('gaming');

// New products
await nopAPI.getNewProducts();

// Related products
await nopAPI.getRelatedProducts(123);
```

---

## 📁 Categories

```javascript
// All categories
await nopAPI.getCategories();

// Category details
await nopAPI.getCategoryById(5);

// Category products
await nopAPI.getCategoryProducts(5, { pageNumber: 1, pageSize: 12 });

// Subcategories
await nopAPI.getCategorySubcategories(5);

// Home page categories
await nopAPI.getHomePageCategories();
```

---

## 🏭 Manufacturers & Vendors

```javascript
// Manufacturers
await nopAPI.getAllManufacturers();
await nopAPI.getManufacturerById(10);
await nopAPI.getManufacturerProducts(10, { pageSize: 12 });

// Vendors
await nopAPI.getAllVendors();
await nopAPI.getVendorById(5);
await nopAPI.getVendorProducts(5, { pageSize: 12 });
```

---

## 📧 Contact

```javascript
// Contact form
await nopAPI.getContactUs();
await nopAPI.sendContactForm({ fullName, email, subject, message });
```

---

## 🛠️ Utilities

```javascript
// API version
await nopAPI.getApiVersion();

// Topics/Pages
await nopAPI.getTopicDetails(10);
await nopAPI.getTopicBySystemName('AboutUs');

// Health check
await nopAPI.checkHealth();
```

---

## 📋 Common Patterns

### Error Handling
```javascript
try {
    const product = await nopAPI.getProductById(123);
    displayProduct(product);
} catch (error) {
    console.error('Error:', error.message);
    showErrorMessage('Failed to load product');
}
```

### Loading States
```javascript
showLoader();
try {
    const products = await nopAPI.getHomePageProducts();
    displayProducts(products);
} catch (error) {
    showError(error);
} finally {
    hideLoader();
}
```

### Pagination
```javascript
const page = 1;
const pageSize = 12;

const products = await nopAPI.getCategoryProducts(categoryId, {
    pageNumber: page,
    pageSize: pageSize
});

console.log('Total:', products.totalCount);
console.log('Pages:', Math.ceil(products.totalCount / pageSize));
```

### Display Product Images
```javascript
const product = await nopAPI.getProductById(123);

// Get full image URL
const imageUrl = nopAPI.getImageUrl(product.pictureModels[0].imageUrl);
```

---

## 🎯 Usage in HTML

Include the scripts in this order:

```html
<!-- 1. Configuration -->
<script src="assets/js/config.js"></script>

<!-- 2. API Service -->
<script src="assets/js/nop-api-catalog.js"></script>

<!-- 3. Your app code -->
<script src="assets/js/main.js"></script>
```

Then use in your code:

```javascript
// API is automatically initialized as global 'nopAPI'
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const products = await nopAPI.getHomePageProducts();
        renderProducts(products);
    } catch (error) {
        console.error('Failed to load products:', error);
    }
});
```

---

## 🔍 Example: Product Listing Page

```javascript
async function loadCategoryProducts(categoryId, page = 1) {
    const loader = document.getElementById('loader');
    const container = document.getElementById('products-container');
    
    loader.classList.remove('hidden');
    
    try {
        const data = await nopAPI.getCategoryProducts(categoryId, {
            pageNumber: page,
            pageSize: 12,
            orderBy: 'position'
        });
        
        // Clear container
        container.innerHTML = '';
        
        // Render products
        data.products.forEach(product => {
            const card = createProductCard(product);
            container.appendChild(card);
        });
        
        // Render pagination
        renderPagination(data.totalCount, page, 12);
        
    } catch (error) {
        container.innerHTML = '<p>Failed to load products</p>';
        console.error(error);
    } finally {
        loader.classList.add('hidden');
    }
}

function createProductCard(product) {
    const div = document.createElement('div');
    div.className = 'product-card';
    div.innerHTML = `
        <img src="${nopAPI.getImageUrl(product.defaultPictureModel?.imageUrl)}" 
             alt="${product.name}">
        <h3>${product.name}</h3>
        <p class="price">${product.productPrice.price}</p>
        <button onclick="viewProduct(${product.id})">View Details</button>
    `;
    return div;
}
```

---

## 🔍 Example: Search Functionality

```javascript
const searchInput = document.getElementById('search-input');
const searchResults = document.getElementById('search-results');

// Debounced search
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const term = e.target.value.trim();
    
    if (term.length < 2) {
        searchResults.innerHTML = '';
        return;
    }
    
    searchTimeout = setTimeout(async () => {
        try {
            const suggestions = await nopAPI.getSearchAutocomplete(term);
            displaySearchSuggestions(suggestions);
        } catch (error) {
            console.error('Search failed:', error);
        }
    }, 300);
});

// Full search
async function performSearch(query) {
    try {
        const results = await nopAPI.searchProducts({
            q: query,
            pageNumber: 1,
            pageSize: 20
        });
        
        displaySearchResults(results);
    } catch (error) {
        console.error('Search failed:', error);
    }
}
```

---

## 🔗 Links

- **[Live API Docs](http://backend.hotimpex.net.162-222-225-82.plesk-web7.webhostbox.net/api/index.html)**
- **[Swagger JSON](http://backend.hotimpex.net.162-222-225-82.plesk-web7.webhostbox.net/api/frontend_v4.60.07/swagger.json)**

---

*Version: 2.0.0 (Catalog Only) | Last Updated: December 25, 2024*
