# HOT IMPEX - Development Guide

## 🏗️ Project Architecture

### File Organization
```
- HTML files: Root directory (index.html, shop.html, etc.)
- CSS files: assets/css/
- JavaScript files: assets/js/
- Images: assets/images/ (organized by type)
- Admin panel: admin/
```

### Naming Conventions
- Files: kebab-case (lowercase with hyphens)
- Classes: camelCase or kebab-case (following Tailwind conventions)
- IDs: kebab-case
- Variables (CSS): kebab-case with double hyphens for BEM-like structure

## 🎨 Styling Guidelines

### CSS Architecture
1. **CSS Variables**: Defined in `:root` for easy theme management
2. **Dark Mode**: Prefixed with `html.dark` selectors
3. **Responsive**: Mobile-first approach with proper breakpoints
4. **Components**: Modular CSS with clear section comments

### Color System
```css
/* Light Mode */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--text-primary: #1f2937;
--text-secondary: #6b7280;

/* Dark Mode */
--bg-primary: #0f172a;
--bg-secondary: #1e293b;
--text-primary: #f1f5f9;
--text-secondary: #cbd5e1;
```

## 📱 Responsive Design

### Breakpoints
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

### Best Practices
- Use Tailwind responsive prefixes (sm:, md:, lg:, xl:)
- Test on multiple devices
- Ensure touch targets are minimum 44px
- Optimize images for different screen densities

## 🔧 JavaScript Guidelines

### Code Organization
- Main functionality: `assets/js/scripts.js`
- Admin functionality: `assets/js/admin.js`
- Use ES6+ features (const/let, arrow functions, template literals)
- Keep functions modular and well-commented

### Event Handling
```javascript
// Preferred pattern
document.addEventListener('DOMContentLoaded', function() {
    // Initialize functionality
});

// Use delegation for dynamic content
document.addEventListener('click', function(e) {
    if (e.target.matches('.selector')) {
        // Handle click
    }
});
```

## 🖼️ Image Management

### Image Organization
```
assets/images/
├── logos/           # Brand logos
├── partners/        # Partner/client logos
├── Products/        # Product category folders
└── *.png           # Main product showcase images
```

### Image Guidelines
- Use WebP format when possible for better compression
- Provide alt text for all images
- Optimize images before adding (use tools like TinyPNG)
- Use consistent naming: lowercase, descriptive, no spaces

## 🎯 Performance Optimization

### CSS
- Minimize CSS by removing unused styles
- Use CSS variables for consistent theming
- Avoid inline styles when possible
- Combine similar selectors

### JavaScript
- Minimize DOM queries by caching elements
- Use event delegation for better performance
- Lazy load images when appropriate
- Minimize third-party dependencies

### Images
- Compress all images
- Use appropriate formats (WebP > PNG > JPG)
- Implement lazy loading for below-fold images
- Use CSS sprites for small icons when beneficial

## 🔍 Testing Checklist

### Cross-Browser Testing
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)

### Device Testing
- [ ] Mobile phones (iOS/Android)
- [ ] Tablets (iOS/Android)
- [ ] Desktop (Windows/Mac/Linux)

### Functionality Testing
- [ ] All navigation links work
- [ ] Forms submit correctly
- [ ] Dark/light theme toggle works
- [ ] Responsive design at all breakpoints
- [ ] All images load correctly
- [ ] JavaScript functionality works
- [ ] Admin panel accessible and functional

## 🚀 Deployment

### Before Deployment
1. Run `npm run verify` to check file structure
2. Test all functionality
3. Optimize images
4. Validate HTML/CSS
5. Check console for errors

### Deployment Steps
1. Ensure all files are committed to git
2. Upload files to web server
3. Test live site
4. Check all links and functionality
5. Verify SSL certificate (if applicable)

## 🔧 Maintenance

### Regular Tasks
- Update Tailwind CSS version
- Optimize images as needed
- Review and clean unused CSS
- Update product information
- Monitor site performance

### Code Quality
- Use consistent indentation (2 spaces)
- Comment complex functionality
- Keep functions small and focused
- Follow naming conventions
- Validate HTML/CSS regularly

## 📊 Analytics & Monitoring

### Recommended Tools
- Google Analytics for traffic analysis
- Google Search Console for SEO monitoring
- PageSpeed Insights for performance monitoring
- GTmetrix for detailed performance analysis

### Key Metrics to Monitor
- Page load speed
- Mobile usability
- Core Web Vitals
- Conversion rates
- User engagement

## 🆘 Troubleshooting

### Common Issues
1. **Images not loading**: Check file paths and case sensitivity
2. **CSS not applying**: Clear browser cache, check file paths
3. **JavaScript errors**: Check browser console for errors
4. **Layout breaking**: Check responsive design at different breakpoints

### Debug Tools
- Browser Developer Tools (F12)
- Console for JavaScript errors
- Network tab for loading issues
- Elements tab for CSS debugging

---

**Last Updated**: August 2025
**Version**: 2.0.0
