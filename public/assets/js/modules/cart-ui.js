// Hot Impex Cart UI Module
// Handles cart interface and interactions

class CartUI {
    constructor() {
        this.isCartOpen = false;
        this.init();
    }

    init() {
        this.initializeCartUI();
        this.setupEventListeners();
    }

    initializeCartUI() {
        // Ensure cart array is initialized
        if (!Array.isArray(window.cart)) {
            window.cart = [];
        }
        
        // Load cart based on user login status
        CartService.loadUserCart();
        
        console.log('Cart UI initialized with', window.cart.length, 'items');
    }

    setupEventListeners() {
        const cartToggle = document.getElementById('cart-toggle');
        const desktopCartToggle = document.getElementById('desktop-cart-toggle');
        const closeCart = document.getElementById('close-cart');
        const cartOverlay = document.getElementById('cart-overlay');
        
        // Add event listeners to all cart toggle elements
        [cartToggle, desktopCartToggle].forEach(toggle => {
            if (toggle) {
                toggle.removeEventListener('click', this.handleCartToggleClick);
                toggle.addEventListener('click', this.handleCartToggleClick.bind(this));
            }
        });
        
        if (closeCart) {
            closeCart.removeEventListener('click', this.handleCloseCartClick);
            closeCart.addEventListener('click', this.handleCloseCartClick.bind(this));
        }
        
        if (cartOverlay) {
            cartOverlay.removeEventListener('click', this.handleCartOverlayClick);
            cartOverlay.addEventListener('click', this.handleCartOverlayClick.bind(this));
        }

        // Setup cart items event delegation
        this.setupCartEventListeners();
    }

    handleCartToggleClick(e) {
        e.preventDefault();
        console.log('Cart toggle clicked');
        this.toggleCart();
    }

    handleCloseCartClick(e) {
        e.preventDefault();
        console.log('Close cart clicked');
        this.closeCartSidebar();
    }

    handleCartOverlayClick(e) {
        e.preventDefault();
        console.log('Cart overlay clicked');
        this.closeCartSidebar();
    }

    toggleCart() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        
        console.log('Toggle cart called');
        
        if (cartSidebar) {
            const isHidden = cartSidebar.classList.contains('translate-x-full');
            
            if (isHidden) {
                // Show cart
                cartSidebar.classList.remove('translate-x-full');
                if (cartOverlay) {
                    cartOverlay.classList.remove('hidden');
                }
                this.isCartOpen = true;
                
                // Update cart content
                this.updateCartUI();
            } else {
                // Hide cart
                this.closeCartSidebar();
            }
        } else {
            console.error('Cart sidebar element not found');
        }
    }

    closeCartSidebar() {
        const cartSidebar = document.getElementById('cart-sidebar');
        const cartOverlay = document.getElementById('cart-overlay');
        
        if (cartSidebar) {
            cartSidebar.classList.add('translate-x-full');
        }
        
        if (cartOverlay) {
            cartOverlay.classList.add('hidden');
        }
        
        this.isCartOpen = false;
    }

    updateCartUI() {
        const cart = window.cart || [];
        const cartBadge = document.getElementById('cart-badge');
        const desktopCartBadge = document.getElementById('desktop-cart-badge');
        const mobileCartBadge = document.getElementById('mobile-cart-badge');
        const cartItems = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const cartCount = document.getElementById('cart-count');
        
        console.log('Updating cart UI. Cart contents:', cart);
        
        const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
        const totalPrice = cart.reduce((sum, item) => {
            const price = parseFloat(item.productData?.price || item.price || 0);
            return sum + (price * (item.quantity || 0));
        }, 0);
        
        console.log('Total items:', totalItems, 'Total price:', totalPrice);
        
        // Update all cart badges
        [cartBadge, desktopCartBadge, mobileCartBadge].forEach(badge => {
            if (badge) {
                badge.textContent = totalItems;
                badge.style.display = totalItems > 0 ? 'inline-flex' : 'none';
            }
        });
        
        // Update cart count
        if (cartCount) {
            cartCount.textContent = totalItems;
        }
        
        // Update cart total
        if (cartTotal) {
            const currency = cart[0]?.productData?.currency || 'EGP';
            cartTotal.textContent = `${totalPrice.toFixed(2)} ${currency}`;
        }
        
        // Update checkout button state
        const checkoutButton = document.getElementById('checkout-btn');
        if (checkoutButton) {
            if (cart.length === 0) {
                checkoutButton.disabled = true;
                checkoutButton.classList.add('opacity-50', 'cursor-not-allowed');
            } else {
                checkoutButton.disabled = false;
                checkoutButton.classList.remove('opacity-50', 'cursor-not-allowed');
            }
        }

        // Update cart items display
        if (cartItems) {
            if (cart.length === 0) {
                cartItems.innerHTML = `
                    <div class="text-center py-8">
                        <div class="text-gray-400 text-4xl mb-4">🛒</div>
                        <p class="text-gray-500 dark:text-gray-400">Your cart is empty</p>
                        <p class="text-sm text-gray-400 dark:text-gray-500 mt-2">Add some products to get started!</p>
                    </div>
                `;
            } else {
                cartItems.innerHTML = cart.map(item => this.createCartItemHTML(item)).join('');
            }
        }
    }

    createCartItemHTML(item) {
        const productData = item.productData || {};
        const price = parseFloat(productData.price || 0);
        const quantity = parseInt(item.quantity || 0);
        const subtotal = (price * quantity).toFixed(2);
        const currency = productData.currency || 'EGP';
        
        // Handle image URL
        let imageUrl = productData.image;
        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
            if (!imageUrl.startsWith('assets/')) {
                imageUrl = `assets/images/Products/${imageUrl}`;
            }
        }
        if (!imageUrl) {
            imageUrl = 'assets/images/placeholder.jpg';
        }
        
        return `
            <div class="flex items-center space-x-4 py-4 border-b border-gray-200 dark:border-gray-700" data-item-id="${item.productId}">
                <img src="${imageUrl}" 
                     alt="${productData.name || 'Product'}" 
                     class="w-16 h-16 object-cover rounded-lg"
                     onerror="this.src='assets/images/placeholder.jpg'">
                
                <div class="flex-1 min-w-0">
                    <h4 class="text-sm font-medium text-gray-900 dark:text-white truncate">
                        ${productData.name || 'Unknown Product'}
                    </h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                        ${price.toFixed(2)} ${currency} each
                    </p>
                    <div class="flex items-center space-x-2 mt-2">
                        <button class="decrease-qty w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"></path>
                            </svg>
                        </button>
                        <span class="w-8 text-center text-sm font-medium">${quantity}</span>
                        <button class="increase-qty w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div class="text-right">
                    <p class="text-sm font-medium text-gray-900 dark:text-white">
                        ${subtotal} ${currency}
                    </p>
                    <button class="remove-item text-red-500 hover:text-red-700 text-sm mt-1 transition-colors">
                        Remove
                    </button>
                </div>
            </div>
        `;
    }

    setupCartEventListeners() {
        const cartItems = document.getElementById('cart-items');
        if (!cartItems) return;
        
        // Remove old listeners
        cartItems.removeEventListener('click', this.handleCartButtonClick);
        
        // Add new listener with proper binding
        cartItems.addEventListener('click', this.handleCartButtonClick.bind(this));
    }

    handleCartButtonClick(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const button = e.target.closest('button');
        if (!button) return;
        
        const cartItem = button.closest('[data-item-id]');
        if (!cartItem) return;
        
        const itemId = cartItem.dataset.itemId;
        console.log('Cart button clicked for item:', itemId, 'Button class:', button.className);
        
        const cart = window.cart || [];
        
        if (button.classList.contains('decrease-qty')) {
            const currentItem = cart.find(item => String(item.productId) === String(itemId));
            if (currentItem) {
                const newQuantity = Math.max(0, currentItem.quantity - 1);
                if (newQuantity === 0) {
                    this.removeFromCart(itemId);
                } else {
                    this.updateCartQuantity(itemId, newQuantity);
                }
            }
        } else if (button.classList.contains('increase-qty')) {
            const currentItem = cart.find(item => String(item.productId) === String(itemId));
            if (currentItem) {
                this.updateCartQuantity(itemId, currentItem.quantity + 1);
            }
        } else if (button.classList.contains('remove-item')) {
            this.removeFromCart(itemId);
        }
    }

    // Cart action methods
    async addToCart(productId, quantity = 1) {
        const success = await CartService.addToCart(productId, quantity);
        if (success) {
            UIComponents.showNotification('Item added to cart!');
            this.updateCartUI();
        }
        return success;
    }

    async removeFromCart(productId) {
        console.log('Removing product from cart:', productId);
        
        const success = await CartService.removeFromCart(productId);
        if (success) {
            UIComponents.showNotification('Item removed from cart');
            this.updateCartUI();
        }
        return success;
    }

    async updateCartQuantity(productId, quantity) {
        console.log('Updating cart quantity for product:', productId, 'to:', quantity);
        
        const newQuantity = parseInt(quantity) || 0;
        const success = await CartService.updateCartQuantity(productId, newQuantity);
        if (success) {
            this.updateCartUI();
        }
        return success;
    }

    // Reinitialize method for external calls
    reinitialize() {
        console.log('Reinitializing cart UI...');
        this.setupEventListeners();
        this.updateCartUI();
    }
}

// Initialize cart UI
const cartUI = new CartUI();

// Make cart UI and functions globally available
window.CartUI = CartUI;
window.cartUI = cartUI;
window.addToCart = (productId, quantity) => cartUI.addToCart(productId, quantity);
window.removeFromCart = (productId) => cartUI.removeFromCart(productId);
window.updateCartQuantity = (productId, quantity) => cartUI.updateCartQuantity(productId, quantity);
window.toggleCart = () => cartUI.toggleCart();
window.updateCartUI = () => cartUI.updateCartUI();
window.reinitializeCartEventListeners = () => cartUI.reinitialize();
