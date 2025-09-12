// Hot Impex Shop Module
// Handles shop page functionality including product display, filtering, and pagination

class ShopManager {
    constructor() {
        this.shopProducts = [];
        this.filteredProducts = [];
        this.currentCategory = 'all';
        this.currentSearchTerm = '';
        this.isLoading = false;
    }

    async init() {
        if (!document.getElementById('products-grid')) {
            return; // Not on shop page
        }

        console.log('Initializing shop page...');
        this.showLoading();
        
        try {
            await this.loadProducts();
            this.initializeFilters();
            this.handleURLParams();
            this.setupSearch();
        } catch (error) {
            console.error('Error initializing shop page:', error);
            this.showError('Failed to load products. Please refresh the page.');
        }
    }

    async loadProducts() {
        try {
            console.log('Loading products from API...');
            const response = await APIService.getProducts({ limit: 100 });
            
            if (response.status === 'success') {
                this.shopProducts = response.data.products || [];
                console.log('Loaded products from database:', this.shopProducts.length);
                
                this.displayProducts(this.shopProducts);
                this.updateCategoryFilters(this.shopProducts);
            } else {
                throw new Error(response.message || 'Failed to load products');
            }
        } catch (error) {
            console.error('Error loading products:', error);
            
            // Fallback to static products if API fails
            console.log('Falling back to static products...');
            this.shopProducts = window.products || [];
            this.displayProducts(this.shopProducts);
            this.updateCategoryFilters(this.shopProducts);
        }
    }

    initializeFilters() {
        const categoryButtons = document.querySelectorAll('.category-btn, .category-filter');
        
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const category = btn.dataset.category;
                this.filterByCategory(category);
                
                // Update active button
                categoryButtons.forEach(b => {
                    b.classList.remove('active', 'font-bold', 'text-blue-600');
                    b.classList.add('text-gray-600');
                });
                btn.classList.add('active', 'font-bold', 'text-blue-600');
                btn.classList.remove('text-gray-600');
                
                // Update URL
                this.updateURL({ category });
            });
        });
    }

    setupSearch() {
        if (window.searchManager) {
            window.searchManager.setupShopSearch((query) => {
                this.currentSearchTerm = query;
                this.filterProducts();
                this.updateURL({ search: query });
            });
        }
    }

    handleURLParams() {
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const search = urlParams.get('search');
        
        if (search) {
            const searchInput = document.getElementById('shop-search-input');
            if (searchInput) {
                searchInput.value = search;
            }
            this.currentSearchTerm = search;
        }
        
        if (category) {
            this.currentCategory = category;
            
            // Update active category button
            const categoryBtn = document.querySelector(`[data-category="${category}"]`);
            if (categoryBtn) {
                const allButtons = document.querySelectorAll('.category-btn, .category-filter');
                allButtons.forEach(b => {
                    b.classList.remove('active', 'font-bold', 'text-blue-600');
                    b.classList.add('text-gray-600');
                });
                categoryBtn.classList.add('active', 'font-bold', 'text-blue-600');
                categoryBtn.classList.remove('text-gray-600');
            }
        }
        
        // Apply filters
        this.filterProducts();
    }

    updateURL(params) {
        const url = new URL(window.location);
        
        if (params.category) {
            if (params.category === 'all') {
                url.searchParams.delete('category');
            } else {
                url.searchParams.set('category', params.category);
            }
        }
        
        if (params.search !== undefined) {
            if (params.search) {
                url.searchParams.set('search', params.search);
            } else {
                url.searchParams.delete('search');
            }
        }
        
        window.history.pushState({}, '', url);
    }

    updateCategoryFilters(products) {
        // Get unique categories from products
        const categories = [...new Set(products.map(p => p.categorySlug || p.category).filter(Boolean))];
        console.log('Available categories:', categories);
        
        // You can dynamically update category filters here if needed
        // For now, we'll keep the existing static categories
    }

    filterByCategory(category) {
        this.currentCategory = category;
        this.filterProducts();
    }

    filterProducts() {
        let filtered = [...this.shopProducts];
        
        // Filter by category
        if (this.currentCategory && this.currentCategory !== 'all') {
            filtered = filtered.filter(product => 
                product.categorySlug === this.currentCategory || 
                product.category === this.currentCategory ||
                product.categorySlug === this.currentCategory.toLowerCase() ||
                product.category === this.currentCategory.toLowerCase()
            );
        }
        
        // Filter by search term
        if (this.currentSearchTerm) {
            const term = this.currentSearchTerm.toLowerCase();
            filtered = filtered.filter(product =>
                product.name.toLowerCase().includes(term) ||
                (product.description && product.description.toLowerCase().includes(term)) ||
                (product.shortDescription && product.shortDescription.toLowerCase().includes(term)) ||
                (product.tags && product.tags.some(tag => tag.toLowerCase().includes(term)))
            );
        }
        
        console.log(`Filtered products: ${filtered.length} of ${this.shopProducts.length}`);
        this.filteredProducts = filtered;
        this.displayProducts(filtered);
    }

    showLoading() {
        const loadingState = document.getElementById('loading-state');
        const productsGrid = document.getElementById('products-grid');
        
        if (loadingState) {
            loadingState.style.display = 'flex';
        }
        
        if (productsGrid) {
            productsGrid.classList.add('hidden');
            productsGrid.innerHTML = '';
        }
        
        this.isLoading = true;
    }

    hideLoading() {
        const loadingState = document.getElementById('loading-state');
        const productsGrid = document.getElementById('products-grid');
        
        if (loadingState) {
            loadingState.style.display = 'none';
        }
        
        if (productsGrid) {
            productsGrid.classList.remove('hidden');
        }
        
        this.isLoading = false;
    }

    showError(message) {
        const container = document.getElementById('products-grid');
        if (!container) return;
        
        this.hideLoading();
        
        container.innerHTML = `
            <div class="col-span-full flex items-center justify-center py-20">
                <div class="text-center">
                    <div class="text-red-500 text-6xl mb-4">⚠️</div>
                    <p class="text-gray-600 dark:text-gray-400 mb-4">${message}</p>
                    <button onclick="location.reload()" class="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                        Try Again
                    </button>
                </div>
            </div>
        `;
    }

    displayProducts(productsToShow) {
        console.log('displayProducts called with:', productsToShow?.length, 'products');
        const container = document.getElementById('products-grid');
        
        if (!container) {
            console.error('Products grid container not found!');
            return;
        }

        this.hideLoading();
        
        if (!productsToShow || productsToShow.length === 0) {
            container.innerHTML = `
                <div class="col-span-full flex items-center justify-center py-20">
                    <div class="text-center">
                        <div class="text-gray-400 text-6xl mb-4">📦</div>
                        <h3 class="text-xl font-semibold text-gray-800 dark:text-white mb-2">No products found</h3>
                        <p class="text-gray-600 dark:text-gray-400">Try adjusting your search or filter criteria.</p>
                    </div>
                </div>
            `;
            return;
        }
        
        container.innerHTML = productsToShow.map(product => this.createProductCard(product)).join('');
        
        // Add click event listeners for add to cart buttons
        container.querySelectorAll('button[onclick*="addToCart"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });
    }

    createProductCard(product) {
        const productPrice = parseFloat(product.price) || 0;
        const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
        const currency = product.currency || 'EGP';
        const isOnSale = originalPrice && originalPrice > productPrice;
        
        // Handle image URL
        let imageUrl = product.mainImage || product.image;
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
            imageUrl = `assets/images/Products/${imageUrl}`;
        }
        if (!imageUrl) {
            imageUrl = 'assets/images/placeholder.jpg';
        }
        
        return `
            <a href="product.html?product=${product.id}" class="product-card block bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden group transform hover:-translate-y-2 transition-all duration-300 hover:shadow-2xl" 
               data-product-id="${product.id}" 
               data-category="${product.categorySlug || product.category}" 
               data-name="${product.name}" 
               data-price="${productPrice}">
                <div class="relative h-64">
                    <img src="${imageUrl}" 
                         alt="${product.name}" 
                         class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                         onerror="this.src='assets/images/placeholder.jpg'">
                    
                    <!-- Product Badges -->
                    ${isOnSale ? '<span class="absolute top-4 left-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">SALE</span>' : ''}
                    ${product.featured ? '<span class="absolute top-4 right-4 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-full">FEATURED</span>' : ''}
                    ${product.bestSeller ? '<span class="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">BEST SELLER</span>' : ''}
                    
                    <!-- Hover Actions -->
                    <div class="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button onclick="event.preventDefault(); event.stopPropagation(); addToCart('${product.id}', 1);" 
                                class="text-white bg-black bg-opacity-50 p-3 rounded-full hover:bg-blue-600 transition-colors"
                                title="Add to Cart">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path>
                            </svg>
                        </button>
                        <button onclick="event.preventDefault(); event.stopPropagation(); openQuickView('${product.id}');" 
                                class="text-white bg-black bg-opacity-50 p-3 rounded-full hover:bg-blue-600 transition-colors"
                                title="Quick View">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="p-6">
                    <h3 class="font-semibold text-gray-800 dark:text-white text-lg mb-2 truncate">${product.name}</h3>
                    <p class="text-gray-500 dark:text-gray-400 text-sm mb-4 capitalize">${product.category || 'Product'}</p>
                    
                    <!-- Rating -->
                    ${product.rating ? `
                        <div class="flex items-center mb-3">
                            <div class="flex text-yellow-400">
                                ${Array.from({length: 5}, (_, i) => 
                                    `<svg class="w-4 h-4 ${i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                                    </svg>`
                                ).join('')}
                            </div>
                            <span class="text-gray-600 dark:text-gray-400 ml-1 text-sm">${product.rating}</span>
                        </div>
                    ` : ''}
                    
                    <!-- Price -->
                    <div class="flex justify-between items-center">
                        <div>
                            ${isOnSale ? `<span class="text-sm text-gray-500 dark:text-gray-400 line-through">${originalPrice} ${currency}</span><br>` : ''}
                            <span class="text-gray-800 dark:text-white font-bold text-xl">${productPrice.toFixed(2)} ${currency}</span>
                        </div>
                        
                        <!-- Stock Status -->
                        ${product.inStock !== undefined ? `
                            <span class="text-xs px-2 py-1 rounded-full ${product.inStock ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                                ${product.inStock ? 'In Stock' : 'Out of Stock'}
                            </span>
                        ` : ''}
                    </div>
                </div>
            </a>
        `;
    }
}

// Initialize shop manager
const shopManager = new ShopManager();

// Make shop manager globally available
window.ShopManager = ShopManager;
window.shopManager = shopManager;
