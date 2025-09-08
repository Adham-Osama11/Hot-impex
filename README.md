# HOT IMPEX - Professional E-commerce Website

A modern, responsive e-commerce website for HOT IMPEX featuring product showcases, dark/light theme support, professional admin dashboard, and a complete Node.js backend API.

## 🚀 Features

### Frontend
- **Responsive Design** - Works on all devices
- **Dark/Light Theme** - User preference support
- **Product Catalog** - Professional product showcase
- **Admin Dashboard** - Complete management interface
- **Modern UI** - Clean and professional design

### Backend (NEW!)
- **RESTful API** - Complete product, user, and order management
- **JWT Authentication** - Secure user sessions
- **Admin Management** - Full CRUD operations
- **File-based Database** - Easy deployment with JSON files
- **Security Features** - Rate limiting, input validation, CORS
- **Real-time API** - Instant data updates

## 📁 Project Structure

```
Hot impex/
├── 📁 public/                   # Frontend assets and pages
│   ├── 📁 admin/               # Admin dashboard
│   │   └── admin.html          # Admin panel interface
│   ├── 📁 assets/              # Static assets
│   │   ├── 📁 css/             # Stylesheets
│   │   │   ├── admin-styles.css # Admin panel styles
│   │   │   └── styles.css      # Main website styles
│   │   ├── 📁 js/              # JavaScript files
│   │   │   ├── admin.js        # Admin panel functionality
│   │   │   └── scripts.js      # Main website scripts
│   │   └── 📁 images/          # Image assets
│   │       ├── 📁 logos/       # Logo files
│   │       ├── 📁 partners/    # Partner logos
│   │       ├── 📁 Products/    # Product images
│   │       └── *.png           # Other images
│   ├── about.html              # About page
│   ├── contact.html            # Contact page
│   ├── checkout.html           # Checkout page
│   ├── index.html              # Homepage
│   ├── product.html            # Product details page
│   ├── profile.html            # User profile page
│   └── shop.html               # Shop/catalog page
├── 📁 server/                  # Backend API
│   ├── 📁 config/              # Configuration files
│   ├── 📁 controllers/         # Route controllers
│   ├── 📁 middleware/          # Express middleware
│   ├── 📁 models/              # Data models
│   ├── 📁 routes/              # API routes
│   ├── 📁 services/            # Business logic
│   ├── 📁 utils/               # Utility functions
│   └── server.js               # Main server file
├── 📁 database/                # JSON database files
│   ├── orders.json            # Order data
│   ├── products.json          # Product data
│   └── users.json             # User data
├── 📁 docs/                    # Documentation
│   ├── DEVELOPMENT.md         # Development guide
│   └── MONGODB_SETUP.md       # MongoDB setup guide
├── 📁 scripts/                 # Utility scripts
│   ├── setup-mongodb.sh      # MongoDB setup script
│   ├── test-api.sh           # API testing script
│   └── verify-structure.sh    # Structure verification
├── 📁 tests/                   # Test files
│   └── test-cart-functionality.html
├── package.json               # Dependencies and scripts
├── tailwind.config.js         # Tailwind CSS configuration
└── README.md                  # This file
```

## 🚀 Features

- **Responsive Design**: Fully responsive across all devices
- **Dark/Light Theme**: Toggle between dark and light modes
- **Product Showcase**: Interactive product display with animations
- **Admin Dashboard**: Complete admin panel for product management
- **Modern UI**: Clean, professional design with animations
- **SEO Optimized**: Proper meta tags and semantic HTML

## 🛠️ Technologies Used

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS, Custom CSS with CSS Variables
- **3D Graphics**: Three.js for interactive elements
- **Icons**: SVG icons and custom graphics
- **Fonts**: Google Fonts (Inter, Playfair Display)

## 📋 Setup Instructions

### Backend + Frontend Setup (Recommended)

1. **Clone the repository**
   ```bash
   git clone https://github.com/Adham-Osama11/Hot-impex.git
   cd Hot-impex
   ```

2. **Install Node.js dependencies**
   ```bash
   npm install
   ```

3. **Start the backend server**
   ```bash
   npm start
   # Or for development with auto-restart
   npm run dev
   ```

4. **Access the application**
   - **Website**: http://localhost:3000
   - **Admin Panel**: http://localhost:3000/admin
   - **API Documentation**: http://localhost:3000/api/health

### Frontend Only Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/Adham-Osama11/Hot-impex.git
   cd Hot-impex
   ```

2. **Open the project**
   - Open `public/index.html` in your browser for the main website
   - Open `public/admin/admin.html` for the admin dashboard

3. **Development**
   - No build process required - pure HTML/CSS/JS
   - Edit files directly and refresh browser to see changes

### Available Scripts

```bash
npm start        # Start the backend server
npm run dev      # Start server with nodemon (auto-restart)
npm run client   # Serve frontend files only (Python server)
npm run server   # Start backend server
```

## 🔧 API Endpoints

The backend provides a complete RESTful API:

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/search/:query` - Search products

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (auth required)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders (auth required)
- `GET /api/orders/:id` - Get single order (auth required)

### Admin (Authentication Required)
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/orders` - All orders management
- `POST /api/admin/products` - Create product
- `PUT /api/admin/products/:id` - Update product
- `DELETE /api/admin/products/:id` - Delete product

### Default Admin Credentials
- **Email**: admin@hotimpex.com
- **Password**: password

## 🎨 Customization

### Colors and Themes
- Main CSS variables are defined in `assets/css/styles.css`
- Dark mode styles are prefixed with `html.dark`
- Custom gradients and colors can be modified in the `:root` section

### Adding Products
- Update `products.json` for product data
- Add product images to `assets/images/Products/`
- Update JavaScript arrays in `assets/js/scripts.js`

### Admin Panel
- Admin styles in `assets/css/admin-styles.css`
- Admin functionality in `assets/js/admin.js`

## 📱 Pages

1. **Homepage** (`index.html`)
   - Hero section with product showcase
   - Interactive 3D elements
   - Partner logos section
   - Stats and features

2. **Shop** (`shop.html`)
   - Product catalog
   - Filtering and search
   - Product cards with animations

3. **Contact** (`contact.html`)
   - Contact form
   - Company information
   - Social media links

4. **About** (`about.html`)
   - Company story
   - Mission and vision
   - Team information

5. **Admin Dashboard** (`admin/admin.html`)
   - Product management
   - Order tracking
   - Analytics dashboard

## 🔧 Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## 📝 License

Copyright © 2025 HOT IMPEX. All rights reserved.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For technical support or questions:
- Email: support@hotimpex.com
- Website: [HOT IMPEX](https://hotimpex.com)

---

**Note**: This project has been recently cleaned and organized for better maintainability and development experience.
