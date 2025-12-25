# HOT IMPEX - Product Catalog

A professional product catalog website for HOT IMPEX, showcasing AV distribution, cables, gaming equipment, and other tech products.

## 🚀 Overview

This is a static frontend application that displays products from a nopCommerce backend API. The catalog allows users to browse categories, view product details, and search for items.

## 📁 Project Structure

```
Hot-impex/
├── index.html              # Home page
├── shop.html               # Product catalog/shop page
├── product.html            # Product detail page
├── about.html              # About page
├── contact.html            # Contact page
├── profile.html            # User profile page
├── 404.html                # Error page
├── favicon.ico             # Site icon
│
├── admin/                  # Admin dashboard
│   └── admin.html
│
├── assets/                 # Static assets
│   ├── css/                # Stylesheets
│   │   ├── styles.css
│   │   ├── index.css
│   │   ├── shop.css
│   │   ├── product.css
│   │   ├── navbar.css
│   │   └── ...
│   │
│   ├── js/                 # JavaScript files
│   │   ├── config.js       # API configuration
│   │   ├── main.js         # Main entry point
│   │   ├── scripts.js      # General scripts
│   │   │
│   │   ├── modules/        # Feature modules
│   │   │   ├── api-service.js
│   │   │   ├── shop.js
│   │   │   ├── products.js
│   │   │   ├── search.js
│   │   │   ├── auth-service.js
│   │   │   └── ...
│   │   │
│   │   └── admin/          # Admin dashboard scripts
│   │       ├── app.js
│   │       ├── dashboard.js
│   │       ├── products.js
│   │       └── ...
│   │
│   └── images/             # Image assets
│       ├── logos/
│       ├── partners/
│       └── Products/
│
├── docs/                   # Documentation
│   └── DEVELOPMENT.md
│
└── .github/                # GitHub workflows
```

## 🔧 Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS
- **Backend API**: nopCommerce (hosted separately)
- **Icons**: Font Awesome
- **Deployment**: Static hosting (GitHub Pages, Netlify, Vercel, etc.)

## 🎯 Features

### Customer Features
- ✅ Browse products by category
- ✅ View detailed product information
- ✅ Search products with autocomplete
- ✅ Shopping cart and wishlist
- ✅ Product reviews and comparison
- ✅ User authentication and profile management
- ✅ Order history and tracking
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Fast loading and optimized performance

### Admin Features
- ✅ Dashboard with analytics
- ✅ Product management
- ✅ User management
- ✅ Order tracking

## 📚 Documentation

- **[Domnex API Integration Guide](docs/DOMNEX_API_GUIDE.md)** - Complete API reference and examples
- **[API Usage Guide](docs/API_USAGE_GUIDE.md)** - Best practices and patterns
- **[Development Guide](docs/DEVELOPMENT.md)** - Development setup and workflows
- **[Project Structure](STRUCTURE.md)** - Detailed file structure
- **[API Requirements](API_REQUIREMENTS.md)** - Backend requirements

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Domnex Web API Backend (already configured)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Adham-Osama11/Hot-impex.git
   cd Hot-impex
   ```

2. **API is pre-configured**
   
   The Domnex Web API is already configured in `assets/js/config.js`:
   ```javascript
   const API_CONFIG = {
       BASE_URL: 'http://backend.hotimpex.net.162-222-225-82.plesk-web7.webhostbox.net',
       ENDPOINTS: {
           // All endpoints pre-configured
       }
   };
   ```

3. **Run locally**
   
   Option 1: Using Python
   ```bash
   python3 -m http.server 8000
   ```
   
   Option 2: Using PHP
   ```bash
   php -S localhost:8000
   ```
   
   Option 3: Using Node.js (npm start)
   ```bash
   npm start
   ```
   
   Option 4: Using VS Code Live Server extension
   - Install Live Server extension
   - Right-click `index.html` → "Open with Live Server"

4. **Access the site**
   ```
   http://localhost:8000
   ```

### API Usage Examples

```javascript
// Products
const products = await nopAPI.getHomePageProducts();
const product = await nopAPI.getProductById(123);

// Search
const results = await nopAPI.searchProducts({ q: 'cable', pageSize: 12 });

// Cart
await nopAPI.addToCartFromCatalog(123, { quantity: 1 });
const cart = await nopAPI.getCart();

// Authentication
await nopAPI.login({ email: 'user@example.com', password: 'password' });
const user = await nopAPI.getCurrentUser();

// Categories
const categories = await nopAPI.getCategories();
const categoryProducts = await nopAPI.getCategoryProducts(5);
```

For complete API documentation, see **[Domnex API Guide](docs/DOMNEX_API_GUIDE.md)**.

## 🌐 Deployment

### Deploy to Netlify
1. Push your code to GitHub
2. Go to [Netlify](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Deploy!

### Deploy to GitHub Pages
```bash
git checkout -b gh-pages
git push origin gh-pages
```
Enable GitHub Pages in repository settings.

### Deploy to Vercel
```bash
npx vercel
```

## 📝 Configuration

### API Configuration
The Domnex Web API is configured in `assets/js/config.js`:

```javascript
const API_CONFIG = {
    BASE_URL: 'http://backend.hotimpex.net.162-222-225-82.plesk-web7.webhostbox.net',
    ENDPOINTS: {
        // Authentication
        LOGIN: '/api-frontend/Customer/Login',
        REGISTER: '/api-frontend/Customer/Register',
        
        // Products
        PRODUCTS: '/api-frontend/Catalog/GetCatalogRoot',
        PRODUCT_BY_ID: '/api-frontend/Product/GetProductDetails/{productId}',
        
        // Shopping Cart
        CART: '/api-frontend/ShoppingCart/Cart',
        ADD_TO_CART: '/api-frontend/ShoppingCart/AddProductToCartFromCatalog/{productId}',
        
        // ... 50+ more endpoints
    }
};
```

**API Documentation**: 
- [Complete API Guide](docs/DOMNEX_API_GUIDE.md)
- [Live API Docs](http://backend.hotimpex.net.162-222-225-82.plesk-web7.webhostbox.net/api/index.html)

### Styling
- Main styles: `assets/css/styles.css`
- Tailwind config: `tailwind.config.js`
- Page-specific styles in respective CSS files

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 📞 Contact

**HOT IMPEX**
- Website: [hotimpex.com](https://hotimpex.com)
- Email: info@hotimpex.com
- GitHub: [@Adham-Osama11](https://github.com/Adham-Osama11)

## 🙏 Acknowledgments

- **Domnex Web API** (nopCommerce-based) for backend services
- **Tailwind CSS** for styling framework
- **Font Awesome** for icons
- **nopCommerce** open-source e-commerce platform

---

**API Version**: Domnex Web API Frontend v4.60.07  
**Last Updated**: December 25, 2024
