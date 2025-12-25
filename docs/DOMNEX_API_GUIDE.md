# Domnex Web API Frontend Integration Guide

## Overview

This guide documents the integration of **Domnex Web API Frontend v4.60.07** (nopCommerce-based) for Hot Impex e-commerce platform.

**Base URL:** `http://backend.hotimpex.net.162-222-225-82.plesk-web7.webhostbox.net`

**API Prefix:** `/api-frontend/`

---

## Table of Contents

1. [Authentication](#authentication)
2. [Products](#products)
3. [Categories](#categories)
4. [Shopping Cart](#shopping-cart)
5. [Wishlist](#wishlist)
6. [Customer Profile](#customer-profile)
7. [Orders & Checkout](#orders--checkout)
8. [Manufacturers & Vendors](#manufacturers--vendors)
9. [Product Reviews & Compare](#product-reviews--compare)
10. [Common Settings](#common-settings)
11. [Contact & Communication](#contact--communication)

---

## Authentication

### Get API Version
```javascript
const version = await nopAPI.getApiVersion();
console.log('API Version:', version);
```

### Get Authentication Token
```javascript
const authResponse = await nopAPI.getAuthToken('user@example.com', 'password123');
// Token is automatically stored
```

### Login
```javascript
const loginData = {
    email: 'user@example.com',
    password: 'password123',
    rememberMe: true
};

const response = await nopAPI.login(loginData);
console.log('User logged in:', response);
```

### Register
```javascript
const userData = {
    email: 'newuser@example.com',
    password: 'securePassword123',
    firstName: 'John',
    lastName: 'Doe',
    // ... other fields
};

const response = await nopAPI.register(userData);
console.log('User registered:', response);
```

### Logout
```javascript
await nopAPI.logout();
console.log('User logged out');
```

### Check Authentication Status
```javascript
if (nopAPI.isAuthenticated()) {
    console.log('User is logged in');
}
```

### Password Recovery
```javascript
// Step 1: Get recovery model
const model = await nopAPI.getPasswordRecovery();

// Step 2: Send recovery email
await nopAPI.sendPasswordRecovery('user@example.com');

// Step 3: Confirm with token
await nopAPI.confirmPasswordRecovery({
    token: 'recovery-token',
    email: 'user@example.com',
    newPassword: 'newPassword123'
});
```

---

## Products

### Get Product by ID
```javascript
const product = await nopAPI.getProductById(123);
console.log('Product:', product);
```

### Get Home Page Products (Featured)
```javascript
const featuredProducts = await nopAPI.getHomePageProducts();
console.log('Featured Products:', featuredProducts);
```

### Get New Products
```javascript
const newProducts = await nopAPI.getNewProducts();
console.log('New Products:', newProducts);
```

### Search Products
```javascript
const searchData = {
    q: 'cable',
    pageNumber: 1,
    pageSize: 12
};

const results = await nopAPI.searchProducts(searchData);
console.log('Search Results:', results);
```

### Get Search Autocomplete
```javascript
const suggestions = await nopAPI.getSearchAutocomplete('gaming');
console.log('Suggestions:', suggestions);
```

### Get Related Products
```javascript
const relatedProducts = await nopAPI.getRelatedProducts(123);
console.log('Related Products:', relatedProducts);
```

### Get Recently Viewed Products
```javascript
const recentlyViewed = await nopAPI.getRecentlyViewedProducts();
console.log('Recently Viewed:', recentlyViewed);
```

---

## Categories

### Get All Categories
```javascript
const categories = await nopAPI.getCategories();
console.log('Categories:', categories);
```

### Get Category by ID
```javascript
const category = await nopAPI.getCategoryById(5);
console.log('Category:', category);
```

### Get Category Products
```javascript
const params = {
    pageNumber: 1,
    pageSize: 12,
    orderBy: 'position'
};

const products = await nopAPI.getCategoryProducts(5, params);
console.log('Category Products:', products);
```

### Get Category Subcategories
```javascript
const subcategories = await nopAPI.getCategorySubcategories(5);
console.log('Subcategories:', subcategories);
```

### Get Home Page Categories
```javascript
const homeCategories = await nopAPI.getHomePageCategories();
console.log('Home Page Categories:', homeCategories);
```

---

## Shopping Cart

### Get Cart
```javascript
const cart = await nopAPI.getCart();
console.log('Shopping Cart:', cart);
```

### Get Mini Cart (for header)
```javascript
const miniCart = await nopAPI.getMiniCart();
console.log('Mini Cart:', miniCart);
```

### Add to Cart from Catalog
```javascript
const data = {
    quantity: 1
};

await nopAPI.addToCartFromCatalog(123, data);
console.log('Product added to cart');
```

### Add to Cart from Product Details
```javascript
const data = {
    quantity: 2,
    productAttributes: {
        attributeId1: 'value1',
        attributeId2: 'value2'
    }
};

await nopAPI.addToCartFromDetails(123, data);
console.log('Product added to cart with attributes');
```

### Update Cart
```javascript
const cartData = {
    itemId: 456,
    quantity: 3
};

await nopAPI.updateCart(cartData);
console.log('Cart updated');
```

### Apply Discount Coupon
```javascript
await nopAPI.applyDiscountCoupon('SAVE20');
console.log('Discount applied');
```

### Remove Discount Coupon
```javascript
await nopAPI.removeDiscountCoupon();
console.log('Discount removed');
```

### Apply Gift Card
```javascript
await nopAPI.applyGiftCard('GIFT-1234-5678');
console.log('Gift card applied');
```

### Remove Gift Card
```javascript
await nopAPI.removeGiftCard('GIFT-1234-5678');
console.log('Gift card removed');
```

---

## Wishlist

### Get Wishlist
```javascript
const wishlist = await nopAPI.getWishlist();
console.log('Wishlist:', wishlist);
```

### Update Wishlist
```javascript
const wishlistData = {
    itemId: 789,
    quantity: 1
};

await nopAPI.updateWishlist(wishlistData);
console.log('Wishlist updated');
```

### Move Wishlist Items to Cart
```javascript
const data = {
    itemIds: [789, 790]
};

await nopAPI.addWishlistItemsToCart(data);
console.log('Items moved to cart');
```

### Get Email Wishlist Model
```javascript
const emailModel = await nopAPI.getEmailWishlist();
console.log('Email Wishlist Model:', emailModel);
```

---

## Customer Profile

### Get Customer Info
```javascript
const customerInfo = await nopAPI.getCustomerInfo();
console.log('Customer Info:', customerInfo);
```

### Update Customer Info
```javascript
const data = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890'
};

await nopAPI.updateCustomerInfo(data);
console.log('Profile updated');
```

### Get Customer Addresses
```javascript
const addresses = await nopAPI.getCustomerAddresses();
console.log('Addresses:', addresses);
```

### Add Customer Address
```javascript
const addressData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    company: 'Hot Impex',
    countryId: 1,
    stateProvinceId: 5,
    city: 'New York',
    address1: '123 Main Street',
    address2: 'Apt 4B',
    zipPostalCode: '10001',
    phoneNumber: '+1234567890'
};

await nopAPI.addCustomerAddress(addressData);
console.log('Address added');
```

### Update Customer Address
```javascript
const addressData = {
    firstName: 'John',
    lastName: 'Doe',
    // ... other fields
};

await nopAPI.updateCustomerAddress(123, addressData);
console.log('Address updated');
```

### Delete Customer Address
```javascript
await nopAPI.deleteCustomerAddress(123);
console.log('Address deleted');
```

### Get Customer Avatar
```javascript
const avatarInfo = await nopAPI.getCustomerAvatar();
console.log('Avatar Info:', avatarInfo);
```

### Upload Customer Avatar
```javascript
const fileInput = document.getElementById('avatar-input');
const file = fileInput.files[0];

await nopAPI.uploadCustomerAvatar(file);
console.log('Avatar uploaded');
```

### Remove Customer Avatar
```javascript
await nopAPI.removeCustomerAvatar();
console.log('Avatar removed');
```

### Change Password
```javascript
const passwordData = {
    oldPassword: 'currentPassword123',
    newPassword: 'newSecurePassword456',
    confirmNewPassword: 'newSecurePassword456'
};

await nopAPI.changeCustomerPassword(passwordData);
console.log('Password changed');
```

### Get Downloadable Products
```javascript
const downloads = await nopAPI.getCustomerDownloadableProducts();
console.log('Downloadable Products:', downloads);
```

---

## Orders & Checkout

### Get Customer Orders
```javascript
const orders = await nopAPI.getCustomerOrders();
console.log('Orders:', orders);
```

### Get Order Details
```javascript
const orderDetails = await nopAPI.getOrderDetails(456);
console.log('Order Details:', orderDetails);
```

### Reorder
```javascript
await nopAPI.reorder(456);
console.log('Items added to cart from previous order');
```

### Get Shipment Details
```javascript
const shipment = await nopAPI.getShipmentDetails(789);
console.log('Shipment Details:', shipment);
```

### Checkout Flow

#### 1. Billing Address
```javascript
const billingAddress = await nopAPI.getBillingAddress();
console.log('Billing Address Model:', billingAddress);
```

#### 2. Shipping Address
```javascript
const shippingAddress = await nopAPI.getShippingAddress();
console.log('Shipping Address Model:', shippingAddress);
```

#### 3. Shipping Method
```javascript
// Get available methods
const shippingMethods = await nopAPI.getShippingMethod();

// Select a method
await nopAPI.selectShippingMethod({
    shippingMethodId: 123
});
```

#### 4. Payment Method
```javascript
// Get available methods
const paymentMethods = await nopAPI.getPaymentMethod();

// Select a method
await nopAPI.selectPaymentMethod({
    paymentMethodSystemName: 'Payments.Manual'
});
```

#### 5. Payment Info
```javascript
const paymentInfo = await nopAPI.getPaymentInfo();
console.log('Payment Info:', paymentInfo);
```

#### 6. Confirm Order
```javascript
// Get confirmation model
const confirmModel = await nopAPI.getConfirmOrder();

// Confirm the order
const orderResult = await nopAPI.confirmOrder();
console.log('Order Confirmed:', orderResult);
```

#### 7. Order Completed
```javascript
const completedInfo = await nopAPI.getCheckoutCompleted();
console.log('Order Completed:', completedInfo);
```

---

## Manufacturers & Vendors

### Get All Manufacturers
```javascript
const manufacturers = await nopAPI.getAllManufacturers();
console.log('Manufacturers:', manufacturers);
```

### Get Manufacturer by ID
```javascript
const manufacturer = await nopAPI.getManufacturerById(10);
console.log('Manufacturer:', manufacturer);
```

### Get Manufacturer Products
```javascript
const params = {
    pageNumber: 1,
    pageSize: 12
};

const products = await nopAPI.getManufacturerProducts(10, params);
console.log('Manufacturer Products:', products);
```

### Get All Vendors
```javascript
const vendors = await nopAPI.getAllVendors();
console.log('Vendors:', vendors);
```

### Get Vendor by ID
```javascript
const vendor = await nopAPI.getVendorById(5);
console.log('Vendor:', vendor);
```

### Get Vendor Products
```javascript
const params = {
    pageNumber: 1,
    pageSize: 12
};

const products = await nopAPI.getVendorProducts(5, params);
console.log('Vendor Products:', products);
```

---

## Product Reviews & Compare

### Get Product Reviews
```javascript
const reviews = await nopAPI.getProductReviews(123);
console.log('Product Reviews:', reviews);
```

### Add Product Review
```javascript
const reviewData = {
    title: 'Great product!',
    reviewText: 'This is an excellent product. Highly recommended.',
    rating: 5
};

await nopAPI.addProductReview(123, reviewData);
console.log('Review added');
```

### Get Customer's Product Reviews
```javascript
const myReviews = await nopAPI.getCustomerProductReviews();
console.log('My Reviews:', myReviews);
```

### Add to Compare List
```javascript
await nopAPI.addToCompareList(123);
console.log('Product added to compare list');
```

### Remove from Compare List
```javascript
await nopAPI.removeFromCompareList(123);
console.log('Product removed from compare list');
```

### Get Compare Products
```javascript
const compareList = await nopAPI.getCompareProducts();
console.log('Compare List:', compareList);
```

### Clear Compare List
```javascript
await nopAPI.clearCompareList();
console.log('Compare list cleared');
```

---

## Common Settings

### Language

```javascript
// Get available languages
const languages = await nopAPI.getLanguageSelector();

// Set language
await nopAPI.setLanguage(2); // Language ID
```

### Currency

```javascript
// Get available currencies
const currencies = await nopAPI.getCurrencySelector();

// Set currency
await nopAPI.setCurrency(3); // Currency ID
```

### Get States by Country
```javascript
const states = await nopAPI.getStatesByCountryId(1);
console.log('States:', states);
```

---

## Contact & Communication

### Get Contact Us Page
```javascript
const contactModel = await nopAPI.getContactUs();
console.log('Contact Model:', contactModel);
```

### Send Contact Form
```javascript
const contactData = {
    fullName: 'John Doe',
    email: 'john@example.com',
    subject: 'Product Inquiry',
    message: 'I would like to know more about...'
};

await nopAPI.sendContactForm(contactData);
console.log('Contact form sent');
```

### Subscribe to Newsletter
```javascript
await nopAPI.subscribeNewsletter('user@example.com');
console.log('Subscribed to newsletter');
```

---

## Utility Methods

### Get Sitemap
```javascript
const sitemap = await nopAPI.getSitemap();
console.log('Sitemap:', sitemap);
```

### Get Topic Details
```javascript
// By ID
const topic = await nopAPI.getTopicDetails(10);

// By system name
const aboutTopic = await nopAPI.getTopicBySystemName('AboutUs');
```

### Check API Health
```javascript
const health = await nopAPI.checkHealth();
console.log('API Health:', health);
```

---

## Error Handling

All API methods return Promises and should be wrapped in try-catch blocks:

```javascript
try {
    const product = await nopAPI.getProductById(123);
    console.log('Product:', product);
} catch (error) {
    console.error('Failed to fetch product:', error.message);
    // Handle error appropriately
}
```

---

## Configuration

The API is configured in `/assets/js/config.js`:

```javascript
const API_CONFIG = {
    BASE_URL: 'http://backend.hotimpex.net.162-222-225-82.plesk-web7.webhostbox.net',
    API_KEY: '', // Optional, for Bearer token
    HEADERS: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    ENDPOINTS: {
        // All endpoints defined here
    }
};
```

---

## Authentication Token Management

The API automatically manages authentication tokens:

- Tokens are stored in `localStorage` as `authToken`
- User data is stored in `localStorage` as `currentUser`
- Tokens are automatically included in request headers
- Use `nopAPI.isAuthenticated()` to check login status

---

## Best Practices

1. **Always handle errors**: Wrap API calls in try-catch blocks
2. **Check authentication**: Use `isAuthenticated()` before making authenticated requests
3. **Use loading states**: Show loading indicators during API calls
4. **Cache when possible**: Store frequently accessed data (categories, etc.)
5. **Validate input**: Validate user input before sending to API
6. **Handle session expiry**: Redirect to login when receiving 401 errors
7. **Use pagination**: Don't load all products at once
8. **Optimize images**: Use appropriate image sizes from the API

---

## Common Response Structures

### Product Object
```javascript
{
    id: 123,
    name: 'Product Name',
    shortDescription: 'Short description...',
    fullDescription: 'Full description...',
    sku: 'PROD-123',
    price: 99.99,
    oldPrice: 129.99,
    productPrice: {
        price: '$99.99',
        priceValue: 99.99
    },
    pictureModels: [
        {
            imageUrl: 'http://...',
            thumbImageUrl: 'http://...',
            fullSizeImageUrl: 'http://...',
            title: 'Image title',
            alternateText: 'Alt text'
        }
    ],
    // ... more fields
}
```

### Customer Object
```javascript
{
    id: 456,
    email: 'user@example.com',
    username: 'username',
    firstName: 'John',
    lastName: 'Doe',
    gender: 'M',
    dateOfBirth: '1990-01-01',
    company: 'Company Name',
    // ... more fields
}
```

---

## Support & Documentation

- **API Documentation**: http://backend.hotimpex.net.162-222-225-82.plesk-web7.webhostbox.net/api/index.html
- **Swagger JSON**: http://backend.hotimpex.net.162-222-225-82.plesk-web7.webhostbox.net/api/frontend_v4.60.07/swagger.json
- **Version**: v4.60.07
- **Provider**: Domnex Web API Frontend

---

## Changelog

### Version 1.0.0 (December 2024)
- Initial integration with Domnex Web API Frontend
- Complete CRUD operations for products, categories, cart, wishlist
- Authentication and customer profile management
- Full checkout flow implementation
- Product reviews and comparison features

---

*Last Updated: December 25, 2024*
