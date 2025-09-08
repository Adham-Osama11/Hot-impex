# MongoDB Integration Setup

This guide will help you set up MongoDB for your HOT IMPEX backend.

## 🔧 Prerequisites

1. **MongoDB Atlas Account** (or local MongoDB installation)
2. **Node.js 18+** installed
3. **Network access** configured in MongoDB Atlas

## 📋 Setup Steps

### Option 1: Quick Setup (Recommended)

Run the setup script that will prompt you for your MongoDB password:

```bash
./setup-mongodb.sh
```

### Option 2: Manual Setup

1. **Update Environment Variables**
   
   Edit your `.env` file and replace `<db_password>` and `your_actual_password_here` with your actual MongoDB password:

   ```env
   MONGODB_URI=mongodb+srv://adham:YOUR_ACTUAL_PASSWORD@databases.tvdskeg.mongodb.net/hotimpex?retryWrites=true&w=majority&appName=Databases
   DB_PASSWORD=YOUR_ACTUAL_PASSWORD
   ```

2. **Start the Server**
   
   ```bash
   npm start
   ```

## 🗄️ Database Structure

The MongoDB integration includes three main collections:

### Products Collection
```javascript
{
  id: String (unique),
  name: String,
  category: String,
  categorySlug: String,
  description: String,
  shortDescription: String,
  price: Number,
  currency: String,
  inStock: Boolean,
  featured: Boolean,
  bestSeller: Boolean,
  images: [String],
  mainImage: String,
  specifications: Map,
  features: [String],
  tags: [String],
  stockQuantity: Number,
  sold: Number,
  rating: {
    average: Number,
    count: Number
  },
  timestamps: true
}
```

### Users Collection
```javascript
{
  firstName: String,
  lastName: String,
  email: String (unique),
  password: String (hashed),
  phone: String,
  role: String (customer/admin/moderator),
  isActive: Boolean,
  isEmailVerified: Boolean,
  avatar: String,
  address: Object,
  preferences: Object,
  lastLoginAt: Date,
  loginAttempts: Number,
  lockUntil: Date,
  timestamps: true
}
```

### Orders Collection
```javascript
{
  orderNumber: String (unique),
  user: ObjectId (ref: User),
  customerInfo: Object,
  items: [OrderItem],
  pricing: {
    subtotal: Number,
    tax: Number,
    shipping: Number,
    discount: Number,
    total: Number
  },
  status: String,
  paymentMethod: String,
  paymentStatus: String,
  shippingAddress: Object,
  billingAddress: Object,
  shipping: Object,
  notes: Object,
  history: [StatusHistory],
  timestamps: true
}
```

## 🔄 Data Migration

The server will automatically migrate your existing JSON data to MongoDB on first startup:

- **Products**: Migrated from `database/products.json`
- **Users**: Migrated from `database/users.json` (admin user)
- **Orders**: Will be created as new orders come in

## 🛠️ Advanced Features

### Search & Filtering
- **Text Search**: Full-text search across product names, descriptions, and tags
- **Category Filtering**: Filter products by category slug
- **Price Range**: Filter by minimum and maximum price
- **Stock Status**: Filter by in-stock availability
- **Featured/Best Sellers**: Filter by featured or best-seller status

### Security Features
- **Password Hashing**: Automatic bcrypt hashing with salt
- **Account Locking**: Temporary account lock after failed login attempts
- **JWT Authentication**: Secure token-based authentication
- **Input Validation**: Mongoose schema validation
- **Role-based Access**: Admin, moderator, and customer roles

### Performance Optimizations
- **Database Indexes**: Optimized indexes for search and filtering
- **Pagination**: Built-in pagination for large datasets
- **Aggregation**: Efficient statistics and analytics queries
- **Connection Pooling**: Automatic MongoDB connection management

## 📊 API Enhancements

With MongoDB integration, your API now supports:

### Enhanced Product Queries
```bash
# Search with multiple filters
GET /api/products?search=hdmi&category=cable&featured=true&minPrice=20&maxPrice=100&page=1&limit=10

# Sort by different fields
GET /api/products?sortBy=price&sortOrder=asc

# Get product statistics
GET /api/admin/stats
```

### User Management
```bash
# User registration with validation
POST /api/users/register

# Secure login with account protection
POST /api/users/login

# Profile management
GET /api/users/profile
PUT /api/users/profile
```

### Order Processing
```bash
# Create orders with automatic calculation
POST /api/orders

# Track order history
GET /api/orders/:id

# Admin order management
GET /api/admin/orders?status=pending&page=1
```

## 🔍 Monitoring & Debugging

### Connection Status
Check the server logs for MongoDB connection status:

```bash
✅ Connected to MongoDB successfully
💾 Database: MongoDB (Connected)
```

### Error Handling
Common issues and solutions:

1. **Connection Failed**
   - Check your MongoDB password in `.env`
   - Ensure network access is configured in MongoDB Atlas
   - Verify the connection string format

2. **Authentication Error**
   - Double-check your MongoDB username and password
   - Ensure the user has read/write permissions

3. **Data Migration Issues**
   - Check if JSON files exist in the `database/` directory
   - Verify JSON file format and structure

## 🚀 Benefits of MongoDB Integration

### Scalability
- **Horizontal Scaling**: Easy scaling across multiple servers
- **Automatic Sharding**: Built-in data distribution
- **Replica Sets**: High availability and data redundancy

### Performance
- **Indexing**: Fast queries with proper indexing
- **Aggregation Pipeline**: Complex data processing
- **Memory Management**: Efficient memory usage

### Developer Experience
- **Schema Validation**: Automatic data validation
- **Rich Queries**: Complex search and filtering
- **Transactions**: ACID compliance for critical operations

### Production Ready
- **Backup & Recovery**: Automated backups in Atlas
- **Monitoring**: Built-in performance monitoring
- **Security**: Enterprise-grade security features

## 📞 Support

If you encounter any issues with the MongoDB setup:

1. Check the server logs for detailed error messages
2. Verify your MongoDB Atlas configuration
3. Ensure your IP address is whitelisted in Atlas
4. Test the connection string in MongoDB Compass

For more help, refer to the [MongoDB Atlas documentation](https://docs.atlas.mongodb.com/).
