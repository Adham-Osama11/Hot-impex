// Hot Impex Website JavaScript - Enhanced Version with API Integration

// API Configuration
const API_BASE_URL = window.location.origin + '/api';

// API Service Functions
class APIService {
    static async request(endpoint, options = {}) {
        try {
            const response = await fetch(`${API_BASE_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                // Return the server error response instead of throwing a generic error
                return data;
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    static async getProducts(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const endpoint = queryString ? `/products?${queryString}` : '/products';
        return await this.request(endpoint);
    }

    static async getProduct(id) {
        return await this.request(`/products/${id}`);
    }

    static async getCategories() {
        return await this.request('/products/categories');
    }

    static async searchProducts(query) {
        return await this.request(`/products/search/${encodeURIComponent(query)}`);
    }

    static async getFeaturedProducts() {
        return await this.getProducts({ featured: 'true', limit: 4 });
    }

    static async getBestSellers() {
        return await this.getProducts({ bestSeller: 'true', limit: 4 });
    }
}

// Global variables
let currentProducts = [];
let cart = []; // Initialize cart as empty array
let isSearchVisible = false;
let currentHeroProduct = 0;
let autoSlideInterval;
let mouseInHero = false;
let scrollProgressBar;
let animationObserver;

// Scroll Animation Functions
function initScrollAnimations() {
    // Create scroll progress bar
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
        updateScrollProgress(progressBar);
        window.addEventListener('scroll', () => updateScrollProgress(progressBar));
    }

    // Initialize Intersection Observer for animations
    initIntersectionObserver();
    
    // Add parallax effect to hero background
    initParallaxEffect();
    
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
}

function updateScrollProgress(progressBar) {
    const scrolled = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100;
    progressBar.style.width = Math.min(scrolled, 100) + '%';
}

function initIntersectionObserver() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    animationObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                
                // Handle staggered animations
                if (entry.target.classList.contains('stagger-animation')) {
                    const delay = parseFloat(entry.target.style.animationDelay) || 0;
                    setTimeout(() => {
                        entry.target.classList.add('fade-in');
                    }, delay * 1000);
                }
            }
        });
    }, observerOptions);

    // Observe all animation elements
    document.querySelectorAll('.scroll-animate, .scroll-animate-left, .scroll-animate-right, .scroll-animate-scale, .scroll-animate-rotate, .stagger-animation').forEach(el => {
        animationObserver.observe(el);
    });
}

function initParallaxEffect() {
    const heroSection = document.getElementById('hero-showroom');
    if (heroSection) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            
            const parallaxElements = heroSection.querySelectorAll('.parallax-bg');
            parallaxElements.forEach(element => {
                element.style.transform = `translateY(${rate}px)`;
            });
        });
    }
}

// Sticky navbar functionality
function initStickyNavbar() {
    const header = document.querySelector('header');
    
    if (header) {
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            
            if (scrolled > 50) { // Start sticky effect after scrolling 50px
                header.classList.add('sticky');
            } else {
                header.classList.remove('sticky');
            }
        });
    }
}

// Add floating animation to elements
function addFloatingAnimation() {
    const floatingElements = document.querySelectorAll('.floating-particle');
    floatingElements.forEach((element, index) => {
        element.style.animation = `float ${3 + index * 0.5}s ease-in-out infinite`;
        element.style.animationDelay = `${index * 0.5}s`;
    });
}

// Enhanced hero products data for Three.js
let heroProducts = [
    {
        id: 1,
        name: "RACING SIM SEAT",
        image: "assets/images/racing sim seat_without BG.png",
        alt: "Racing Sim Seat"
    },
    {
        id: 2,
        name: "TELESCOPIC SCREEN",
        image: "assets/images/screen telescopic_without BG.png",
        alt: "Telescopic Screen"
    },
    {
        id: 3,
        name: "INTERACTIVE KIOSKS",
        image: "assets/images/kiosks without BG.png",
        alt: "Interactive Kiosks"
    }
];

// Three.js variables
let scene, camera, renderer, textureLoader;
let productMeshes = [];
let currentProductIndex = 0;
let isAnimating = false;
let rotationGroup;

// Sample products data - Updated to match database products
const products = [
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
window.products = products;

// Make cart functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.toggleCart = toggleCart;
window.reinitializeCartEventListeners = reinitializeCartEventListeners;

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    console.log('=== HOT IMPEX INITIALIZATION START ===');
    
    initializeDarkMode();
    initializeMobileMenu();
    initializeCarousel();
    initializeProductCards();
    initializeSearch();
    
    console.log('Initializing cart...');
    initializeCart();
    console.log('Cart initialized. Current cart:', cart);
    
    initializeQuickView();
    initializeScrollAnimations();
    initializeMobileGestures();
    initializeHeroProductShowcase(); // Initialize product showcase instead of video
    initStickyNavbar(); // Initialize sticky navbar
    loadProductsFromStorage();
    
    // Load dynamic content from API
    loadDynamicContent();
    
    // Initialize products on main page
    if (document.getElementById('featured-products')) {
        displayFeaturedProducts();
    }
    
    // Initialize shop page if present
    if (document.getElementById('products-grid')) {
        initializeShopPage();
    }
    
    // Initialize product page if present
    if (document.getElementById('product-gallery')) {
        initializeProductPage();
    }
    
    console.log('=== HOT IMPEX INITIALIZATION COMPLETE ===');
    console.log('Products available:', products.length);
    console.log('Cart functions available:', {
        addToCart: typeof window.addToCart,
        removeFromCart: typeof window.removeFromCart,
        toggleCart: typeof window.toggleCart
    });
});

// Dark Mode Functionality
function initializeDarkMode() {
    const darkModeToggle = document.getElementById('theme-toggle');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    const html = document.documentElement;
    
    // Check for saved dark mode preference
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    
    if (isDarkMode) {
        html.classList.add('dark');
        updateDarkModeToggle(true);
        updateMobileDarkModeToggle(true);
    }
    
    if (darkModeToggle) {
        darkModeToggle.addEventListener('click', toggleDarkMode);
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', toggleDarkMode);
    }
}

function toggleDarkMode() {
    const html = document.documentElement;
    const isDarkMode = html.classList.toggle('dark');
    
    localStorage.setItem('darkMode', isDarkMode);
    updateDarkModeToggle(isDarkMode);
    updateMobileDarkModeToggle(isDarkMode);
    
    // Trigger animation
    html.style.transition = 'background 0.3s ease, color 0.3s ease';
    setTimeout(() => {
        html.style.transition = '';
    }, 300);
}

function updateDarkModeToggle(isDarkMode) {
    const toggle = document.getElementById('theme-toggle');
    if (toggle) {
        const sunIcon = toggle.querySelector('.sun-icon');
        const moonIcon = toggle.querySelector('.moon-icon');
        
        if (isDarkMode) {
            sunIcon.style.opacity = '0';
            moonIcon.style.opacity = '1';
        } else {
            sunIcon.style.opacity = '1';
            moonIcon.style.opacity = '0';
        }
    }
}

function updateMobileDarkModeToggle(isDarkMode) {
    const toggle = document.getElementById('mobile-theme-toggle');
    if (toggle) {
        const sunIcon = toggle.querySelector('.sun-icon');
        const moonIcon = toggle.querySelector('.moon-icon');
        
        if (isDarkMode) {
            sunIcon.style.opacity = '0';
            moonIcon.style.opacity = '1';
        } else {
            sunIcon.style.opacity = '1';
            moonIcon.style.opacity = '0';
        }
    }
}

// Mobile Menu
function initializeMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
    const mobileMenu = document.getElementById('mobile-menu');
    const closeMobileMenu = document.getElementById('mobile-menu-close') || document.getElementById('close-mobile-menu');
    const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
    
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
            document.body.style.overflow = mobileMenu.classList.contains('hidden') ? '' : 'hidden';
        });
    }
    
    if (closeMobileMenu && mobileMenu) {
        closeMobileMenu.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
        });
    }
    
    // Close menu when clicking backdrop
    if (mobileMenuBackdrop && mobileMenu) {
        mobileMenuBackdrop.addEventListener('click', () => {
            mobileMenu.classList.add('hidden');
            document.body.style.overflow = '';
        });
    }
}

// Carousel Functionality
function initializeCarousel() {
    const slides = document.querySelectorAll('.carousel-slide');
    const prevBtn = document.querySelector('.carousel-prev');
    const nextBtn = document.querySelector('.carousel-next');
    let currentSlide = 0;
    
    if (slides.length === 0) return;
    
    function showSlide(index) {
        slides.forEach((slide, i) => {
            slide.style.display = i === index ? 'block' : 'none';
        });
    }
    
    function nextSlide() {
        currentSlide = (currentSlide + 1) % slides.length;
        showSlide(currentSlide);
    }
    
    function prevSlide() {
        currentSlide = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(currentSlide);
    }
    
    if (nextBtn) nextBtn.addEventListener('click', nextSlide);
    if (prevBtn) prevBtn.addEventListener('click', prevSlide);
    
    // Auto-advance carousel
    setInterval(nextSlide, 5000);
    
    // Initialize first slide
    showSlide(0);
}

// Product Cards Animation
function initializeProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-8px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = '';
        });
    });
}

// Search Functionality
function initializeSearch() {
    const searchToggle = document.getElementById('search-toggle');
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');
    const searchResults = document.getElementById('search-results');
    const closeSearch = document.getElementById('close-search');
    const heroSearch = document.getElementById('hero-search');
    const searchSuggestions = document.getElementById('search-suggestions');
    
    if (searchToggle) {
        searchToggle.addEventListener('click', toggleSearch);
    }
    
    if (closeSearch) {
        closeSearch.addEventListener('click', closeSearchBar);
    }
    
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }
    
    if (heroSearch) {
        heroSearch.addEventListener('input', handleHeroSearch);
        heroSearch.addEventListener('focus', showHeroSearchSuggestions);
        heroSearch.addEventListener('blur', hideHeroSearchSuggestions);
    }
    
    // Close search on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isSearchVisible) {
            closeSearchBar();
        }
        if (e.key === 'Escape' && searchSuggestions && !searchSuggestions.classList.contains('hidden')) {
            hideHeroSearchSuggestions();
        }
    });
}

function toggleSearch() {
    const searchContainer = document.getElementById('search-container');
    const searchInput = document.getElementById('search-input');
    
    if (searchContainer) {
        isSearchVisible = !isSearchVisible;
        searchContainer.classList.toggle('hidden', !isSearchVisible);
        
        if (isSearchVisible && searchInput) {
            setTimeout(() => searchInput.focus(), 100);
        }
    }
}

function closeSearchBar() {
    const searchContainer = document.getElementById('search-container');
    const searchResults = document.getElementById('search-results');
    
    if (searchContainer) {
        isSearchVisible = false;
        searchContainer.classList.add('hidden');
    }
    
    if (searchResults) {
        searchResults.innerHTML = '';
    }
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase();
    const searchResults = document.getElementById('search-results');
    
    if (!searchResults) return;
    
    if (query.length < 2) {
        searchResults.innerHTML = '';
        return;
    }
    
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );
    
    displaySearchResults(filteredProducts);
}

function displaySearchResults(results) {
    const searchResults = document.getElementById('search-results');
    
    if (!searchResults) return;
    
    if (results.length === 0) {
        searchResults.innerHTML = '<div class="p-4 text-gray-500 dark:text-gray-400">No products found</div>';
        return;
    }
    
    searchResults.innerHTML = results.map(product => `
        <div class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-600" 
             onclick="viewProduct(${product.id})">
            <div class="flex items-center space-x-3">
                <img src="https://placehold.co/50x50/E0E0E0/808080?text=${product.image}" 
                     alt="${product.name}" class="w-12 h-12 rounded-lg object-cover">
                <div>
                    <h4 class="font-medium text-gray-900 dark:text-white">${product.name}</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400 capitalize">${product.category}</p>
                    <p class="text-lg font-bold text-blue-600">${product.price}EGP</p>
                </div>
            </div>
        </div>
    `).join('');
}

// Hero Search Functions
function handleHeroSearch(e) {
    const query = e.target.value.toLowerCase();
    const searchSuggestions = document.getElementById('search-suggestions');
    
    if (!searchSuggestions) return;
    
    if (query.length < 2) {
        searchSuggestions.classList.add('hidden');
        return;
    }
    
    const filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query)
    );
    
    displayHeroSearchResults(filteredProducts);
    searchSuggestions.classList.remove('hidden');
}

function displayHeroSearchResults(results) {
    const searchSuggestions = document.getElementById('search-suggestions');
    
    if (!searchSuggestions) return;
    
    if (results.length === 0) {
        searchSuggestions.innerHTML = '<div class="p-4 text-gray-500">No products found</div>';
        return;
    }
    
    searchSuggestions.innerHTML = results.slice(0, 5).map(product => `
        <div class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0" 
             onclick="viewProduct(${product.id})">
            <div class="flex items-center space-x-3">
                <img src="https://placehold.co/40x40/E0E0E0/808080?text=${product.image}" 
                     alt="${product.name}" class="w-10 h-10 rounded-lg object-cover">
                <div>
                    <h4 class="font-medium text-gray-900">${product.name}</h4>
                    <p class="text-sm text-gray-500 capitalize">${product.category}</p>
                    <p class="text-sm font-bold text-blue-600">${product.price}EGP</p>
                </div>
            </div>
        </div>
    `).join('');
}

function showHeroSearchSuggestions() {
    const heroSearch = document.getElementById('hero-search');
    const searchSuggestions = document.getElementById('search-suggestions');
    
    if (heroSearch && searchSuggestions && heroSearch.value.length >= 2) {
        searchSuggestions.classList.remove('hidden');
    }
}

function hideHeroSearchSuggestions() {
    const searchSuggestions = document.getElementById('search-suggestions');
    
    // Delay hiding to allow clicks on suggestions
    setTimeout(() => {
        if (searchSuggestions) {
            searchSuggestions.classList.add('hidden');
        }
    }, 200);
}

// Cart Functionality
function initializeCart() {
    // Ensure cart array is initialized
    if (!Array.isArray(cart)) {
        cart = [];
    }
    
    loadCartFromStorage();
    updateCartUI();
    
    const cartToggle = document.getElementById('cart-toggle');
    const desktopCartToggle = document.getElementById('desktop-cart-toggle');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCart = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    
    // Add event listeners to all cart toggle elements
    [cartToggle, desktopCartToggle].forEach(toggle => {
        if (toggle) {
            toggle.addEventListener('click', handleCartToggleClick);
        }
    });
    
    if (closeCart) {
        closeCart.addEventListener('click', handleCloseCartClick);
    }
    
    if (cartOverlay) {
        cartOverlay.addEventListener('click', handleCartOverlayClick);
    }
    
    console.log('Cart initialized with', cart.length, 'items');
}

// Function to reinitialize cart event listeners - can be called from any page
function reinitializeCartEventListeners() {
    console.log('Reinitializing cart event listeners...');
    
    const cartToggle = document.getElementById('cart-toggle');
    const desktopCartToggle = document.getElementById('desktop-cart-toggle');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCart = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    
    console.log('Found elements:', {
        cartToggle: !!cartToggle,
        desktopCartToggle: !!desktopCartToggle,
        cartSidebar: !!cartSidebar,
        closeCart: !!closeCart,
        cartOverlay: !!cartOverlay
    });
    
    // Add event listeners to all cart toggle elements
    [cartToggle, desktopCartToggle].forEach(toggle => {
        if (toggle) {
            // Remove existing listeners first
            toggle.removeEventListener('click', handleCartToggleClick);
            // Add new listener
            toggle.addEventListener('click', handleCartToggleClick);
            console.log('Added cart toggle listener to:', toggle.id);
        }
    });
    
    if (closeCart) {
        closeCart.removeEventListener('click', handleCloseCartClick);
        closeCart.addEventListener('click', handleCloseCartClick);
        console.log('Added close cart listener');
    }
    
    if (cartOverlay) {
        cartOverlay.removeEventListener('click', handleCartOverlayClick);
        cartOverlay.addEventListener('click', handleCartOverlayClick);
        console.log('Added cart overlay listener');
    }
}

// Event handler functions to avoid duplicate listeners
function handleCartToggleClick(e) {
    e.preventDefault();
    console.log('Cart toggle clicked via event handler');
    toggleCart();
}

function handleCloseCartClick(e) {
    e.preventDefault();
    console.log('Close cart clicked via event handler');
    closeCartSidebar();
}

function handleCartOverlayClick(e) {
    e.preventDefault();
    console.log('Cart overlay clicked via event handler');
    closeCartSidebar();
}

function addToCart(productId, quantity = 1) {
    const qty = parseInt(quantity) || 1;
    console.log('Adding product to cart:', productId, 'quantity:', qty);
    
    const product = products.find(p => String(p.id) === String(productId));
    if (!product) {
        console.error('Product not found:', productId);
        return;
    }
    
    if (!Array.isArray(cart)) {
        cart = [];
    }
    
    const existingItem = cart.find(item => String(item.id) === String(product.id));
    
    if (existingItem) {
        existingItem.quantity += qty;
        console.log('Updated quantity for product:', product.id, 'to', existingItem.quantity);
    } else {
        cart.push({ ...product, quantity: qty });
        console.log('Added new product to cart:', product.id, 'with quantity:', qty);
    }
    
    saveCartToStorage();
    updateCartUI();
    showCartNotification('Product added to cart!');
}

function removeFromCart(productId) {
    console.log('Removing product from cart:', productId, typeof productId);
    
    if (!Array.isArray(cart)) {
        cart = [];
        return;
    }
    
    // Find and remove the item
    const originalLength = cart.length;
    cart = cart.filter(item => {
        const itemIdStr = String(item.id);
        const targetIdStr = String(productId);
        return itemIdStr !== targetIdStr;
    });
    
    const removed = cart.length < originalLength;
    console.log('Removal successful:', removed, 'Cart length:', cart.length);
    
    if (removed) {
        saveCartToStorage();
        updateCartUI();
        showCartNotification('Product removed from cart!');
    }
}

function updateCartQuantity(productId, quantity) {
    console.log('Updating cart quantity for product:', productId, 'to:', quantity);
    
    const newQuantity = parseInt(quantity) || 0;
    if (!Array.isArray(cart)) {
        cart = [];
        return;
    }
    
    const item = cart.find(item => String(item.id) === String(productId));
    
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            saveCartToStorage();
            updateCartUI();
        }
    }
}

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    
    console.log('Toggle cart called');
    console.log('Cart sidebar:', cartSidebar);
    console.log('Cart overlay:', cartOverlay);
    
    if (cartSidebar) {
        const isHidden = cartSidebar.classList.contains('translate-x-full');
        
        if (isHidden) {
            // Show cart
            cartSidebar.classList.remove('translate-x-full');
            if (cartOverlay) {
                cartOverlay.classList.remove('hidden');
            }
            console.log('Cart opened');
        } else {
            // Hide cart
            cartSidebar.classList.add('translate-x-full');
            if (cartOverlay) {
                cartOverlay.classList.add('hidden');
            }
            console.log('Cart closed');
        }
    } else {
        console.error('Cart sidebar element not found');
    }
}

function closeCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    
    console.log('Close cart called');
    
    if (cartSidebar) {
        cartSidebar.classList.add('translate-x-full');
    }
    
    if (cartOverlay) {
        cartOverlay.classList.add('hidden');
    }
}

function updateCartUI() {
    const cartBadge = document.getElementById('cart-badge');
    const desktopCartBadge = document.getElementById('desktop-cart-badge');
    const mobileCartBadge = document.getElementById('mobile-cart-badge');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');
    
    console.log('Updating cart UI. Cart contents:', cart);
    
    // Ensure cart is an array
    if (!Array.isArray(cart)) {
        cart = [];
    }
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    console.log('Total items:', totalItems, 'Total price:', totalPrice);
    
    // Update all cart badges
    [cartBadge, desktopCartBadge, mobileCartBadge].forEach(badge => {
        if (badge) {
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'block' : 'none';
        }
    });
    
    // Update cart count
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
    
    // Update cart total
    if (cartTotal) {
        cartTotal.textContent = `${totalPrice.toFixed(2)} EGP`;
    }
    
    // Update cart items display
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="text-center text-gray-500 dark:text-gray-400 py-16">
                    <svg class="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <p class="mt-4 text-lg font-semibold">Your cart is empty</p>
                    <p class="mt-2 text-sm">Add items to see them here.</p>
                </div>
            `;
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="flex items-center space-x-3 p-3 border-b border-gray-200 dark:border-gray-600" data-item-id="${item.id}">
                    <img src="${item.mainImage || item.image || 'assets/images/Products/placeholder.jpg'}" 
                         alt="${item.name}" class="w-12 h-12 rounded-lg object-cover flex-shrink-0">
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-900 dark:text-white">${item.name}</h4>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${parseFloat(item.price).toFixed(2)} EGP each</p>
                        <div class="flex items-center space-x-2 mt-1">
                            <button class="decrease-qty w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                                <span class="font-bold">−</span>
                            </button>
                            <span class="text-sm font-bold w-8 text-center bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-md">${item.quantity}</span>
                            <button class="increase-qty w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors">
                                <span class="font-bold">+</span>
                            </button>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-medium text-gray-900 dark:text-white">${(item.price * item.quantity).toFixed(2)} EGP</p>
                        <button class="remove-item text-red-500 hover:text-red-700 text-sm font-medium transition-colors">
                            Remove
                        </button>
                    </div>
                </div>
            `).join('');
            
            // Add event listeners for cart buttons
            setupCartEventListeners();
        }
    }
}

function setupCartEventListeners() {
    const cartItems = document.getElementById('cart-items');
    if (!cartItems) return;
    
    // Remove old listeners
    cartItems.removeEventListener('click', handleCartButtonClick);
    
    // Add new listener
    cartItems.addEventListener('click', handleCartButtonClick);
}

function handleCartButtonClick(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const button = e.target.closest('button');
    if (!button) return;
    
    const cartItem = button.closest('[data-item-id]');
    if (!cartItem) return;
    
    const itemId = cartItem.dataset.itemId;
    console.log('Cart button clicked for item:', itemId, 'Button class:', button.className);
    
    if (button.classList.contains('decrease-qty')) {
        const currentItem = cart.find(item => String(item.id) === String(itemId));
        if (currentItem) {
            const newQty = currentItem.quantity - 1;
            if (newQty <= 0) {
                removeFromCart(itemId);
            } else {
                updateCartQuantity(itemId, newQty);
            }
        }
    } else if (button.classList.contains('increase-qty')) {
        const currentItem = cart.find(item => String(item.id) === String(itemId));
        if (currentItem) {
            updateCartQuantity(itemId, currentItem.quantity + 1);
        }
    } else if (button.classList.contains('remove-item')) {
        removeFromCart(itemId);
    }
}

function showCartNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.classList.remove('translate-x-full');
    }, 100);
    
    setTimeout(() => {
        notification.classList.add('translate-x-full');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Quick View Functionality
function initializeQuickView() {
    const quickViewModal = document.getElementById('quick-view-modal');
    const closeQuickView = document.getElementById('close-quick-view');
    
    if (closeQuickView) {
        closeQuickView.addEventListener('click', closeQuickViewModal);
    }
    
    if (quickViewModal) {
        quickViewModal.addEventListener('click', (e) => {
            if (e.target === quickViewModal) {
                closeQuickViewModal();
            }
        });
    }
}

function openQuickView(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const modal = document.getElementById('quick-view-modal');
    const content = document.getElementById('quick-view-content');
    
    if (modal && content) {
        content.innerHTML = `
            <div class="flex flex-col md:flex-row">
                <div class="md:w-1/2">
                    <img src="https://placehold.co/400x400/E0E0E0/808080?text=${product.image}" 
                         alt="${product.name}" class="w-full h-64 md:h-96 object-cover rounded-lg">
                </div>
                <div class="md:w-1/2 md:pl-6 mt-4 md:mt-0">
                    <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-2">${product.name}</h2>
                    <p class="text-gray-600 dark:text-gray-300 capitalize mb-4">${product.category} Category</p>
                    <div class="mb-4">
                        ${product.originalPrice ? 
                            `<span class="text-lg text-gray-500 line-through">${product.originalPrice}EGP</span>` : ''
                        }
                        <span class="text-2xl font-bold text-blue-600 ml-2">${product.price}EGP</span>
                    </div>
                    <p class="text-gray-600 dark:text-gray-300 mb-6">
                        High-quality ${product.category} supplement designed for optimal performance and health benefits.
                    </p>
                    <div class="flex space-x-3">
                        <button onclick="addToCart(${product.id}); closeQuickViewModal();" 
                                class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
                            Add to Cart
                        </button>
                        <button onclick="viewProduct(${product.id})" 
                                class="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            View Details
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        modal.classList.remove('hidden');
        setTimeout(() => {
            content.classList.add('show');
        }, 10);
    }
}

function closeQuickViewModal() {
    const modal = document.getElementById('quick-view-modal');
    const content = document.getElementById('quick-view-content');
    
    if (content) {
        content.classList.remove('show');
    }
    
    setTimeout(() => {
        if (modal) {
            modal.classList.add('hidden');
        }
    }, 300);
}

// Scroll Animations
function initializeScrollAnimations() {
    // Create scroll progress bar
    const progressBar = document.querySelector('.scroll-progress');
    if (progressBar) {
        updateScrollProgress(progressBar);
        window.addEventListener('scroll', () => updateScrollProgress(progressBar));
    }

    // Initialize Intersection Observer for animations
    initIntersectionObserver();
    
    // Add parallax effect to hero background
    initParallaxEffect();
    
    // Add floating animation
    addFloatingAnimation();
    
    // Add smooth scroll behavior
    document.documentElement.style.scrollBehavior = 'smooth';
}

// Mobile Gestures
function initializeMobileGestures() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        let startX = 0;
        let startY = 0;
        
        card.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });
        
        card.addEventListener('touchend', (e) => {
            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const diffX = Math.abs(endX - startX);
            const diffY = Math.abs(endY - startY);
            
            // If it's a swipe left and minimal vertical movement
            if (diffX > 50 && diffY < 30 && endX < startX) {
                const productId = parseInt(card.dataset.productId);
                if (productId) {
                    addToCart(productId);
                }
            }
        });
    });
}

// Product Display Functions
function displayFeaturedProducts() {
    const container = document.getElementById('featured-products');
    if (!container) return;
    
    const featuredProducts = products.slice(0, 8);
    
    container.innerHTML = featuredProducts.map(product => `
        <div class="product-card bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 scroll-animate" 
             data-product-id="${product.id}">
            <div class="relative mb-4">
                <img src="https://placehold.co/300x300/E0E0E0/808080?text=${product.image}" 
                     alt="${product.name}" 
                     class="w-full h-48 object-cover rounded-lg">
                ${product.originalPrice ? '<span class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm">Sale</span>' : ''}
            </div>
            <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">${product.name}</h3>
            <p class="text-gray-600 dark:text-gray-300 capitalize mb-3">${product.category}</p>
            <div class="flex items-center justify-between mb-4">
                <div>
                    ${product.originalPrice ? 
                        `<span class="text-sm text-gray-500 line-through">${product.originalPrice}EGP</span><br>` : ''
                    }
                    <span class="text-2xl font-bold text-blue-600">${product.price}EGP</span>
                </div>
            </div>
            <div class="flex space-x-2">
                <button onclick="addToCart(${product.id})" 
                        class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                    Add to Cart
                </button>
                <button onclick="openQuickView(${product.id})" 
                        class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    Quick View
                </button>
            </div>
        </div>
    `).join('');
}

// Shop Page Functions
function initializeShopPage() {
    const categoryButtons = document.querySelectorAll('.category-btn');
    
    categoryButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const category = btn.dataset.category;
            filterProductsByCategory(category);
            
            // Update active button
            categoryButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        });
    });
    
    // Display all products initially
    displayShopProducts(products);
}

function filterProductsByCategory(category) {
    const filteredProducts = category === 'all' ? 
        products : 
        products.filter(product => product.category === category);
    
    displayShopProducts(filteredProducts);
}

function displayShopProducts(productsToShow) {
    const container = document.getElementById('products-grid');
    if (!container) return;
    
    container.innerHTML = productsToShow.map(product => `
        <div class="product-card bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300" 
             data-product-id="${product.id}">
            <div class="relative">
                <img src="https://placehold.co/300x300/E0E0E0/808080?text=${product.image}" 
                     alt="${product.name}" 
                     class="w-full h-48 object-cover">
                ${product.originalPrice ? '<span class="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm">Sale</span>' : ''}
            </div>
            <div class="p-6">
                <h3 class="text-xl font-semibold text-gray-900 dark:text-white mb-2">${product.name}</h3>
                <p class="text-gray-600 dark:text-gray-300 capitalize mb-3">${product.category}</p>
                <div class="flex items-center justify-between mb-4">
                    <div>
                        ${product.originalPrice ? 
                            `<span class="text-sm text-gray-500 line-through">${product.originalPrice}EGP</span><br>` : ''
                        }
                        <span class="text-2xl font-bold text-blue-600">${product.price}EGP</span>
                    </div>
                </div>
                <div class="flex space-x-2">
                    <button onclick="addToCart(${product.id})" 
                            class="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
                        Add to Cart
                    </button>
                    <button onclick="openQuickView(${product.id})" 
                            class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        Quick View
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Product Page Functions
function initializeProductPage() {
    initializeProductGallery();
    initializeProductTabs();
}

function initializeProductGallery() {
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

function initializeProductTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            
            // Update active button
            tabButtons.forEach(b => {
                b.classList.remove('border-blue-500', 'text-blue-600');
                b.classList.add('border-transparent', 'text-gray-500');
            });
            btn.classList.remove('border-transparent', 'text-gray-500');
            btn.classList.add('border-blue-500', 'text-blue-600');
            
            // Show corresponding content
            tabContents.forEach(content => {
                content.classList.add('hidden');
            });
            document.getElementById(tabId).classList.remove('hidden');
        });
    });
}

// Utility Functions
function viewProduct(productId) {
    // Close search if open
    closeSearchBar();
    
    // Navigate to product page (use 'product' parameter for consistency)
    window.location.href = `product.html?product=${productId}`;
}

function saveCartToStorage() {
    try {
        console.log('Saving cart to storage:', cart);
        localStorage.setItem('hotimpex-cart', JSON.stringify(cart));
    } catch (error) {
        console.error('Error saving cart to storage:', error);
    }
}

function loadCartFromStorage() {
    const saved = localStorage.getItem('hotimpex-cart');
    console.log('Loading cart from storage:', saved);
    
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            cart = Array.isArray(parsed) ? parsed : [];
            console.log('Cart loaded successfully:', cart);
        } catch (e) {
            console.error('Error parsing cart from storage:', e);
            cart = [];
        }
    } else {
        cart = [];
    }
}

function saveProductsToStorage() {
    localStorage.setItem('hotimpex-products', JSON.stringify(products));
}

function loadProductsFromStorage() {
    const saved = localStorage.getItem('hotimpex-products');
    if (saved) {
        try {
            const savedProducts = JSON.parse(saved);
            // Update the products array but keep the original structure
            currentProducts = savedProducts;
        } catch (e) {
            console.warn('Could not load products from storage');
        }
    }
}

// Product management for admin
function getProductById(id) {
    // Handle both string and numeric IDs
    return products.find(p => p.id === id || p.id === parseInt(id));
}

function updateProduct(id, updatedData) {
    // Handle both string and numeric IDs
    const index = products.findIndex(p => p.id === id || p.id === parseInt(id));
    if (index !== -1) {
        products[index] = { ...products[index], ...updatedData };
        saveProductsToStorage();
        return true;
    }
    return false;
}

function addProduct(productData) {
    const newId = Math.max(...products.map(p => p.id)) + 1;
    const newProduct = {
        id: newId,
        ...productData
    };
    products.push(newProduct);
    saveProductsToStorage();
    return newProduct;
}

// Hero Product Showcase Implementation
function initializeHeroProductShowcase() {
    const products = [
        {
            id: 1,
            title: "Racing Sim Seat",
            description: "Professional racing simulation seat for ultimate gaming experience",
            image: "assets/images/racing sim seat_without BG.png",
            features: ["Ergonomic design", "Premium materials", "Adjustable settings"]
        },
        {
            id: 2,
            title: "Mobile Experience",
            description: "Seamless mobile interface for on-the-go access",
            image: "assets/images/kiosks without BG.png",
            features: ["Responsive design", "Touch optimized", "Offline support"]
        },
        {
            id: 3,
            title: "Screen Telescopic",
            description: "Advanced telescopic screen system with crystal clear display",
            image: "assets/images/screen telescopic_without BG.png",
            features: ["4K Resolution", "Auto-adjust", "Smart controls"]
        }
    ];

    let currentProductIndex = 1; // Start with second product (Mobile Experience)
    let autoAdvanceInterval;
    
    // Get DOM elements
    const productImage = document.getElementById('product-image');
    const productTitle = document.getElementById('product-title');
    const productDescription = document.getElementById('product-description');
    const productFeatures = document.getElementById('product-features');
    const cardNumber = document.getElementById('card-number');
    const progressBar = document.getElementById('progress-bar');
    const prevButton = document.getElementById('prev-product');
    const nextButton = document.getElementById('next-product');
    
    // Update product display
    function updateProduct(index) {
        const product = products[index];
        
        // Add transition effect
        const card = document.getElementById('active-product-card');
        card.style.transform = 'scale(0.95) rotateY(10deg)';
        card.style.opacity = '0.7';
        
        setTimeout(() => {
            // Update content
            if (productImage) productImage.src = product.image;
            if (productTitle) productTitle.textContent = product.title;
            if (productDescription) productDescription.textContent = product.description;
            if (cardNumber) cardNumber.textContent = `${index + 1}/${products.length}`;
            
            // Update features
            if (productFeatures) {
                productFeatures.innerHTML = product.features.map(feature => 
                    `<span class="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm font-medium">${feature}</span>`
                ).join('');
            }
            
            // Update progress bar
            if (progressBar) {
                const progressWidth = ((index + 1) / products.length) * 100;
                progressBar.style.width = `${progressWidth}%`;
            }
            
            // Restore card appearance
            card.style.transform = 'scale(1) rotateY(0deg)';
            card.style.opacity = '1';
        }, 200);
    }
    
    // Navigation functions
    function nextProduct() {
        currentProductIndex = (currentProductIndex + 1) % products.length;
        updateProduct(currentProductIndex);
        resetAutoAdvance();
    }
    
    function prevProduct() {
        currentProductIndex = (currentProductIndex - 1 + products.length) % products.length;
        updateProduct(currentProductIndex);
        resetAutoAdvance();
    }
    
    // Auto-advance functionality
    function startAutoAdvance() {
        autoAdvanceInterval = setInterval(nextProduct, 4000); // Change every 4 seconds
    }
    
    function stopAutoAdvance() {
        if (autoAdvanceInterval) {
            clearInterval(autoAdvanceInterval);
            autoAdvanceInterval = null;
        }
    }
    
    function resetAutoAdvance() {
        stopAutoAdvance();
        startAutoAdvance();
    }
    
    // Event listeners
    if (nextButton) {
        nextButton.addEventListener('click', nextProduct);
    }
    
    if (prevButton) {
        prevButton.addEventListener('click', prevProduct);
    }
    
    // Pause auto-advance on hover
    const heroSection = document.getElementById('hero-showroom');
    if (heroSection) {
        heroSection.addEventListener('mouseenter', stopAutoAdvance);
        heroSection.addEventListener('mouseleave', startAutoAdvance);
    }
    
    // Initialize first product and start auto-advance
    updateProduct(currentProductIndex);
    startAutoAdvance();
    
    // Handle page visibility changes
    document.addEventListener('visibilitychange', function() {
        if (document.hidden) {
            stopAutoAdvance();
        } else {
            startAutoAdvance();
        }
    });
}

// Legacy function for compatibility
function initializeHeroVideo() {
    // This function is now replaced by initializeHeroProductShowcase()
    console.log('Hero now using product showcase instead of video');
    initializeHeroProductShowcase();
}

// Legacy function for compatibility - now handled by video
function initializeHeroShowroom() {
    // This function is now replaced by initializeHeroVideo()
    console.log('Hero showroom now using video background');
    initializeHeroVideo();
}

function initProfessionalThreeJS(canvas, container) {
    // Create scene with professional dark background
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    // Setup camera for optimal product viewing
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(50, aspect, 0.1, 100);
    camera.position.set(0, 0, 8);

    // Create high-quality renderer
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;

    // Setup professional lighting
    setupShowcaseLighting();

    // Create texture loader
    textureLoader = new THREE.TextureLoader();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start render loop
    animate();
}

function setupShowcaseLighting() {
    // Key light for main illumination
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0);
    keyLight.position.set(5, 5, 5);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 2048;
    keyLight.shadow.mapSize.height = 2048;
    scene.add(keyLight);

    // Fill light to soften shadows
    const fillLight = new THREE.DirectionalLight(0x4a9eff, 0.4);
    fillLight.position.set(-3, 3, 4);
    scene.add(fillLight);

    // Rim light for edge definition
    const rimLight = new THREE.DirectionalLight(0xff6b35, 0.6);
    rimLight.position.set(-5, -2, -5);
    scene.add(rimLight);

    // Ambient light for overall illumination
    const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
    scene.add(ambientLight);

    // Environment light for natural feel
    const envLight = new THREE.HemisphereLight(0x87ceeb, 0x2f4f4f, 0.4);
    scene.add(envLight);
}

async function loadAndCreateShowcase() {
    try {
        // Load all product textures efficiently
        const loadPromises = heroProducts.map(loadSingleTexture);
        await Promise.all(loadPromises);

        // Create the showcase
        createCleanShowcase();
        
        // Hide loading and start rotation
        hideLoadingIndicator();
        startAutoRotation();
        
    } catch (error) {
        console.error('Error loading products:', error);
        hideLoadingIndicator();
    }
}

function loadSingleTexture(product) {
    return new Promise((resolve, reject) => {
        textureLoader.load(
            product.image,
            (texture) => {
                // Optimize for quality
                texture.minFilter = THREE.LinearMipmapLinearFilter;
                texture.magFilter = THREE.LinearFilter;
                texture.wrapS = THREE.ClampToEdgeWrapping;
                texture.wrapT = THREE.ClampToEdgeWrapping;
                texture.generateMipmaps = true;
                
                product.texture = texture;
                resolve(texture);
            },
            undefined,
            reject
        );
    });
}

function createCleanShowcase() {
    // Main product group
    productGroup = new THREE.Group();
    scene.add(productGroup);

    heroProducts.forEach((product, index) => {
        if (!product.texture) return;

        // Maintain aspect ratio
        const texture = product.texture;
        const imageAspect = texture.image.width / texture.image.height;
        
        const baseSize = 3;
        const width = baseSize;
        const height = baseSize / imageAspect;
        
        const geometry = new THREE.PlaneGeometry(width, height);
        
        // Clean material for 2D images
        const material = new THREE.MeshLambertMaterial({
            map: texture,
            transparent: true,
            alphaTest: 0.1,
            side: THREE.DoubleSide,
            opacity: index === currentProductIndex ? 1.0 : 0.3
        });

        const mesh = new THREE.Mesh(geometry, material);
        
        // Circular arrangement
        const angleStep = (Math.PI * 2) / heroProducts.length;
        const radius = 5;
        const angle = index * angleStep;
        
        mesh.position.x = Math.cos(angle) * radius;
        mesh.position.z = Math.sin(angle) * radius;
        mesh.position.y = 0;
        
        // Face center
        mesh.lookAt(0, 0, 0);
        
        // Scale for active/inactive
        const scale = index === currentProductIndex ? 1.3 : 0.8;
        mesh.scale.set(scale, scale, scale);
        
        // Elevate active product
        if (index === currentProductIndex) {
            mesh.position.y = 0.2;
        }
        
        productMeshes.push(mesh);
        productGroup.add(mesh);
    });

    // Add subtle ground plane
    addGroundPlane();
}

function addGroundPlane() {
    const groundGeometry = new THREE.PlaneGeometry(20, 20);
    const groundMaterial = new THREE.MeshLambertMaterial({
        color: 0x222222,
        transparent: true,
        opacity: 0.1
    });
    
    const groundMesh = new THREE.Mesh(groundGeometry, groundMaterial);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.position.y = -2;
    groundMesh.receiveShadow = true;
    
    scene.add(groundMesh);
}

function setupAllNavigation() {
    // Navigation dots
    const dots = document.querySelectorAll('.hero-dot');
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            if (!isAnimating) {
                rotateToProduct(index);
            }
        });
    });

    // Keyboard controls
    document.addEventListener('keydown', (e) => {
        if (isAnimating) return;
        
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            const newIndex = (currentProductIndex - 1 + heroProducts.length) % heroProducts.length;
            rotateToProduct(newIndex);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            const newIndex = (currentProductIndex + 1) % heroProducts.length;
            rotateToProduct(newIndex);
        }
    });

    // Touch/swipe support
    let touchStartX = 0;
    const canvas = document.getElementById('hero-canvas');
    
    canvas.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    });

    canvas.addEventListener('touchend', (e) => {
        if (isAnimating) return;
        
        const touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        const threshold = 50;

        if (Math.abs(diff) > threshold) {
            if (diff > 0) {
                const newIndex = (currentProductIndex + 1) % heroProducts.length;
                rotateToProduct(newIndex);
            } else {
                const newIndex = (currentProductIndex - 1 + heroProducts.length) % heroProducts.length;
                rotateToProduct(newIndex);
            }
        }
    });
}

function initThreeJS(canvas, container) {
    // Create scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a); // Dark background to match your design

    // Create camera with better positioning for 2D images
    const aspect = container.clientWidth / container.clientHeight;
    camera = new THREE.PerspectiveCamera(60, aspect, 0.1, 1000);
    camera.position.set(0, 0, 4); // Position camera to view the center product

    // Create renderer optimized for 2D images
    renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true,
        alpha: false 
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Create texture loader
    textureLoader = new THREE.TextureLoader();

    // Simple lighting for 2D images
    setupLighting();

    // Handle window resize
    window.addEventListener('resize', onWindowResize);

    // Start render loop
    animate();
}

function setupLighting() {
    // Simple ambient light - perfect for 2D images
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.0);
    scene.add(ambientLight);
}

async function loadProductTextures() {
    const loadPromises = heroProducts.map((product, index) => {
        return new Promise((resolve, reject) => {
            textureLoader.load(
                product.image,
                (texture) => {
                    texture.minFilter = THREE.LinearFilter;
                    texture.magFilter = THREE.LinearFilter;
                    product.texture = texture;
                    resolve(texture);
                },
                undefined,
                (error) => {
                    console.error(`Failed to load texture: ${product.image}`, error);
                    reject(error);
                }
            );
        });
    });

    try {
        await Promise.all(loadPromises);
        console.log('All textures loaded successfully');
    } catch (error) {
        console.error('Error loading textures:', error);
    }
}

function createProductCarousel() {
    // Create container group for all products
    rotationGroup = new THREE.Group();
    scene.add(rotationGroup);

    heroProducts.forEach((product, index) => {
        if (!product.texture) return;

        // Calculate aspect ratio from texture
        const texture = product.texture;
        const aspectRatio = texture.image.width / texture.image.height;
        
        // Create plane geometry maintaining aspect ratio
        const baseWidth = 3;
        const planeWidth = baseWidth;
        const planeHeight = baseWidth / aspectRatio;
        
        const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight);
        const material = new THREE.MeshBasicMaterial({ 
            map: texture,
            transparent: true,
            alphaTest: 0.1,
            side: THREE.DoubleSide
        });

        const mesh = new THREE.Mesh(geometry, material);
        
        // Position products in a line (we'll rotate the camera around them)
        mesh.position.x = (index - 1) * 5; // Spread products horizontally
        mesh.position.y = 0;
        mesh.position.z = 0;
        
        // All products face the camera initially
        mesh.rotation.y = 0;
        
        // Set initial states
        if (index === currentProductIndex) {
            // Main product: larger and fully opaque
            mesh.scale.set(1.2, 1.2, 1.2);
            material.opacity = 1.0;
        } else {
            // Background products: smaller and semi-transparent
            mesh.scale.set(0.7, 0.7, 0.7);
            material.opacity = 0.4;
        }
        
        productMeshes.push(mesh);
        rotationGroup.add(mesh);
    });

    // Position camera to look at the main product
    updateCameraPosition();
}

function rotateToProduct(targetIndex) {
    if (isAnimating || targetIndex === currentProductIndex) return;

    isAnimating = true;
    const prevIndex = currentProductIndex;
    currentProductIndex = targetIndex;

    // Update navigation dots
    updateNavigationDots();

    // Animate product transition
    animateProductTransition(prevIndex, targetIndex).then(() => {
        isAnimating = false;
    });
}

function animateProductTransition(fromIndex, toIndex) {
    return new Promise((resolve) => {
        const duration = 1200; // 1.2 seconds
        const startTime = Date.now();

        function animateFrame() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = easeInOutCubic(progress);

            // Update all products
            productMeshes.forEach((mesh, index) => {
                const material = mesh.material;
                
                if (index === toIndex) {
                    // Animate to main position (larger, more opaque)
                    const targetScale = 1.2;
                    const startScale = index === fromIndex ? 1.2 : 0.7;
                    const currentScale = startScale + (targetScale - startScale) * easeProgress;
                    mesh.scale.set(currentScale, currentScale, currentScale);
                    
                    const startOpacity = index === fromIndex ? 1.0 : 0.4;
                    material.opacity = startOpacity + (1.0 - startOpacity) * easeProgress;
                    
                } else if (index === fromIndex) {
                    // Animate from main position (smaller, more transparent)
                    const targetScale = 0.7;
                    const currentScale = 1.2 - (1.2 - targetScale) * easeProgress;
                    mesh.scale.set(currentScale, currentScale, currentScale);
                    
                    material.opacity = 1.0 - (1.0 - 0.4) * easeProgress;
                    
                } else {
                    // Background products stay the same
                    mesh.scale.set(0.7, 0.7, 0.7);
                    material.opacity = 0.4;
                }
            });

            // Move camera to focus on the new main product
            updateCameraPosition(easeProgress, toIndex);

            if (progress < 1) {
                requestAnimationFrame(animateFrame);
            } else {
                resolve();
            }
        }

        animateFrame();
    });
}

function updateCameraPosition(progress = 1, targetIndex = currentProductIndex) {
    // Calculate target camera position to focus on the selected product
    const targetX = (targetIndex - 1) * 5; // Match product positioning
    const currentX = camera.position.x;
    
    if (progress < 1) {
        // Smooth camera movement during transition
        camera.position.x = currentX + (targetX - currentX) * progress;
    } else {
        camera.position.x = targetX;
    }
    
    // Keep camera at fixed Y and Z for consistent viewing
    camera.position.y = 0;
    camera.position.z = 4;
    
    // Make camera look at the target product
    camera.lookAt(targetX, 0, 0);
}

function updateNavigationDots() {
    const dots = document.querySelectorAll('.hero-dot');
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === currentProductIndex);
    });
}

function startAutoRotation() {
    setInterval(() => {
        if (!isAnimating) {
            const nextIndex = (currentProductIndex + 1) % heroProducts.length;
            rotateToProduct(nextIndex);
        }
    }, 4000); // Rotate every 4 seconds
}

function hideLoadingIndicator() {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.classList.add('hidden');
    }
}

function animate() {
    requestAnimationFrame(animate);
    
    // Render the scene
    renderer.render(scene, camera);
}

function onWindowResize() {
    const container = document.getElementById('threejs-container');
    if (!container) return;

    const aspect = container.clientWidth / container.clientHeight;
    camera.aspect = aspect;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
}

function easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
}

// Update the main updateHeroContent function to work with Three.js
function updateHeroContent(index) {
    if (!isAnimating) {
        rotateToProduct(index);
    }
}

// ===== DYNAMIC PRODUCT LOADING =====

// Load products from API and update the page
async function loadDynamicContent() {
    try {
        // Load best sellers for the homepage
        if (document.querySelector('.best-sellers-grid')) {
            await loadBestSellers();
        }

        // Load featured products for hero showcase
        if (document.getElementById('active-product-card')) {
            await loadHeroProducts();
        }

        console.log('Dynamic content loaded successfully');
    } catch (error) {
        console.error('Error loading dynamic content:', error);
        // Fallback to static content if API fails
    }
}

// Load best seller products
async function loadBestSellers() {
    try {
        const response = await APIService.getBestSellers();
        const products = response.data.products;
        
        const bestSellersGrid = document.querySelector('.best-sellers-grid');
        if (!bestSellersGrid) return;

        // Clear existing products (except the structure)
        const existingCards = bestSellersGrid.querySelectorAll('.card');
        existingCards.forEach(card => card.parentElement.remove());

        // Add new products from API
        products.forEach(product => {
            const productCard = createProductCard(product);
            bestSellersGrid.appendChild(productCard);
        });

    } catch (error) {
        console.error('Error loading best sellers:', error);
    }
}

// Load featured products for hero section
async function loadHeroProducts() {
    try {
        const response = await APIService.getFeaturedProducts();
        const products = response.data.products;
        
        if (products.length > 0) {
            // Update the hero product showcase with real data
            updateHeroShowcase(products);
        }
    } catch (error) {
        console.error('Error loading hero products:', error);
    }
}

// Create a product card element
function createProductCard(product) {
    const cardWrapper = document.createElement('a');
    cardWrapper.href = `product.html?product=${product.id}`;
    cardWrapper.className = 'block';

    const badge = product.bestSeller ? 'Best Seller' : 
                  product.featured ? 'Featured' : '';

    cardWrapper.innerHTML = `
        <div class="card" data-product-id="${product.id}" data-product-name="${product.name}" data-category="${product.categorySlug}" data-price="${product.price}">
            <div class="card__shine"></div>
            <div class="card__glow"></div>
            <div class="card__content">
                ${badge ? `<div class="card__badge">${badge}</div>` : ''}
                <div class="card__image" style="background-image: url('${product.mainImage}'); background-size: cover; background-position: center;"></div>
                <div class="card__text">
                    <p class="card__title">${product.name}</p>
                    <p class="card__description">${product.shortDescription}</p>
                </div>
                <div class="card__footer">
                    <div class="card__price">${product.price}${product.currency}</div>
                    <div class="card__button add-to-cart">
                        <svg height="16" width="16" viewBox="0 0 24 24">
                            <path stroke-width="2" stroke="currentColor" d="M4 12H20M12 4V20" fill="none"></path>
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    `;

    return cardWrapper;
}

// Update hero showcase with real product data
function updateHeroShowcase(products) {
    // Update the product data for the hero carousel
    const heroProducts = products.slice(0, 3).map(product => ({
        title: product.name,
        description: product.shortDescription,
        image: product.mainImage,
        features: product.tags || ['Premium Quality', 'Fast Delivery', 'Best Price']
    }));

    // Store globally for the carousel
    window.heroProducts = heroProducts;
    
    // Update the active card with the first product
    if (heroProducts.length > 0) {
        updateHeroCard(heroProducts[0], 0);
    }
}

// Update a single hero card
function updateHeroCard(product, index) {
    const cardTitle = document.getElementById('product-title');
    const cardDescription = document.getElementById('product-description');
    const cardImage = document.getElementById('product-image');
    const cardFeatures = document.getElementById('product-features');
    const cardNumber = document.getElementById('card-number');

    if (cardTitle) cardTitle.textContent = product.title;
    if (cardDescription) cardDescription.textContent = product.description;
    if (cardImage) cardImage.src = product.image;
    if (cardNumber) cardNumber.textContent = `${index + 1}/${window.heroProducts?.length || 3}`;
    
    if (cardFeatures) {
        cardFeatures.innerHTML = '';
        product.features.forEach(feature => {
            const tag = document.createElement('span');
            tag.className = 'feature-tag px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300';
            tag.textContent = feature;
            cardFeatures.appendChild(tag);
        });
    }
}

// Enhanced search functionality with API
async function performSearch(query) {
    if (!query.trim()) return;
    
    try {
        const response = await APIService.searchProducts(query);
        const products = response.data.products;
        
        // Redirect to shop page with search results
        const searchParams = new URLSearchParams({ search: query });
        window.location.href = `shop.html?${searchParams.toString()}`;
        
    } catch (error) {
        console.error('Search error:', error);
        // Fallback to basic search
        window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
    }
}

// ===== DYNAMIC PRODUCT SHOWCASE FUNCTIONALITY =====

// Array of product images for showcase
const showcaseProducts = [
    'assets/images/screen telescopic_without BG.png',
    'assets/images/racing sim seat_without BG.png',
    'assets/images/kiosks without BG.png'
];

let currentIndex = 0;

/**
 * Displays a product with an animation.
 * @param {string} imageUrl - The URL of the product image.
 * @param {number} index - The index of the product in the array.
 */
function displayProduct(imageUrl, index) {
    const productDisplay = document.getElementById('product-display');
    if (!productDisplay) return;

    // Create a new image element
    const img = document.createElement('img');
    img.src = imageUrl;
    img.alt = `Product ${index + 1}`;
    img.classList.add('product-item'); // Add base styling class
    productDisplay.appendChild(img);

    // Set initial position (off-screen right)
    img.style.transform = 'translateX(100vw) scale(0.8)';
    img.style.opacity = '0';

    // Animate to center
    setTimeout(() => {
        img.style.transform = 'translateX(0) scale(1)';
        img.style.opacity = '1';
    }, 100); // Small delay for initial render

    // Set a timeout to remove the current product and display the next
    setTimeout(() => {
        // Animate out (off-screen left)
        img.style.transform = 'translateX(-100vw) scale(0.8)';
        img.style.opacity = '0';

        // Remove the image after it moves off screen
        img.addEventListener('transitionend', () => {
            img.remove();
        }, { once: true });

        // Move to the next product
        currentIndex = (currentIndex + 1) % showcaseProducts.length;
        displayProduct(showcaseProducts[currentIndex], currentIndex);
    }, 5000); // Display each product for 5 seconds
}

// Initialize product showcase when DOM is loaded
function initProductShowcase() {
    if (document.getElementById('product-display')) {
        displayProduct(showcaseProducts[currentIndex], currentIndex);
    }
}

// Make functions globally available
window.toggleDarkMode = toggleDarkMode;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.openQuickView = openQuickView;
window.closeQuickViewModal = closeQuickViewModal;
window.viewProduct = viewProduct;
window.toggleCart = toggleCart;
window.closeCartSidebar = closeCartSidebar;
window.initProductShowcase = initProductShowcase;
window.displayProduct = displayProduct;

// Authentication System
class AuthService {
    static async login(email, password) {
        const response = await APIService.request('/users/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        console.log('=== AUTH SERVICE LOGIN DEBUG ===');
        console.log('Full login response:', response);
        console.log('Response status:', response?.status);
        console.log('Response data:', response?.data);
        console.log('Token in response:', response?.data?.token);
        console.log('User in response:', response?.data?.user);
        
        return response;
    }

    static async register(userData) {
        return await APIService.request('/users/register', {
            method: 'POST',
            body: JSON.stringify(userData)
        });
    }

    static async getCurrentUser() {
        const token = this.getToken();
        if (!token) return null;

        try {
            return await APIService.request('/users/profile', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
        } catch (error) {
            this.logout(); // Clear invalid token
            return null;
        }
    }

    static setToken(token) {
        console.log('=== SET TOKEN DEBUG ===');
        console.log('Token being set:', token);
        console.log('Token type:', typeof token);
        console.log('Token value:', JSON.stringify(token));
        
        if (token === undefined || token === null) {
            console.error('WARNING: Attempting to set undefined/null token!');
        }
        
        localStorage.setItem('hotimpex-token', token);
        
        // Verify it was saved correctly
        const saved = localStorage.getItem('hotimpex-token');
        console.log('Token after saving:', saved);
    }

    static getToken() {
        return localStorage.getItem('hotimpex-token');
    }

    static logout() {
        localStorage.removeItem('hotimpex-token');
        localStorage.removeItem('hotimpex-user');
        window.location.reload();
    }

    static setUser(user) {
        localStorage.setItem('hotimpex-user', JSON.stringify(user));
    }

    static getUser() {
        const user = localStorage.getItem('hotimpex-user');
        return user ? JSON.parse(user) : null;
    }

    static isLoggedIn() {
        return !!this.getToken();
    }
}

// Authentication UI Management
class AuthUI {
    static init() {
        this.bindEvents();
        this.updateUI();
    }

    static bindEvents() {
        // User dropdown toggle
        const userDropdownToggle = document.getElementById('user-dropdown-toggle');
        const userDropdownMenu = document.getElementById('user-dropdown-menu');
        const userDropdownArrow = document.getElementById('user-dropdown-arrow');

        if (userDropdownToggle && userDropdownMenu) {
            userDropdownToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                const isVisible = !userDropdownMenu.classList.contains('hidden');
                
                if (isVisible) {
                    userDropdownMenu.classList.add('hidden');
                    userDropdownArrow.style.transform = 'rotate(0deg)';
                } else {
                    userDropdownMenu.classList.remove('hidden');
                    userDropdownArrow.style.transform = 'rotate(180deg)';
                }
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', () => {
                userDropdownMenu.classList.add('hidden');
                userDropdownArrow.style.transform = 'rotate(0deg)';
            });
        }

        // Modal show/hide events
        this.bindModalEvents();
        
        // Form submission events
        this.bindFormEvents();
        
        // Logout event
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                AuthService.logout();
            });
        }
    }

    static bindModalEvents() {
        // Show modals
        const showLoginBtn = document.getElementById('show-login-modal');
        const showRegisterBtn = document.getElementById('show-register-modal');
        
        if (showLoginBtn) {
            showLoginBtn.addEventListener('click', () => this.showLoginModal());
        }
        
        if (showRegisterBtn) {
            showRegisterBtn.addEventListener('click', () => this.showRegisterModal());
        }

        // Close modals
        const closeLoginBtn = document.getElementById('close-login-modal');
        const closeRegisterBtn = document.getElementById('close-register-modal');
        
        if (closeLoginBtn) {
            closeLoginBtn.addEventListener('click', () => this.hideLoginModal());
        }
        
        if (closeRegisterBtn) {
            closeRegisterBtn.addEventListener('click', () => this.hideRegisterModal());
        }

        // Switch between modals
        const switchToRegister = document.getElementById('switch-to-register');
        const switchToLogin = document.getElementById('switch-to-login');
        
        if (switchToRegister) {
            switchToRegister.addEventListener('click', () => {
                this.hideLoginModal();
                this.showRegisterModal();
            });
        }
        
        if (switchToLogin) {
            switchToLogin.addEventListener('click', () => {
                this.hideRegisterModal();
                this.showLoginModal();
            });
        }

        // Password visibility toggles
        const toggleLoginPassword = document.getElementById('toggle-login-password');
        const toggleRegisterPassword = document.getElementById('toggle-register-password');
        
        if (toggleLoginPassword) {
            toggleLoginPassword.addEventListener('click', () => {
                this.togglePasswordVisibility('login-password');
            });
        }
        
        if (toggleRegisterPassword) {
            toggleRegisterPassword.addEventListener('click', () => {
                this.togglePasswordVisibility('register-password');
            });
        }

        // Close modals when clicking outside
        const loginModal = document.getElementById('login-modal');
        const registerModal = document.getElementById('register-modal');
        
        if (loginModal) {
            loginModal.addEventListener('click', (e) => {
                if (e.target === loginModal) {
                    this.hideLoginModal();
                }
            });
        }
        
        if (registerModal) {
            registerModal.addEventListener('click', (e) => {
                if (e.target === registerModal) {
                    this.hideRegisterModal();
                }
            });
        }
    }

    static bindFormEvents() {
        // Login form
        const loginForm = document.getElementById('login-form');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleLogin(e);
            });
        }

        // Register form
        const registerForm = document.getElementById('register-form');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                await this.handleRegister(e);
            });
        }
    }

    static async handleLogin(e) {
        const form = e.target;
        const formData = new FormData(form);
        const email = formData.get('email');
        const password = formData.get('password');

        try {
            this.clearError('login-error');
            this.setLoading(form, true);

            const response = await AuthService.login(email, password);
            
            console.log('Login response:', response);
            console.log('Token from response:', response?.data?.token);
            console.log('User from response:', response?.data?.user);
            
            if (response.status === 'success') {
                console.log('Setting token:', response.data.token);
                AuthService.setToken(response.data.token);
                AuthService.setUser(response.data.user);
                
                // Verify token was saved
                const savedToken = AuthService.getToken();
                const savedUser = AuthService.getUser();
                console.log('Token saved in localStorage:', savedToken);
                console.log('User saved in localStorage:', savedUser);
                
                this.hideLoginModal();
                this.updateUI();
                this.showSuccess('Login successful!');
            } else {
                console.log('Login failed:', response);
                this.showError('login-error', response.message || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            this.showError('login-error', 'Login failed. Please try again.');
        } finally {
            this.setLoading(form, false);
        }
    }

    static async handleRegister(e) {
        const form = e.target;
        const formData = new FormData(form);
        
        const userData = {
            firstName: formData.get('firstName'),
            lastName: formData.get('lastName'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            password: formData.get('password')
        };

        // Client-side validation
        const validationError = this.validateRegistrationData(userData);
        if (validationError) {
            this.showError('register-error', validationError);
            return;
        }

        try {
            this.clearError('register-error');
            this.setLoading(form, true);

            const response = await AuthService.register(userData);
            
            if (response.status === 'success') {
                this.showSuccess('Account created successfully! Please sign in.', 'register-success');
                form.reset();
                setTimeout(() => {
                    this.hideRegisterModal();
                    this.showLoginModal();
                }, 2000);
            } else {
                // Handle validation errors more specifically
                let errorMessage = response.message || 'Registration failed';
                
                // If there are validation errors, show them in detail
                if (response.errors && Array.isArray(response.errors)) {
                    errorMessage = response.errors.map(error => error.msg || error.message || error).join(', ');
                }
                
                this.showError('register-error', errorMessage);
            }
        } catch (error) {
            console.error('Registration error:', error);
            this.showError('register-error', 'Registration failed. Please try again.');
        } finally {
            this.setLoading(form, false);
        }
    }

    static validateRegistrationData(userData) {
        // Check required fields
        if (!userData.firstName || userData.firstName.trim().length === 0) {
            return 'First name is required';
        }
        
        if (!userData.lastName || userData.lastName.trim().length === 0) {
            return 'Last name is required';
        }
        
        if (!userData.email || userData.email.trim().length === 0) {
            return 'Email is required';
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(userData.email)) {
            return 'Please enter a valid email address';
        }
        
        if (!userData.password || userData.password.length === 0) {
            return 'Password is required';
        }
        
        // Password validation
        if (userData.password.length < 6) {
            return 'Password must be at least 6 characters long';
        }
        
        // Phone validation (if provided)
        if (userData.phone && userData.phone.trim().length > 0) {
            const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
            if (!phoneRegex.test(userData.phone.replace(/\s/g, ''))) {
                return 'Please enter a valid phone number';
            }
        }
        
        return null; // No validation errors
    }

    static updateUI() {
        const user = AuthService.getUser();
        const isLoggedIn = AuthService.isLoggedIn();

        // Update user display name
        const userDisplayName = document.getElementById('user-display-name');
        if (userDisplayName) {
            userDisplayName.textContent = isLoggedIn ? `Hi, ${user?.firstName || 'User'}` : 'Account';
        }

        // Show/hide login states
        const notLoggedIn = document.getElementById('user-not-logged-in');
        const loggedIn = document.getElementById('user-logged-in');

        if (notLoggedIn && loggedIn) {
            if (isLoggedIn) {
                notLoggedIn.classList.add('hidden');
                loggedIn.classList.remove('hidden');
                
                // Update user info
                const userWelcome = document.getElementById('user-welcome');
                const userEmail = document.getElementById('user-email');
                
                if (userWelcome && user) {
                    userWelcome.textContent = `Welcome back, ${user.firstName}!`;
                }
                
                if (userEmail && user) {
                    userEmail.textContent = user.email;
                }
            } else {
                notLoggedIn.classList.remove('hidden');
                loggedIn.classList.add('hidden');
            }
        }
    }

    static showLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    static hideLoginModal() {
        const modal = document.getElementById('login-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            this.clearError('login-error');
        }
    }

    static showRegisterModal() {
        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.classList.remove('hidden');
            document.body.style.overflow = 'hidden';
        }
    }

    static hideRegisterModal() {
        const modal = document.getElementById('register-modal');
        if (modal) {
            modal.classList.add('hidden');
            document.body.style.overflow = '';
            this.clearError('register-error');
            this.clearSuccess('register-success');
        }
    }

    static togglePasswordVisibility(passwordFieldId) {
        const passwordField = document.getElementById(passwordFieldId);
        if (passwordField) {
            const type = passwordField.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordField.setAttribute('type', type);
        }
    }

    static showError(elementId, message) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.classList.remove('hidden');
            errorElement.querySelector('p').textContent = message;
        }
    }

    static clearError(elementId) {
        const errorElement = document.getElementById(elementId);
        if (errorElement) {
            errorElement.classList.add('hidden');
            errorElement.querySelector('p').textContent = '';
        }
    }

    static showSuccess(message, elementId = 'register-success') {
        const successElement = document.getElementById(elementId);
        if (successElement) {
            successElement.classList.remove('hidden');
            successElement.querySelector('p').textContent = message;
        }
    }

    static clearSuccess(elementId) {
        const successElement = document.getElementById(elementId);
        if (successElement) {
            successElement.classList.add('hidden');
            successElement.querySelector('p').textContent = '';
        }
    }

    static setLoading(form, isLoading) {
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            if (isLoading) {
                submitBtn.disabled = true;
                submitBtn.innerHTML = `
                    <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing...
                `;
            } else {
                submitBtn.disabled = false;
                const originalText = form.id === 'login-form' ? 'Sign In' : 'Create Account';
                submitBtn.textContent = originalText;
            }
        }
    }
}

// Initialize authentication when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    AuthUI.init();
});

// Make auth functions globally available
window.AuthService = AuthService;
window.AuthUI = AuthUI;

// ===== PROFILE PAGE FUNCTIONALITY =====

// Profile page initialization
function initializeProfile() {
    console.log('Initializing profile page...');
    
    const token = localStorage.getItem('hotimpex-token');
    const user = localStorage.getItem('hotimpex-user');
    
    console.log('Token exists:', !!token);
    console.log('User data exists:', !!user);
    console.log('Full token:', token);
    console.log('Full user:', user);
    
    if (!isUserLoggedIn()) {
        console.log('User not logged in, redirecting to home page');
        // Add a delay to show the issue
        setTimeout(() => {
            alert('Please log in to access your profile');
            window.location.href = 'index.html';
        }, 1000);
        return;
    }
    
    console.log('User is logged in, loading profile...');
    loadUserProfile();
    initializeProfileForm();
    initializePasswordForm();
    initializeUserMenu();
}

// Check if user is logged in
function isUserLoggedIn() {
    const token = localStorage.getItem('hotimpex-token');
    const user = localStorage.getItem('hotimpex-user');
    return token && user;
}

// Get current user data
function getCurrentUser() {
    const userData = localStorage.getItem('hotimpex-user');
    return userData ? JSON.parse(userData) : null;
}

// Load user profile data
async function loadUserProfile() {
    try {
        showLoading();
        const token = localStorage.getItem('hotimpex-token');
        
        console.log('=== PROFILE LOAD DEBUG ===');
        console.log('Raw token from localStorage:', token);
        console.log('Token type:', typeof token);
        console.log('Token length:', token ? token.length : 'null');
        console.log('Token first 50 chars:', token ? token.substring(0, 50) : 'null');
        
        if (!token) {
            throw new Error('No authentication token found');
        }
        
        console.log('Making API request with Authorization header...');
        const response = await APIService.request('/users/profile', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('Profile response:', response);
        
        if (response.status === 'success') {
            updateProfileUI(response.data.user);
            // Update localStorage with fresh data
            localStorage.setItem('hotimpex-user', JSON.stringify(response.data.user));
        } else {
            console.error('Profile load error:', response);
            showError(response.message || 'Failed to load profile');
        }
    } catch (error) {
        console.error('Error loading profile:', error);
        showError('Failed to load profile data');
        // If token is invalid, redirect to login
        if (error.message?.includes('token') || error.message?.includes('auth')) {
            logout();
        }
    } finally {
        hideLoading();
    }
}

// Update profile UI with user data
function updateProfileUI(user) {
    // Profile card
    const profileInitials = document.getElementById('profile-initials');
    const profileName = document.getElementById('profile-name');
    const profileEmail = document.getElementById('profile-email');
    const memberSince = document.getElementById('member-since');
    
    if (profileInitials) {
        const initials = (user.firstName?.[0] || '') + (user.lastName?.[0] || '');
        profileInitials.textContent = initials || user.email?.[0]?.toUpperCase() || 'U';
    }
    
    if (profileName) {
        profileName.textContent = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'User';
    }
    
    if (profileEmail) {
        profileEmail.textContent = user.email || '';
    }
    
    if (memberSince) {
        const date = new Date(user.createdAt || user.registeredAt || Date.now());
        memberSince.textContent = date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long' 
        });
    }
    
    // Form fields
    const firstNameInput = document.getElementById('firstName');
    const lastNameInput = document.getElementById('lastName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const roleInput = document.getElementById('role');
    
    if (firstNameInput) firstNameInput.value = user.firstName || '';
    if (lastNameInput) lastNameInput.value = user.lastName || '';
    if (emailInput) emailInput.value = user.email || '';
    if (phoneInput) phoneInput.value = user.phone || '';
    if (roleInput) roleInput.value = user.role || 'customer';
    
    // Update user menu
    const userNameSpan = document.getElementById('user-name');
    if (userNameSpan) {
        userNameSpan.textContent = user.firstName || 'Profile';
    }
}

// Initialize profile form
function initializeProfileForm() {
    const form = document.getElementById('profile-form');
    if (form) {
        form.addEventListener('submit', handleProfileUpdate);
    }
}

// Initialize password form
function initializePasswordForm() {
    const form = document.getElementById('password-form');
    if (form) {
        form.addEventListener('submit', handlePasswordChange);
    }
}

// Initialize user menu dropdown
function initializeUserMenu() {
    const userMenuToggle = document.getElementById('user-menu-toggle');
    const userDropdown = document.getElementById('user-dropdown');
    
    if (userMenuToggle && userDropdown) {
        userMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            userDropdown.classList.toggle('hidden');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', () => {
            userDropdown.classList.add('hidden');
        });
    }
}

// Toggle edit mode
function toggleEdit() {
    const editButton = document.getElementById('edit-toggle');
    const formActions = document.getElementById('form-actions');
    const inputs = document.querySelectorAll('#profile-form input:not([readonly])');
    
    const isEditing = editButton.innerHTML.includes('Cancel');
    
    if (isEditing) {
        cancelEdit();
    } else {
        // Enable editing
        inputs.forEach(input => input.disabled = false);
        formActions.classList.remove('hidden');
        editButton.innerHTML = '<i class="fas fa-times mr-2"></i>Cancel Edit';
        editButton.className = editButton.className.replace('bg-blue-600 hover:bg-blue-700', 'bg-gray-600 hover:bg-gray-700');
    }
}

// Cancel edit mode
function cancelEdit() {
    const editButton = document.getElementById('edit-toggle');
    const formActions = document.getElementById('form-actions');
    const inputs = document.querySelectorAll('#profile-form input:not([readonly])');
    
    // Disable editing
    inputs.forEach(input => input.disabled = true);
    formActions.classList.add('hidden');
    editButton.innerHTML = '<i class="fas fa-edit mr-2"></i>Edit Profile';
    editButton.className = editButton.className.replace('bg-gray-600 hover:bg-gray-700', 'bg-blue-600 hover:bg-blue-700');
    
    // Reload user data to reset form
    const user = getCurrentUser();
    if (user) {
        updateProfileUI(user);
    }
}

// Handle profile update
async function handleProfileUpdate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const profileData = {
        firstName: formData.get('firstName').trim(),
        lastName: formData.get('lastName').trim(),
        phone: formData.get('phone').trim()
    };
    
    // Validate required fields
    if (!profileData.firstName || !profileData.lastName) {
        showError('First name and last name are required');
        return;
    }
    
    // Validate phone if provided
    if (profileData.phone && !validatePhone(profileData.phone)) {
        showError('Please enter a valid phone number');
        return;
    }
    
    try {
        showLoading();
        const token = localStorage.getItem('hotimpex-token');
        
        const response = await APIService.request('/users/profile', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });
        
        if (response.status === 'success') {
            showSuccess('Profile updated successfully!');
            updateProfileUI(response.data.user);
            localStorage.setItem('hotimpex-user', JSON.stringify(response.data.user));
            cancelEdit();
        } else {
            showError(response.message || 'Failed to update profile');
        }
    } catch (error) {
        console.error('Error updating profile:', error);
        showError('Failed to update profile');
    } finally {
        hideLoading();
    }
}

// Handle password change
async function handlePasswordChange(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const passwordData = {
        currentPassword: formData.get('currentPassword'),
        newPassword: formData.get('newPassword'),
        confirmPassword: formData.get('confirmPassword')
    };
    
    // Validate fields
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
        showError('All password fields are required');
        return;
    }
    
    if (passwordData.newPassword.length < 6) {
        showError('New password must be at least 6 characters long');
        return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
        showError('New passwords do not match');
        return;
    }
    
    try {
        showLoading();
        const token = localStorage.getItem('hotimpex-token');
        
        const response = await APIService.request('/users/change-password', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })
        });
        
        if (response.status === 'success') {
            showSuccess('Password changed successfully!');
            document.getElementById('password-form').reset();
        } else {
            showError(response.message || 'Failed to change password');
        }
    } catch (error) {
        console.error('Error changing password:', error);
        showError('Failed to change password');
    } finally {
        hideLoading();
    }
}

// Validate phone number
function validatePhone(phone) {
    // Basic phone validation - allows international formats
    const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.trim());
}

// Show loading overlay
function showLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.remove('hidden');
    }
}

// Hide loading overlay
function hideLoading() {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) {
        overlay.classList.add('hidden');
    }
}

// Show error message
function showError(message) {
    const container = document.getElementById('message-container');
    const errorDiv = document.getElementById('error-message');
    const errorText = document.getElementById('error-text');
    const successDiv = document.getElementById('success-message');
    
    if (container && errorDiv && errorText) {
        container.classList.remove('hidden');
        errorDiv.classList.remove('hidden');
        successDiv.classList.add('hidden');
        errorText.textContent = message;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            container.classList.add('hidden');
        }, 5000);
    }
}

// Show success message
function showSuccess(message) {
    const container = document.getElementById('message-container');
    const successDiv = document.getElementById('success-message');
    const successText = document.getElementById('success-text');
    const errorDiv = document.getElementById('error-message');
    
    if (container && successDiv && successText) {
        container.classList.remove('hidden');
        successDiv.classList.remove('hidden');
        errorDiv.classList.add('hidden');
        successText.textContent = message;
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            container.classList.add('hidden');
        }, 5000);
    }
}

// Logout function
function logout() {
    // Clear stored data
    localStorage.removeItem('hotimpex-token');
    localStorage.removeItem('hotimpex-user');
    
    // Redirect to home page
    window.location.href = 'index.html';
}

// Make cart functions globally accessible for HTML onclick events
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateCartQuantity = updateCartQuantity;
window.toggleCart = toggleCart;
window.openQuickView = openQuickView;
window.viewProduct = viewProduct;

// Make cart and products accessible for debugging
window.getCart = () => cart;
window.getProducts = () => products;
window.cart = cart;
window.products = products;

window.clearCart = () => {
    cart = [];
    saveCartToStorage();
    updateCartUI();
    console.log('Cart cleared');
};

// Debug function to test cart
window.testCart = () => {
    console.log('Testing cart functionality...');
    console.log('Current cart:', cart);
    console.log('Available products:', products);
    
    // Add first product
    if (products.length > 0) {
        addToCart(products[0].id);
        console.log('Added product:', products[0].name);
    }
};
