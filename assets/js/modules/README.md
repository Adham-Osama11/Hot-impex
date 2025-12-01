# Hot Impex JavaScript Modules

This document describes the modular JavaScript architecture for the Hot Impex website. The original monolithic `scripts.js` file has been split into focused, maintainable modules.

## Architecture Overview

The JavaScript codebase is now organized into specialized modules that handle specific aspects of the application:

```
public/assets/js/
├── modules/
│   ├── auth-service.js      # Authentication and user session management
│   ├── api-service.js       # API communication with backend
│   ├── cart-service.js      # Cart logic for logged-in and guest users
│   ├── cart-ui.js           # Cart user interface and interactions
│   ├── ui-components.js     # Reusable UI components and interactions
│   ├── search.js            # Search functionality for both header and hero
│   ├── shop.js              # Shop page product display and filtering
│   ├── products.js          # Product management and display logic
│   ├── animations.js        # Scroll animations, parallax, and visual effects
│   └── profile.js           # User profile and order management
├── main.js                  # Main application initialization and coordination
└── scripts.js               # Legacy file (can be removed after migration)
```

## Module Dependencies

The modules are loaded in the following order to ensure proper dependency resolution:

1. **auth-service.js** - Core authentication (no dependencies)
2. **api-service.js** - API communication (depends on auth-service)
3. **cart-service.js** - Cart logic (depends on auth-service, api-service)
4. **ui-components.js** - UI components (minimal dependencies)
5. **search.js** - Search functionality (depends on api-service)
6. **shop.js** - Shop page logic (depends on api-service, search)
7. **cart-ui.js** - Cart interface (depends on cart-service, ui-components)
8. **products.js** - Product management (depends on api-service)
9. **animations.js** - Visual effects (no dependencies)
10. **profile.js** - Profile management (depends on auth-service, api-service)
11. **main.js** - Application coordinator (depends on all modules)

## Module Descriptions

### auth-service.js
Handles user authentication and session management:
- JWT token management
- Login/logout functionality
- User session validation
- Profile data management

**Key Classes/Functions:**
- `AuthService` - Main authentication service
- `AuthService.login()` - User login
- `AuthService.logout()` - User logout
- `AuthService.isLoggedIn()` - Check authentication status

### api-service.js
Centralized API communication layer:
- HTTP request handling
- Error management
- Endpoint abstraction
- Response formatting

**Key Classes/Functions:**
- `APIService` - Main API service
- `APIService.getProducts()` - Fetch products
- `APIService.addToCart()` - Add items to cart
- `APIService.createOrder()` - Create new orders

### cart-service.js
Cart functionality for both logged-in and guest users:
- Guest cart management (localStorage)
- User cart synchronization
- Cart data persistence
- Cart migration between guest and user states

**Key Classes/Functions:**
- `CartService` - Main cart service
- `CartService.addToCart()` - Add products to cart
- `CartService.loadUserCart()` - Load user-specific cart
- `CartService.migrateGuestCartToUser()` - Migrate guest cart to user account

### cart-ui.js
Cart user interface and interactions:
- Cart sidebar display
- Cart item management UI
- Quantity updates
- Cart notifications

**Key Classes/Functions:**
- `CartUI` - Cart interface manager
- `CartUI.toggleCart()` - Show/hide cart sidebar
- `CartUI.updateCartUI()` - Refresh cart display
- `CartUI.createCartItemHTML()` - Generate cart item markup

### ui-components.js
Reusable UI components and common interactions:
- Dark mode toggle
- Mobile menu
- Quick view modals
- Notifications
- Loading states

**Key Classes/Functions:**
- `UIComponents` - UI component manager
- `UIComponents.toggleDarkMode()` - Switch between light/dark themes
- `UIComponents.showNotification()` - Display user notifications
- `UIComponents.openQuickView()` - Show product quick view

### search.js
Search functionality for header and hero sections:
- Live search as you type
- API and local search fallback
- Search result display
- Search suggestions

**Key Classes/Functions:**
- `SearchManager` - Search functionality manager
- `SearchManager.handleSearch()` - Process search queries
- `SearchManager.displaySearchResults()` - Show search results
- `SearchManager.setupShopSearch()` - Configure shop page search

### shop.js
Shop page product display and filtering:
- Product grid display
- Category filtering
- Search integration
- URL parameter handling

**Key Classes/Functions:**
- `ShopManager` - Shop page manager
- `ShopManager.loadProducts()` - Load products from API
- `ShopManager.filterProducts()` - Apply category/search filters
- `ShopManager.createProductCard()` - Generate product cards

### products.js
Product management and display logic:
- Product data management
- Featured products display
- Product page functionality
- Product CRUD operations

**Key Classes/Functions:**
- `ProductsManager` - Product management
- `ProductsManager.loadFeaturedProducts()` - Load featured products
- `ProductsManager.createProductCard()` - Generate product markup
- `ProductsManager.getProductById()` - Find product by ID

### animations.js
Visual effects and animations:
- Scroll animations
- Parallax effects
- Hero product showcase
- Mobile gestures
- Sticky navigation

**Key Classes/Functions:**
- `AnimationsManager` - Animation controller
- `AnimationsManager.initScrollAnimations()` - Setup scroll effects
- `AnimationsManager.initializeHeroProductShowcase()` - Hero animations
- `AnimationsManager.initMobileGestures()` - Touch interactions

### profile.js
User profile and order management:
- Profile data display
- Order history
- Order details modal
- Profile updates

**Key Classes/Functions:**
- `ProfileManager` - Profile page manager
- `ProfileManager.loadUserOrders()` - Load user order history
- `ProfileManager.viewOrderDetails()` - Show order details
- `ProfileManager.updateProfile()` - Update user profile

### main.js
Application initialization and coordination:
- Module initialization order
- Page-specific setup
- Global event handlers
- Error handling

**Key Classes/Functions:**
- `HotImpexApp` - Main application class
- `HotImpexApp.init()` - Initialize application
- `HotImpexApp.initializeCurrentPage()` - Setup page-specific functionality

## HTML Integration

To use the modular structure, include the scripts in your HTML in the correct order:

```html
<!-- JavaScript Modules -->
<!-- Load modules in dependency order -->
<script src="assets/js/modules/auth-service.js"></script>
<script src="assets/js/modules/api-service.js"></script>
<script src="assets/js/modules/cart-service.js"></script>
<script src="assets/js/modules/ui-components.js"></script>
<script src="assets/js/modules/search.js"></script>
<script src="assets/js/modules/shop.js"></script>
<script src="assets/js/modules/cart-ui.js"></script>
<script src="assets/js/modules/products.js"></script>
<script src="assets/js/modules/animations.js"></script>
<script src="assets/js/modules/profile.js"></script>

<!-- Main initialization script -->
<script src="assets/js/main.js"></script>
```

## Global Variables and Compatibility

The modules maintain compatibility with existing code by exposing key functions and objects globally:

- `window.cart` - Global cart array
- `window.addToCart()` - Add product to cart
- `window.toggleCart()` - Toggle cart sidebar
- `window.viewProduct()` - Navigate to product page
- `window.openQuickView()` - Open product quick view
- `window.APIService` - API service access
- `window.AuthService` - Authentication service access

## Benefits of Modular Architecture

1. **Maintainability**: Each module focuses on a specific functionality
2. **Testability**: Modules can be tested independently
3. **Reusability**: Components can be reused across different pages
4. **Performance**: Modules can be loaded conditionally based on page needs
5. **Collaboration**: Different developers can work on different modules
6. **Debugging**: Easier to locate and fix issues in specific modules

## Development Guidelines

1. **Single Responsibility**: Each module should handle one specific area of functionality
2. **Clear Interfaces**: Use consistent naming conventions and clear APIs
3. **Error Handling**: Each module should handle its own errors gracefully
4. **Documentation**: Include clear comments and documentation for each module
5. **Global Exposure**: Only expose what needs to be accessed from other modules
6. **Dependency Management**: Keep dependencies minimal and well-defined

## Migration Notes

The original `scripts.js` file can be gradually phased out as the modular system is fully integrated. All existing functionality has been preserved in the new modular structure with backward compatibility maintained through global function exposure.

## Future Enhancements

1. **Lazy Loading**: Load modules only when needed
2. **ES6 Modules**: Migrate to modern ES6 module syntax
3. **Build Process**: Implement bundling and minification
4. **TypeScript**: Add type safety with TypeScript
5. **Testing**: Add unit tests for each module
