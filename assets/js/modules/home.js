/**
 * Home Page Module
 * Handles loading and displaying products and categories on the home page
 * Uses the nopCommerce API to fetch dynamic content
 */

class HomePageManager {
    constructor() {
        this.api = window.nopAPI;
        this.heroProducts = [];
        this.currentHeroIndex = 0;
        this.autoSlideInterval = null;
        this.isMouseInHero = false;
    }

    /**
     * Initialize the home page
     */
    async init() {
        console.log('Initializing home page manager...');
        
        try {
            // Show loading status
            this.showStatusBadge('Loading products & categories...', 'loading');
            
            // Load and display content
            await Promise.all([
                this.loadHomePageCategories(),
                this.loadHomePageProducts(),
                this.loadHeroProducts()
            ]);

            // Initialize hero carousel
            this.initializeHeroCarousel();
            
            // Hide status badge
            this.hideStatusBadge();
            
            console.log('✅ Home page manager initialized successfully');
        } catch (error) {
            console.error('❌ Error initializing home page:', error);
            this.showStatusBadge('⚠ Using default content', 'error');
            setTimeout(() => this.hideStatusBadge(), 5000);
            this.showErrorState();
        }
    }

    /**
     * Load categories that are marked to show on home page
     */
    async loadHomePageCategories() {
        const loadingEl = document.getElementById('categories-loading');
        const gridEl = document.getElementById('categories-grid');
        
        try {
            console.log('Loading home page categories...');
            
            // Show loading state
            if (loadingEl) {
                loadingEl.style.display = 'block';
            }
            if (gridEl) {
                gridEl.style.display = 'none';
            }
            
            const categories = await this.api.getHomePageCategories();
            
            // Hide loading state
            if (loadingEl) {
                loadingEl.style.display = 'none';
            }
            if (gridEl) {
                gridEl.style.display = 'grid';
            }
            
            if (categories && categories.length > 0) {
                this.renderCategories(categories);
                console.log(`✅ Loaded ${categories.length} home page categories`);
            } else {
                console.log('ℹ️ No categories with "show on home" enabled - keeping default categories');
            }
        } catch (error) {
            console.error('❌ Error loading home page categories:', error);
            
            // Hide loading state
            if (loadingEl) {
                loadingEl.style.display = 'none';
            }
            if (gridEl) {
                gridEl.style.display = 'grid';
            }
        }
    }

    /**
     * Load products for home page
     * First tries to get products marked as "show on home"
     * If none exist, loads products from categories marked as "show on home"
     */
    async loadHomePageProducts() {
        const loadingEl = document.getElementById('products-loading');
        const gridEl = document.getElementById('products-grid');
        
        try {
            console.log('Loading home page products...');
            
            // Show loading state
            if (loadingEl) {
                loadingEl.style.display = 'block';
            }
            if (gridEl) {
                gridEl.style.display = 'none';
            }
            
            let products = await this.api.getHomePageProducts();
            
            // If no products with "show on home" are found, 
            // load products from categories that have "show on home" enabled
            if (!products || products.length === 0) {
                console.log('ℹ️ No products with "show on home" enabled, loading from home page categories...');
                const categories = await this.api.getHomePageCategories();
                
                if (categories && categories.length > 0) {
                    // Load products from the first home page category
                    const allProducts = [];
                    
                    // Load products from up to 3 categories to get variety
                    for (let i = 0; i < Math.min(categories.length, 3); i++) {
                        const categoryId = categories[i].id;
                        try {
                            const response = await this.api.getCategoryProducts(categoryId, {
                                PageSize: 8,
                                PageNumber: 1
                            });
                            
                            if (response && response.catalog_products_model && response.catalog_products_model.products) {
                                allProducts.push(...response.catalog_products_model.products);
                            }
                        } catch (err) {
                            console.warn(`Could not load products from category ${categoryId}:`, err);
                        }
                    }
                    
                    products = allProducts;
                    console.log(`✅ Loaded ${products.length} products from home page categories`);
                }
            } else {
                console.log(`✅ Loaded ${products.length} home page products`);
            }
            
            // Hide loading state
            if (loadingEl) {
                loadingEl.style.display = 'none';
            }
            if (gridEl) {
                gridEl.style.display = 'grid';
            }
            
            if (products && products.length > 0) {
                this.renderProducts(products);
            } else {
                console.log('ℹ️ No products available - keeping default products');
            }
        } catch (error) {
            console.error('❌ Error loading home page products:', error);
            
            // Hide loading state
            if (loadingEl) {
                loadingEl.style.display = 'none';
            }
            if (gridEl) {
                gridEl.style.display = 'grid';
            }
        }
    }

    /**
     * Load products for hero carousel
     */
    async loadHeroProducts() {
        try {
            console.log('Loading hero products...');
            let products = await this.api.getHomePageProducts();
            
            if (!products || products.length === 0) {
                products = await this.api.getNewProducts();
            }

            if (products && products.length > 0) {
                this.heroProducts = products.slice(0, 5);
                console.log(`Loaded ${this.heroProducts.length} hero products`);
            } else {
                this.heroProducts = this.getDefaultHeroProducts();
            }
        } catch (error) {
            console.error('Error loading hero products:', error);
            this.heroProducts = this.getDefaultHeroProducts();
        }
    }

    /**
     * Render categories in the collections section
     */
    renderCategories(categories) {
        const collectionsGrid = document.getElementById('categories-grid');
        if (!collectionsGrid) return;

        if (categories && categories.length > 0) {
            collectionsGrid.innerHTML = '';
            const colorSchemes = ['purple', 'emerald', 'orange', 'blue', 'rose', 'teal'];

            categories.forEach((category, index) => {
                const colorScheme = colorSchemes[index % colorSchemes.length];
                const imageUrl = category.picture_model?.image_url || 
                               category.picture_model?.full_size_image_url ||
                               'assets/images/placeholder.png';
                
                const categoryCard = this.createCategoryCard(category, imageUrl, colorScheme);
                collectionsGrid.appendChild(categoryCard);
            });
            
            this.animateCategories();
        }
    }

    /**
     * Create a category card element
     */
    createCategoryCard(category, imageUrl, colorScheme) {
        const card = document.createElement('a');
        card.href = `shop.html?category=${category.se_name || category.id}`;
        card.className = 'collection-card group';
        
        card.innerHTML = `
            <div class="collection-bg-overlay ${colorScheme}"></div>
            <div class="collection-content">
                <img src="${imageUrl}" 
                     alt="${category.name}" 
                     class="collection-image"
                     onerror="this.src='assets/images/placeholder.png'">
                <div class="collection-text">
                    <h3 class="collection-title ${colorScheme}">
                        ${category.name.toUpperCase()} &rarr;
                    </h3>
                </div>
            </div>
            <div class="collection-gradient-overlay ${colorScheme}"></div>
        `;
        
        return card;
    }

    /**
     * Render products in the best sellers section
     */
    renderProducts(products) {
        const productsGrid = document.getElementById('products-grid');
        if (!productsGrid) return;

        if (products && products.length > 0) {
            productsGrid.innerHTML = '';
            const displayProducts = products.slice(0, 8);

            displayProducts.forEach((product) => {
                const productCard = this.createProductCard(product);
                productsGrid.appendChild(productCard);
            });
            
            this.animateProducts();
        }
    }

    /**
     * Create a product card element
     */
    createProductCard(product) {
        const link = document.createElement('a');
        link.href = `product.html?id=${product.id}`;
        link.className = 'block';

        const imageUrl = product.default_picture_model?.image_url || 
                        product.picture_models?.[0]?.image_url ||
                        'assets/images/placeholder.png';

        const productName = product.name || 'Product';
        const shortDescription = product.short_description || '';
        
        link.innerHTML = `
            <div class="card" data-product-id="${product.id}" data-product-name="${productName}">
                <div class="card__shine"></div>
                <div class="card__glow"></div>
                <div class="card__content">
                    <div class="card__badge">Featured</div>
                    <div class="card__image" style="background-image: url('${imageUrl}'); background-size: cover; background-position: center;"></div>
                    <div class="card__text">
                        <p class="card__title">${productName}</p>
                        <p class="card__description">${this.truncateText(shortDescription, 60)}</p>
                    </div>
                    <div class="card__footer">
                        <div class="card__button add-to-cart" onclick="event.preventDefault(); event.stopPropagation(); alert('Add to cart feature coming soon');">
                            <svg height="16" width="16" viewBox="0 0 24 24">
                                <path stroke-width="2" stroke="currentColor" d="M4 12H20M12 4V20" fill="none"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return link;
    }

    /**
     * Initialize hero product carousel
     */
    initializeHeroCarousel() {
        const prevBtn = document.getElementById('prev-product');
        const nextBtn = document.getElementById('next-product');
        const heroSection = document.getElementById('hero-showroom');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => this.previousHeroProduct());
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => this.nextHeroProduct());
        }

        if (heroSection) {
            heroSection.addEventListener('mouseenter', () => {
                this.isMouseInHero = true;
                this.stopAutoSlide();
            });

            heroSection.addEventListener('mouseleave', () => {
                this.isMouseInHero = false;
                this.startAutoSlide();
            });
        }

        if (this.heroProducts.length > 0) {
            this.displayHeroProduct(0);
            this.startAutoSlide();
        }
    }

    /**
     * Display hero product at given index
     */
    displayHeroProduct(index) {
        if (!this.heroProducts || this.heroProducts.length === 0) return;

        this.currentHeroIndex = index;
        const product = this.heroProducts[index];

        const productImage = document.getElementById('product-image');
        if (productImage) {
            const imageUrl = product.default_picture_model?.image_url || 
                           product.picture_models?.[0]?.image_url ||
                           './assets/images/racing sim seat_without BG.png';
            productImage.src = imageUrl;
            productImage.alt = product.name || 'Product';
        }

        const productTitle = document.getElementById('product-title');
        if (productTitle) {
            productTitle.textContent = product.name || 'Product';
        }

        const productDescription = document.getElementById('product-description');
        if (productDescription) {
            productDescription.textContent = product.short_description || 'Discover our premium product';
        }

        const cardNumber = document.getElementById('card-number');
        if (cardNumber) {
            cardNumber.textContent = `${index + 1}/${this.heroProducts.length}`;
        }

        const progressBar = document.getElementById('progress-bar');
        if (progressBar) {
            const percentage = ((index + 1) / this.heroProducts.length) * 100;
            progressBar.style.width = `${percentage}%`;
        }

        this.updateHeroFeatures(product);
    }

    /**
     * Update hero product features
     */
    updateHeroFeatures(product) {
        const featuresContainer = document.getElementById('product-features');
        if (!featuresContainer) return;

        featuresContainer.innerHTML = '';
        const features = [];
        
        if (product.product_tags && product.product_tags.length > 0) {
            product.product_tags.forEach(tag => features.push(tag.name));
        }

        if (features.length === 0) {
            features.push('Premium Quality', 'Fast Shipping', 'Best Price');
        }

        features.slice(0, 3).forEach(feature => {
            const tag = document.createElement('span');
            tag.className = 'hero-feature-tag feature-tag';
            tag.textContent = feature;
            featuresContainer.appendChild(tag);
        });
    }

    nextHeroProduct() {
        if (this.heroProducts.length === 0) return;
        const nextIndex = (this.currentHeroIndex + 1) % this.heroProducts.length;
        this.displayHeroProduct(nextIndex);
    }

    previousHeroProduct() {
        if (this.heroProducts.length === 0) return;
        const prevIndex = (this.currentHeroIndex - 1 + this.heroProducts.length) % this.heroProducts.length;
        this.displayHeroProduct(prevIndex);
    }

    startAutoSlide() {
        this.stopAutoSlide();
        if (this.heroProducts.length > 1) {
            this.autoSlideInterval = setInterval(() => {
                if (!this.isMouseInHero) {
                    this.nextHeroProduct();
                }
            }, 5000);
        }
    }

    stopAutoSlide() {
        if (this.autoSlideInterval) {
            clearInterval(this.autoSlideInterval);
            this.autoSlideInterval = null;
        }
    }

    getDefaultHeroProducts() {
        return [
            {
                id: 'default-1',
                name: 'Premium Solutions',
                short_description: 'Innovative technology for modern businesses',
                default_picture_model: {
                    image_url: './assets/images/racing sim seat_without BG.png'
                }
            }
        ];
    }

    showErrorState() {
        console.log('Using default content from HTML');
    }

    truncateText(text, maxLength) {
        if (!text) return '';
        const cleanText = text.replace(/<[^>]*>/g, '');
        if (cleanText.length <= maxLength) return cleanText;
        return cleanText.substring(0, maxLength) + '...';
    }

    animateCategories() {
        const cards = document.querySelectorAll('#categories-grid .collection-card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    animateProducts() {
        const cards = document.querySelectorAll('#products-grid .card');
        cards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    showStatusBadge(message, type = 'loading') {
        const badge = document.getElementById('api-status-badge');
        const text = document.getElementById('api-status-text');
        
        if (badge && text) {
            text.textContent = message;
            badge.className = `api-status-badge ${type}`;
            badge.style.display = 'flex';
        }
    }

    hideStatusBadge() {
        const badge = document.getElementById('api-status-badge');
        if (badge) {
            badge.style.display = 'none';
        }
    }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
            window.homePageManager = new HomePageManager();
            window.homePageManager.init();
        }
    });
} else {
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
        window.homePageManager = new HomePageManager();
        window.homePageManager.init();
    }
}
