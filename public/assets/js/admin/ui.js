/**
 * Theme Manager
 * Handles theme switching and persistence
 */
class ThemeManager {
    constructor() {
        this.themeToggle = document.getElementById('theme-toggle');
        this.html = document.documentElement;
        this.initialize();
    }

    /**
     * Initialize theme management
     */
    initialize() {
        this.setupEventListeners();
        this.loadSavedTheme();
        this.watchSystemTheme();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
    }

    /**
     * Apply theme
     * @param {boolean} isDark - Whether to apply dark theme
     */
    applyTheme(isDark) {
        this.html.classList.toggle('dark', isDark);
        this.updateToggleIcon(isDark);
        ChartManager.updateTheme(isDark);
        this.saveTheme(isDark);
    }

    /**
     * Update theme toggle icon
     * @param {boolean} isDark - Whether dark theme is active
     */
    updateToggleIcon(isDark) {
        if (!this.themeToggle) return;
        
        const icon = this.themeToggle.querySelector('svg');
        if (!icon) return;

        if (isDark) {
            icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>`;
            this.themeToggle.setAttribute('title', 'Switch to light mode');
        } else {
            icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>`;
            this.themeToggle.setAttribute('title', 'Switch to dark mode');
        }
    }

    /**
     * Toggle theme
     */
    toggleTheme() {
        const isCurrentlyDark = this.html.classList.contains('dark');
        const newIsDark = !isCurrentlyDark;
        this.applyTheme(newIsDark);
    }

    /**
     * Load saved theme from localStorage
     */
    loadSavedTheme() {
        const savedTheme = localStorage.getItem('darkMode');
        const isDark = savedTheme !== null ? 
            savedTheme === 'true' : 
            window.matchMedia('(prefers-color-scheme: dark)').matches;
        
        this.applyTheme(isDark);
    }

    /**
     * Save theme preference
     * @param {boolean} isDark - Whether dark theme is active
     */
    saveTheme(isDark) {
        localStorage.setItem('darkMode', isDark.toString());
    }

    /**
     * Watch for system theme changes
     */
    watchSystemTheme() {
        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
            // Only apply system theme if no user preference is saved
            if (localStorage.getItem('darkMode') === null) {
                this.applyTheme(e.matches);
            }
        });
    }

    /**
     * Get current theme
     * @returns {string} - 'dark' or 'light'
     */
    getCurrentTheme() {
        return this.html.classList.contains('dark') ? 'dark' : 'light';
    }

    /**
     * Reset to system theme
     */
    resetToSystem() {
        localStorage.removeItem('darkMode');
        const systemIsDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.applyTheme(systemIsDark);
    }
}

/**
 * Sidebar Manager
 * Handles sidebar navigation and mobile responsiveness
 */
class SidebarManager {
    constructor() {
        this.mobileMenuToggle = document.getElementById('mobile-menu-toggle');
        this.mobileOverlay = document.getElementById('mobile-overlay');
        this.floatingSidebar = document.getElementById('floating-sidebar');
        this.sidebarLinks = document.querySelectorAll('.sidebar-link');
        this.adminSections = document.querySelectorAll('.admin-section');
        
        this.initialize();
    }

    /**
     * Initialize sidebar management
     */
    initialize() {
        this.setupMobileMenu();
        this.setupNavigation();
        this.setupResponsive();
    }

    /**
     * Setup mobile menu functionality
     */
    setupMobileMenu() {
        if (this.mobileMenuToggle && this.mobileOverlay && this.floatingSidebar) {
            this.mobileMenuToggle.addEventListener('click', () => {
                this.toggleMobileMenu();
            });

            this.mobileOverlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }
    }

    /**
     * Setup navigation functionality
     */
    setupNavigation() {
        this.sidebarLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleNavigation(link);
            });
        });
    }

    /**
     * Setup responsive behavior
     */
    setupResponsive() {
        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) {
                this.closeMobileMenu();
            }
        });
    }

    /**
     * Toggle mobile menu
     */
    toggleMobileMenu() {
        this.floatingSidebar.classList.toggle('open');
        this.mobileOverlay.classList.toggle('hidden');
        document.body.style.overflow = this.floatingSidebar.classList.contains('open') ? 'hidden' : '';
    }

    /**
     * Close mobile menu
     */
    closeMobileMenu() {
        this.floatingSidebar.classList.remove('open');
        this.mobileOverlay.classList.add('hidden');
        document.body.style.overflow = '';
    }

    /**
     * Handle navigation between sections
     * @param {HTMLElement} link - Clicked navigation link
     */
    handleNavigation(link) {
        // Update active states
        this.updateActiveStates(link);
        
        // Show target section
        this.showTargetSection(link);
        
        // Load section data
        this.loadSectionData(link);
        
        // Close mobile menu if open
        if (window.innerWidth < 1024 && this.floatingSidebar.classList.contains('open')) {
            this.closeMobileMenu();
        }
    }

    /**
     * Update active states for navigation
     * @param {HTMLElement} activeLink - Active navigation link
     */
    updateActiveStates(activeLink) {
        const activeClasses = ['opacity-100'];
        const inactiveClasses = ['opacity-50'];

        this.sidebarLinks.forEach(l => {
            l.classList.remove(...activeClasses);
            l.classList.add(...inactiveClasses);
        });
        
        activeLink.classList.add(...activeClasses);
        activeLink.classList.remove(...inactiveClasses);
    }

    /**
     * Show target section
     * @param {HTMLElement} link - Navigation link
     */
    showTargetSection(link) {
        // Hide all sections
        this.adminSections.forEach(section => section.classList.add('hidden'));
        
        // Show target section
        const targetSectionId = link.getAttribute('data-section') + '-section';
        const targetElement = document.getElementById(targetSectionId);
        if (targetElement) {
            targetElement.classList.remove('hidden');
        }
    }

    /**
     * Load data for the active section
     * @param {HTMLElement} link - Navigation link
     */
    loadSectionData(link) {
        const section = link.getAttribute('data-section');
        
        switch (section) {
            case 'dashboard':
                window.dashboardController?.loadData();
                break;
            case 'orders':
                window.ordersController?.loadData();
                break;
            case 'customers':
                window.usersController?.loadData();
                break;
            case 'products':
                window.productsController?.loadData();
                break;
            case 'settings':
                // Load settings if needed
                break;
        }
    }

    /**
     * Get current active section
     * @returns {string} - Active section name
     */
    getCurrentSection() {
        const activeLink = document.querySelector('.sidebar-link.opacity-100');
        return activeLink ? activeLink.getAttribute('data-section') : 'dashboard';
    }

    /**
     * Navigate to specific section
     * @param {string} sectionName - Section to navigate to
     */
    navigateToSection(sectionName) {
        const targetLink = document.querySelector(`[data-section="${sectionName}"]`);
        if (targetLink) {
            this.handleNavigation(targetLink);
        }
    }
}

// Export classes
window.ThemeManager = ThemeManager;
window.SidebarManager = SidebarManager;
