// Hot Impex Website JavaScript

// Global variables
let currentProducts = [];
let cart = [];
let isSearchVisible = false;

// Sample products data
const products = [
    { id: 1, name: "Active JR", category: "active", price: 64, originalPrice: 80, image: "Product+1" },
    { id: 2, name: "Bio Original", category: "bio", price: 119, image: "Product+2" },
    { id: 3, name: "Bio Perform", category: "bio", price: 99, originalPrice: 119, image: "Product+3" },
    { id: 4, name: "Limited DL", category: "limited", price: 129, image: "Product+4" },
    { id: 5, name: "Active Pro", category: "active", price: 89, image: "Product+5" },
    { id: 6, name: "Bio Essential", category: "bio", price: 159, image: "Product+6" },
    { id: 7, name: "Kids Special", category: "kids", price: 45, image: "Product+7" },
    { id: 8, name: "Artisanal Blend", category: "artisanal", price: 199, image: "Product+8" },
    { id: 9, name: "Protein Max", category: "active", price: 75, image: "Product+9" },
    { id: 10, name: "Vitamin Complex", category: "bio", price: 69, image: "Product+10" },
    { id: 11, name: "Energy Boost", category: "active", price: 85, image: "Product+11" },
    { id: 12, name: "Omega Plus", category: "bio", price: 95, image: "Product+12" }
];

// Initialize the website
document.addEventListener('DOMContentLoaded', function() {
    initializeDarkMode();
    initializeMobileMenu();
    initializeCarousel();
    initializeProductCards();
    initializeSearch();
    initializeCart();
    initializeQuickView();
    initializeScrollAnimations();
    initializeMobileGestures();
    loadProductsFromStorage();
    
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
    const closeMobileMenu = document.getElementById('close-mobile-menu');
    
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
    loadCartFromStorage();
    updateCartUI();
    
    const cartToggle = document.getElementById('cart-toggle');
    const cartSidebar = document.getElementById('cart-sidebar');
    const closeCart = document.getElementById('close-cart');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartToggle) {
        cartToggle.addEventListener('click', toggleCart);
    }
    
    if (closeCart) {
        closeCart.addEventListener('click', closeCartSidebar);
    }
    
    if (cartOverlay) {
        cartOverlay.addEventListener('click', closeCartSidebar);
    }
}

function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({ ...product, quantity: 1 });
    }
    
    saveCartToStorage();
    updateCartUI();
    showCartNotification('Product added to cart!');
}

function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCartToStorage();
    updateCartUI();
}

function updateCartQuantity(productId, quantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity = Math.max(0, quantity);
        if (item.quantity === 0) {
            removeFromCart(productId);
        } else {
            saveCartToStorage();
            updateCartUI();
        }
    }
}

function toggleCart() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.toggle('translate-x-full');
        cartOverlay.classList.toggle('hidden');
    }
}

function closeCartSidebar() {
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    
    if (cartSidebar && cartOverlay) {
        cartSidebar.classList.add('translate-x-full');
        cartOverlay.classList.add('hidden');
    }
}

function updateCartUI() {
    const cartBadge = document.getElementById('cart-badge');
    const cartItems = document.getElementById('cart-items');
    const cartTotal = document.getElementById('cart-total');
    const cartCount = document.getElementById('cart-count');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    if (cartBadge) {
        cartBadge.textContent = totalItems;
        cartBadge.style.display = totalItems > 0 ? 'block' : 'none';
    }
    
    if (cartCount) {
        cartCount.textContent = totalItems;
    }
    
    if (cartTotal) {
        cartTotal.textContent = `${totalPrice}EGP`;
    }
    
    if (cartItems) {
        if (cart.length === 0) {
            cartItems.innerHTML = '<div class="text-center text-gray-500 py-8">Your cart is empty</div>';
        } else {
            cartItems.innerHTML = cart.map(item => `
                <div class="flex items-center space-x-3 p-3 border-b border-gray-200 dark:border-gray-600">
                    <img src="https://placehold.co/60x60/E0E0E0/808080?text=${item.image}" 
                         alt="${item.name}" class="w-15 h-15 rounded-lg object-cover">
                    <div class="flex-1">
                        <h4 class="font-medium text-gray-900 dark:text-white">${item.name}</h4>
                        <p class="text-sm text-gray-500 dark:text-gray-400">${item.price}EGP each</p>
                        <div class="flex items-center space-x-2 mt-1">
                            <button onclick="updateCartQuantity(${item.id}, ${item.quantity - 1})" 
                                    class="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm">-</button>
                            <span class="text-sm font-medium">${item.quantity}</span>
                            <button onclick="updateCartQuantity(${item.id}, ${item.quantity + 1})" 
                                    class="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-sm">+</button>
                        </div>
                    </div>
                    <div class="text-right">
                        <p class="font-medium text-gray-900 dark:text-white">${item.price * item.quantity}EGP</p>
                        <button onclick="removeFromCart(${item.id})" 
                                class="text-red-500 hover:text-red-700 text-sm">Remove</button>
                    </div>
                </div>
            `).join('');
        }
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
    const animatedElements = document.querySelectorAll('.scroll-animate');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    animatedElements.forEach(el => {
        observer.observe(el);
    });
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
    
    // Navigate to product page (in a real app, this would be routing)
    window.location.href = `product.html?id=${productId}`;
}

function saveCartToStorage() {
    localStorage.setItem('hotimpex-cart', JSON.stringify(cart));
}

function loadCartFromStorage() {
    const saved = localStorage.getItem('hotimpex-cart');
    if (saved) {
        try {
            cart = JSON.parse(saved);
        } catch (e) {
            cart = [];
        }
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
    return products.find(p => p.id === parseInt(id));
}

function updateProduct(id, updatedData) {
    const index = products.findIndex(p => p.id === parseInt(id));
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
