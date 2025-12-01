# nopCommerce API Client - Usage Guide

## Overview

The nopCommerce API client (`nop-api.js`) provides a comprehensive interface for interacting with the nopCommerce backend. This guide explains how to use the API client in your frontend application.

---

## Setup

### 1. Include Required Files in HTML

Add these scripts in your HTML files in the correct order:

```html
<!-- Load configuration first -->
<script src="assets/js/config.js"></script>

<!-- Load API client -->
<script src="assets/js/nop-api.js"></script>

<!-- Your application scripts -->
<script src="assets/js/your-app.js"></script>
```

### 2. Configure API Settings

Update `assets/js/config.js` with your backend information:

```javascript
const API_CONFIG = {
    BASE_URL: 'https://your-nopcommerce-server.com/api',
    API_KEY: 'your-api-key-here',
    // ... other settings
};
```

### 3. Access the API Client

The API client is automatically initialized and available globally as `window.nopAPI`:

```javascript
// The API is ready to use after DOM loads
document.addEventListener('DOMContentLoaded', () => {
    console.log('API Client:', window.nopAPI);
});
```

---

## Authentication

### Login

```javascript
async function loginUser() {
    try {
        const response = await window.nopAPI.login(
            'user@example.com',
            'password123'
        );
        
        console.log('Login successful:', response);
        console.log('User:', response.customer);
        // Token is automatically stored
        
    } catch (error) {
        console.error('Login failed:', error.message);
    }
}
```

### Register

```javascript
async function registerUser() {
    try {
        const userData = {
            email: 'newuser@example.com',
            password: 'password123',
            firstName: 'John',
            lastName: 'Doe',
            phone: '+1234567890',
            acceptTerms: true
        };
        
        const response = await window.nopAPI.register(userData);
        console.log('Registration successful:', response);
        
    } catch (error) {
        console.error('Registration failed:', error.message);
    }
}
```

### Check Authentication Status

```javascript
// Check if user is logged in
if (window.nopAPI.isAuthenticated()) {
    console.log('User is logged in');
    console.log('Current user:', window.nopAPI.currentUser);
}

// Check if user is admin
if (window.nopAPI.isAdmin()) {
    console.log('User is admin');
}
```

### Logout

```javascript
async function logoutUser() {
    try {
        await window.nopAPI.logout();
        console.log('Logged out successfully');
        // Redirects or updates UI
        
    } catch (error) {
        console.error('Logout error:', error.message);
    }
}
```

### Get Current User

```javascript
async function getCurrentUser() {
    try {
        const user = await window.nopAPI.getCurrentUser();
        console.log('Current user:', user);
        
    } catch (error) {
        console.error('Failed to get user:', error.message);
    }
}
```

### Password Reset

```javascript
// Request password reset
async function forgotPassword() {
    try {
        const response = await window.nopAPI.forgotPassword('user@example.com');
        console.log('Reset email sent:', response.message);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Reset password with token
async function resetPassword(token) {
    try {
        const response = await window.nopAPI.resetPassword(token, 'newpassword123');
        console.log('Password reset successful');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

---

## Products

### Get All Products

```javascript
async function loadProducts() {
    try {
        const response = await window.nopAPI.getProducts({
            page: 1,
            pageSize: 12,
            orderby: 'name',
            sortorder: 'asc'
        });
        
        console.log('Products:', response.data);
        console.log('Total:', response.total);
        console.log('Pages:', response.totalPages);
        
        // Display products in UI
        displayProducts(response.data);
        
    } catch (error) {
        console.error('Error loading products:', error.message);
    }
}
```

### Get Product by ID

```javascript
async function loadProductDetails(productId) {
    try {
        const product = await window.nopAPI.getProductById(productId);
        
        console.log('Product:', product);
        console.log('Name:', product.name);
        console.log('Price:', product.price);
        console.log('Images:', product.pictureModels);
        console.log('Specs:', product.productSpecifications);
        
        // Display product details
        displayProductDetails(product);
        
    } catch (error) {
        console.error('Error loading product:', error.message);
    }
}
```

### Search Products

```javascript
async function searchProducts(query) {
    try {
        const response = await window.nopAPI.searchProducts(query, {
            page: 1,
            pageSize: 20
        });
        
        console.log('Search results:', response.data);
        displaySearchResults(response.data);
        
    } catch (error) {
        console.error('Search error:', error.message);
    }
}
```

### Get Products by Category

```javascript
async function loadCategoryProducts(categoryId) {
    try {
        const response = await window.nopAPI.getProductsByCategory(categoryId, {
            page: 1,
            pageSize: 12,
            orderby: 'price',
            sortorder: 'asc'
        });
        
        console.log('Category products:', response.data);
        displayProducts(response.data);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

### Get Product Images

```javascript
// Get image URL from product data
function getProductImageUrl(product) {
    const imageUrl = product.defaultPictureModel?.imageUrl;
    return window.nopAPI.getImageUrl(imageUrl);
}

// Example usage
const product = await window.nopAPI.getProductById(1);
const imageUrl = window.nopAPI.getImageUrl(product.defaultPictureModel.imageUrl);

console.log('Image URL:', imageUrl);
// Result: https://your-api.com/images/thumbs/0000001_product.jpeg
```

---

## Categories

### Get All Categories

```javascript
async function loadCategories() {
    try {
        const response = await window.nopAPI.getCategories();
        
        console.log('Categories:', response.data);
        
        // Display categories
        response.data.forEach(category => {
            console.log(`${category.name}: ${category.productCount} products`);
        });
        
        displayCategories(response.data);
        
    } catch (error) {
        console.error('Error loading categories:', error.message);
    }
}
```

### Get Category by ID

```javascript
async function loadCategoryDetails(categoryId) {
    try {
        const category = await window.nopAPI.getCategoryById(categoryId);
        
        console.log('Category:', category);
        console.log('Subcategories:', category.subCategories);
        
        displayCategoryDetails(category);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

---

## Customer Profile

### Get Customer Profile

```javascript
async function loadUserProfile(customerId) {
    try {
        const profile = await window.nopAPI.getCustomerProfile(customerId);
        
        console.log('Profile:', profile);
        displayProfile(profile);
        
    } catch (error) {
        console.error('Error loading profile:', error.message);
    }
}
```

### Update Customer Profile

```javascript
async function updateProfile(customerId) {
    try {
        const updatedData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            phone: '+1234567890',
            company: 'Tech Company'
        };
        
        const response = await window.nopAPI.updateCustomerProfile(customerId, updatedData);
        
        console.log('Profile updated:', response);
        
    } catch (error) {
        console.error('Error updating profile:', error.message);
    }
}
```

### Get Customer Addresses

```javascript
async function loadAddresses(customerId) {
    try {
        const response = await window.nopAPI.getCustomerAddresses(customerId);
        
        console.log('Addresses:', response.addresses);
        displayAddresses(response.addresses);
        
    } catch (error) {
        console.error('Error loading addresses:', error.message);
    }
}
```

### Add Address

```javascript
async function addAddress(customerId) {
    try {
        const addressData = {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            company: 'Tech Corp',
            country: 'United States',
            stateProvince: 'California',
            city: 'San Francisco',
            address1: '123 Main St',
            address2: 'Apt 4B',
            zipPostalCode: '94105',
            phoneNumber: '+1234567890'
        };
        
        const response = await window.nopAPI.addCustomerAddress(customerId, addressData);
        console.log('Address added:', response);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

### Update Address

```javascript
async function updateAddress(customerId, addressId) {
    try {
        const addressData = {
            address1: '456 New St',
            city: 'Los Angeles'
            // ... other fields
        };
        
        const response = await window.nopAPI.updateCustomerAddress(
            customerId, 
            addressId, 
            addressData
        );
        
        console.log('Address updated:', response);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

### Delete Address

```javascript
async function deleteAddress(customerId, addressId) {
    try {
        await window.nopAPI.deleteCustomerAddress(customerId, addressId);
        console.log('Address deleted');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

### Upload Profile Picture

```javascript
async function uploadAvatar(customerId, fileInput) {
    try {
        const file = fileInput.files[0];
        
        if (!file) {
            console.error('No file selected');
            return;
        }
        
        const response = await window.nopAPI.uploadCustomerAvatar(customerId, file);
        
        console.log('Avatar uploaded:', response.avatarUrl);
        
        // Update UI with new avatar
        document.querySelector('#avatar-img').src = response.avatarUrl;
        
    } catch (error) {
        console.error('Upload error:', error.message);
    }
}

// HTML
// <input type="file" id="avatar-input" accept="image/*">
// document.getElementById('avatar-input').addEventListener('change', (e) => {
//     uploadAvatar(currentUserId, e.target);
// });
```

---

## Contact & Communication

### Send Contact Form

```javascript
async function sendContactMessage() {
    try {
        const formData = {
            name: 'John Doe',
            email: 'john@example.com',
            subject: 'Product Inquiry',
            message: 'I would like to know more about...',
            phone: '+1234567890'
        };
        
        const response = await window.nopAPI.sendContactForm(formData);
        
        console.log('Message sent:', response.message);
        alert('Your message has been sent successfully!');
        
    } catch (error) {
        console.error('Error:', error.message);
        alert('Failed to send message. Please try again.');
    }
}
```

### Subscribe to Newsletter

```javascript
async function subscribeToNewsletter(email) {
    try {
        const response = await window.nopAPI.subscribeNewsletter(email);
        
        console.log('Subscribed:', response.message);
        alert('Thank you for subscribing!');
        
    } catch (error) {
        console.error('Error:', error.message);
        alert('Subscription failed. Please try again.');
    }
}
```

---

## Admin Operations

### Admin: Get Products

```javascript
async function adminLoadProducts() {
    try {
        const response = await window.nopAPI.adminGetProducts({
            page: 1,
            pageSize: 50
        });
        
        console.log('Admin products:', response.data);
        displayAdminProducts(response.data);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

### Admin: Create Product

```javascript
async function adminCreateProduct() {
    try {
        const productData = {
            name: 'New Product',
            shortDescription: 'Short description',
            fullDescription: 'Full description',
            sku: 'SKU-NEW-001',
            price: 199.99,
            oldPrice: 249.99,
            stockQuantity: 100,
            categoryIds: [1, 5],
            manufacturerId: 1,
            published: true
        };
        
        const response = await window.nopAPI.adminCreateProduct(productData);
        console.log('Product created:', response);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

### Admin: Update Product

```javascript
async function adminUpdateProduct(productId) {
    try {
        const productData = {
            name: 'Updated Product Name',
            price: 179.99,
            stockQuantity: 75
        };
        
        const response = await window.nopAPI.adminUpdateProduct(productId, productData);
        console.log('Product updated:', response);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

### Admin: Delete Product

```javascript
async function adminDeleteProduct(productId) {
    try {
        const confirmed = confirm('Are you sure you want to delete this product?');
        
        if (confirmed) {
            await window.nopAPI.adminDeleteProduct(productId);
            console.log('Product deleted');
        }
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

### Admin: Get Dashboard Statistics

```javascript
async function loadAdminStats() {
    try {
        const stats = await window.nopAPI.adminGetStatistics();
        
        console.log('Total Products:', stats.totalProducts);
        console.log('Total Customers:', stats.totalCustomers);
        console.log('Total Categories:', stats.totalCategories);
        console.log('Low Stock:', stats.lowStockProducts);
        
        displayDashboardStats(stats);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

### Admin: Get All Customers

```javascript
async function adminLoadCustomers() {
    try {
        const response = await window.nopAPI.adminGetCustomers({
            page: 1,
            pageSize: 50,
            q: 'search term'
        });
        
        console.log('Customers:', response.data);
        displayCustomers(response.data);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

---

## Utility Methods

### Check API Health

```javascript
async function checkAPIHealth() {
    const health = await window.nopAPI.checkHealth();
    console.log('API Status:', health.status);
}
```

### Get Store Information

```javascript
async function loadStoreInfo() {
    try {
        const storeInfo = await window.nopAPI.getStoreInfo();
        console.log('Store:', storeInfo);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}
```

---

## Error Handling

### Best Practices

```javascript
async function handleAPICall() {
    try {
        // Make API call
        const response = await window.nopAPI.getProducts();
        
        // Handle success
        console.log('Success:', response);
        
    } catch (error) {
        // Handle error
        console.error('Error:', error.message);
        
        // Show user-friendly message
        showErrorMessage('Failed to load products. Please try again.');
        
        // Log for debugging
        if (window.API_CONFIG.getEnvironment() === 'development') {
            console.error('Full error:', error);
        }
    }
}
```

### Loading States

```javascript
async function loadDataWithLoading() {
    // Show loading indicator
    showLoading();
    
    try {
        const products = await window.nopAPI.getProducts();
        displayProducts(products.data);
        
    } catch (error) {
        showError(error.message);
        
    } finally {
        // Always hide loading indicator
        hideLoading();
    }
}
```

---

## Complete Example: Product Listing Page

```javascript
class ProductListingPage {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 12;
        this.currentCategory = null;
    }
    
    async init() {
        await this.loadCategories();
        await this.loadProducts();
        this.setupEventListeners();
    }
    
    async loadCategories() {
        try {
            const response = await window.nopAPI.getCategories();
            this.displayCategories(response.data);
        } catch (error) {
            console.error('Error loading categories:', error);
        }
    }
    
    async loadProducts(categoryId = null) {
        try {
            this.showLoading();
            
            const params = {
                page: this.currentPage,
                pageSize: this.pageSize
            };
            
            const response = categoryId 
                ? await window.nopAPI.getProductsByCategory(categoryId, params)
                : await window.nopAPI.getProducts(params);
            
            this.displayProducts(response.data);
            this.displayPagination(response.totalPages);
            
        } catch (error) {
            this.showError('Failed to load products');
            console.error(error);
        } finally {
            this.hideLoading();
        }
    }
    
    async searchProducts(query) {
        try {
            this.showLoading();
            
            const response = await window.nopAPI.searchProducts(query, {
                page: 1,
                pageSize: this.pageSize
            });
            
            this.displayProducts(response.data);
            
        } catch (error) {
            this.showError('Search failed');
        } finally {
            this.hideLoading();
        }
    }
    
    displayProducts(products) {
        const container = document.getElementById('products-grid');
        container.innerHTML = '';
        
        products.forEach(product => {
            const imageUrl = window.nopAPI.getImageUrl(
                product.defaultPictureModel?.imageUrl
            );
            
            const productCard = `
                <div class="product-card">
                    <img src="${imageUrl}" alt="${product.name}">
                    <h3>${product.name}</h3>
                    <p class="price">$${product.price}</p>
                    <button onclick="viewProduct(${product.id})">
                        View Details
                    </button>
                </div>
            `;
            
            container.innerHTML += productCard;
        });
    }
    
    displayCategories(categories) {
        // Implementation...
    }
    
    displayPagination(totalPages) {
        // Implementation...
    }
    
    setupEventListeners() {
        // Search
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.searchProducts(e.target.value);
        });
        
        // Category filter
        document.querySelectorAll('.category-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const categoryId = e.target.dataset.categoryId;
                this.loadProducts(categoryId);
            });
        });
    }
    
    showLoading() {
        document.getElementById('loading').classList.remove('hidden');
    }
    
    hideLoading() {
        document.getElementById('loading').classList.add('hidden');
    }
    
    showError(message) {
        alert(message);
    }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const page = new ProductListingPage();
    page.init();
});
```

---

## Tips & Best Practices

1. **Always use try-catch blocks** for API calls
2. **Show loading indicators** during API requests
3. **Handle errors gracefully** with user-friendly messages
4. **Cache data when appropriate** to reduce API calls
5. **Check authentication** before making authenticated requests
6. **Use async/await** for cleaner code
7. **Log errors in development** for debugging
8. **Validate user input** before sending to API
9. **Use proper HTTP status codes** for error handling
10. **Test API integration** thoroughly before deployment

---

## Troubleshooting

### API Not Initialized

```javascript
if (!window.nopAPI) {
    console.error('API not initialized. Check if config.js and nop-api.js are loaded.');
}
```

### CORS Errors

- Ensure backend team has configured CORS to allow your domain
- Check if API_CONFIG.BASE_URL is correct

### Authentication Errors

- Check if token is valid
- Verify API key is correct
- Ensure user is logged in for protected endpoints

### Network Errors

- Check internet connection
- Verify API server is running
- Check for firewall or proxy issues

---

## Support

For API-related issues:
1. Check browser console for error messages
2. Verify API configuration in `config.js`
3. Test API endpoints using tools like Postman
4. Contact backend team if issues persist

---

**Document Version:** 1.0  
**Last Updated:** December 1, 2025
