// Hot Impex Cart Service Module
// Handles cart operations for both logged-in and guest users

class CartService {
    static async loadUserCart() {
        if (!AuthService.isLoggedIn()) {
            return this.loadGuestCart();
        }

        try {
            const response = await APIService.getCart();
            if (response.status === 'success') {
                cart = response.data.cart || [];
                this.updateCartUI();
                return cart;
            }
        } catch (error) {
            console.error('Error loading user cart:', error);
            // Fallback to guest cart
            return this.loadGuestCart();
        }
    }

    static loadGuestCart() {
        // For non-logged in users, use localStorage but make it temporary
        const saved = localStorage.getItem('hotimpex-guest-cart');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                cart = Array.isArray(parsed) ? parsed : [];
            } catch (e) {
                console.error('Error parsing guest cart:', e);
                cart = [];
            }
        } else {
            cart = [];
        }
        this.updateCartUI();
        return cart;
    }

    static async saveUserCart() {
        if (!AuthService.isLoggedIn()) {
            return this.saveGuestCart();
        }

        // For logged-in users, cart is automatically saved on server
        // No need to manually save
        return true;
    }

    static saveGuestCart() {
        // Save guest cart to temporary localStorage
        try {
            localStorage.setItem('hotimpex-guest-cart', JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving guest cart:', error);
        }
    }

    static async addToCart(productId, quantity = 1) {
        console.log('CartService.addToCart called with:', { productId, quantity });
        console.log('User logged in?', AuthService.isLoggedIn());
        console.log('Token:', AuthService.getToken());
        
        if (!AuthService.isLoggedIn()) {
            console.log('User not logged in, using guest cart');
            return this.addToGuestCart(productId, quantity);
        }

        if (!productId) {
            console.error('ProductId is missing!');
            showCartNotification('Error: Product ID is missing');
            return false;
        }

        try {
            // Get product data from API first
            let productData = {};
            try {
                const productResponse = await APIService.getProduct(productId);
                if (productResponse.status === 'success') {
                    const product = productResponse.data.product;
                    productData = {
                        name: product.name,
                        price: product.price,
                        image: product.mainImage || product.image,
                        currency: product.currency || 'EGP'
                    };
                }
            } catch (productError) {
                console.warn('Could not fetch product data:', productError);
                // Try to get from local products array as fallback
                const product = getProductById(productId);
                if (product) {
                    productData = {
                        name: product.name,
                        price: product.price,
                        image: product.mainImage || product.image,
                        currency: product.currency || 'EGP'
                    };
                }
            }

            console.log('Making API call to add to cart with:', { productId, quantity, productData });
            const response = await APIService.addToCart(productId, quantity, productData);
            console.log('API response:', response);
            
            if (response.status === 'success') {
                cart = response.data.cart || [];
                this.updateCartUI();
                return true;
            } else {
                throw new Error(response.message || 'Failed to add to cart');
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
            console.error('Error details:', error.message);
            
            // If it's an authentication error, try guest cart instead
            if (error.message.includes('401') || error.message.includes('unauthorized') || error.message.includes('token')) {
                console.log('Authentication error, falling back to guest cart');
                AuthService.logout(); // Clear invalid token
                return this.addToGuestCart(productId, quantity);
            }
            
            showCartNotification('Failed to add item to cart: ' + error.message);
            return false;
        }
    }

    static async addToGuestCart(productId, quantity = 1) {
        const existingItem = cart.find(item => item.productId === productId);
        
        // Try to get product data from API first, then fallback to local array
        let product = null;
        try {
            const productResponse = await APIService.getProduct(productId);
            if (productResponse.status === 'success') {
                product = productResponse.data.product;
            }
        } catch (error) {
            console.warn('Could not fetch product from API:', error);
            product = getProductById(productId);
        }
        
        if (!product) {
            showCartNotification('Product not found');
            return false;
        }

        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                productId,
                quantity,
                productData: {
                    name: product.name,
                    price: product.price,
                    image: product.mainImage || product.image,
                    currency: product.currency || 'EGP'
                }
            });
        }

        this.saveGuestCart();
        this.updateCartUI();
        return true;
    }

    static async removeFromCart(productId) {
        if (!AuthService.isLoggedIn()) {
            return this.removeFromGuestCart(productId);
        }

        try {
            const response = await APIService.removeFromCart(productId);
            if (response.status === 'success') {
                cart = response.data.cart || [];
                this.updateCartUI();
                return true;
            } else {
                throw new Error(response.message || 'Failed to remove from cart');
            }
        } catch (error) {
            console.error('Error removing from cart:', error);
            showCartNotification('Failed to remove item from cart');
            return false;
        }
    }

    static removeFromGuestCart(productId) {
        cart = cart.filter(item => item.productId !== productId);
        this.saveGuestCart();
        this.updateCartUI();
        return true;
    }

    static async updateCartQuantity(productId, quantity) {
        if (quantity <= 0) {
            return this.removeFromCart(productId);
        }

        if (!AuthService.isLoggedIn()) {
            return this.updateGuestCartQuantity(productId, quantity);
        }

        try {
            const response = await APIService.updateCartItem(productId, quantity);
            if (response.status === 'success') {
                cart = response.data.cart || [];
                this.updateCartUI();
                return true;
            } else {
                throw new Error(response.message || 'Failed to update cart');
            }
        } catch (error) {
            console.error('Error updating cart:', error);
            showCartNotification('Failed to update cart');
            return false;
        }
    }

    static updateGuestCartQuantity(productId, quantity) {
        const item = cart.find(item => item.productId === productId);
        if (item) {
            item.quantity = quantity;
            this.saveGuestCart();
            this.updateCartUI();
            return true;
        }
        return false;
    }

    static async clearCart() {
        if (!AuthService.isLoggedIn()) {
            cart = [];
            this.saveGuestCart();
            this.updateCartUI();
            return true;
        }

        try {
            const response = await APIService.clearCart();
            if (response.status === 'success') {
                cart = [];
                this.updateCartUI();
                return true;
            } else {
                throw new Error(response.message || 'Failed to clear cart');
            }
        } catch (error) {
            console.error('Error clearing cart:', error);
            return false;
        }
    }

    static async migrateGuestCartToUser() {
        if (!AuthService.isLoggedIn() || cart.length === 0) {
            return true;
        }

        try {
            // Add each guest cart item to user cart
            for (const item of cart) {
                await APIService.addToCart(item.productId, item.quantity, item.productData);
            }

            // Clear guest cart after migration
            localStorage.removeItem('hotimpex-guest-cart');
            
            // Load the updated user cart
            await this.loadUserCart();
            
            return true;
        } catch (error) {
            console.error('Error migrating guest cart:', error);
            return false;
        }
    }

    static updateCartUI() {
        // Update cart count in header
        const cartCountElements = document.querySelectorAll('.cart-count');
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        
        cartCountElements.forEach(element => {
            element.textContent = totalItems;
            element.style.display = totalItems > 0 ? 'inline' : 'none';
        });

        // Update cart sidebar if open - call global updateCartUI function
        if (window.updateCartUI && typeof window.updateCartUI === 'function') {
            window.updateCartUI();
        }
    }

    static getCartTotal() {
        let total = 0;
        let count = 0;
        
        cart.forEach(item => {
            const price = parseFloat(item.productData?.price) || 0;
            total += price * item.quantity;
            count += item.quantity;
        });
        
        return { total: total.toFixed(2), count };
    }
}

// Make CartService globally available
window.CartService = CartService;
