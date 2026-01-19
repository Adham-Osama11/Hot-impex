// Hot Impex UI Components Module
// Handles common UI components and interactions

class UIComponents {
    // Mobile Menu
    static initializeMobileMenu() {
        const mobileMenuBtn = document.getElementById('mobile-menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        const closeMobileMenu = document.getElementById('mobile-menu-close') || document.getElementById('close-mobile-menu');
        const mobileMenuBackdrop = document.getElementById('mobile-menu-backdrop');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.remove('translate-x-full');
                if (mobileMenuBackdrop) {
                    mobileMenuBackdrop.classList.remove('hidden');
                }
            });
        }
        
        if (closeMobileMenu && mobileMenu) {
            closeMobileMenu.addEventListener('click', () => {
                mobileMenu.classList.add('translate-x-full');
                if (mobileMenuBackdrop) {
                    mobileMenuBackdrop.classList.add('hidden');
                }
            });
        }
        
        // Close menu when clicking backdrop
        if (mobileMenuBackdrop && mobileMenu) {
            mobileMenuBackdrop.addEventListener('click', () => {
                mobileMenu.classList.add('translate-x-full');
                mobileMenuBackdrop.classList.add('hidden');
            });
        }
    }

    // Carousel Functionality
    static initializeCarousel() {
        const slides = document.querySelectorAll('.carousel-slide');
        const prevBtn = document.querySelector('.carousel-prev');
        const nextBtn = document.querySelector('.carousel-next');
        let currentSlide = 0;
        
        if (slides.length === 0) return;
        
        function showSlide(index) {
            slides.forEach((slide, i) => {
                slide.classList.toggle('active', i === index);
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
    static initializeProductCards() {
        const productCards = document.querySelectorAll('.product-card');
        
        productCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-8px)';
            });
            
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }

    // Quick View Modal
    static initializeQuickView() {
        const quickViewModal = document.getElementById('quick-view-modal');
        const closeQuickView = document.getElementById('close-quick-view');
        
        if (closeQuickView) {
            closeQuickView.addEventListener('click', this.closeQuickViewModal);
        }
        
        if (quickViewModal) {
            quickViewModal.addEventListener('click', (e) => {
                if (e.target === quickViewModal) {
                    this.closeQuickViewModal();
                }
            });
        }
    }

    static openQuickView(productId) {
        const product = window.products?.find(p => p.id === productId);
        if (!product) return;
        
        const modal = document.getElementById('quick-view-modal');
        const content = document.getElementById('quick-view-content');
        
        if (modal && content) {
            content.innerHTML = `
                <div class="flex flex-col md:flex-row">
                    <div class="md:w-1/2">
                        <img src="${product.mainImage || `https://placehold.co/400x400/E0E0E0/808080?text=${product.image}`}" 
                             alt="${product.name}" class="w-full h-64 md:h-96 object-cover rounded-lg">
                    </div>
                    <div class="md:w-1/2 md:pl-6 mt-4 md:mt-0">
                        <h2 class="text-2xl font-bold text-gray-900 mb-2">${product.name}</h2>
                        <p class="text-gray-600 capitalize mb-4">${product.category} Category</p>
                        <div class="mb-4">
                            ${product.originalPrice ? 
                                `<span class="text-lg text-gray-500 line-through">${product.originalPrice}${product.currency || 'EGP'}</span>` : ''
                            }
                            <span class="text-2xl font-bold text-blue-600 ml-2">${product.price}${product.currency || 'EGP'}</span>
                        </div>
                        <p class="text-gray-600 mb-6">
                            ${product.description || `High-quality ${product.category} product designed for optimal performance.`}
                        </p>
                        <div class="flex space-x-3">
                            <button onclick="viewProduct('${product.id}')" 
                                    class="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors">
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

    static closeQuickViewModal() {
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

    // Notifications
    static showNotification(message, type = 'success') {
        const notification = document.createElement('div');
        const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';
        
        notification.className = `fixed top-4 right-4 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg z-50 transform translate-x-full transition-transform duration-300`;
        notification.textContent = message;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);
        
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Loading states
    static showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = `
            <div class="flex items-center justify-center py-20">
                <div class="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
            </div>
        `;
    }

    static hideLoading(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = '';
    }

    // Initialize all UI components
    static init() {
        this.initializeMobileMenu();
        this.initializeCarousel();
        this.initializeProductCards();
        this.initializeQuickView();
    }
}

// Make UIComponents globally available
window.UIComponents = UIComponents;
window.openQuickView = UIComponents.openQuickView.bind(UIComponents);
window.showCartNotification = UIComponents.showNotification;
