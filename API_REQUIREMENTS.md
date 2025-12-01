# HOT IMPEX - nopCommerce API Requirements

**Project:** Hot Impex Product Catalog Frontend  
**Date:** December 1, 2025  
**Purpose:** Frontend integration with nopCommerce backend

---

## Overview

This document outlines all API endpoints required by the Hot Impex frontend application. The frontend is a static catalog system that will consume these APIs to display products, manage user profiles, and provide admin functionality.

---

## Technical Requirements

### Base Configuration Needed
- **Base API URL**: `https://[your-domain]/api`
- **Authentication Method**: Bearer Token / API Key (please specify)
- **Response Format**: JSON
- **CORS Configuration**: Must allow requests from frontend domain
- **Rate Limiting**: Please specify limits if any

### Request Headers
```
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token} or API-Key {key}
```

---

## 1. Authentication & User Management APIs

### 1.1 User Login
```
POST /api/customers/login
```
**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
**Response (200 OK):**
```json
{
  "token": "jwt_token_here",
  "customer": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "isAdmin": false,
    "avatar": "url_to_avatar"
  }
}
```
**Error Response (401 Unauthorized):**
```json
{
  "error": "Invalid credentials"
}
```

---

### 1.2 User Registration
```
POST /api/customers/register
```
**Request Body:**
```json
{
  "email": "newuser@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "acceptTerms": true
}
```
**Response (201 Created):**
```json
{
  "token": "jwt_token_here",
  "customer": {
    "id": 1,
    "email": "newuser@example.com",
    "firstName": "John",
    "lastName": "Doe"
  }
}
```

---

### 1.3 Get Current User
```
GET /api/customers/current
Authorization: Bearer {token}
```
**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "isAdmin": false,
  "avatar": "url_to_avatar",
  "createdAt": "2025-01-01T00:00:00Z"
}
```

---

### 1.4 Logout User
```
POST /api/customers/logout
Authorization: Bearer {token}
```
**Response (200 OK):**
```json
{
  "message": "Logged out successfully"
}
```

---

### 1.5 Forgot Password
```
POST /api/customers/forgotpassword
```
**Request Body:**
```json
{
  "email": "user@example.com"
}
```
**Response (200 OK):**
```json
{
  "message": "Password reset email sent"
}
```

---

### 1.6 Reset Password
```
POST /api/customers/resetpassword
```
**Request Body:**
```json
{
  "token": "reset_token_from_email",
  "newPassword": "newpassword123"
}
```

---

## 2. Product APIs

### 2.1 Get All Products (with Pagination & Filters)
```
GET /api/products?page={page}&pageSize={size}&categoryid={id}&q={query}&orderby={field}&sortorder={asc|desc}
```
**Query Parameters:**
- `page` (optional, default: 1): Page number
- `pageSize` (optional, default: 12): Items per page
- `categoryid` (optional): Filter by category ID
- `q` (optional): Search query
- `orderby` (optional): Sort field (name, price, createddate)
- `sortorder` (optional): asc or desc
- `minprice` (optional): Minimum price filter
- `maxprice` (optional): Maximum price filter

**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "4K UHD Generator",
      "shortDescription": "Professional 4K signal generator",
      "fullDescription": "Detailed description...",
      "sku": "SKU-001",
      "price": 299.99,
      "oldPrice": 349.99,
      "stockQuantity": 50,
      "defaultPictureModel": {
        "imageUrl": "0000001_product.jpeg",
        "fullSizeImageUrl": "0000001_product_full.jpeg"
      },
      "pictureModels": [
        {
          "imageUrl": "0000001_product.jpeg"
        },
        {
          "imageUrl": "0000002_product.jpeg"
        }
      ],
      "productSpecifications": [
        {
          "specificationAttributeName": "Resolution",
          "valueRaw": "4K UHD"
        }
      ],
      "manufacturerName": "Tech Corp",
      "seName": "4k-uhd-generator",
      "categoryIds": [1, 5]
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 12,
  "totalPages": 13
}
```

---

### 2.2 Get Single Product
```
GET /api/products/{id}
```
**Response (200 OK):**
```json
{
  "id": 1,
  "name": "4K UHD Generator",
  "shortDescription": "Professional 4K signal generator",
  "fullDescription": "Complete detailed description with HTML formatting...",
  "sku": "SKU-001",
  "price": 299.99,
  "oldPrice": 349.99,
  "stockQuantity": 50,
  "gtin": "1234567890123",
  "manufacturerName": "Tech Corp",
  "defaultPictureModel": {
    "imageUrl": "0000001_product.jpeg",
    "fullSizeImageUrl": "0000001_product_full.jpeg",
    "alternateText": "4K UHD Generator"
  },
  "pictureModels": [
    {
      "imageUrl": "0000001_product.jpeg",
      "fullSizeImageUrl": "0000001_product_full.jpeg"
    }
  ],
  "productSpecifications": [
    {
      "specificationAttributeName": "Resolution",
      "valueRaw": "4K UHD",
      "colorSquaresRgb": null
    },
    {
      "specificationAttributeName": "Weight",
      "valueRaw": "2.5 kg"
    }
  ],
  "productAttributes": [],
  "seName": "4k-uhd-generator",
  "categoryIds": [1, 5],
  "createdOnUtc": "2025-01-01T00:00:00Z"
}
```

---

### 2.3 Search Products
```
GET /api/products/search?q={query}&page={page}&pageSize={size}
```
**Query Parameters:**
- `q` (required): Search query string
- `page` (optional): Page number
- `pageSize` (optional): Items per page

**Response:** Same format as 2.1 (Get All Products)

---

## 3. Category APIs

### 3.1 Get All Categories
```
GET /api/categories
```
**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "name": "AV Distribution",
      "description": "Audio/Video distribution equipment",
      "pictureModel": {
        "imageUrl": "0000001_category.jpeg"
      },
      "seName": "av-distribution",
      "parentCategoryId": null,
      "productCount": 45
    },
    {
      "id": 2,
      "name": "Cables",
      "description": "Professional cables and connectors",
      "pictureModel": {
        "imageUrl": "0000002_category.jpeg"
      },
      "seName": "cables",
      "parentCategoryId": null,
      "productCount": 120
    }
  ]
}
```

---

### 3.2 Get Single Category
```
GET /api/categories/{id}
```
**Response (200 OK):**
```json
{
  "id": 1,
  "name": "AV Distribution",
  "description": "Audio/Video distribution equipment and solutions",
  "pictureModel": {
    "imageUrl": "0000001_category.jpeg",
    "fullSizeImageUrl": "0000001_category_full.jpeg"
  },
  "seName": "av-distribution",
  "parentCategoryId": null,
  "productCount": 45,
  "subCategories": [
    {
      "id": 10,
      "name": "HDMI Splitters",
      "productCount": 15
    }
  ]
}
```

---

## 4. Customer Profile APIs

### 4.1 Get Customer Profile
```
GET /api/customers/{id}
Authorization: Bearer {token}
```
**Response (200 OK):**
```json
{
  "id": 1,
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "company": "Tech Company",
  "isAdmin": false,
  "avatar": "url_to_avatar",
  "createdOnUtc": "2025-01-01T00:00:00Z",
  "lastActivityDateUtc": "2025-12-01T10:30:00Z"
}
```

---

### 4.2 Update Customer Profile
```
PUT /api/customers/{id}
Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "newemail@example.com",
  "phone": "+1234567890",
  "company": "Tech Company"
}
```
**Response (200 OK):**
```json
{
  "id": 1,
  "email": "newemail@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

---

### 4.3 Get Customer Addresses
```
GET /api/customers/{id}/addresses
Authorization: Bearer {token}
```
**Response (200 OK):**
```json
{
  "addresses": [
    {
      "id": 1,
      "firstName": "John",
      "lastName": "Doe",
      "email": "user@example.com",
      "company": "Tech Corp",
      "country": "United States",
      "stateProvince": "California",
      "city": "San Francisco",
      "address1": "123 Main St",
      "address2": "Apt 4B",
      "zipPostalCode": "94105",
      "phoneNumber": "+1234567890"
    }
  ]
}
```

---

### 4.4 Add Customer Address
```
POST /api/customers/{id}/addresses
Authorization: Bearer {token}
```
**Request Body:**
```json
{
  "firstName": "John",
  "lastName": "Doe",
  "email": "user@example.com",
  "company": "Tech Corp",
  "country": "United States",
  "stateProvince": "California",
  "city": "San Francisco",
  "address1": "123 Main St",
  "address2": "Apt 4B",
  "zipPostalCode": "94105",
  "phoneNumber": "+1234567890"
}
```

---

### 4.5 Update Customer Address
```
PUT /api/customers/{id}/addresses/{addressId}
Authorization: Bearer {token}
```

---

### 4.6 Delete Customer Address
```
DELETE /api/customers/{id}/addresses/{addressId}
Authorization: Bearer {token}
```

---

### 4.7 Upload Profile Picture
```
POST /api/customers/{id}/avatar
Authorization: Bearer {token}
Content-Type: multipart/form-data
```
**Request Body:**
```
avatar: [image file]
```
**Response (200 OK):**
```json
{
  "avatarUrl": "url_to_uploaded_avatar"
}
```

---

## 5. Contact & Communication APIs

### 5.1 Send Contact Form
```
POST /api/contact/send
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "user@example.com",
  "subject": "Product Inquiry",
  "message": "I would like to know more about...",
  "phone": "+1234567890"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Your message has been sent successfully"
}
```

---

### 5.2 Subscribe to Newsletter
```
POST /api/newsletter/subscribe
```
**Request Body:**
```json
{
  "email": "user@example.com"
}
```
**Response (200 OK):**
```json
{
  "success": true,
  "message": "Successfully subscribed to newsletter"
}
```

---

## 6. Image & Media URLs

### 6.1 Image URL Pattern
```
GET {BASE_URL}/images/thumbs/{filename}
GET {BASE_URL}/images/full/{filename}
```

**Example:**
```
https://your-api.com/images/thumbs/0000001_product.jpeg
https://your-api.com/images/full/0000001_product.jpeg
```

**Note:** Images should be served with proper CORS headers and caching.

---

## 7. Admin APIs

### 7.1 Get All Products (Admin)
```
GET /api/admin/products?page={page}&pageSize={size}
Authorization: Bearer {admin_token}
```
**Response:** Extended product list with admin fields (cost, vendor info, etc.)

---

### 7.2 Create Product
```
POST /api/admin/products
Authorization: Bearer {admin_token}
```
**Request Body:**
```json
{
  "name": "New Product",
  "shortDescription": "Short desc",
  "fullDescription": "Full description",
  "sku": "SKU-NEW-001",
  "price": 199.99,
  "oldPrice": 249.99,
  "stockQuantity": 100,
  "categoryIds": [1, 5],
  "manufacturerId": 1,
  "published": true
}
```

---

### 7.3 Update Product
```
PUT /api/admin/products/{id}
Authorization: Bearer {admin_token}
```

---

### 7.4 Delete Product
```
DELETE /api/admin/products/{id}
Authorization: Bearer {admin_token}
```

---

### 7.5 Get All Categories (Admin)
```
GET /api/admin/categories
Authorization: Bearer {admin_token}
```

---

### 7.6 Create Category
```
POST /api/admin/categories
Authorization: Bearer {admin_token}
```
**Request Body:**
```json
{
  "name": "New Category",
  "description": "Category description",
  "parentCategoryId": null,
  "published": true
}
```

---

### 7.7 Update Category
```
PUT /api/admin/categories/{id}
Authorization: Bearer {admin_token}
```

---

### 7.8 Delete Category
```
DELETE /api/admin/categories/{id}
Authorization: Bearer {admin_token}
```

---

### 7.9 Get All Customers (Admin)
```
GET /api/admin/customers?page={page}&pageSize={size}&q={search}
Authorization: Bearer {admin_token}
```
**Response (200 OK):**
```json
{
  "data": [
    {
      "id": 1,
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "isAdmin": false,
      "active": true,
      "createdOnUtc": "2025-01-01T00:00:00Z",
      "lastActivityDateUtc": "2025-12-01T10:30:00Z"
    }
  ],
  "total": 500,
  "page": 1,
  "pageSize": 50
}
```

---

### 7.10 Update Customer (Admin)
```
PUT /api/admin/customers/{id}
Authorization: Bearer {admin_token}
```

---

### 7.11 Delete Customer (Admin)
```
DELETE /api/admin/customers/{id}
Authorization: Bearer {admin_token}
```

---

### 7.12 Dashboard Statistics
```
GET /api/admin/statistics/dashboard
Authorization: Bearer {admin_token}
```
**Response (200 OK):**
```json
{
  "totalProducts": 1250,
  "totalCustomers": 500,
  "totalCategories": 25,
  "lowStockProducts": 15,
  "recentCustomers": 10,
  "popularProducts": [
    {
      "id": 1,
      "name": "Product Name",
      "views": 1500
    }
  ]
}
```

---

## 8. Utility APIs

### 8.1 Health Check
```
GET /api/health
```
**Response (200 OK):**
```json
{
  "status": "healthy",
  "timestamp": "2025-12-01T10:30:00Z"
}
```

---

### 8.2 Store Information
```
GET /api/store/info
```
**Response (200 OK):**
```json
{
  "name": "HOT IMPEX",
  "url": "https://hotimpex.com",
  "email": "info@hotimpex.com",
  "phone": "+1234567890",
  "logo": "url_to_logo"
}
```

---

## 9. Error Response Format

All error responses should follow this format:

**Error Response:**
```json
{
  "error": "Error message here",
  "code": "ERROR_CODE",
  "details": {
    "field": "Specific field error message"
  }
}
```

**Common HTTP Status Codes:**
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (authentication required)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `500` - Internal Server Error

---

## 10. Security Requirements

1. **CORS Configuration**: Allow requests from frontend domain(s)
2. **Rate Limiting**: Specify limits per endpoint
3. **Authentication**: Token-based (JWT preferred)
4. **HTTPS**: All endpoints must use HTTPS
5. **Input Validation**: Server-side validation for all inputs
6. **File Upload**: Validate image types and sizes (max 5MB recommended)

---

## 11. Additional Information Required

Please provide the following information to complete the integration:

1. **Base API URL**: _______________________________
2. **Authentication Method**: JWT / API Key / Other: _______
3. **API Key** (if applicable): _______________________________
4. **Admin API Key** (if different): _______________________________
5. **Rate Limits**: Requests per minute: _______
6. **Image CDN URL** (if separate): _______________________________
7. **CORS Allowed Origins**: _______________________________
8. **API Documentation URL**: _______________________________
9. **Test/Staging Environment**: _______________________________
10. **Support Contact**: _______________________________

---

## Contact Information

**Frontend Team:**
- Developer: Adham Osama
- Email: _______________________________
- GitHub: [@Adham-Osama11](https://github.com/Adham-Osama11)

**Questions or Issues:**
Please contact the frontend team if you need clarification on any endpoint requirements.

---

**Document Version:** 1.0  
**Last Updated:** December 1, 2025  
**Status:** Ready for Backend Implementation
