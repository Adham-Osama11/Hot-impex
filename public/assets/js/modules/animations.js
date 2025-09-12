// Hot Impex Animations Module
// Handles scroll animations, parallax effects, and UI animations

class AnimationsManager {
    constructor() {
        this.scrollProgressBar = null;
        this.animationObserver = null;
        this.init();
    }

    init() {
        this.initScrollAnimations();
        this.initStickyNavbar();
        this.initMobileGestures();
        this.addFloatingAnimation();
    }

    initScrollAnimations() {
        // Create scroll progress bar
        const progressBar = document.querySelector('.scroll-progress');
        if (progressBar) {
            this.scrollProgressBar = progressBar;
            this.updateScrollProgress(progressBar);
            window.addEventListener('scroll', () => this.updateScrollProgress(progressBar));
        }

        // Initialize Intersection Observer for animations
        this.initIntersectionObserver();
        
        // Add parallax effect to hero background
        this.initParallaxEffect();
        
        // Add smooth scroll behavior
        document.documentElement.style.scrollBehavior = 'smooth';
    }

    updateScrollProgress(progressBar) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / scrollHeight) * 100;
        progressBar.style.width = progress + '%';
    }

    initIntersectionObserver() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        this.animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    
                    // Add animation classes based on element type
                    if (element.classList.contains('scroll-animate')) {
                        element.style.opacity = '1';
                        element.style.transform = 'translateY(0)';
                    }
                    
                    if (element.classList.contains('fade-in-left')) {
                        element.style.opacity = '1';
                        element.style.transform = 'translateX(0)';
                    }
                    
                    if (element.classList.contains('fade-in-right')) {
                        element.style.opacity = '1';
                        element.style.transform = 'translateX(0)';
                    }
                    
                    if (element.classList.contains('scale-in')) {
                        element.style.opacity = '1';
                        element.style.transform = 'scale(1)';
                    }
                }
            });
        }, observerOptions);

        // Observe elements with animation classes
        document.querySelectorAll('.scroll-animate, .fade-in-left, .fade-in-right, .scale-in').forEach(el => {
            // Set initial state
            el.style.opacity = '0';
            el.style.transition = 'all 0.8s ease-out';
            
            if (el.classList.contains('scroll-animate')) {
                el.style.transform = 'translateY(50px)';
            } else if (el.classList.contains('fade-in-left')) {
                el.style.transform = 'translateX(-50px)';
            } else if (el.classList.contains('fade-in-right')) {
                el.style.transform = 'translateX(50px)';
            } else if (el.classList.contains('scale-in')) {
                el.style.transform = 'scale(0.8)';
            }
            
            this.animationObserver.observe(el);
        });
    }

    initParallaxEffect() {
        const parallaxElements = document.querySelectorAll('.parallax');
        
        if (parallaxElements.length === 0) return;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset;
            
            parallaxElements.forEach(element => {
                const speed = element.dataset.speed || 0.5;
                const yPos = -(scrollTop * speed);
                element.style.transform = `translateY(${yPos}px)`;
            });
        });
    }

    initStickyNavbar() {
        const navbar = document.querySelector('.navbar, nav');
        if (!navbar) return;
        
        let lastScrollTop = 0;
        const navHeight = navbar.offsetHeight;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > navHeight) {
                navbar.classList.add('navbar-scrolled');
                
                // Hide/show navbar on scroll direction
                if (scrollTop > lastScrollTop && scrollTop > navHeight * 2) {
                    navbar.style.transform = 'translateY(-100%)';
                } else {
                    navbar.style.transform = 'translateY(0)';
                }
            } else {
                navbar.classList.remove('navbar-scrolled');
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });
    }

    addFloatingAnimation() {
        const floatingElements = document.querySelectorAll('.floating');
        
        floatingElements.forEach((element, index) => {
            // Stagger the animation start times
            element.style.animationDelay = `${index * 0.5}s`;
            element.style.animation = 'float 6s ease-in-out infinite';
        });
    }

    initMobileGestures() {
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
                    // Add to cart with swipe animation
                    card.style.transform = 'translateX(-20px)';
                    setTimeout(() => {
                        card.style.transform = 'translateX(0)';
                        
                        // Trigger add to cart
                        const productId = card.dataset.productId;
                        if (productId && window.addToCart) {
                            window.addToCart(productId);
                        }
                    }, 200);
                }
            });
        });
    }

    // Hero Product Showcase Animation
    initializeHeroProductShowcase() {
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

        let currentProductIndex = 1; // Start with second product
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
        const updateProduct = (index) => {
            const product = products[index];
            
            // Add transition effect
            const card = document.getElementById('active-product-card');
            if (card) {
                card.style.transform = 'scale(0.95) rotateY(10deg)';
                card.style.opacity = '0.7';
                
                setTimeout(() => {
                    // Update content
                    if (productImage) productImage.src = product.image;
                    if (productTitle) productTitle.textContent = product.title;
                    if (productDescription) productDescription.textContent = product.description;
                    if (cardNumber) cardNumber.textContent = `${index + 1}`;
                    
                    if (productFeatures) {
                        productFeatures.innerHTML = product.features.map(feature => 
                            `<li class="flex items-center"><span class="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>${feature}</li>`
                        ).join('');
                    }
                    
                    if (progressBar) {
                        progressBar.style.width = `${((index + 1) / products.length) * 100}%`;
                    }
                    
                    // Restore card
                    card.style.transform = 'scale(1) rotateY(0deg)';
                    card.style.opacity = '1';
                }, 200);
            }
        };
        
        // Navigation functions
        const nextProduct = () => {
            currentProductIndex = (currentProductIndex + 1) % products.length;
            updateProduct(currentProductIndex);
            this.resetAutoAdvance();
        };
        
        const prevProduct = () => {
            currentProductIndex = (currentProductIndex - 1 + products.length) % products.length;
            updateProduct(currentProductIndex);
            this.resetAutoAdvance();
        };
        
        // Auto-advance functionality
        const startAutoAdvance = () => {
            autoAdvanceInterval = setInterval(nextProduct, 4000);
        };
        
        const stopAutoAdvance = () => {
            if (autoAdvanceInterval) {
                clearInterval(autoAdvanceInterval);
            }
        };
        
        this.resetAutoAdvance = () => {
            stopAutoAdvance();
            startAutoAdvance();
        };
        
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

    // CSS Keyframes injection for animations
    injectAnimationCSS() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-20px); }
            }
            
            @keyframes fadeInUp {
                from {
                    opacity: 0;
                    transform: translateY(30px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }
            
            @keyframes slideInLeft {
                from {
                    opacity: 0;
                    transform: translateX(-30px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes slideInRight {
                from {
                    opacity: 0;
                    transform: translateX(30px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            
            @keyframes scaleIn {
                from {
                    opacity: 0;
                    transform: scale(0.8);
                }
                to {
                    opacity: 1;
                    transform: scale(1);
                }
            }
            
            .navbar-scrolled {
                background-color: rgba(255, 255, 255, 0.95);
                backdrop-filter: blur(10px);
                box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
                transition: all 0.3s ease;
            }
            
            .dark .navbar-scrolled {
                background-color: rgba(17, 24, 39, 0.95);
                box-shadow: 0 2px 20px rgba(0, 0, 0, 0.3);
            }
            
            .floating {
                animation: float 6s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);
    }

    // Cleanup method
    destroy() {
        if (this.animationObserver) {
            this.animationObserver.disconnect();
        }
        
        // Remove event listeners
        window.removeEventListener('scroll', this.updateScrollProgress);
    }
}

// Initialize animations manager
const animationsManager = new AnimationsManager();

// Inject CSS animations
animationsManager.injectAnimationCSS();

// Make animations manager globally available
window.AnimationsManager = AnimationsManager;
window.animationsManager = animationsManager;
window.initializeHeroProductShowcase = () => animationsManager.initializeHeroProductShowcase();

// Legacy compatibility functions
window.initScrollAnimations = () => animationsManager.initScrollAnimations();
window.initStickyNavbar = () => animationsManager.initStickyNavbar();
window.initializeMobileGestures = () => animationsManager.initMobileGestures();
window.addFloatingAnimation = () => animationsManager.addFloatingAnimation();
