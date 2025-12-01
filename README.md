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
- ✅ Search products
- ✅ Responsive design (mobile, tablet, desktop)
- ✅ Fast loading and optimized performance

### Admin Features
- ✅ Dashboard with analytics
- ✅ Product management
- ✅ User management
- ✅ Order tracking

## 🚀 Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- nopCommerce backend API URL and credentials

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Adham-Osama11/Hot-impex.git
   cd Hot-impex
   ```

2. **Configure API connection**
   
   Edit `assets/js/config.js` and update with your nopCommerce API details:
   ```javascript
   const API_CONFIG = {
       BASE_URL: 'https://your-nopcommerce-api.com/api',
       API_KEY: 'your-api-key-here',
       // ... other config
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
   
   Option 3: Using VS Code Live Server extension
   - Install Live Server extension
   - Right-click `index.html` → "Open with Live Server"

4. **Access the site**
   ```
   http://localhost:8000
   ```

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
Update `assets/js/config.js` with your backend details:

```javascript
const API_CONFIG = {
    BASE_URL: 'https://api.yourstore.com/api',
    API_KEY: 'your-api-key',
    ENDPOINTS: {
        CATEGORIES: '/categories',
        PRODUCTS: '/products',
        // ... more endpoints
    }
};
```

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

- nopCommerce for backend API
- Tailwind CSS for styling framework
- Font Awesome for icons
