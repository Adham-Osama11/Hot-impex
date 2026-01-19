// Hot Impex Search Module
// Handles search functionality and UI

class SearchManager {
    constructor() {
        this.isSearchVisible = false;
        this.searchResults = [];
        this.init();
    }

    init() {
        this.initializeSearch();
        this.initializeHeroSearch();
    }

    initializeSearch() {
        const searchToggle = document.getElementById('search-toggle');
        const searchContainer = document.getElementById('search-container');
        const searchInput = document.getElementById('search-input');
        const searchResults = document.getElementById('search-results');
        const closeSearch = document.getElementById('close-search');
        
        if (searchToggle) {
            searchToggle.addEventListener('click', () => this.toggleSearch());
        }
        
        if (closeSearch) {
            closeSearch.addEventListener('click', () => this.closeSearchBar());
        }
        
        if (searchInput) {
            searchInput.addEventListener('input', (e) => this.handleSearch(e));
            searchInput.addEventListener('focus', () => this.showSearchResults());
            searchInput.addEventListener('blur', () => this.hideSearchResults());
        }
        
        // Close search on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isSearchVisible) {
                this.closeSearchBar();
            }
        });
    }

    initializeHeroSearch() {
        const heroSearch = document.getElementById('hero-search');
        const searchSuggestions = document.getElementById('search-suggestions');
        
        if (heroSearch) {
            heroSearch.addEventListener('input', (e) => this.handleHeroSearch(e));
            heroSearch.addEventListener('focus', () => this.showHeroSearchSuggestions());
            heroSearch.addEventListener('blur', () => this.hideHeroSearchSuggestions());
        }
    }

    toggleSearch() {
        const searchContainer = document.getElementById('search-container');
        const searchInput = document.getElementById('search-input');
        
        if (searchContainer) {
            this.isSearchVisible = !this.isSearchVisible;
            
            if (this.isSearchVisible) {
                searchContainer.classList.remove('hidden');
                setTimeout(() => {
                    searchContainer.classList.add('opacity-100');
                    if (searchInput) searchInput.focus();
                }, 10);
            } else {
                this.closeSearchBar();
            }
        }
    }

    closeSearchBar() {
        const searchContainer = document.getElementById('search-container');
        const searchResults = document.getElementById('search-results');
        
        if (searchContainer) {
            searchContainer.classList.remove('opacity-100');
            setTimeout(() => {
                searchContainer.classList.add('hidden');
            }, 300);
        }
        
        if (searchResults) {
            searchResults.classList.add('hidden');
        }
        
        this.isSearchVisible = false;
    }

    async handleSearch(e) {
        const query = e.target.value.toLowerCase().trim();
        const searchResults = document.getElementById('search-results');
        
        if (!searchResults) return;
        
        if (query.length < 2) {
            searchResults.classList.add('hidden');
            return;
        }
        
        try {
            // Try API search first
            const response = await APIService.searchProducts(query);
            if (response.status === 'success') {
                this.displaySearchResults(response.data.products || []);
            } else {
                // Fallback to local search
                this.searchLocalProducts(query);
            }
        } catch (error) {
            console.warn('API search failed, falling back to local search:', error);
            this.searchLocalProducts(query);
        }
    }

    searchLocalProducts(query) {
        const products = window.products || [];
        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            (product.description && product.description.toLowerCase().includes(query))
        );
        
        this.displaySearchResults(filteredProducts);
    }

    displaySearchResults(results) {
        const searchResults = document.getElementById('search-results');
        
        if (!searchResults) return;
        
        searchResults.classList.remove('hidden');
        
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="p-4 text-gray-500 text-center">
                    No products found
                </div>
            `;
            return;
        }
        
        searchResults.innerHTML = results.slice(0, 5).map(product => `
            <div class="p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100" 
                 onclick="viewProduct('${product.id}')">
                <div class="flex items-center space-x-3">
                    <img src="${product.mainImage || `https://placehold.co/50x50/E0E0E0/808080?text=${product.image || product.name}`}" 
                         alt="${product.name}" class="w-12 h-12 rounded-lg object-cover">
                    <div>
                        <h4 class="font-medium text-gray-900">${product.name}</h4>
                        <p class="text-sm text-gray-500 capitalize">${product.category}</p>
                        <!-- Price hidden in search results -->
                    </div>
                </div>
            </div>
        `).join('');
    }

    showSearchResults() {
        const searchResults = document.getElementById('search-results');
        const searchInput = document.getElementById('search-input');
        
        if (searchResults && searchInput && searchInput.value.length >= 2) {
            searchResults.classList.remove('hidden');
        }
    }

    hideSearchResults() {
        setTimeout(() => {
            const searchResults = document.getElementById('search-results');
            if (searchResults) {
                searchResults.classList.add('hidden');
            }
        }, 200);
    }

    // Hero Search Functions
    async handleHeroSearch(e) {
        const query = e.target.value.toLowerCase().trim();
        const searchSuggestions = document.getElementById('search-suggestions');
        
        if (!searchSuggestions) return;
        
        if (query.length < 2) {
            searchSuggestions.classList.add('hidden');
            return;
        }
        
        try {
            // Try API search first
            const response = await APIService.searchProducts(query);
            if (response.status === 'success') {
                this.displayHeroSearchResults(response.data.products || []);
            } else {
                // Fallback to local search
                this.searchLocalProductsForHero(query);
            }
        } catch (error) {
            console.warn('API search failed, falling back to local search:', error);
            this.searchLocalProductsForHero(query);
        }
        
        searchSuggestions.classList.remove('hidden');
    }

    searchLocalProductsForHero(query) {
        const products = window.products || [];
        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(query) ||
            product.category.toLowerCase().includes(query) ||
            (product.description && product.description.toLowerCase().includes(query))
        );
        
        this.displayHeroSearchResults(filteredProducts);
    }

    displayHeroSearchResults(results) {
        const searchSuggestions = document.getElementById('search-suggestions');
        
        if (!searchSuggestions) return;
        
        if (results.length === 0) {
            searchSuggestions.innerHTML = '<div class="p-4 text-gray-500">No products found</div>';
            return;
        }
        
        searchSuggestions.innerHTML = results.slice(0, 5).map(product => `
            <div class="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0" 
                 onclick="viewProduct('${product.id}')">
                <div class="flex items-center space-x-3">
                    <img src="${product.mainImage || `https://placehold.co/40x40/E0E0E0/808080?text=${product.image || product.name}`}" 
                         alt="${product.name}" class="w-10 h-10 rounded-lg object-cover">
                    <div>
                        <h4 class="font-medium text-gray-900">${product.name}</h4>
                        <p class="text-sm text-gray-500 capitalize">${product.category}</p>
                        <!-- Price hidden in suggestions; kept in product data for sorting -->
                    </div>
                </div>
            </div>
        `).join('');
    }

    showHeroSearchSuggestions() {
        const heroSearch = document.getElementById('hero-search');
        const searchSuggestions = document.getElementById('search-suggestions');
        
        if (heroSearch && searchSuggestions && heroSearch.value.length >= 2) {
            searchSuggestions.classList.remove('hidden');
        }
    }

    hideHeroSearchSuggestions() {
        // Delay hiding to allow clicks on suggestions
        setTimeout(() => {
            const searchSuggestions = document.getElementById('search-suggestions');
            if (searchSuggestions) {
                searchSuggestions.classList.add('hidden');
            }
        }, 200);
    }

    // Shop page search functionality
    setupShopSearch(callback) {
        const searchInput = document.getElementById('shop-search-input');
        if (!searchInput) return;
        
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const query = e.target.value.toLowerCase().trim();
                if (callback && typeof callback === 'function') {
                    callback(query);
                }
            }, 300); // Debounce search
        });
    }
}

// Initialize search manager
const searchManager = new SearchManager();

// Make search functions globally available
window.SearchManager = SearchManager;
window.searchManager = searchManager;
window.toggleSearch = () => searchManager.toggleSearch();
window.closeSearchBar = () => searchManager.closeSearchBar();
