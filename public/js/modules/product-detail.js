// Function to get URL parameters
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Function to fetch product data from the server
async function fetchProductDetails(productId) {
    try {
        const response = await fetch(`/api/products/${productId}`);
        if (!response.ok) {
            throw new Error('Product not found');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching product details:', error);
        return null;
    }
}

// Function to update product tabs content
function updateProductTabs(product) {
    // Update Description tab
    const descriptionContent = document.querySelector('#description-tab .text-gray-800.text-lg');
    if (descriptionContent) {
        descriptionContent.textContent = product.description;
    }

    // Update perfect for list
    const perfectForList = document.querySelector('#description-tab .grid.grid-cols-1.md\\:grid-cols-2');
    if (perfectForList && product.perfectFor) {
        perfectForList.innerHTML = product.perfectFor.map(item => `
            <div class="flex items-center space-x-3 p-3 rounded-lg hover:bg-emerald-50 transition-colors duration-200">
                <svg class="w-6 h-6 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>
                </svg>
                <span class="text-gray-700 font-medium">${item}</span>
            </div>
        `).join('');
    }

    // Update Specifications tab
    const specsList = document.querySelector('#specifications-tab table');
    if (specsList && product.specifications) {
        specsList.innerHTML = Object.entries(product.specifications).map(([key, value]) => `
            <tr class="border-b">
                <td class="py-3 font-semibold text-gray-800">${key}</td>
                <td class="py-3 text-gray-700">${value}</td>
            </tr>
        `).join('');
    }

    // Update Package Contents
    const packageList = document.querySelector('#specifications-tab ul');
    if (packageList && product.packageContents) {
        packageList.innerHTML = product.packageContents.map(item => `
            <li>• ${item}</li>
        `).join('');
    }

    // Update Setup & Usage tab
    const setupInstructions = document.querySelector('#setup-tab ol');
    if (setupInstructions && product.setupInstructions) {
        setupInstructions.innerHTML = product.setupInstructions.map(instruction => `
            <li>${instruction}</li>
        `).join('');
    }

    // Update Reviews tab
    const reviewsContainer = document.querySelector('#reviews-tab .space-y-6');
    if (reviewsContainer && product.reviews) {
        reviewsContainer.innerHTML = product.reviews.map(review => `
            <div class="bg-white rounded-lg border border-gray-200 p-6">
                <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-3">
                        <div class="w-10 h-10 bg-${review.color || 'blue'}-500 rounded-full flex items-center justify-center text-white font-semibold">
                            ${review.initials || review.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                            <h4 class="font-semibold text-gray-800">${review.name}</h4>
                            <div class="flex text-yellow-400 text-sm">
                                <span>${'★'.repeat(review.rating)}${'☆'.repeat(5-review.rating)}</span>
                            </div>
                        </div>
                    </div>
                    <span class="text-sm text-gray-500">${review.date}</span>
                </div>
                <p class="text-gray-700">${review.comment}</p>
            </div>
        `).join('');
    }

    // Update review count in tab button
    const reviewsTabButton = document.querySelector('button[data-tab="reviews"] span');
    if (reviewsTabButton && product.reviews) {
        reviewsTabButton.textContent = `Reviews (${product.reviews.length})`;
    }
}

// Function to handle tab switching
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    // Function to activate a specific tab
    function activateTab(tabName) {
        // Remove active class from all buttons and hide all content
        tabButtons.forEach(btn => {
            if (btn.dataset.tab === tabName) {
                btn.classList.add('tab-active');
                btn.classList.add('border-purple-500');
                btn.classList.add('text-purple-600');
                btn.classList.remove('border-transparent');
                btn.classList.remove('text-gray-500');
            } else {
                btn.classList.remove('tab-active');
                btn.classList.remove('border-purple-500');
                btn.classList.remove('text-purple-600');
                btn.classList.add('border-transparent');
                btn.classList.add('text-gray-500');
            }
        });

        // Show selected tab content and hide others
        tabContents.forEach(content => {
            if (content.id === `${tabName}-tab`) {
                content.classList.remove('hidden');
            } else {
                content.classList.add('hidden');
            }
        });
    }

    // Add click handlers to all tab buttons
    tabButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const tabName = button.dataset.tab;
            activateTab(tabName);
        });
    });

    // Activate the first tab by default
    activateTab('description');
}

// Initialize product details page
async function initializeProductPage() {
    const productId = getUrlParameter('id');
    if (!productId) {
        console.error('No product ID provided');
        return;
    }

    const product = await fetchProductDetails(productId);
    if (product) {
        updateProductTabs(product);
        
        // Track product visit for analytics
        if (typeof AnalyticsService !== 'undefined') {
            try {
                await AnalyticsService.trackProductVisit(
                    product.data.id || product.data._id,
                    product.data.name,
                    product.data.category
                );
                console.log('📊 Product visit tracked:', product.data.name);
            } catch (error) {
                console.error('Error tracking product visit:', error);
            }
        }
    }

    // Initialize tabs
    initializeTabs();
}

// Load product details when the page loads
document.addEventListener('DOMContentLoaded', initializeProductPage);