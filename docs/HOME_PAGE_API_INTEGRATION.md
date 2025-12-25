# Home Page API Integration

## Overview
The homepage has been updated to dynamically load products and categories from the nopCommerce backend API. The system now properly displays only categories with the "Show on Home" feature enabled.

## Changes Made

### 1. New Home Page Manager Module
**File**: `assets/js/modules/home.js`

A new JavaScript module that handles all home page functionality:

#### Features:
- **Dynamic Category Loading**: Fetches categories from `/api-frontend/Catalog/HomePageCategories`
  - Only displays categories with "Show on Home" enabled
  - Automatically renders category cards with images
  - Falls back to default HTML categories if API fails

- **Dynamic Product Loading**: Fetches products from `/api-frontend/Product/HomePageProducts`
  - Displays products marked to show on home page
  - Renders up to 8 products in the "Our Products" section
  - Falls back to default HTML products if none available

- **Hero Carousel**: 
  - Uses home page products for the hero section
  - Auto-rotates every 5 seconds
  - Pauses on mouse hover
  - Shows product images, titles, descriptions, and features

- **Error Handling**:
  - Gracefully handles API failures
  - Falls back to default content from HTML
  - Logs errors for debugging

### 2. Updated Files

#### `index.html`
- Added `assets/js/modules/home.js` script tag
- Keeps default products/categories as fallback content

#### `assets/js/main.js`
- Modified `initializeHomePage()` to use new HomePageManager
- Maintains backward compatibility with legacy code

## API Endpoints Used

### Categories
```
GET /api-frontend/Catalog/HomePageCategories
```
Returns categories with "Show on Home" enabled.

**Response Structure**:
```json
[
  {
    "name": "Category Name",
    "se_name": "category-name",
    "id": 2,
    "picture_model": {
      "image_url": "http://backend.../image.png",
      "full_size_image_url": "http://backend.../image.png"
    }
  }
]
```

### Products
```
GET /api-frontend/Product/HomePageProducts
```
Returns products marked to show on home page.

**Response Structure**:
```json
[
  {
    "id": 123,
    "name": "Product Name",
    "short_description": "Description",
    "default_picture_model": {
      "image_url": "http://backend.../image.png"
    }
  }
]
```

## How It Works

### Initialization Flow

1. **Page Load**: `home.js` auto-initializes when index.html loads
2. **API Calls**: Three parallel API calls are made:
   - `getHomePageCategories()` - Categories to show
   - `getHomePageProducts()` - Products to show
   - `loadHeroProducts()` - Products for hero carousel
3. **Rendering**: 
   - Categories are rendered in the "Browse by Collection" section
   - Products are rendered in the "Our Products" section
   - Hero products are displayed in the carousel
4. **Fallback**: If APIs return empty or fail, default HTML content is preserved

### Category Rendering

```javascript
// Color schemes rotate through: purple, emerald, orange, blue, rose, teal
categories.forEach((category, index) => {
    const colorScheme = colorSchemes[index % colorSchemes.length];
    const imageUrl = category.picture_model?.image_url || 'fallback.png';
    renderCategoryCard(category, imageUrl, colorScheme);
});
```

### Product Rendering

```javascript
// Display up to 8 products
const displayProducts = products.slice(0, 8);
displayProducts.forEach(product => {
    renderProductCard(product);
});
```

## Configuration

### Show on Home Feature

To enable a category or product to show on the homepage:

1. **In nopCommerce Admin Panel**:
   - Navigate to Catalog > Categories (or Products)
   - Edit the category/product
   - Check "Show on home page" checkbox
   - Save changes

2. **The frontend will automatically**:
   - Fetch the updated list on next page load
   - Display the category/product
   - Use the uploaded image from admin panel

## Testing

### Verify Categories Display
```bash
# Check API response
curl "http://backend.hotimpex.net.../api-frontend/Catalog/HomePageCategories"

# Should return categories with "show on home" enabled
```

### Verify Products Display
```bash
# Check API response
curl "http://backend.hotimpex.net.../api-frontend/Product/HomePageProducts"

# Should return products with "show on home" enabled
```

### Browser Console
Open browser console on homepage to see:
```
Initializing home page manager...
Loading home page categories...
Loading home page products...
Loading hero products...
Loaded X home page categories
Loaded Y home page products
```

## Fallback Behavior

The system is designed to be resilient:

1. **No Categories with "Show on Home"**:
   - Default HTML categories remain visible
   - No visual change to user

2. **No Products with "Show on Home"**:
   - Default HTML products remain visible
   - No visual change to user

3. **API Errors**:
   - Errors logged to console
   - Default content displayed
   - User experience not affected

## Image Handling

- **API Returns**: Full image URLs (no need for base URL concatenation)
- **Fallback Images**: `assets/images/placeholder.png`
- **Error Handling**: `onerror` attribute loads placeholder if image fails

## Future Enhancements

1. **Loading States**: Add skeleton loaders while fetching data
2. **Pagination**: Handle more than 8 products
3. **Filtering**: Allow users to filter products
4. **Caching**: Cache API responses to reduce server calls
5. **Analytics**: Track which products/categories are clicked

## Troubleshooting

### Categories Not Showing
1. Check if categories have "Show on Home" enabled in admin panel
2. Verify API endpoint returns data: `/api-frontend/Catalog/HomePageCategories`
3. Check browser console for errors

### Products Not Showing
1. Check if products have "Show on Home" enabled in admin panel
2. Verify API endpoint returns data: `/api-frontend/Product/HomePageProducts`
3. Check browser console for errors

### Images Not Loading
1. Verify image URLs in API response are accessible
2. Check CORS settings if images are from different domain
3. Ensure placeholder images exist in `assets/images/`

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Requires ES6+ support (async/await, arrow functions)
- Falls back gracefully in older browsers (shows default HTML content)

## Performance

- **Parallel API Calls**: Categories and products load simultaneously
- **Lazy Loading**: Images load as needed
- **Minimal DOM Updates**: Only updates necessary sections
- **Auto-slide Optimization**: Pauses when user not viewing

## Maintenance

### Adding New Features
All home page logic is in `assets/js/modules/home.js`:
- Easy to extend with new sections
- Well-documented methods
- Clear separation of concerns

### Updating API Endpoints
API endpoints are configured in `assets/js/config.js`:
- Update `ENDPOINTS.HOME_PAGE_CATEGORIES`
- Update `ENDPOINTS.HOME_PAGE_PRODUCTS`

### Styling
CSS for home page components is in:
- `assets/css/index.css` - Home page specific styles
- `assets/css/styles.css` - Global styles

## Support

For issues or questions:
1. Check browser console for error messages
2. Verify API endpoints are accessible
3. Review this documentation
4. Contact development team

---

**Last Updated**: December 25, 2025
**Version**: 1.0.0
**Author**: Hot Impex Development Team
