// Hot Impex Products Module
// Handles product display, management, and related functionality

class ProductsManager {
    constructor() {
        this.products = [];
        this.featuredProducts = [];
        this.bestSellers = [];
        this.init();
    }

    init() {
        this.loadStaticProducts();
        this.loadDynamicContent();
    }

    loadStaticProducts() {
        // Static products fallback
        this.products = [
            { 
                id: "av-002", 
                name: "CVBS/S-Video to HDMI Converter", 
                category: "AV Distribution",
                categorySlug: "av-distribution", 
                price: 89.99,
                currency: "EGP",
                inStock: true,
                bestSeller: true,
                description: "Convert legacy CVBS or S-Video signals to modern HDMI output with superior quality",
                shortDescription: "Legacy to HDMI signal converter",
                image: "CVBS or S-video to HDMI converter",
                mainImage: "assets/images/Products/Av distribution/CVBS or S-video to HDMI converter.jpg",
                images: ["assets/images/Products/Av distribution/CVBS or S-video to HDMI converter.jpg"]
            },
            { 
                id: "cable-001", 
                name: "Premium AUX Cable", 
                category: "Cable",
                categorySlug: "cable", 
                price: 19.99,
                currency: "EGP",
                inStock: true,
                bestSeller: true,
                description: "High-quality 3.5mm AUX cable for crystal clear audio transmission",
                shortDescription: "Premium 3.5mm AUX audio cable",
                image: "AUX-CABLE",
                mainImage: "assets/images/Products/Cable/AUX-CABLE.jpg",
                images: ["assets/images/Products/Cable/AUX-CABLE.jpg"]
            },
            { 
                id: "cable-002", 
                name: "DTECH High Speed HDMI Cable", 
                category: "Cable",
                categorySlug: "cable", 
                price: 49.99,
                currency: "EGP",
                inStock: true,
                bestSeller: true,
                description: "Premium HDMI cable supporting 4K UHD, 3D, and 2160p for computers, TVs, and monitors",
                shortDescription: "High-speed 4K HDMI cable",
                image: "DTECH Hdmi Cable by HOT High Speed Hdmi Cable Hdmi Male To Hdmi Male Cable Uhd 4k 3d 2160p 1 To 5m For Computer Tv Monitor V2.0",
                mainImage: "assets/images/Products/Cable/DTECH Hdmi Cable by HOT High Speed Hdmi Cable Hdmi Male To Hdmi Male Cable Uhd 4k 3d 2160p 1 To 5m For Computer Tv Monitor V2.0.jpg",
                images: ["assets/images/Products/Cable/DTECH Hdmi Cable by HOT High Speed Hdmi Cable Hdmi Male To Hdmi Male Cable Uhd 4k 3d 2160p 1 To 5m For Computer Tv Monitor V2.0.jpg"]
            },
            { 
                id: "gaming-002", 
                name: "LRS02-BS Premium Racing Simulator Cockpit", 
                category: "Gaming",
                categorySlug: "gaming", 
                price: 1299.99,
                currency: "EGP",
                inStock: true,
                bestSeller: true,
                description: "Premium racing simulator cockpit seat - professional grade product designed for serious sim racers",
                shortDescription: "Premium racing simulator cockpit",
                image: "LRS02-BS PREMIUM RACING SIMULATOR COCKPIT SEAT Professional Grade Product for the Serious Sim Racer",
                mainImage: "assets/images/Products/Gaming/LRS02-BS PREMIUM RACING SIMULATOR COCKPIT SEAT Professional Grade Product for the Serious Sim Racer.jpg",
                images: ["assets/images/Products/Gaming/LRS02-BS PREMIUM RACING SIMULATOR COCKPIT SEAT Professional Grade Product for the Serious Sim Racer.jpg"]
            },
            { 
                id: "av-001", 
                name: "4K UHD Generator", 
                category: "AV Distribution",
                categorySlug: "av-distribution", 
                price: 299.99,
                currency: "EGP",
                inStock: true,
                featured: true,
                description: "High-performance 4K UHD signal generator for professional audio-visual applications",
                shortDescription: "Professional 4K UHD signal generator",
                image: "4K UHD GENRATOR",
                mainImage: "assets/images/Products/Av distribution/4K UHD GENRATOR.jpg",
                images: ["assets/images/Products/Av distribution/4K UHD GENRATOR.jpg"]
            },
            { 
                id: "av-003", 
                name: "DVI-D to HDMI Adapter", 
                category: "AV Distribution",
                categorySlug: "av-distribution", 
                price: 29.99,
                currency: "EGP",
                inStock: true,
                description: "High-quality DVI-D Male (24+1 Pin) to HDMI Female adapter for seamless connectivity",
                shortDescription: "DVI-D to HDMI adapter",
                image: "Dvi-d Male (24 1 Pin) to HDMI Female Adapter",
                mainImage: "assets/images/Products/Av distribution/Dvi-d Male (24 1 Pin) to HDMI Female Adapter.jpg",
                images: ["assets/images/Products/Av distribution/Dvi-d Male (24 1 Pin) to HDMI Female Adapter.jpg"]
            }
        ];

        // Make products globally available
        window.products = this.products;
    }

    async loadDynamicContent() {
        try {
            await this.loadFeaturedProducts();
            await this.loadBestSellers();
            await this.loadAllProducts();
        } catch (error) {
            console.warn('Failed to load dynamic content, using static products:', error);
        }
    }

    async loadAllProducts() {
        try {
            const response = await APIService.getProducts();
            if (response.status === 'success' && response.data.products) {
                this.products = response.data.products;
                window.products = this.products;
                console.log('Loaded products from API:', this.products.length);
            }
        } catch (error) {
            console.warn('Failed to load products from API:', error);
        }
    }

    async loadFeaturedProducts() {
        try {
            const response = await APIService.getFeaturedProducts();
            if (response.status === 'success' && response.data.products) {
                this.featuredProducts = response.data.products;
                this.displayFeaturedProducts();
                console.log('Loaded featured products:', this.featuredProducts.length);
            }
        } catch (error) {
            console.warn('Failed to load featured products:', error);
            // Fallback to static featured products
            this.featuredProducts = this.products.filter(p => p.featured).slice(0, 4);
            this.displayFeaturedProducts();
        }
    }

    async loadBestSellers() {
        try {
            const response = await APIService.getBestSellers();
            if (response.status === 'success' && response.data.products) {
                this.bestSellers = response.data.products;
                this.displayBestSellers();
                console.log('Loaded best sellers:', this.bestSellers.length);
            }
        } catch (error) {
            console.warn('Failed to load best sellers:', error);
            // Fallback to static best sellers
            this.bestSellers = this.products.filter(p => p.bestSeller).slice(0, 4);
            this.displayBestSellers();
        }
    }

    displayFeaturedProducts() {
        const container = document.getElementById('featured-products');
        if (!container) return;
        
        const productsToShow = this.featuredProducts.length > 0 ? this.featuredProducts : this.products.slice(0, 8);
        
        container.innerHTML = productsToShow.map(product => this.createProductCard(product)).join('');
    }

    displayBestSellers() {
        const container = document.getElementById('best-sellers');
        if (!container) return;
        
        const productsToShow = this.bestSellers.length > 0 ? this.bestSellers : this.products.filter(p => p.bestSeller).slice(0, 4);
        
        container.innerHTML = productsToShow.map(product => this.createProductCard(product)).join('');
    }

    createProductCard(product) {
        const productPrice = parseFloat(product.price) || 0;
        const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : null;
        const currency = product.currency || 'EGP';
        const isOnSale = originalPrice && originalPrice > productPrice;
        
        // Handle image URL
        let imageUrl = product.mainImage || product.image;
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
            if (!imageUrl.startsWith('assets/')) {
                imageUrl = `assets/images/Products/${imageUrl}`;
            }
        }
        if (!imageUrl) {
            imageUrl = `https://placehold.co/300x300/E0E0E0/808080?text=${encodeURIComponent(product.name)}`;
        }
        
        return `
            <div class="product-card bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 scroll-animate" 
                 data-product-id="${product.id}">
                <div class="relative mb-4">
                    <img src="${imageUrl}" 
                         alt="${product.name}" 
                         class="w-full h-48 object-cover rounded-lg"
                         onerror="this.src='https://placehold.co/300x300/E0E0E0/808080?text=${encodeURIComponent(product.name)}'">
                    ${isOnSale ? '<span class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm">Sale</span>' : ''}
                    ${product.featured ? '<span class="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded-full text-sm">Featured</span>' : ''}
                    ${product.bestSeller ? '<span class="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-sm">Best Seller</span>' : ''}
                </div>
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">${product.name}</h3>
                <p class="text-gray-600 dark:text-gray-300 capitalize mb-3">${product.category}</p>
                <div class="flex items-center justify-between mb-4">
                    <div>
                        <!-- Price hidden on product cards; used internally via data-price -->
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="addToCart('${product.id}')" 
                            class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        Add to Cart
                    </button>
                    <button onclick="openQuickView('${product.id}')" 
                            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Quick View
                    </button>
                </div>
            </div>
        `;
    }

    // Product Page Functions
    initializeProductPage() {
        this.initializeProductGallery();
        this.initializeProductTabs();
    }

    initializeProductGallery() {
        const thumbnails = document.querySelectorAll('.thumbnail');
        const mainImage = document.getElementById('main-product-image');
        
        thumbnails.forEach(thumb => {
            thumb.addEventListener('click', () => {
                const newSrc = thumb.src;
                if (mainImage) {
                    mainImage.src = newSrc;
                }
                
                // Update active thumbnail
                thumbnails.forEach(t => t.classList.remove('ring-2', 'ring-blue-500'));
                thumb.classList.add('ring-2', 'ring-blue-500');
            });
        });
    }

    initializeProductTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                
                // Update active button
                tabButtons.forEach(b => {
                    b.classList.add('border-transparent', 'text-gray-500');
                    b.classList.remove('border-blue-500', 'text-blue-600');
                });
                btn.classList.remove('border-transparent', 'text-gray-500');
                btn.classList.add('border-blue-500', 'text-blue-600');
                
                // Show corresponding content
                tabContents.forEach(content => {
                    content.classList.add('hidden');
                });
                const targetContent = document.getElementById(tabId);
                if (targetContent) {
                    targetContent.classList.remove('hidden');
                }
            });
        });
    }

    // Utility Functions
    getProductById(id) {
        return this.products.find(p => p.id === id || p.id === parseInt(id));
    }

    updateProduct(id, updatedData) {
        const index = this.products.findIndex(p => p.id === id || p.id === parseInt(id));
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...updatedData };
            window.products = this.products;
            this.saveProductsToStorage();
            return true;
        }
        return false;
    }

    addProduct(productData) {
        const newId = Math.max(...this.products.map(p => parseInt(p.id) || 0)) + 1;
        const newProduct = {
            id: newId.toString(),
            ...productData
        };
        this.products.push(newProduct);
        window.products = this.products;
        this.saveProductsToStorage();
        return newProduct;
    }

    saveProductsToStorage() {
        try {
            localStorage.setItem('hotimpex-products', JSON.stringify(this.products));
        } catch (error) {
            console.warn('Failed to save products to storage:', error);
        }
    }

    loadProductsFromStorage() {
        try {
            const saved = localStorage.getItem('hotimpex-products');
            if (saved) {
                const savedProducts = JSON.parse(saved);
                this.products = savedProducts;
                window.products = this.products;
            }
        } catch (error) {
            console.warn('Could not load products from storage:', error);
        }
    }
}

// Initialize products manager
const productsManager = new ProductsManager();

// Make products manager and utility functions globally available
window.ProductsManager = ProductsManager;
window.productsManager = productsManager;
window.getProductById = (id) => productsManager.getProductById(id);
window.updateProduct = (id, data) => productsManager.updateProduct(id, data);
window.addProduct = (data) => productsManager.addProduct(data);
window.viewProduct = (productId) => {
    // Close search if open
    if (window.searchManager) {
        window.searchManager.closeSearchBar();
    }
    
    // Navigate to product page
    window.location.href = `product.html?product=${productId}`;
};
