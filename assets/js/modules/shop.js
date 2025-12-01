// Hot Impex Shop Module
// Handles catalog and products display with category-based navigation

class ShopManager {
    constructor() {
        this.allProducts = [];
        this.categories = [];
        this.currentCategory = null;
        this.currentSearchTerm = '';
        this.isLoading = false;
    }

    async init() {
        if (!document.getElementById('catalog-view')) {
            return; // Not on shop page
        }

        console.log('Initializing catalog page...');
        
        try {
            await this.loadProducts();
            this.setupEventListeners();
            this.showCatalogView();
        } catch (error) {
            console.error('Failed to initialize shop:', error);
            // Hide loading and show error
            const catalogLoading = document.getElementById('catalog-loading');
            if (catalogLoading) catalogLoading.style.display = 'none';
            
            const categoriesGrid = document.getElementById('categories-grid');
            if (categoriesGrid) {
                categoriesGrid.classList.remove('hidden');
                categoriesGrid.innerHTML = `
                    <div class="col-span-full text-center py-20">
                        <p class="text-red-500 mb-4">Failed to load categories</p>
                        <button onclick="location.reload()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                            Retry
                        </button>
                    </div>
                `;
            }
        }
    }

    async loadProducts() {
        try {
            console.log('Loading products from API...');
            console.log('APIService available?', typeof APIService !== 'undefined');
            console.log('API_CONFIG available?', typeof API_CONFIG !== 'undefined');
            
            if (typeof APIService === 'undefined') {
                throw new Error('APIService is not defined');
            }
            
            const response = await APIService.getProducts({ limit: 1000 });
            
            if (response.status === 'success') {
                this.allProducts = response.data.products || [];
                console.log('Loaded products:', this.allProducts.length);
                this.extractCategories();
            } else {
                throw new Error(response.message || 'Failed to load products');
            }
        } catch (error) {
            console.error('Error loading products:', error);
            console.log('Using fallback products');
            this.allProducts = window.products || [];
            console.log('Fallback products count:', this.allProducts.length);
            this.extractCategories();
        }
    }

    extractCategories() {
        // Create a map to store unique categories with their data
        const categoryMap = new Map();

        this.allProducts.forEach(product => {
            let categoryName = product.category || 'Other';
            
            // Normalize category names (singular/plural, etc.)
            categoryName = this.normalizeCategoryName(categoryName);
            
            // Generate slug from normalized name (not from product.categorySlug)
            const categorySlug = categoryName.toLowerCase().replace(/\s+/g, '-');

            if (!categoryMap.has(categorySlug)) {
                categoryMap.set(categorySlug, {
                    slug: categorySlug,
                    name: categoryName,
                    count: 0,
                    image: null // Start with null, will be set below
                });
            }

            const category = categoryMap.get(categorySlug);
            category.count++;
            
            // Set category image priority:
            // 1. Featured products with images
            // 2. Any product with an image (if category doesn't have one yet)
            // 3. Fallback to placeholder
            const productImage = product.mainImage || product.image;
            
            if (product.featured && productImage) {
                // Always use featured product image
                category.image = productImage;
            } else if (!category.image && productImage) {
                // Use first available image if category doesn't have one
                category.image = productImage;
            }
        });

        // Set fallback for categories without images
        this.categories = Array.from(categoryMap.values()).map(cat => {
            if (!cat.image) {
                cat.image = 'assets/images/placeholder.jpg';
            }
            return cat;
        });
        
        console.log('Extracted categories:', this.categories);
    }

    normalizeCategoryName(name) {
        // Normalize category names to handle singular/plural and variations
        const normalized = name.trim();
        
        // Map of variations to standard names
        const categoryMap = {
            'cable': 'Cables',
            'cables': 'Cables',
            'ceiling bracket': 'Ceiling Bracket',
            'ceiling brackets': 'Ceiling Bracket',
            'gaming': 'Gaming',
            'wall mount': 'Wall Mount',
            'wall-mount': 'Wall Mount',
            'stand tilt': 'Stand Tilt',
            'stand-tilt': 'Stand Tilt',
            'full motion': 'Full Motion',
            'full-motion': 'Full Motion',
            'motorized tv': 'Motorized TV',
            'motorized-tv': 'Motorized TV',
            'tv cart': 'TV Cart',
            'tv-cart': 'TV Cart',
            'video wall': 'Video Wall',
            'video-wall': 'Video Wall'
        };
        
        const lowerName = normalized.toLowerCase();
        return categoryMap[lowerName] || normalized;
    }

    setupEventListeners() {
        // Back to catalog button
        const backBtn = document.getElementById('back-to-catalog');
        if (backBtn) {
            backBtn.addEventListener('click', () => this.showCatalogView());
        }

        // Product search
        const searchInput = document.getElementById('product-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.currentSearchTerm = e.target.value;
                this.filterProducts();
            });
        }
    }

    showCatalogView() {
        console.log('Showing catalog view');
        
        // Update URL
        const url = new URL(window.location);
        url.searchParams.delete('category');
        window.history.pushState({}, '', url);
        
        // Hide breadcrumb and products view
        const breadcrumb = document.getElementById('breadcrumb');
        const productsView = document.getElementById('products-view');
        const catalogView = document.getElementById('catalog-view');
        
        if (breadcrumb) breadcrumb.classList.add('hidden');
        if (productsView) productsView.classList.add('hidden');
        if (catalogView) catalogView.classList.remove('hidden');
        
        // Reset search
        this.currentCategory = null;
        this.currentSearchTerm = '';
        
        // Display categories
        this.displayCategories();
    }

    displayCategories() {
        console.log('Displaying categories:', this.categories.length);
        const categoriesGrid = document.getElementById('categories-grid');
        const catalogLoading = document.getElementById('catalog-loading');
        
        if (!categoriesGrid) {
            console.error('Categories grid not found!');
            return;
        }
        
        // Always hide loading
        if (catalogLoading) {
            catalogLoading.style.display = 'none';
        }
        
        // Show categories grid
        categoriesGrid.classList.remove('hidden');
        
        if (this.categories.length === 0) {
            console.warn('No categories to display');
            categoriesGrid.innerHTML = `
                <div class="col-span-full text-center py-20">
                    <p class="text-gray-500 dark:text-gray-400">No categories available</p>
                </div>
            `;
            return;
        }
        
        console.log('Creating category cards...');
        categoriesGrid.innerHTML = this.categories.map(category => this.createCategoryCard(category)).join('');
        
        // Add click listeners
        categoriesGrid.querySelectorAll('.category-card').forEach(card => {
            card.addEventListener('click', () => {
                const categorySlug = card.dataset.categorySlug;
                console.log('Category clicked:', categorySlug);
                this.showProductsView(categorySlug);
            });
        });
        
        console.log('Categories displayed successfully');
    }

    createCategoryCard(category) {
        // Handle image URL - check various formats
        let imageUrl = category.image || 'assets/images/placeholder.jpg';
        
        // If it's already a full URL (http/https), use it as is
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            // Use as is
        }
        // If it starts with /, it's absolute from root
        else if (imageUrl.startsWith('/')) {
            // Use as is
        }
        // If it already starts with assets/, use as is
        else if (imageUrl.startsWith('assets/')) {
            // Use as is
        }
        // Otherwise, assume it's a filename that needs the full path
        else {
            imageUrl = `assets/images/Products/${imageUrl}`;
        }
        
        return `
            <div class="category-card" data-category-slug="${category.slug}">
                <img src="${imageUrl}" 
                     alt="${category.name}" 
                     class="category-card-image"
                     onerror="this.src='assets/images/placeholder.jpg'">
                <div class="category-card-overlay">
                    <h3 class="category-card-name">${category.name}</h3>
                    <p class="category-card-count">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
                        </svg>
                        ${category.count} ${category.count === 1 ? 'Product' : 'Products'}
                    </p>
                </div>
                <div class="category-card-arrow">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </div>
            </div>
        `;
    }

    showProductsView(categorySlug) {
        console.log('Showing products for category:', categorySlug);
        
        const category = this.categories.find(c => c.slug === categorySlug);
        if (!category) return;
        
        this.currentCategory = categorySlug;
        
        // Update URL
        const url = new URL(window.location);
        url.searchParams.set('category', categorySlug);
        window.history.pushState({}, '', url);
        
        // Show breadcrumb and products view
        const breadcrumb = document.getElementById('breadcrumb');
        const catalogView = document.getElementById('catalog-view');
        const productsView = document.getElementById('products-view');
        const currentCategorySpan = document.getElementById('current-category');
        
        if (breadcrumb) breadcrumb.classList.remove('hidden');
        if (catalogView) catalogView.classList.add('hidden');
        if (productsView) productsView.classList.remove('hidden');
        if (currentCategorySpan) currentCategorySpan.textContent = category.name;
        
        // Display products
        this.displayProducts();
    }

    filterProducts() {
        if (!this.currentCategory) return;
        this.displayProducts();
    }

    displayProducts() {
        const productsGrid = document.getElementById('products-grid');
        const productsLoading = document.getElementById('products-loading');
        const noProducts = document.getElementById('no-products');
        
        if (!productsGrid) return;
        
        // Filter products by category using normalized names
        let filteredProducts = this.allProducts.filter(product => {
            const productCategoryName = product.category || 'Other';
            const normalizedProductCategory = this.normalizeCategoryName(productCategoryName);
            const productSlug = normalizedProductCategory.toLowerCase().replace(/\s+/g, '-');
            return productSlug === this.currentCategory;
        });
        
        // Apply search filter
        if (this.currentSearchTerm) {
            const term = this.currentSearchTerm.toLowerCase();
            filteredProducts = filteredProducts.filter(product =>
                product.name.toLowerCase().includes(term) ||
                (product.description && product.description.toLowerCase().includes(term)) ||
                (product.shortDescription && product.shortDescription.toLowerCase().includes(term))
            );
        }
        
        console.log('Filtered products:', filteredProducts.length);
        
        // Hide loading
        if (productsLoading) {
            productsLoading.classList.add('hidden');
        }
        
        // Show/hide no products message
        if (filteredProducts.length === 0) {
            productsGrid.innerHTML = '';
            if (noProducts) noProducts.classList.remove('hidden');
            return;
        }
        
        if (noProducts) noProducts.classList.add('hidden');
        
        // Display products
        productsGrid.innerHTML = filteredProducts.map(product => this.createProductCard(product)).join('');
    }

    createProductCard(product) {
        const productPrice = parseFloat(product.price) || 0;
        const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
        const currency = product.currency || 'EGP';
        const isOnSale = originalPrice && originalPrice > productPrice;
        
        // Handle image URL - check various formats
        let imageUrl = product.mainImage || product.image || 'assets/images/placeholder.jpg';
        
        // If it's already a full URL (http/https), use it as is
        if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
            // Use as is
        }
        // If it starts with /, it's absolute from root
        else if (imageUrl.startsWith('/')) {
            // Use as is
        }
        // If it already starts with assets/, use as is
        else if (imageUrl.startsWith('assets/')) {
            // Use as is
        }
        // Otherwise, assume it's a filename that needs the full path
        else {
            imageUrl = `assets/images/Products/${imageUrl}`;
        }
        
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-card-image-container">
                    <img src="${imageUrl}" 
                         alt="${product.name}" 
                         class="product-card-image"
                         onerror="this.src='assets/images/placeholder.jpg'">
                    ${isOnSale ? '<span class="product-card-badge">Sale</span>' : ''}
                    ${product.featured ? '<span class="product-card-badge">Featured</span>' : ''}
                    
                    <div class="product-card-actions">
                        <button onclick="event.stopPropagation(); window.location.href='product.html?product=${product.id}'" 
                                class="product-card-action-btn" title="View Details">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </button>
                        <button onclick="event.stopPropagation(); addToCart('${product.id}', 1)" 
                                class="product-card-action-btn" title="Add to Cart">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="product-card-content" onclick="window.location.href='product.html?product=${product.id}'">
                    <p class="product-card-category">${product.category || 'Product'}</p>
                    <h3 class="product-card-name">${product.name}</h3>
                    ${product.shortDescription ? `<p class="product-card-description">${product.shortDescription}</p>` : ''}
                    
                    <div class="product-card-footer">
                        <button onclick="event.stopPropagation(); addToCart('${product.id}', 1)" 
                                class="product-card-add-btn">
                            Add to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }
}

// Initialize shop manager
const shopManager = new ShopManager();

// Make shop manager globally available
window.ShopManager = ShopManager;
window.shopManager = shopManager;
