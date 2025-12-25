// Hot Impex API Service Module
// Wrapper around nopCommerce Catalog API to maintain compatibility with existing frontend code

class APIService {
    /**
     * Get all products with optional filters
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Products response
     */
    static async getProducts(params = {}) {
        try {
            // Wait for nopAPI to be initialized
            if (typeof nopAPI === 'undefined') {
                await new Promise(resolve => {
                    const checkAPI = setInterval(() => {
                        if (typeof nopAPI !== 'undefined') {
                            clearInterval(checkAPI);
                            resolve();
                        }
                    }, 100);
                });
            }

            let products = [];
            
            // If category filter is provided
            if (params.category || params.categoryId) {
                const categoryId = params.categoryId || params.category;
                const result = await nopAPI.getCategoryProducts(categoryId, {
                    pageNumber: params.page || 1,
                    pageSize: params.limit || params.pageSize || 50
                });
                // Products are nested in catalog_products_model.products
                products = result.catalog_products_model?.products || result.products || [];
            }
            // If search query is provided
            else if (params.q || params.search) {
                const searchTerm = params.q || params.search;
                const result = await nopAPI.searchProducts({
                    q: searchTerm,
                    pageNumber: params.page || 1,
                    pageSize: params.limit || params.pageSize || 50
                });
                // Search also returns nested structure
                products = result.catalog_products_model?.products || result.products || [];
            }
            // Get featured products
            else if (params.featured === 'true') {
                products = await nopAPI.getHomePageProducts();
            }
            // Get new products
            else if (params.new === 'true') {
                const result = await nopAPI.getNewProducts();
                products = result.products || [];
            }
            // Get all products (use home page + new products)
            else {
                const featured = await nopAPI.getHomePageProducts();
                const newProducts = await nopAPI.getNewProducts();
                products = [...featured, ...(newProducts.products || [])];
            }

            return {
                status: 'success',
                data: {
                    products: this.transformProducts(products),
                    total: products.length,
                    page: params.page || 1,
                    limit: params.limit || products.length
                }
            };
        } catch (error) {
            console.error('APIService.getProducts error:', error);
            return {
                status: 'error',
                message: error.message || 'Failed to fetch products',
                data: { products: [], total: 0 }
            };
        }
    }

    /**
     * Get single product by ID
     * @param {number} id - Product ID
     * @returns {Promise<Object>} Product response
     */
    static async getProduct(id) {
        try {
            if (typeof nopAPI === 'undefined') {
                throw new Error('API not initialized');
            }

            const product = await nopAPI.getProductById(id);
            
            return {
                status: 'success',
                data: this.transformProduct(product)
            };
        } catch (error) {
            console.error('APIService.getProduct error:', error);
            return {
                status: 'error',
                message: error.message || 'Failed to fetch product'
            };
        }
    }

    /**
     * Get all categories
     * @returns {Promise<Object>} Categories response
     */
    static async getCategories() {
        try {
            if (typeof nopAPI === 'undefined') {
                throw new Error('API not initialized');
            }

            const categories = await nopAPI.getCategories(true); // Load with images
            
            return {
                status: 'success',
                data: {
                    categories: this.transformCategories(categories)
                }
            };
        } catch (error) {
            console.error('APIService.getCategories error:', error);
            return {
                status: 'error',
                message: error.message || 'Failed to fetch categories',
                data: { categories: [] }
            };
        }
    }

    /**
     * Search products
     * @param {string} query - Search query
     * @returns {Promise<Object>} Search results
     */
    static async searchProducts(query) {
        try {
            if (typeof nopAPI === 'undefined') {
                throw new Error('API not initialized');
            }

            const result = await nopAPI.searchProducts({
                q: query,
                pageNumber: 1,
                pageSize: 50
            });

            return {
                status: 'success',
                data: {
                    products: this.transformProducts(result.products || []),
                    total: result.totalCount || 0
                }
            };
        } catch (error) {
            console.error('APIService.searchProducts error:', error);
            return {
                status: 'error',
                message: error.message || 'Search failed',
                data: { products: [], total: 0 }
            };
        }
    }

    /**
     * Get featured products
     * @returns {Promise<Object>} Featured products
     */
    static async getFeaturedProducts() {
        try {
            if (typeof nopAPI === 'undefined') {
                throw new Error('API not initialized');
            }

            const products = await nopAPI.getHomePageProducts();
            
            return {
                status: 'success',
                data: {
                    products: this.transformProducts(products.slice(0, 4))
                }
            };
        } catch (error) {
            console.error('APIService.getFeaturedProducts error:', error);
            return {
                status: 'error',
                message: error.message,
                data: { products: [] }
            };
        }
    }

    /**
     * Get best sellers (using featured products as fallback)
     * @returns {Promise<Object>} Best seller products
     */
    static async getBestSellers() {
        return await this.getFeaturedProducts();
    }

    // ===================  TRANSFORM METHODS ====================

    /**
     * Transform nopCommerce product to frontend format
     * @param {Object} nopProduct - Product from nopCommerce API
     * @returns {Object} Transformed product
     */
    static transformProduct(nopProduct) {
        if (!nopProduct) return null;

        // Handle both snake_case (API response) and camelCase
        const pictureModels = nopProduct.picture_models || nopProduct.pictureModels || [];
        const defaultPictureModel = nopProduct.default_picture_model || nopProduct.defaultPictureModel;
        const productPrice = nopProduct.product_price || nopProduct.productPrice || {};
        const mainImage = pictureModels[0] || defaultPictureModel;
        
        return {
            id: nopProduct.id,
            name: nopProduct.name || '',
            category: nopProduct.breadcrumb?.categoryBreadcrumb?.[0]?.name || nopProduct.breadcrumb?.category_breadcrumb?.[0]?.name || 'Products',
            categorySlug: nopProduct.breadcrumb?.categoryBreadcrumb?.[0]?.seName || nopProduct.breadcrumb?.category_breadcrumb?.[0]?.se_name || 'products',
            categoryId: nopProduct.breadcrumb?.categoryBreadcrumb?.[0]?.id || nopProduct.breadcrumb?.category_breadcrumb?.[0]?.id,
            price: parseFloat(productPrice.price_value || productPrice.priceValue || 0),
            oldPrice: parseFloat(productPrice.old_price_value || productPrice.oldPriceValue || 0),
            currency: 'EGP',
            priceDisplay: productPrice.price || '',
            inStock: !(productPrice.disable_buy_button || productPrice.disableBuyButton),
            featured: false,
            bestSeller: false,
            sku: nopProduct.sku || '',
            description: nopProduct.full_description || nopProduct.fullDescription || '',
            shortDescription: nopProduct.short_description || nopProduct.shortDescription || '',
            metaDescription: nopProduct.meta_description || nopProduct.metaDescription || '',
            image: mainImage?.image_url || mainImage?.imageUrl || '',
            mainImage: mainImage?.full_size_image_url || mainImage?.fullSizeImageUrl || mainImage?.image_url || mainImage?.imageUrl || '',
            thumbImage: mainImage?.thumb_image_url || mainImage?.thumbImageUrl || mainImage?.image_url || mainImage?.imageUrl || '',
            images: pictureModels.map(pic => ({
                url: pic.image_url || pic.imageUrl,
                fullSize: pic.full_size_image_url || pic.fullSizeImageUrl,
                thumb: pic.thumb_image_url || pic.thumbImageUrl,
                alt: pic.alternate_text || pic.alternateText || pic.title
            })),
            manufacturer: nopProduct.manufacturers?.[0]?.name || '',
            manufacturerId: nopProduct.manufacturers?.[0]?.id,
            vendor: nopProduct.vendor_model?.name || nopProduct.vendorModel?.name || '',
            vendorId: nopProduct.vendor_model?.id || nopProduct.vendorModel?.id,
            tags: (nopProduct.product_tags || nopProduct.productTags || []).map(tag => tag.name),
            rating: nopProduct.review_overview_model?.rating_sum || nopProduct.reviewOverviewModel?.ratingSum || 0,
            reviewCount: nopProduct.review_overview_model?.total_reviews || nopProduct.reviewOverviewModel?.totalReviews || 0,
            specifications: nopProduct.product_specification_model?.groups || nopProduct.productSpecificationModel?.groups || []
        };
    }

    /**
     * Transform multiple products
     * @param {Array} products - Array of nopCommerce products
     * @returns {Array} Transformed products
     */
    static transformProducts(products) {
        if (!Array.isArray(products)) return [];
        return products.map(product => this.transformProduct(product)).filter(p => p !== null);
    }

    /**
     * Transform nopCommerce category to frontend format
     * @param {Object} nopCategory - Category from nopCommerce API
     * @returns {Object} Transformed category
     */
    static transformCategory(nopCategory) {
        if (!nopCategory) return null;

        // Handle both snake_case (API response) and camelCase
        const pictureModel = nopCategory.picture_model || nopCategory.pictureModel;
        const seName = nopCategory.se_name || nopCategory.seName;

        return {
            id: nopCategory.id,
            name: nopCategory.name || '',
            slug: seName || nopCategory.name?.toLowerCase().replace(/\s+/g, '-') || '',
            description: nopCategory.description || '',
            image: pictureModel?.image_url || pictureModel?.imageUrl || pictureModel?.full_size_image_url || pictureModel?.fullSizeImageUrl || '',
            imageUrl: pictureModel?.image_url || pictureModel?.imageUrl || '',
            fullSizeImageUrl: pictureModel?.full_size_image_url || pictureModel?.fullSizeImageUrl || '',
            thumbImageUrl: pictureModel?.thumb_image_url || pictureModel?.thumbImageUrl || '',
            count: 0, // Will be populated separately if needed
            parentId: nopCategory.parentCategoryId || nopCategory.parent_category_id || null,
            featured: nopCategory.showOnHomePage || nopCategory.show_on_home_page || false
        };
    }

    /**
     * Transform multiple categories
     * @param {Array} categories - Array of nopCommerce categories
     * @returns {Array} Transformed categories
     */
    static transformCategories(categories) {
        if (!Array.isArray(categories)) return [];
        return categories.map(category => this.transformCategory(category)).filter(c => c !== null);
    }

    // =================== HELPER METHODS ====================

    /**
     * Get image URL (ensure full URL)
     * @param {string} path - Image path
     * @returns {string} Full image URL
     */
    static getImageUrl(path) {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        return `${API_CONFIG.BASE_URL}${path}`;
    }

    /**
     * Format price
     * @param {number} price - Price value
     * @param {string} currency - Currency code
     * @returns {string} Formatted price
     */
    static formatPrice(price, currency = 'EGP') {
        return `${currency} ${price.toFixed(2)}`;
    }

    // Cart API methods
    static async getCart() {
        const token = AuthService.getToken();
        if (!token) throw new Error('User not authenticated');
        
        return await this.request('/users/cart', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    static async addToCart(productId, quantity = 1, productData = {}) {
        const token = AuthService.getToken();
        if (!token) throw new Error('User not authenticated');
        
        console.log('APIService.addToCart called with:', { productId, quantity, productData });
        
        const requestBody = { productId, quantity, productData };
        console.log('Request body:', JSON.stringify(requestBody));
        
        return await this.request('/users/cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(requestBody)
        });
    }

    static async updateCartItem(productId, quantity) {
        const token = AuthService.getToken();
        if (!token) throw new Error('User not authenticated');
        
        return await this.request(`/users/cart/${productId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ quantity })
        });
    }

    static async removeFromCart(productId) {
        const token = AuthService.getToken();
        if (!token) throw new Error('User not authenticated');
        
        return await this.request(`/users/cart/${productId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    static async clearCart() {
        const token = AuthService.getToken();
        if (!token) throw new Error('User not authenticated');
        
        return await this.request('/users/cart', {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    // Order API methods
    static async createOrder(orderData) {
        const token = AuthService.getToken();
        if (!token) throw new Error('User not authenticated');
        
        return await this.request('/orders', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(orderData)
        });
    }

    static async getUserOrders() {
        const token = AuthService.getToken();
        if (!token) throw new Error('User not authenticated');
        
        return await this.request('/orders', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    static async getOrder(orderId) {
        const token = AuthService.getToken();
        if (!token) throw new Error('User not authenticated');
        
        return await this.request(`/orders/${orderId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    static async cancelOrder(orderId) {
        const token = AuthService.getToken();
        if (!token) throw new Error('User not authenticated');
        
        return await this.request(`/orders/${orderId}/cancel`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    // User API methods
    static async login(credentials) {
        return await this.request('/auth/login', {
            method: 'POST',
            body: JSON.stringify(credentials)
        });
    }

    static async register(userData) {
        return await this.request('/auth/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    static async getUserProfile() {
        const token = AuthService.getToken();
        if (!token) throw new Error('User not authenticated');
        
        return await this.request('/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    static async updateUserProfile(profileData) {
        const token = AuthService.getToken();
        if (!token) throw new Error('User not authenticated');
        
        return await this.request('/users/profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });
    }
}

// Make APIService globally available
window.APIService = APIService;
