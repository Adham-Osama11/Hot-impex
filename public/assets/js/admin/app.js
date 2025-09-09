/**
 * Admin Dashboard Main Application
 * Coordinates all admin dashboard functionality
 */
class AdminApp {
    constructor() {
        this.api = null;
        this.controllers = {};
        this.managers = {};
        this.isInitialized = false;
    }

    /**
     * Initialize the admin application
     */
    async initialize() {
        if (this.isInitialized) return;

        try {
            // Initialize API
            this.api = new AdminAPI();
            
            // Initialize managers
            this.managers.theme = new ThemeManager();
            this.managers.sidebar = new SidebarManager();
            this.managers.userProfile = new UserProfileManager(this.api);
            
            // Initialize controllers
            this.controllers.dashboard = new DashboardController(this.api);
            this.controllers.products = new ProductsController(this.api);
            this.controllers.orders = new OrdersController(this.api);
            this.controllers.users = new UsersController(this.api);
            
            // Make controllers globally available for onclick handlers
            window.dashboardController = this.controllers.dashboard;
            window.productsController = this.controllers.products;
            window.ordersController = this.controllers.orders;
            window.usersController = this.controllers.users;
            
            // Initialize charts
            ChartManager.initialize();
            
            // Setup global event listeners
            this.setupGlobalEventListeners();
            
            // Setup UI animations
            this.setupUIAnimations();
            
            // Load initial data (dashboard)
            await this.controllers.dashboard.loadData();
            
            this.isInitialized = true;
            
            // Make app globally available for testing
            window.adminApp = this;
            
            console.log('Admin Dashboard initialized successfully');
            
        } catch (error) {
            console.error('Failed to initialize admin dashboard:', error);
            NotificationManager.showError('Failed to initialize dashboard');
        }
    }

    /**
     * Setup global event listeners
     */
    setupGlobalEventListeners() {
        // Global error handler
        window.addEventListener('error', (event) => {
            console.error('Global error:', event.error);
            NotificationManager.showError('An unexpected error occurred');
        });

        // Unhandled promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            console.error('Unhandled promise rejection:', event.reason);
            NotificationManager.showError('An unexpected error occurred');
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });

        // Auto-save forms (if needed)
        this.setupAutoSave();
    }

    /**
     * Handle keyboard shortcuts
     * @param {KeyboardEvent} e - Keyboard event
     */
    handleKeyboardShortcuts(e) {
        // Ctrl/Cmd + K for search
        if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
            e.preventDefault();
            // Focus search input if available
            const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]');
            if (searchInput) {
                searchInput.focus();
            }
        }

        // Escape to close modals
        if (e.key === 'Escape') {
            this.closeAllModals();
        }

        // Ctrl/Cmd + S to save (prevent default browser save)
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            // Could trigger save action for currently open form
        }
    }

    /**
     * Setup auto-save functionality
     */
    setupAutoSave() {
        // Auto-save form data to localStorage (optional)
        const forms = document.querySelectorAll('form[data-autosave]');
        forms.forEach(form => {
            const inputs = form.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                input.addEventListener('input', UIHelpers.debounce(() => {
                    this.saveFormData(form);
                }, 1000));
            });
        });
    }

    /**
     * Save form data to localStorage
     * @param {HTMLFormElement} form - Form to save
     */
    saveFormData(form) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
        const formId = form.id || 'default-form';
        localStorage.setItem(`admin-form-${formId}`, JSON.stringify(data));
    }

    /**
     * Restore form data from localStorage
     * @param {HTMLFormElement} form - Form to restore
     */
    restoreFormData(form) {
        const formId = form.id || 'default-form';
        const savedData = localStorage.getItem(`admin-form-${formId}`);
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                Object.entries(data).forEach(([key, value]) => {
                    const input = form.querySelector(`[name="${key}"]`);
                    if (input) {
                        input.value = value;
                    }
                });
            } catch (error) {
                console.error('Failed to restore form data:', error);
            }
        }
    }

    /**
     * Setup UI animations
     */
    setupUIAnimations() {
        // Card hover animations
        const cards = document.querySelectorAll('.admin-card');
        cards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-4px) scale(1.02)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0) scale(1)';
            });
        });

        // Animate stats on load
        const statsNumbers = document.querySelectorAll('.admin-card .text-3xl');
        statsNumbers.forEach((stat, index) => {
            setTimeout(() => {
                stat.style.opacity = '0';
                stat.style.transform = 'translateY(20px)';
                stat.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                
                requestAnimationFrame(() => {
                    stat.style.opacity = '1';
                    stat.style.transform = 'translateY(0)';
                });
            }, index * 150);
        });

        // Intersection Observer for scroll animations
        this.setupScrollAnimations();
    }

    /**
     * Setup scroll-based animations
     */
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-fade-in');
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        // Observe cards and sections
        document.querySelectorAll('.admin-card, .admin-section').forEach(el => {
            observer.observe(el);
        });
    }

    /**
     * Close all open modals
     */
    closeAllModals() {
        // Close product modal
        const productModal = document.getElementById('productModal');
        if (productModal && !productModal.classList.contains('hidden')) {
            this.controllers.products.closeModal();
        }

        // Close order details modal
        const orderModal = document.getElementById('orderDetailsModal');
        if (orderModal) {
            this.controllers.orders.closeOrderModal();
        }

        // Close user details modal
        const userModal = document.getElementById('userDetailsModal');
        if (userModal) {
            this.controllers.users.closeUserModal();
        }
    }

    /**
     * Refresh current section data
     */
    async refreshCurrentSection() {
        const currentSection = this.managers.sidebar.getCurrentSection();
        const controller = this.controllers[currentSection];
        
        if (controller && typeof controller.loadData === 'function') {
            await controller.loadData();
            NotificationManager.showSuccess('Data refreshed successfully');
        }
    }

    /**
     * Export data for current section
     */
    exportCurrentSectionData() {
        const currentSection = this.managers.sidebar.getCurrentSection();
        
        switch (currentSection) {
            case 'users':
                this.controllers.users.exportToCSV();
                break;
            default:
                NotificationManager.showInfo('Export not available for this section');
        }
    }

    /**
     * Get application status
     * @returns {object} - Application status
     */
    getStatus() {
        return {
            initialized: this.isInitialized,
            currentSection: this.managers.sidebar?.getCurrentSection(),
            theme: this.managers.theme?.getCurrentTheme(),
            controllers: Object.keys(this.controllers),
            managers: Object.keys(this.managers)
        };
    }

    /**
     * Cleanup and destroy the application
     */
    destroy() {
        // Destroy charts
        ChartManager.destroyAll();
        
        // Remove event listeners
        // (This would be more comprehensive in a real application)
        
        // Clear controllers
        this.controllers = {};
        this.managers = {};
        this.api = null;
        this.isInitialized = false;
        
        console.log('Admin Dashboard destroyed');
    }
}

// Global functions for modal management (to maintain compatibility with onclick handlers)
window.showAddProductModal = () => window.productsController?.showAddModal();
window.closeProductModal = () => window.productsController?.closeModal();

// Initialize the admin app when authentication is successful
document.addEventListener('adminAuthSuccess', async () => {
    window.adminApp = new AdminApp();
    await window.adminApp.initialize();
});

// Fallback initialization for testing/development
document.addEventListener('DOMContentLoaded', async () => {
    // Wait a bit to see if auth guard fires first
    setTimeout(async () => {
        if (!window.adminApp) {
            console.warn('Admin app not initialized by auth guard, initializing directly (development mode)');
            window.adminApp = new AdminApp();
            await window.adminApp.initialize();
        }
    }, 100);
});

// Export for global access
window.AdminApp = AdminApp;
