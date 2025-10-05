// Use the AdminAPI from the modular admin/api.js file
// which properly integrates with API_CONFIG
const LEGACY_DISABLED = !!window.__DISABLE_LEGACY_PRODUCT_FORM__;
// Create a reference to the adminAPI instance created by the modular API
let adminAPI;

// --- NOTIFICATION SYSTEM ---
class NotificationManager {
    constructor() {
        this.container = this.createContainer();
        this.notifications = new Map();
    }

    createContainer() {
        const container = document.createElement('div');
        container.id = 'notification-container';
        container.className = 'fixed top-4 right-4 z-50 space-y-2';
        document.body.appendChild(container);
        return container;
    }

    show(message, type = 'info', duration = 5000) {
        const id = Date.now().toString();
        const notification = this.createNotification(id, message, type);
        
        this.container.appendChild(notification);
        this.notifications.set(id, notification);

        // Animate in
        requestAnimationFrame(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        });

        // Auto remove
        if (duration > 0) {
            setTimeout(() => this.remove(id), duration);
        }

        return id;
    }

    createNotification(id, message, type) {
        const notification = document.createElement('div');
        notification.className = `
            max-w-sm w-full bg-white dark:bg-gray-800 shadow-lg rounded-lg pointer-events-auto 
            flex ring-1 ring-black ring-opacity-5 transform transition-all duration-300 ease-in-out
            translate-x-full opacity-0
        `;

        const typeStyles = {
            success: 'border-l-4 border-green-500',
            error: 'border-l-4 border-red-500',
            warning: 'border-l-4 border-yellow-500',
            info: 'border-l-4 border-blue-500'
        };

        const typeIcons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        notification.className += ` ${typeStyles[type] || typeStyles.info}`;

        notification.innerHTML = `
            <div class="flex-1 w-0 p-4">
                <div class="flex items-start">
                    <div class="flex-shrink-0 pt-0.5">
                        <span class="h-6 w-6 text-lg">${typeIcons[type] || typeIcons.info}</span>
                    </div>
                    <div class="ml-3 flex-1">
                        <p class="text-sm font-medium text-gray-900 dark:text-white">${message}</p>
                    </div>
                </div>
            </div>
            <div class="flex border-l border-gray-200 dark:border-gray-600">
                <button onclick="notificationManager.remove('${id}')" 
                        class="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-gray-500 focus:outline-none">
                    ✕
                </button>
            </div>
        `;

        return notification;
    }

    remove(id) {
        const notification = this.notifications.get(id);
        if (notification) {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(full)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                this.notifications.delete(id);
            }, 300);
        }
    }

    clear() {
        this.notifications.forEach((_, id) => this.remove(id));
    }
}

const notificationManager = new NotificationManager();

// Global notification function
function showNotification(message, type = 'info', duration = 5000) {
    return notificationManager.show(message, type, duration);
}

// --- FORM VALIDATION ---
class FormValidator {
    static validateProduct(productData) {
        const errors = [];

        if (!productData.name || productData.name.trim().length < 2) {
            errors.push('Product name must be at least 2 characters long');
        }

        if (!productData.category || productData.category.trim().length < 2) {
            errors.push('Category is required');
        }

        if (!productData.price || productData.price <= 0) {
            errors.push('Price must be a positive number');
        }

        if (productData.stock !== undefined && productData.stock < 0) {
            errors.push('Stock cannot be negative');
        }

        if (productData.description && productData.description.length > 1000) {
            errors.push('Description cannot exceed 1000 characters');
        }

        return errors;
    }

    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    static sanitizeInput(input) {
        if (typeof input !== 'string') return input;
        return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
    }
}

document.addEventListener('DOMContentLoaded', function() {
    // Initialize adminAPI reference from the modular API system
    adminAPI = new AdminAPI();
    
    // --- THEME MANAGEMENT ---
    const themeToggle = document.getElementById('theme-toggle');
    const html = document.documentElement;

    const applyTheme = (isDark) => {
        html.classList.toggle('dark', isDark);
        updateThemeToggleIcon(isDark);
        updateChartsTheme(isDark);
    };

    const updateThemeToggleIcon = (isDark) => {
        if (!themeToggle) return;
        const icon = themeToggle.querySelector('svg');
        if (!icon) return;

        if (isDark) {
            icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>`;
            themeToggle.setAttribute('title', 'Switch to light mode');
        } else {
            icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>`;
            themeToggle.setAttribute('title', 'Switch to dark mode');
        }
    };

    const toggleTheme = () => {
        const isCurrentlyDark = html.classList.contains('dark');
        const newIsDark = !isCurrentlyDark;
        localStorage.setItem('darkMode', newIsDark.toString());
        applyTheme(newIsDark);
    };

    const initializeTheme = () => {
        const savedTheme = localStorage.getItem('darkMode');
        const isDark = savedTheme !== null ? savedTheme === 'true' : window.matchMedia('(prefers-color-scheme: dark)').matches;
        applyTheme(isDark);
    };

    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (localStorage.getItem('darkMode') === null) {
            applyTheme(e.matches);
        }
    });

    // --- MOBILE SIDEBAR ---
    const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
    const mobileOverlay = document.getElementById('mobile-overlay');
    const floatingSidebar = document.getElementById('floating-sidebar');

    if (mobileMenuToggle && mobileOverlay && floatingSidebar) {
        mobileMenuToggle.addEventListener('click', () => {
            floatingSidebar.classList.toggle('open');
            mobileOverlay.classList.toggle('hidden');
            document.body.style.overflow = floatingSidebar.classList.contains('open') ? 'hidden' : '';
        });

        mobileOverlay.addEventListener('click', () => {
            floatingSidebar.classList.remove('open');
            mobileOverlay.classList.add('hidden');
            document.body.style.overflow = '';
        });

        window.addEventListener('resize', () => {
            if (window.innerWidth >= 1024) {
                floatingSidebar.classList.remove('open');
                mobileOverlay.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
    }

    // --- SIDEBAR NAVIGATION ---
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const adminSections = document.querySelectorAll('.admin-section');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            
            const activeClasses = ['opacity-100'];
            const inactiveClasses = ['opacity-50'];

            sidebarLinks.forEach(l => {
                l.classList.remove(...activeClasses);
                l.classList.add(...inactiveClasses);
            });
            
            link.classList.add(...activeClasses);
            link.classList.remove(...inactiveClasses);
            
            adminSections.forEach(section => section.classList.add('hidden'));
            
            const targetSectionId = link.getAttribute('data-section') + '-section';
            const targetElement = document.getElementById(targetSectionId);
            if (targetElement) {
                targetElement.classList.remove('hidden');
            }

            const sectionTitle = link.textContent.trim();
            
            // Load data based on section
            switch (link.getAttribute('data-section')) {
                case 'dashboard':
                    loadDashboardData();
                    break;
                case 'orders':
                    loadOrdersData();
                    break;
                case 'customers':
                    loadUsersData();
                    break;
                case 'products':
                    loadProductsData();
                    break;
            }

            if (window.innerWidth < 1024 && floatingSidebar.classList.contains('open')) {
                floatingSidebar.classList.remove('open');
                mobileOverlay.classList.add('hidden');
                document.body.style.overflow = '';
            }
        });
    });

    // --- UI ANIMATIONS ---
    const cards = document.querySelectorAll('.admin-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => card.style.transform = 'translateY(-4px) scale(1.02)');
        card.addEventListener('mouseleave', () => card.style.transform = 'translateY(0) scale(1)');
    });

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

    // --- INITIALIZE EVERYTHING ---
    initializeTheme();
    if (typeof Chart !== 'undefined') {
        initializeCharts();
    }
    
    // Load dashboard data
    loadDashboardData();
});

// --- DATA LOADING FUNCTIONS ---
async function loadDashboardData() {
    try {
        showLoadingState('dashboard');
        const statsData = await adminAPI.getDashboardStats();
        
        if (!statsData || !statsData.data) {
            throw new Error('Invalid data received from server');
        }
        
        updateDashboardStats(statsData.data);
        updateChartsWithData(statsData.data);
        hideLoadingState('dashboard');
        showNotification('Dashboard data loaded successfully', 'success', 3000);
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        hideLoadingState('dashboard');
        showErrorState('dashboard', 'Failed to load dashboard data: ' + error.message);
        showNotification('Failed to load dashboard data', 'error');
        
        // Show cached data if available
        const cachedData = getCachedData('dashboard');
        if (cachedData) {
            updateDashboardStats(cachedData);
            showNotification('Showing cached data. Please refresh to get latest information.', 'warning');
        }
    }
}

async function loadOrdersData() {
    try {
        showLoadingState('orders');
        const ordersData = await adminAPI.getAllOrders({ limit: 50 });
        
        if (!ordersData || !ordersData.data) {
            throw new Error('Invalid orders data received');
        }
        
        const orders = ordersData.data.orders || ordersData.data || [];
        updateOrdersTable(orders);
        cacheData('orders', orders);
        hideLoadingState('orders');
        showNotification(`Loaded ${orders.length} orders`, 'success', 3000);
    } catch (error) {
        console.error('Failed to load orders data:', error);
        hideLoadingState('orders');
        showErrorState('orders', 'Failed to load orders: ' + error.message);
        showNotification('Failed to load orders', 'error');
        
        // Show cached data if available
        const cachedOrders = getCachedData('orders');
        if (cachedOrders) {
            updateOrdersTable(cachedOrders);
            showNotification('Showing cached orders. Some data may be outdated.', 'warning');
        }
    }
}

async function loadUsersData() {
    try {
        showLoadingState('users');
        const usersData = await adminAPI.getAllUsers({ role: 'customer', limit: 50 });
        
        if (!usersData || !usersData.data) {
            throw new Error('Invalid users data received');
        }
        
        const users = usersData.data.users || usersData.data || [];
        updateUsersTable(users);
        cacheData('users', users);
        hideLoadingState('users');
        showNotification(`Loaded ${users.length} users`, 'success', 3000);
    } catch (error) {
        console.error('Failed to load users data:', error);
        hideLoadingState('users');
        showErrorState('users', 'Failed to load users: ' + error.message);
        showNotification('Failed to load users', 'error');
        
        // Show cached data if available
        const cachedUsers = getCachedData('users');
        if (cachedUsers) {
            updateUsersTable(cachedUsers);
            showNotification('Showing cached users. Some data may be outdated.', 'warning');
        }
    }
}

async function loadProductsData() {
    try {
        showLoadingState('products');
        const productsResponse = await fetch('/api/products');
        
        if (!productsResponse.ok) {
            throw new Error(`HTTP ${productsResponse.status}: ${productsResponse.statusText}`);
        }
        
        const productsData = await productsResponse.json();
        
        if (!productsData || !productsData.data) {
            throw new Error('Invalid products data received');
        }
        
        const products = productsData.data.products || productsData.data || [];
        updateProductsTable(products);
        cacheData('products', products);
        hideLoadingState('products');
        showNotification(`Loaded ${products.length} products`, 'success', 3000);
    } catch (error) {
        console.error('Failed to load products data:', error);
        hideLoadingState('products');
        showErrorState('products', 'Failed to load products: ' + error.message);
        showNotification('Failed to load products', 'error');
        
        // Show cached data if available
        const cachedProducts = getCachedData('products');
        if (cachedProducts) {
            updateProductsTable(cachedProducts);
            showNotification('Showing cached products. Some data may be outdated.', 'warning');
        }
    }
}

// --- CACHING SYSTEM ---
function cacheData(key, data) {
    try {
        const cacheEntry = {
            data: data,
            timestamp: Date.now(),
            expires: Date.now() + (5 * 60 * 1000) // 5 minutes
        };
        localStorage.setItem(`admin_cache_${key}`, JSON.stringify(cacheEntry));
    } catch (error) {
        console.warn('Failed to cache data:', error);
    }
}

function getCachedData(key) {
    try {
        const cached = localStorage.getItem(`admin_cache_${key}`);
        if (!cached) return null;
        
        const cacheEntry = JSON.parse(cached);
        if (Date.now() > cacheEntry.expires) {
            localStorage.removeItem(`admin_cache_${key}`);
            return null;
        }
        
        return cacheEntry.data;
    } catch (error) {
        console.warn('Failed to get cached data:', error);
        return null;
    }
}

function clearCache() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('admin_cache_')) {
            localStorage.removeItem(key);
        }
    });
}

// --- UPDATE FUNCTIONS ---
function updateDashboardStats(statsData) {
    try {
        if (!statsData) {
            console.warn('No stats data provided');
            return;
        }

        // Handle different data structures from MongoDB vs file-based systems
        const stats = statsData.stats || statsData;
        
        // Update stat cards with safe access
        const statsElements = {
            totalSales: document.querySelector('[data-stat="total-sales"]'),
            totalOrders: document.querySelector('[data-stat="total-orders"]'),
            totalProducts: document.querySelector('[data-stat="total-products"]'),
            totalCustomers: document.querySelector('[data-stat="total-customers"]')
        };

        // Safely update each stat with fallback values
        if (statsElements.totalSales) {
            const revenue = stats.orders?.totalRevenue || stats.totalRevenue || 0;
            statsElements.totalSales.textContent = `$${revenue.toLocaleString()}`;
        }
        
        if (statsElements.totalOrders) {
            const orders = stats.orders?.total || stats.totalOrders || 0;
            statsElements.totalOrders.textContent = orders.toLocaleString();
        }
        
        if (statsElements.totalProducts) {
            const products = stats.products?.total || stats.totalProducts || 0;
            statsElements.totalProducts.textContent = products.toLocaleString();
        }
        
        if (statsElements.totalCustomers) {
            const users = stats.users?.total || stats.totalUsers || 0;
            statsElements.totalCustomers.textContent = users.toLocaleString();
        }

        // Update recent activities
        updateRecentActivities(stats);
    } catch (error) {
        console.error('Error updating dashboard stats:', error);
        showNotification('Error updating dashboard display', 'error');
    }
}

function updateOrdersTable(orders) {
    try {
        const tableBody = document.querySelector('#orders-section tbody');
        if (!tableBody) {
            console.warn('Orders table body not found');
            return;
        }

        if (!Array.isArray(orders)) {
            console.warn('Orders data is not an array:', orders);
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-black dark:text-white">No orders data available</td></tr>';
            return;
        }

        if (orders.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-black dark:text-white">No orders found</td></tr>';
            return;
        }

        tableBody.innerHTML = orders.map(order => {
            try {
                return `
                    <tr class="border-b border-white/10 dark:border-gray-700/50 hover:bg-white/5 dark:hover:bg-gray-800/20">
                        <td class="px-6 py-4 font-medium">#${order.id || order._id || 'N/A'}</td>
                        <td class="px-6 py-4">${order.userEmail || order.user?.email || 'Guest'}</td>
                        <td class="px-6 py-4">${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td class="px-6 py-4">$${(order.totalAmount || 0).toFixed(2)}</td>
                        <td class="px-6 py-4">
                            <span class="px-2 py-1 font-semibold leading-tight rounded-full ${getStatusColor(order.status || 'pending')}">
                                ${(order.status || 'pending').charAt(0).toUpperCase() + (order.status || 'pending').slice(1)}
                            </span>
                        </td>
                        <td class="px-6 py-4 text-right">
                            <button onclick="viewOrder('${order.id || order._id}')" class="text-blue-500 hover:text-blue-400">View</button>
                        </td>
                    </tr>
                `;
            } catch (rowError) {
                console.warn('Error rendering order row:', rowError, order);
                return '<tr><td colspan="6" class="text-center py-2 text-red-500">Error displaying order</td></tr>';
            }
        }).join('');
    } catch (error) {
        console.error('Error updating orders table:', error);
        showNotification('Error updating orders table', 'error');
    }
}

function updateUsersTable(users) {
    try {
        const tableBody = document.querySelector('#customers-section tbody');
        if (!tableBody) {
            console.warn('Users table body not found');
            return;
        }

        if (!Array.isArray(users)) {
            console.warn('Users data is not an array:', users);
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-black dark:text-white">No users data available</td></tr>';
            return;
        }

        if (users.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-black dark:text-white">No users found</td></tr>';
            return;
        }

        tableBody.innerHTML = users.map(user => {
            try {
                const fullName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A';
                const role = user.role || 'customer';
                const roleColor = role === 'admin' ? 'text-purple-600 dark:text-purple-400' : 'text-blue-600 dark:text-blue-400';
                const roleBg = role === 'admin' ? 'bg-purple-100 dark:bg-purple-900/20' : 'bg-blue-100 dark:bg-blue-900/20';
                
                return `
                    <tr class="border-b border-white/10 dark:border-gray-700/50 hover:bg-white/5 dark:hover:bg-gray-800/20">
                        <td class="px-6 py-4 font-medium">${fullName}</td>
                        <td class="px-6 py-4">${user.email || 'N/A'}</td>
                        <td class="px-6 py-4">
                            <span class="px-2 py-1 rounded-full text-xs font-medium ${roleColor} ${roleBg}">
                                ${role.charAt(0).toUpperCase() + role.slice(1)}
                            </span>
                        </td>
                        <td class="px-6 py-4">$${(user.totalSpent || 0).toFixed(2)}</td>
                        <td class="px-6 py-4">${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                        <td class="px-6 py-4 text-right space-x-2">
                            <button onclick="viewUser('${user.id || user._id}')" class="text-blue-500 hover:text-blue-400">View</button>
                            <button onclick="deleteUser('${user.id || user._id}')" class="text-red-500 hover:text-red-400">Remove</button>
                        </td>
                    </tr>
                `;
            } catch (rowError) {
                console.warn('Error rendering user row:', rowError, user);
                return '<tr><td colspan="6" class="text-center py-2 text-red-500">Error displaying user</td></tr>';
            }
        }).join('');
    } catch (error) {
        console.error('Error updating users table:', error);
        showNotification('Error updating users table', 'error');
    }
}

function updateProductsTable(products) {
    try {
        const tableBody = document.querySelector('#products-section tbody');
        if (!tableBody) {
            console.warn('Products table body not found');
            return;
        }

        if (!Array.isArray(products)) {
            console.warn('Products data is not an array:', products);
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-black dark:text-white">No products data available</td></tr>';
            return;
        }

        if (products.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" class="text-center py-8 text-black dark:text-white">No products found</td></tr>';
            return;
        }

        tableBody.innerHTML = products.map(product => {
            try {
                return `
                    <tr class="border-b border-white/10 dark:border-gray-700/50 hover:bg-white/5 dark:hover:bg-gray-800/20">
                        <td class="px-6 py-4 font-medium whitespace-nowrap">${product.name || 'Unnamed Product'}</td>
                        <td class="px-6 py-4">${product.category || 'Uncategorized'}</td>
                        <td class="px-6 py-4">$${(product.price || 0).toFixed(2)}</td>
                        <td class="px-6 py-4">${product.stock !== undefined ? product.stock : 'N/A'}</td>
                        <td class="px-6 py-4 text-right space-x-2">
                            <button onclick="editProduct('${product.id || product._id}')" class="text-blue-500 hover:text-blue-400">Edit</button>
                            <button onclick="deleteProduct('${product.id || product._id}')" class="text-red-500 hover:text-red-400">Delete</button>
                        </td>
                    </tr>
                `;
            } catch (rowError) {
                console.warn('Error rendering product row:', rowError, product);
                return '<tr><td colspan="5" class="text-center py-2 text-red-500">Error displaying product</td></tr>';
            }
        }).join('');
    } catch (error) {
        console.error('Error updating products table:', error);
        showNotification('Error updating products table', 'error');
    }
}

function updateRecentActivities(stats) {
    // This would typically come from a separate endpoint, but for now we'll generate based on stats
    const activities = [
        {
            type: 'order',
            message: `${stats.recentOrdersCount} new orders in the last 30 days`,
            time: 'Recent',
            value: `+$${stats.totalRevenue.toLocaleString()}`,
            icon: 'check',
            color: 'green'
        },
        {
            type: 'products',
            message: `${stats.totalProducts} products in catalog`,
            time: 'Current',
            value: `${stats.topProducts.length} categories`,
            icon: 'package',
            color: 'blue'
        },
        {
            type: 'customers',
            message: `${stats.totalUsers} registered customers`,
            time: 'Total',
            value: 'Growing',
            icon: 'users',
            color: 'purple'
        }
    ];

    // Update activities section if it exists
    // This would require updating the HTML structure to be more dynamic
}

// --- HELPER FUNCTIONS ---
function getStatusColor(status) {
    const statusColors = {
        'pending': 'text-yellow-700 bg-yellow-100 dark:bg-yellow-700 dark:text-yellow-100',
        'processing': 'text-blue-700 bg-blue-100 dark:bg-blue-700 dark:text-blue-100',
        'shipped': 'text-purple-700 bg-purple-100 dark:bg-purple-700 dark:text-purple-100',
        'delivered': 'text-green-700 bg-green-100 dark:bg-green-700 dark:text-green-100',
        'cancelled': 'text-red-700 bg-red-100 dark:bg-red-700 dark:text-red-100'
    };
    return statusColors[status] || statusColors.pending;
}

function showLoadingState(section = null) {
    const loadingHTML = `
        <tr>
            <td colspan="6" class="text-center py-8">
                <div class="flex justify-center items-center space-x-2">
                    <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-pink-500"></div>
                    <span class="text-black dark:text-white">Loading data...</span>
                </div>
            </td>
        </tr>
    `;
    
    if (section) {
        const sectionElement = document.querySelector(`#${section}-section tbody`);
        if (sectionElement) {
            sectionElement.innerHTML = loadingHTML;
        }
    } else {
        // Show loading for all visible sections
        document.querySelectorAll('.admin-section:not(.hidden) tbody').forEach(tbody => {
            if (tbody) tbody.innerHTML = loadingHTML;
        });
    }
}

function hideLoadingState(section = null) {
    // Loading states will be replaced by actual content
    // This function is called after successful data loading
}

function showErrorState(section, message) {
    const errorHTML = `
        <tr>
            <td colspan="6" class="text-center py-8">
                <div class="flex flex-col items-center space-y-2">
                    <div class="text-red-500 text-2xl">⚠️</div>
                    <div class="text-red-500 font-medium">${message}</div>
                    <button onclick="retryLoad('${section}')" 
                            class="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
                        Retry
                    </button>
                </div>
            </td>
        </tr>
    `;
    
    const sectionElement = document.querySelector(`#${section}-section tbody`);
    if (sectionElement) {
        sectionElement.innerHTML = errorHTML;
    }
}

function retryLoad(section) {
    switch (section) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'orders':
            loadOrdersData();
            break;
        case 'users':
            loadUsersData();
            break;
        case 'products':
            loadProductsData();
            break;
        default:
            console.warn('Unknown section for retry:', section);
    }
}

// --- CONNECTION STATUS ---
class ConnectionMonitor {
    constructor() {
        this.isOnline = navigator.onLine;
        this.init();
    }

    init() {
        window.addEventListener('online', () => {
            this.isOnline = true;
            showNotification('Connection restored', 'success', 3000);
            this.retryFailedRequests();
        });

        window.addEventListener('offline', () => {
            this.isOnline = false;
            showNotification('Connection lost. Working offline.', 'warning', 0);
        });
    }

    retryFailedRequests() {
        // Refresh current section data
        const activeSection = document.querySelector('.sidebar-link.opacity-100');
        if (activeSection) {
            const sectionName = activeSection.getAttribute('data-section');
            retryLoad(sectionName);
        }
    }
}

const connectionMonitor = new ConnectionMonitor();

// --- ACTION HANDLERS ---
async function viewOrder(orderId) {
    try {
        // Implement order detail view
        alert(`Viewing order ${orderId} - Feature to be implemented`);
    } catch (error) {
        console.error('Failed to view order:', error);
        alert('Failed to load order details');
    }
}

async function viewUser(userId) {
    try {
        showNotification('Loading user details...', 'info', 2000);
        
        // Fetch user details from admin API
        const response = await adminAPI.request(`/users/${userId}`);
        const user = response.data.user;
        
        if (!user) {
            showNotification('User not found', 'error');
            return;
        }
        
        // Populate user details modal
        const userDetailsContent = document.getElementById('userDetailsContent');
        const fullName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A';
        
        userDetailsContent.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="glass-effect p-6 rounded-xl border border-white/20 dark:border-gray-700/20">
                    <h4 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Personal Information</h4>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</label>
                            <p class="text-gray-800 dark:text-gray-200">${fullName}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                            <p class="text-gray-800 dark:text-gray-200">${user.email || 'N/A'}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Phone</label>
                            <p class="text-gray-800 dark:text-gray-200">${user.phone || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                
                <div class="glass-effect p-6 rounded-xl border border-white/20 dark:border-gray-700/20">
                    <h4 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Account Information</h4>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Customer ID</label>
                            <p class="text-gray-800 dark:text-gray-200">${user.id || user._id || 'N/A'}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Member Since</label>
                            <p class="text-gray-800 dark:text-gray-200">${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Account Status</label>
                            <span class="px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300' : 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300'}">
                                ${user.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="glass-effect p-6 rounded-xl border border-white/20 dark:border-gray-700/20">
                <h4 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Purchase Summary</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="text-center">
                        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">$${(user.totalSpent || 0).toFixed(2)}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-green-600 dark:text-green-400">${user.totalOrders || 0}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">${user.avgOrderValue ? '$' + user.avgOrderValue.toFixed(2) : '$0.00'}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Avg Order Value</p>
                    </div>
                </div>
            </div>
        `;
        
        // Store current user ID for editing
        document.getElementById('userDetailsModal').setAttribute('data-user-id', userId);
        
        // Show the modal
        document.getElementById('userDetailsModal').classList.remove('hidden');
        
    } catch (error) {
        console.error('Failed to view user:', error);
        showNotification('Failed to load user details: ' + error.message, 'error');
    }
}

async function editProduct(productId) {
    try {
        // First, get the product data
        const response = await fetch('/api/products');
        const productsData = await response.json();
        const product = productsData.data.products.find(p => p.id === productId);
        
        if (!product) {
            alert('Product not found');
            return;
        }
        
        // Populate the modal with product data
        document.getElementById('modalTitle').textContent = 'Edit Product';
        document.getElementById('submitButtonText').textContent = 'Update Product';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productCategory').value = product.category;
        document.getElementById('productPrice').value = product.price;
        document.getElementById('productStock').value = product.stock || '';
        document.getElementById('productDescription').value = product.description || '';
        document.getElementById('productImages').value = product.images ? product.images.join('\n') : '';
        
        // Show the modal
        document.getElementById('productModal').classList.remove('hidden');
    } catch (error) {
        console.error('Failed to edit product:', error);
        alert('Failed to load product data');
    }
}

function showAddProductModal() {
    // Reset form for new product
    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('submitButtonText').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    
    // Show the modal
    document.getElementById('productModal').classList.remove('hidden');
}

function closeProductModal() {
    document.getElementById('productModal').classList.add('hidden');
    document.getElementById('productForm').reset();
}

// Handle form submission
document.addEventListener('DOMContentLoaded', function() {
    if (LEGACY_DISABLED) return;
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const formData = new FormData(this);
                const productData = {
                    name: FormValidator.sanitizeInput(formData.get('name')),
                    category: FormValidator.sanitizeInput(formData.get('category')),
                    price: parseFloat(formData.get('price')),
                    stock: parseInt(formData.get('stock')) || 0,
                    description: FormValidator.sanitizeInput(formData.get('description')),
                    images: formData.get('images') ? 
                           formData.get('images').split('\n')
                                   .map(img => img.trim())
                                   .filter(img => img) : []
                };
                
                // Validate form data
                const validationErrors = FormValidator.validateProduct(productData);
                if (validationErrors.length > 0) {
                    showNotification('Validation errors:\n' + validationErrors.join('\n'), 'error', 8000);
                    return;
                }
                
                const productId = formData.get('id');
                
                // Show loading state
                const submitButton = this.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                submitButton.disabled = true;
                submitButton.textContent = productId ? 'Updating...' : 'Adding...';
                
                let result;
                if (productId) {
                    result = await adminAPI.updateProduct(productId, productData);
                } else {
                    result = await adminAPI.createProduct(productData);
                }
                
                closeProductModal();
                await loadProductsData();
                showNotification(
                    productId ? 'Product updated successfully!' : 'Product added successfully!', 
                    'success'
                );
                
                // Clear cache to force fresh data
                localStorage.removeItem('admin_cache_products');
                
            } catch (error) {
                console.error('Failed to save product:', error);
                showNotification('Failed to save product: ' + error.message, 'error');
            } finally {
                // Reset button state
                const submitButton = this.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = false;
                    const productId = new FormData(this).get('id');
                    submitButton.textContent = productId ? 'Update Product' : 'Add Product';
                }
            }
        });
    }
    
    // Handle user form submission
    const userForm = document.getElementById('userForm');
    if (userForm) {
        userForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            try {
                const formData = new FormData(this);
                const userId = formData.get('id');
                
                // Validate passwords match if provided
                const password = formData.get('password');
                const passwordConfirm = formData.get('passwordConfirm');
                
                if (password && password !== passwordConfirm) {
                    showNotification('Passwords do not match', 'error');
                    return;
                }
                
                // For new users, password is required
                if (!userId && !password) {
                    showNotification('Password is required for new customers', 'error');
                    return;
                }
                
                // Validate password length if provided
                if (password && password.length < 6) {
                    showNotification('Password must be at least 6 characters long', 'error');
                    return;
                }
                
                const userData = {
                    firstName: FormValidator.sanitizeInput(formData.get('firstName')),
                    lastName: FormValidator.sanitizeInput(formData.get('lastName')),
                    email: FormValidator.sanitizeInput(formData.get('email')),
                    phone: FormValidator.sanitizeInput(formData.get('phone'))
                };
                
                // Add password only if provided
                if (password) {
                    userData.password = password;
                }
                
                // Validate email format
                if (!userData.email || !userData.email.includes('@')) {
                    showNotification('Please enter a valid email address', 'error');
                    return;
                }
                
                // Show loading state
                const submitButton = this.querySelector('button[type="submit"]');
                const originalText = submitButton.textContent;
                submitButton.disabled = true;
                submitButton.textContent = userId ? 'Updating...' : 'Adding...';
                
                let result;
                if (userId) {
                    // Update existing user
                    result = await adminAPI.request(`/users/${userId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(userData)
                    });
                } else {
                    // Create new user via admin endpoint
                    result = await adminAPI.request('/users', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(userData)
                    });
                }
                
                closeUserModal();
                await loadUsersData();
                showNotification(
                    userId ? 'Customer updated successfully!' : 'Customer added successfully!', 
                    'success'
                );
                
                // Clear cache to force fresh data
                localStorage.removeItem('admin_cache_users');
                
            } catch (error) {
                console.error('Failed to save user:', error);
                showNotification('Failed to save customer: ' + error.message, 'error');
            } finally {
                // Reset button state
                const submitButton = this.querySelector('button[type="submit"]');
                if (submitButton) {
                    submitButton.disabled = false;
                    const userId = new FormData(this).get('id');
                    submitButton.textContent = userId ? 'Update Customer' : 'Add Customer';
                }
            }
        });
    }
});

async function deleteProduct(productId) {
    if (!productId) {
        showNotification('Invalid product ID', 'error');
        return;
    }

    // Enhanced confirmation dialog
    const confirmed = confirm('⚠️ Are you sure you want to delete this product?\n\nThis action cannot be undone and will permanently remove the product from your catalog.');
    if (!confirmed) return;
    
    try {
        showNotification('Deleting product...', 'info', 2000);
        await adminAPI.deleteProduct(productId);
        
        // Clear cache and reload
        localStorage.removeItem('admin_cache_products');
        await loadProductsData();
        
        showNotification('Product deleted successfully', 'success');
    } catch (error) {
        console.error('Failed to delete product:', error);
        showNotification('Failed to delete product: ' + error.message, 'error');
    }
}

async function deleteUser(userId) {
    if (!userId) {
        showNotification('Invalid user ID', 'error');
        return;
    }

    const confirmed = confirm('⚠️ Are you sure you want to remove this user?\n\nThis will deactivate their account and they will no longer be able to access the system.');
    if (!confirmed) return;
    
    try {
        showNotification('Removing user...', 'info', 2000);
        
        // Call admin API to delete user
        await adminAPI.request(`/users/${userId}`, { method: 'DELETE' });
        
        // Clear cache and reload
        localStorage.removeItem('admin_cache_users');
        await loadUsersData();
        
        showNotification('User removed successfully', 'success');
    } catch (error) {
        console.error('Failed to delete user:', error);
        showNotification('Failed to remove user: ' + error.message, 'error');
    }
}

// User Modal Functions
function showAddUserModal() {
    // Reset form for new user
    document.getElementById('userModalTitle').textContent = 'Add New User';
    document.getElementById('userSubmitButtonText').textContent = 'Add User';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    
    // Set default role to customer
    document.getElementById('userRole').value = 'customer';
    
    // Show password fields for new users
    document.getElementById('passwordSection').style.display = 'grid';
    document.getElementById('userPassword').required = true;
    document.getElementById('userPasswordConfirm').required = true;
    
    // Show the modal
    document.getElementById('userModal').classList.remove('hidden');
}

function showEditUserModal(user) {
    // Populate the modal with user data
    const userRole = user.role || 'customer';
    const modalTitle = userRole === 'admin' ? 'Edit Admin' : 'Edit User';
    const buttonText = userRole === 'admin' ? 'Update Admin' : 'Update User';
    
    document.getElementById('userModalTitle').textContent = modalTitle;
    document.getElementById('userSubmitButtonText').textContent = buttonText;
    document.getElementById('userId').value = user.id || user._id;
    document.getElementById('userFirstName').value = user.firstName || '';
    document.getElementById('userLastName').value = user.lastName || '';
    document.getElementById('userEmail').value = user.email || '';
    document.getElementById('userPhone').value = user.phone || '';
    document.getElementById('userRole').value = userRole;
    
    // Hide password fields for editing (optional password change)
    document.getElementById('passwordSection').style.display = 'grid';
    document.getElementById('userPassword').required = false;
    document.getElementById('userPasswordConfirm').required = false;
    document.getElementById('userPassword').value = '';
    document.getElementById('userPasswordConfirm').value = '';
    
    // Show the modal
    document.getElementById('userModal').classList.remove('hidden');
}

function closeUserModal() {
    document.getElementById('userModal').classList.add('hidden');
    document.getElementById('userForm').reset();
}

function closeUserDetailsModal() {
    document.getElementById('userDetailsModal').classList.add('hidden');
}

async function editUserFromDetails() {
    try {
        const userId = document.getElementById('userDetailsModal').getAttribute('data-user-id');
        if (!userId) {
            showNotification('User ID not found', 'error');
            return;
        }
        
        // Fetch user data again to populate edit form
        const response = await adminAPI.request(`/users/${userId}`);
        const user = response.data.user;
        
        // Close details modal and show edit modal
        closeUserDetailsModal();
        showEditUserModal(user);
        
    } catch (error) {
        console.error('Failed to load user for editing:', error);
        showNotification('Failed to load user data for editing', 'error');
    }
}

// --- CHART MANAGEMENT ---
let salesChartInstance = null;
let categoryChartInstance = null;
let revenueChartInstance = null;

function getChartOptions(isDark) {
    const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    const textColor = isDark ? '#f3f4f6' : '#374151';
    return {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, grid: { color: gridColor }, ticks: { color: textColor } },
            x: { grid: { display: false }, ticks: { color: textColor } }
        }
    };
}

function getDoughnutChartOptions(isDark) {
    const textColor = isDark ? '#f3f4f6' : '#374151';
    return {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: { padding: 20, usePointStyle: true, color: textColor }
            }
        }
    };
}

function getCategoryColors() {
    return [
        'rgba(239, 68, 68, 0.8)',   // Red - Fixed Stand
        'rgba(34, 197, 94, 0.8)',   // Green - Stand Tilt
        'rgba(59, 130, 246, 0.8)',  // Blue - Full Motion
        'rgba(249, 115, 22, 0.8)',  // Orange - Cables
        'rgba(168, 85, 247, 0.8)',  // Purple - Ceiling Bracket
        'rgba(236, 72, 153, 0.8)',  // Pink - Gaming
        'rgba(14, 165, 233, 0.8)',  // Sky Blue - Motorized TV
        'rgba(16, 185, 129, 0.8)',  // Emerald - TV Cart
        'rgba(245, 158, 11, 0.8)'   // Amber - Video Wall
    ];
}

function getCategoryColor(categoryName) {
    const categoryColors = {
        'Fixed stand': 'rgba(239, 68, 68, 0.8)',    // Red
        'Stand Tilt': 'rgba(34, 197, 94, 0.8)',     // Green
        'Full Motion': 'rgba(59, 130, 246, 0.8)',   // Blue
        'Cables': 'rgba(249, 115, 22, 0.8)',        // Orange
        'Cable': 'rgba(249, 115, 22, 0.8)',         // Orange (singular form)
        'Ceiling Bracket': 'rgba(168, 85, 247, 0.8)', // Purple
        'Gaming': 'rgba(236, 72, 153, 0.8)',        // Pink
        'Motorized TV': 'rgba(14, 165, 233, 0.8)',  // Sky Blue
        'TV Cart': 'rgba(16, 185, 129, 0.8)',       // Emerald
        'Video Wall': 'rgba(245, 158, 11, 0.8)',    // Amber
        'Commercial': 'rgba(99, 102, 241, 0.8)',    // Indigo
        'AV Distribution': 'rgba(139, 92, 246, 0.8)', // Violet
        'Av distribution': 'rgba(139, 92, 246, 0.8)' // Violet (lowercase)
    };
    
    return categoryColors[categoryName] || 'rgba(107, 114, 128, 0.8)'; // Default gray
}

function updateChartsWithData(stats) {
    try {
        if (!stats) {
            console.warn('No stats data provided for charts');
            return;
        }

        // Update sales chart with real data
        if (salesChartInstance) {
            try {
                const orderStatusStats = stats.orders?.statusBreakdown || stats.orderStatusStats || {};
                if (Object.keys(orderStatusStats).length > 0) {
                    const orderData = Object.entries(orderStatusStats);
                    salesChartInstance.data.labels = orderData.map(([status]) => 
                        status.charAt(0).toUpperCase() + status.slice(1)
                    );
                    salesChartInstance.data.datasets[0].data = orderData.map(([, count]) => count);
                    salesChartInstance.update();
                }
            } catch (chartError) {
                console.warn('Error updating sales chart:', chartError);
            }
        }

        // Update category chart with product categories
        if (categoryChartInstance) {
            try {
                const categories = stats.products?.categories || [];
                if (categories.length > 0) {
                    const labels = categories.map(cat => cat._id || cat.name);
                    const data = categories.map(cat => cat.count);
                    const colors = labels.map(label => getCategoryColor(label));
                    
                    categoryChartInstance.data.labels = labels;
                    categoryChartInstance.data.datasets[0].data = data;
                    categoryChartInstance.data.datasets[0].backgroundColor = colors;
                    categoryChartInstance.update();
                }
            } catch (chartError) {
                console.warn('Error updating category chart:', chartError);
            }
        }
    } catch (error) {
        console.error('Error updating charts:', error);
    }
}

function initializeCharts() {
    try {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded');
            return;
        }

        const isDark = document.documentElement.classList.contains('dark');
        
        const salesCtx = document.getElementById('salesChart');
        if (salesCtx) {
            try {
                salesChartInstance = new Chart(salesCtx, {
                    type: 'line',
                    data: {
                        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                        datasets: [{
                            label: 'Sales',
                            data: [1200, 1900, 3000, 2500, 2200, 3000, 4500],
                            borderColor: 'rgb(34, 197, 94)',
                            backgroundColor: 'rgba(34, 197, 94, 0.1)',
                            tension: 0.4,
                            fill: true
                        }]
                    },
                    options: getChartOptions(isDark)
                });
            } catch (error) {
                console.error('Error creating sales chart:', error);
            }
        }

        const categoryCtx = document.getElementById('categoryChart');
        if (categoryCtx) {
            try {
                categoryChartInstance = new Chart(categoryCtx, {
                    type: 'doughnut',
                    data: {
                        labels: ['Fixed Stand', 'Stand Tilt', 'Full Motion', 'Cables', 'Ceiling Bracket', 'Gaming', 'Motorized TV', 'TV Cart', 'Video Wall'],
                        datasets: [{
                            data: [28, 15, 18, 12, 8, 6, 5, 4, 4],
                            backgroundColor: getCategoryColors(),
                            borderWidth: 2,
                            borderColor: '#ffffff',
                            hoverBorderWidth: 3,
                            hoverBorderColor: '#ffffff'
                        }]
                    },
                    options: getDoughnutChartOptions(isDark)
                });
            } catch (error) {
                console.error('Error creating category chart:', error);
            }
        }

        const revenueCtx = document.getElementById('revenueChart');
        if (revenueCtx) {
            try {
                revenueChartInstance = new Chart(revenueCtx, {
                    type: 'bar',
                    data: {
                        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                        datasets: [{
                            label: 'Revenue',
                            data: [5000, 7500, 6000, 9000, 11000, 10000],
                            backgroundColor: 'rgba(139, 92, 246, 0.6)',
                            borderColor: 'rgba(139, 92, 246, 1)',
                            borderWidth: 1
                        }]
                    },
                    options: getChartOptions(isDark)
                });
            } catch (error) {
                console.error('Error creating revenue chart:', error);
            }
        }
    } catch (error) {
        console.error('Error initializing charts:', error);
    }
}

function updateChartsTheme(isDark) {
    try {
        if (salesChartInstance) {
            salesChartInstance.options = getChartOptions(isDark);
            salesChartInstance.update();
        }
        if (categoryChartInstance) {
            categoryChartInstance.options = getDoughnutChartOptions(isDark);
            categoryChartInstance.update();
        }
        if (revenueChartInstance) {
            revenueChartInstance.options = getChartOptions(isDark);
            revenueChartInstance.update();
        }
    } catch (error) {
        console.error('Error updating chart themes:', error);
    }
}


