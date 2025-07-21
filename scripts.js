// Hot Impex Website JavaScript

// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mainNav = document.getElementById('main-nav');

    if (mobileMenuToggle && mainNav) {
        mobileMenuToggle.addEventListener('click', () => {
            mainNav.classList.toggle('hidden');
        });
    }

    // Partners carousel functionality (for index page)
    const carousel = document.getElementById('partners-carousel');
    const dotsContainer = document.getElementById('carousel-dots');
    
    if (carousel && dotsContainer) {
        const dots = dotsContainer.querySelectorAll('.dot');
        
        // Function to update active dot based on scroll position
        function updateDots() {
            const scrollLeft = carousel.scrollLeft;
            const carouselWidth = carousel.clientWidth;
            const scrollWidth = carousel.scrollWidth;

            // Calculate the approximate index of the currently visible "page"
            const sectionWidth = (scrollWidth - carouselWidth) / (dots.length - 1);
            let activeIndex = 0;

            if (dots.length > 1) {
                activeIndex = Math.round(scrollLeft / sectionWidth);
                if (activeIndex < 0) activeIndex = 0;
                if (activeIndex >= dots.length) activeIndex = dots.length - 1;
            }
            
            setActiveDot(activeIndex);
        }

        // Sets the active class on the corresponding dot
        function setActiveDot(index) {
            dots.forEach((dot, i) => {
                if (i === index) {
                    dot.classList.add('bg-gray-800');
                    dot.classList.remove('bg-gray-400');
                } else {
                    dot.classList.remove('bg-gray-800');
                    dot.classList.add('bg-gray-400');
                }
            });
        }

        // Scrolls the carousel to a specific "page" based on dot index
        function scrollToPage(dotIndex) {
            const carouselWidth = carousel.clientWidth;
            const scrollWidth = carousel.scrollWidth;
            let targetScrollLeft = 0;

            if (dots.length > 1) {
                const sectionWidth = (scrollWidth - carouselWidth) / (dots.length - 1);
                targetScrollLeft = sectionWidth * dotIndex;
            }

            carousel.scrollTo({
                left: targetScrollLeft,
                behavior: 'smooth'
            });
        }

        // Event listeners for dots
        dots.forEach(dot => {
            dot.addEventListener('click', () => {
                const slideIndex = parseInt(dot.dataset.slide);
                scrollToPage(slideIndex);
            });
        });

        // Update dots on scroll and resize
        carousel.addEventListener('scroll', updateDots);
        window.addEventListener('resize', updateDots);
        updateDots(); // Initial update
    }

    // Category filtering functionality (for shop page)
    const categoryLinks = document.querySelectorAll('a[href="#"]');
    if (categoryLinks.length > 0) {
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                // Remove active class from all links
                categoryLinks.forEach(l => l.classList.remove('category-active'));
                // Add active class to clicked link
                link.classList.add('category-active');
            });
        });
    }

    // Product page functionality
    initProductPage();
});

// Product page specific functions
function initProductPage() {
    // Image gallery functionality
    window.changeImage = function(src) {
        const mainImage = document.getElementById('main-image');
        if (mainImage) {
            mainImage.src = src;
        }
    };

    // Quantity controls
    const qtyMinus = document.getElementById('qty-minus');
    const qtyPlus = document.getElementById('qty-plus');
    const quantity = document.getElementById('quantity');

    if (qtyMinus && qtyPlus && quantity) {
        qtyMinus.addEventListener('click', () => {
            let currentQty = parseInt(quantity.textContent);
            if (currentQty > 1) {
                quantity.textContent = currentQty - 1;
            }
        });

        qtyPlus.addEventListener('click', () => {
            let currentQty = parseInt(quantity.textContent);
            if (currentQty < 15) { // Max available stock
                quantity.textContent = currentQty + 1;
            }
        });
    }

    // Size selection
    const sizeOptions = document.querySelectorAll('.size-option');
    if (sizeOptions.length > 0) {
        sizeOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove active class from all options
                sizeOptions.forEach(opt => {
                    opt.classList.remove('border-blue-500', 'bg-blue-50', 'text-blue-700');
                    opt.classList.add('border-gray-300');
                });
                // Add active class to clicked option
                option.classList.remove('border-gray-300');
                option.classList.add('border-blue-500', 'bg-blue-50', 'text-blue-700');
            });
        });
    }

    // Tab functionality
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    if (tabBtns.length > 0 && tabContents.length > 0) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabId = btn.dataset.tab;
                
                // Remove active class from all tabs
                tabBtns.forEach(tab => {
                    tab.classList.remove('tab-active', 'border-blue-500', 'text-blue-600');
                    tab.classList.add('border-transparent', 'text-gray-500');
                });
                
                // Add active class to clicked tab
                btn.classList.remove('border-transparent', 'text-gray-500');
                btn.classList.add('tab-active', 'border-blue-500', 'text-blue-600');
                
                // Hide all tab contents
                tabContents.forEach(content => {
                    content.classList.add('hidden');
                });
                
                // Show selected tab content
                const targetTab = document.getElementById(tabId + '-tab');
                if (targetTab) {
                    targetTab.classList.remove('hidden');
                }
            });
        });
    }
}
