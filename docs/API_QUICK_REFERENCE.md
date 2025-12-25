# Domnex API Quick Reference

Quick reference for the most commonly used API methods.

## 🔐 Authentication

```javascript
// Login
await nopAPI.login({ email, password, rememberMe: true });

// Register
await nopAPI.register({ email, password, firstName, lastName });

// Logout
await nopAPI.logout();

// Check if logged in
nopAPI.isAuthenticated();

// Get current user
await nopAPI.getCurrentUser();
```

---

## 🛍️ Products

```javascript
// Home page products
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

// Recently viewed
await nopAPI.getRecentlyViewedProducts();
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

## 🛒 Shopping Cart

```javascript
// Get cart
await nopAPI.getCart();

// Mini cart (header)
await nopAPI.getMiniCart();

// Add to cart
await nopAPI.addToCartFromCatalog(123, { quantity: 1 });
await nopAPI.addToCartFromDetails(123, { quantity: 2, attributes: {...} });

// Update cart
await nopAPI.updateCart({ itemId: 456, quantity: 3 });

// Apply coupon
await nopAPI.applyDiscountCoupon('SAVE20');

// Remove coupon
await nopAPI.removeDiscountCoupon();

// Apply gift card
await nopAPI.applyGiftCard('GIFT-CODE');
```

---

## ❤️ Wishlist

```javascript
// Get wishlist
await nopAPI.getWishlist();

// Update wishlist
await nopAPI.updateWishlist({ itemId: 789, quantity: 1 });

// Move to cart
await nopAPI.addWishlistItemsToCart({ itemIds: [789, 790] });
```

---

## 👤 Customer Profile

```javascript
// Get customer info
await nopAPI.getCustomerInfo();

// Update info
await nopAPI.updateCustomerInfo({ firstName, lastName, email });

// Get addresses
await nopAPI.getCustomerAddresses();

// Add address
await nopAPI.addCustomerAddress({ firstName, lastName, city, address1, ... });

// Update address
await nopAPI.updateCustomerAddress(123, { ... });

// Delete address
await nopAPI.deleteCustomerAddress(123);

// Change password
await nopAPI.changeCustomerPassword({ oldPassword, newPassword });

// Avatar
await nopAPI.getCustomerAvatar();
await nopAPI.uploadCustomerAvatar(fileObject);
await nopAPI.removeCustomerAvatar();
```

---

## 📦 Orders

```javascript
// Customer orders
await nopAPI.getCustomerOrders();

// Order details
await nopAPI.getOrderDetails(456);

// Reorder
await nopAPI.reorder(456);

// Shipment tracking
await nopAPI.getShipmentDetails(789);
```

---

## 💳 Checkout Flow

```javascript
// 1. Billing address
await nopAPI.getBillingAddress();

// 2. Shipping address
await nopAPI.getShippingAddress();

// 3. Shipping method
const methods = await nopAPI.getShippingMethod();
await nopAPI.selectShippingMethod({ shippingMethodId: 123 });

// 4. Payment method
const payments = await nopAPI.getPaymentMethod();
await nopAPI.selectPaymentMethod({ paymentMethodSystemName: 'Payments.Manual' });

// 5. Payment info
await nopAPI.getPaymentInfo();

// 6. Confirm
const confirmModel = await nopAPI.getConfirmOrder();
const result = await nopAPI.confirmOrder();

// 7. Completed
await nopAPI.getCheckoutCompleted();
```

---

## ⭐ Reviews & Compare

```javascript
// Product reviews
await nopAPI.getProductReviews(123);
await nopAPI.addProductReview(123, { title, reviewText, rating: 5 });
await nopAPI.getCustomerProductReviews();

// Compare
await nopAPI.addToCompareList(123);
await nopAPI.removeFromCompareList(123);
await nopAPI.getCompareProducts();
await nopAPI.clearCompareList();
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

## 🌍 Settings

```javascript
// Language
await nopAPI.getLanguageSelector();
await nopAPI.setLanguage(2);

// Currency
await nopAPI.getCurrencySelector();
await nopAPI.setCurrency(3);

// Countries & States
await nopAPI.getStatesByCountryId(1);
```

---

## 📧 Contact

```javascript
// Contact form
await nopAPI.getContactUs();
await nopAPI.sendContactForm({ fullName, email, subject, message });

// Newsletter
await nopAPI.subscribeNewsletter('email@example.com');
```

---

## 🛠️ Utilities

```javascript
// API version
await nopAPI.getApiVersion();

// Sitemap
await nopAPI.getSitemap();

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

### Authentication Check
```javascript
if (!nopAPI.isAuthenticated()) {
    window.location.href = '/login.html';
    return;
}

const user = await nopAPI.getCurrentUser();
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

---

## 🔗 Links

- **[Complete API Guide](DOMNEX_API_GUIDE.md)** - Full documentation
- **[Live API Docs](http://backend.hotimpex.net.162-222-225-82.plesk-web7.webhostbox.net/api/index.html)** - Interactive documentation
- **[Swagger JSON](http://backend.hotimpex.net.162-222-225-82.plesk-web7.webhostbox.net/api/frontend_v4.60.07/swagger.json)** - OpenAPI spec

---

*Version: 1.0.0 | Last Updated: December 25, 2024*
