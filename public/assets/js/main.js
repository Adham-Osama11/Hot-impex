// Hot Impex Main Initialization Script
// Coordinates the loading and initialization of all modules

class HotImpexApp {
    constructor() {
        this.isInitialized = false;
        this.modules = {};
        this.globalVariables = {
            currentProducts: [],
            cart: [],
            isSearchVisible: false,
            currentHeroProduct: 0,
            autoSlideInterval: null,
            mouseInHero: false
        };
    }

    async init() {
        if (this.isInitialized) {
            console.warn('HotImpex app already initialized');
            return;
        }

        console.log('=== HOT IMPEX INITIALIZATION START ===');
        
        try {
            // Initialize global variables
            this.initializeGlobalVariables();
            
            // Initialize authentication
            this.initializeAuth();
            
            // Initialize core UI components
            this.initializeCoreUI();
            
            // Initialize page-specific content
            await this.initializePageContent();
            
            // Setup global event listeners
            this.setupGlobalEventListeners();
            
            this.isInitialized = true;
            console.log('=== HOT IMPEX INITIALIZATION COMPLETE ===');
            
        } catch (error) {
            console.error('Error during initialization:', error);
        }
    }

    initializeGlobalVariables() {
        // Ensure global variables are available
        Object.keys(this.globalVariables).forEach(key => {
            if (window[key] === undefined) {
                window[key] = this.globalVariables[key];
            }
        });

        // Initialize cart as empty array
        if (!Array.isArray(window.cart)) {
            window.cart = [];
        }

        console.log('Global variables initialized');
    }

    initializeAuth() {
        // Authentication is auto-initialized in auth-service.js
        console.log('Authentication service initialized');
    }

    initializeCoreUI() {
        // Initialize UI components (should be available immediately)
        if (window.UIComponents) {
            UIComponents.init();
            console.log('UI Components initialized');
        }

        // Initialize animations
        if (window.animationsManager) {
            // Animations are auto-initialized in their module
            console.log('Animations initialized');
        }

        // Initialize search
        if (window.searchManager) {
            // Search is auto-initialized in its module
            console.log('Search initialized');
        }

        // Initialize cart UI
        if (window.cartUI) {
            // Cart UI is auto-initialized in its module
            console.log('Cart UI initialized');
        }
    }

    async initializePageContent() {
        console.log('Initializing page-specific content...');

        // Initialize products manager
        if (window.productsManager) {
            await productsManager.loadDynamicContent();
            console.log('Products manager initialized');
        }

        // Check what page we're on and initialize accordingly
        await this.initializeCurrentPage();
    }

    async initializeCurrentPage() {
        const currentPage = this.getCurrentPageType();
        console.log('Current page type:', currentPage);

        switch (currentPage) {
            case 'home':
                await this.initializeHomePage();
                break;
            case 'shop':
                await this.initializeShopPage();
                break;
            case 'product':
                await this.initializeProductPage();
                break;
            case 'profile':
                await this.initializeProfilePage();
                break;
            default:
                console.log('Generic page initialization');
                break;
        }
    }

    getCurrentPageType() {
        const path = window.location.pathname;
        const filename = path.split('/').pop() || 'index.html';
        
        if (filename === 'index.html' || filename === '') {
            return 'home';
        } else if (filename === 'shop.html') {
            return 'shop';
        } else if (filename === 'product.html') {
            return 'product';
        } else if (filename === 'profile.html') {
            return 'profile';
        }
        
        return 'other';
    }

    async initializeHomePage() {
        console.log('Initializing home page...');
        
        // Initialize hero product showcase
        if (window.initializeHeroProductShowcase) {
            initializeHeroProductShowcase();
        }

        // Load and display featured products
        if (window.productsManager) {
            await productsManager.loadFeaturedProducts();
        }

        // Initialize any home-specific animations
        this.initializeHomeAnimations();
    }

    async initializeShopPage() {
        console.log('Initializing shop page...');
        
        if (window.shopManager) {
            await shopManager.init();
        }
    }

    async initializeProductPage() {
        console.log('Initializing product page...');
        
        if (window.productsManager) {
            productsManager.initializeProductPage();
        }
    }

    async initializeProfilePage() {
        console.log('Initializing profile page...');
        
        // Initialize profile tabs if they exist
        if (window.initializeProfilePage) {
            initializeProfilePage();
        }
    }

    initializeHomeAnimations() {
        // Add any home-specific animations here
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.classList.add('fade-in-up');
        }
    }

    setupGlobalEventListeners() {
        // Global escape key handler
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                // Close any open modals/sidebars
                if (window.searchManager && window.searchManager.isSearchVisible) {
                    window.searchManager.closeSearchBar();
                }
                
                if (window.cartUI && window.cartUI.isCartOpen) {
                    window.cartUI.closeCartSidebar();
                }
                
                // Close quick view modal
                const quickViewModal = document.getElementById('quick-view-modal');
                if (quickViewModal && !quickViewModal.classList.contains('hidden')) {
                    if (window.UIComponents && window.UIComponents.closeQuickViewModal) {
                        window.UIComponents.closeQuickViewModal();
                    }
                }
            }
        });

        // Global click handler for external links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('a[href^="http"]');
            if (link && !link.href.includes(window.location.hostname)) {
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
            }
        });

        console.log('Global event listeners setup complete');
    }

    // Utility methods
    showLoading(message = 'Loading...') {
        if (window.UIComponents) {
            UIComponents.showNotification(message, 'info');
        }
    }

    hideLoading() {
        // Hide loading states
        const loadingElements = document.querySelectorAll('.loading-state');
        loadingElements.forEach(el => {
            el.style.display = 'none';
        });
    }

    // Error handling
    handleError(error, context = 'Application') {
        console.error(`${context} Error:`, error);
        
        if (window.UIComponents) {
            UIComponents.showNotification(`${context} error occurred. Please try again.`, 'error');
        }
    }

    // Cleanup method
    destroy() {
        if (window.animationsManager && window.animationsManager.destroy) {
            window.animationsManager.destroy();
        }
        
        this.isInitialized = false;
        console.log('HotImpex app destroyed');
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    // Create and initialize the app
    window.hotImpexApp = new HotImpexApp();
    await window.hotImpexApp.init();
    
    // Legacy compatibility - make functions globally available
    window.initializeDarkMode = () => UIComponents.initializeDarkMode();
    window.initializeMobileMenu = () => UIComponents.initializeMobileMenu();
    window.initializeCarousel = () => UIComponents.initializeCarousel();
    window.initializeProductCards = () => UIComponents.initializeProductCards();
    window.initializeSearch = () => searchManager.init();
    window.initializeCart = () => cartUI.init();
    window.initializeQuickView = () => UIComponents.initializeQuickView();
    window.loadProductsFromStorage = () => productsManager.loadProductsFromStorage();
    window.saveProductsToStorage = () => productsManager.saveProductsToStorage();
    window.displayFeaturedProducts = () => productsManager.displayFeaturedProducts();
    
    // Profile page specific initialization
    if (document.querySelector('.profile-tab')) {
        window.initializeProfilePage();
    }
    
    console.log('Legacy compatibility functions initialized');
});

// Make the app class available globally
window.HotImpexApp = HotImpexApp;
