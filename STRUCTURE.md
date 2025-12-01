# Hot Impex - Directory Structure

## 📁 Current Structure (Updated - December 2025)

```
Hot-impex/                          # Root directory
│
├── 📄 HTML Pages (Root Level)
│   ├── index.html                  # Home page - Main landing
│   ├── shop.html                   # Product catalog/browsing
│   ├── product.html                # Product detail page
│   ├── about.html                  # About us page
│   ├── contact.html                # Contact page
│   ├── profile.html                # User profile
│   └── 404.html                    # Error page
│
├── 📁 admin/                       # Admin Dashboard
│   └── admin.html                  # Admin panel interface
│
├── 📁 assets/                      # Static Assets
│   │
│   ├── 📁 css/                     # Stylesheets
│   │   ├── styles.css              # Global styles
│   │   ├── navbar.css              # Navigation styles
│   │   ├── index.css               # Home page styles
│   │   ├── shop.css                # Shop page styles
│   │   ├── product.css             # Product page styles
│   │   ├── about.css               # About page styles
│   │   ├── contact.css             # Contact page styles
│   │   ├── profile.css             # Profile page styles
│   │   └── admin-styles.css        # Admin dashboard styles
│   │
│   ├── 📁 js/                      # JavaScript Files
│   │   ├── config.js               # API configuration
│   │   ├── main.js                 # Main entry point
│   │   ├── scripts.js              # General scripts
│   │   ├── admin.js                # Admin loader
│   │   │
│   │   ├── 📁 modules/             # Feature Modules
│   │   │   ├── api-service.js      # API communication
│   │   │   ├── shop.js             # Shop functionality
│   │   │   ├── products.js         # Product handling
│   │   │   ├── product-detail.js   # Product details
│   │   │   ├── search.js           # Search functionality
│   │   │   ├── auth-service.js     # Authentication
│   │   │   ├── profile.js          # Profile management
│   │   │   ├── ui-components.js    # UI components
│   │   │   ├── animations.js       # Animations
│   │   │   ├── analytics-service.js # Analytics
│   │   │   └── README.md           # Modules documentation
│   │   │
│   │   └── 📁 admin/               # Admin Scripts
│   │       ├── app.js              # Admin app loader
│   │       ├── api.js              # Admin API calls
│   │       ├── dashboard.js        # Dashboard logic
│   │       ├── products.js         # Product management
│   │       ├── orders.js           # Order management
│   │       ├── users.js            # User management
│   │       ├── auth-guard.js       # Authentication guard
│   │       ├── charts.js           # Chart rendering
│   │       ├── ui.js               # UI utilities
│   │       ├── utils.js            # Helper functions
│   │       └── README.md           # Admin docs
│   │
│   └── 📁 images/                  # Image Assets
│       ├── 📁 logos/               # Brand logos
│       ├── 📁 partners/            # Partner logos
│       └── 📁 Products/            # Product images
│           ├── �� Av distribution/
│           ├── 📁 Cable/
│           ├── 📁 Ceiling bracket/
│           └── 📁 Gaming/
│
├── 📁 docs/                        # Documentation
│   └── DEVELOPMENT.md              # Development guide
│
├── 📁 .github/                     # GitHub Configuration
│   └── workflows/                  # CI/CD workflows
│
├── 📁 .vscode/                     # VS Code Settings
│
├── 📄 Configuration Files
│   ├── README.md                   # Project documentation
│   ├── STRUCTURE.md                # This file
│   ├── .gitignore                  # Git ignore rules
│   ├── tailwind.config.js          # Tailwind CSS config
│   └── favicon.ico                 # Site favicon
│
└── 📁 .git/                        # Git repository
```

## 🔗 Path Reference Guide

### HTML Files (All at Root)
```
index.html
shop.html
product.html
about.html
contact.html
profile.html
404.html
admin/admin.html
```

### CSS Files
```
assets/css/styles.css
assets/css/navbar.css
assets/css/index.css
assets/css/shop.css
assets/css/product.css
assets/css/about.css
assets/css/contact.css
assets/css/profile.css
assets/css/admin-styles.css
```

### JavaScript Files
```
assets/js/config.js
assets/js/main.js
assets/js/scripts.js
assets/js/admin.js
assets/js/modules/*.js
assets/js/admin/*.js
```

### Images
```
favicon.ico
assets/images/logos/
assets/images/partners/
assets/images/Products/
```

## 📝 Notes

### Path Types Used
- **Relative paths**: Used throughout for portability
- **Root-level HTML**: All pages at root for clean URLs
- **Organized assets**: All static files in `/assets/`
- **Admin subfolder**: Isolated admin dashboard

### Benefits
✅ Clean, professional structure
✅ Easy to navigate and maintain
✅ Works with static hosting
✅ No build process required
✅ SEO-friendly URLs

### Migration Notes
- Removed: `public/` directory (moved to root)
- Removed: Node.js dependencies
- Removed: Backend server files
- Removed: Database files
- Updated: All file paths to relative
- Updated: All links for new structure

Last updated: December 1, 2025
