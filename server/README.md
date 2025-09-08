# HOT IMPEX Backend Server

A Node.js/Express.js backend server for the HOT IMPEX e-commerce website.

## Features

- **RESTful API** for products, users, and orders
- **JWT Authentication** for secure user sessions
- **Admin Dashboard** with comprehensive management features
- **File-based Database** using JSON files for easy deployment
- **Security Middleware** including Helmet, CORS, and rate limiting
- **Input Validation** using express-validator
- **File Upload** support for product images
- **Comprehensive Error Handling**

## API Endpoints

### Products
- `GET /api/products` - Get all products (with filtering, search, pagination)
- `GET /api/products/:id` - Get single product
- `GET /api/products/category/:category` - Get products by category
- `GET /api/products/search/:query` - Search products
- `GET /api/products/categories` - Get all categories

### Users
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile (auth required)
- `PUT /api/users/profile` - Update user profile (auth required)
- `PUT /api/users/change-password` - Change password (auth required)

### Orders
- `POST /api/orders` - Create new order
- `GET /api/orders` - Get user orders (auth required)
- `GET /api/orders/:id` - Get single order (auth required)
- `PUT /api/orders/:id/cancel` - Cancel order (auth required)
- `PUT /api/orders/:id/status` - Update order status (admin only)

### Admin
- `GET /api/admin/stats` - Dashboard statistics (admin only)
- `GET /api/admin/orders` - All orders management (admin only)
- `GET /api/admin/users` - All users management (admin only)
- `POST /api/admin/products` - Create product (admin only)
- `PUT /api/admin/products/:id` - Update product (admin only)
- `DELETE /api/admin/products/:id` - Delete product (admin only)

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp .env.example .env
   # Edit .env file with your configuration
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Start Production Server**
   ```bash
   npm start
   ```

5. **Serve Client Files**
   ```bash
   npm run client
   ```

## Default Admin Credentials

- **Email:** admin@hotimpex.com
- **Password:** password (hash: $2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi)

## Project Structure

```
server/
├── app.js                 # Main application file
├── server.js             # Server entry point
├── config/
│   └── db.js             # File database configuration
├── controllers/
│   ├── adminController.js
│   ├── orderController.js
│   ├── productController.js
│   └── userController.js
├── middleware/
│   ├── auth.js           # Authentication middleware
│   ├── errorHandler.js   # Error handling middleware
│   └── notFound.js       # 404 handler
├── models/
│   ├── Order.js          # Order model
│   ├── Product.js        # Product model
│   └── User.js           # User model
├── routes/
│   ├── adminRoutes.js
│   ├── orderRoutes.js
│   ├── productRoutes.js
│   └── userRoutes.js
└── utils/
    ├── ApiResponse.js    # API response utilities
    └── upload.js         # File upload configuration
```

## Environment Variables

```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-secret-key
JWT_EXPIRE=30d
CORS_ORIGINS=http://localhost:3000,http://localhost:8000
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./public/assets/images/uploads
ADMIN_EMAIL=admin@hotimpex.com
ADMIN_PASSWORD=admin123456
RATE_LIMIT_WINDOW_MS=600000
RATE_LIMIT_MAX_REQUESTS=100
LOG_LEVEL=debug
```

## Security Features

- **Helmet.js** - Sets various HTTP headers
- **CORS** - Cross-Origin Resource Sharing configuration
- **Rate Limiting** - Prevents abuse
- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - Using bcryptjs
- **Input Validation** - Using express-validator
- **Error Handling** - Comprehensive error responses

## Database

The application uses a file-based JSON database system located in the `database/` directory:

- `products.json` - Product catalog
- `users.json` - User accounts
- `orders.json` - Order history

## Testing the API

You can test the API using tools like Postman or curl:

```bash
# Health check
curl http://localhost:3000/api/health

# Get all products
curl http://localhost:3000/api/products

# User registration
curl -X POST http://localhost:3000/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"John","lastName":"Doe","email":"john@example.com","password":"password123"}'

# User login
curl -X POST http://localhost:3000/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"password123"}'
```

## Development

- **Nodemon** is configured for automatic server restart during development
- **Morgan** provides HTTP request logging in development mode
- **Detailed error messages** in development environment

## Production Deployment

1. Set `NODE_ENV=production` in your environment
2. Configure your production domain in `CORS_ORIGINS`
3. Use a strong `JWT_SECRET`
4. Set up proper logging and monitoring
5. Consider using a process manager like PM2

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.
