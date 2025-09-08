// --- API CLIENT ---
class AdminAPI {
    constructor() {
        this.baseURL = '/api/admin';
        this.token = localStorage.getItem('adminToken');
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        if (this.token) {
            config.headers.Authorization = `Bearer ${this.token}`;
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Request failed');
            }

            return data;
        } catch (error) {
            console.error('API Request failed:', error);
            throw error;
        }
    }

    // Dashboard Stats
    async getDashboardStats() {
        return this.request('/stats');
    }

    // Orders
    async getAllOrders(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/orders${queryString ? `?${queryString}` : ''}`);
    }

    // Users
    async getAllUsers(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/users${queryString ? `?${queryString}` : ''}`);
    }

    // Products
    async createProduct(productData) {
        return this.request('/products', {
            method: 'POST',
            body: JSON.stringify(productData)
        });
    }

    async updateProduct(id, productData) {
        return this.request(`/products/${id}`, {
            method: 'PUT',
            body: JSON.stringify(productData)
        });
    }

    async deleteProduct(id) {
        return this.request(`/products/${id}`, {
            method: 'DELETE'
        });
    }

    async getProducts() {
        return this.request('/api/products');
    }
}

// Initialize API client
const adminAPI = new AdminAPI();

document.addEventListener('DOMContentLoaded', function() {
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
        showLoadingState();
        const statsData = await adminAPI.getDashboardStats();
        updateDashboardStats(statsData.data.stats);
        updateChartsWithData(statsData.data.stats);
        hideLoadingState();
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showErrorState('Failed to load dashboard data');
    }
}

async function loadOrdersData() {
    try {
        showLoadingState();
        const ordersData = await adminAPI.getAllOrders({ limit: 50 });
        updateOrdersTable(ordersData.data.orders);
        hideLoadingState();
    } catch (error) {
        console.error('Failed to load orders data:', error);
        showErrorState('Failed to load orders data');
    }
}

async function loadUsersData() {
    try {
        showLoadingState();
        const usersData = await adminAPI.getAllUsers({ role: 'customer', limit: 50 });
        updateUsersTable(usersData.data.users);
        hideLoadingState();
    } catch (error) {
        console.error('Failed to load users data:', error);
        showErrorState('Failed to load users data');
    }
}

async function loadProductsData() {
    try {
        showLoadingState();
        const productsResponse = await fetch('/api/products');
        const productsData = await productsResponse.json();
        updateProductsTable(productsData.data.products);
        hideLoadingState();
    } catch (error) {
        console.error('Failed to load products data:', error);
        showErrorState('Failed to load products data');
    }
}

// --- UPDATE FUNCTIONS ---
function updateDashboardStats(stats) {
    // Update stat cards
    const statsElements = {
        totalSales: document.querySelector('[data-stat="total-sales"]'),
        totalOrders: document.querySelector('[data-stat="total-orders"]'),
        totalProducts: document.querySelector('[data-stat="total-products"]'),
        totalCustomers: document.querySelector('[data-stat="total-customers"]')
    };

    if (statsElements.totalSales) {
        statsElements.totalSales.textContent = `$${stats.totalRevenue.toLocaleString()}`;
    }
    if (statsElements.totalOrders) {
        statsElements.totalOrders.textContent = stats.totalOrders.toLocaleString();
    }
    if (statsElements.totalProducts) {
        statsElements.totalProducts.textContent = stats.totalProducts.toLocaleString();
    }
    if (statsElements.totalCustomers) {
        statsElements.totalCustomers.textContent = stats.totalUsers.toLocaleString();
    }

    // Update recent activities
    updateRecentActivities(stats);
}

function updateOrdersTable(orders) {
    const tableBody = document.querySelector('#orders-section tbody');
    if (!tableBody) return;

    tableBody.innerHTML = orders.map(order => `
        <tr class="border-b border-white/10 dark:border-gray-700/50 hover:bg-white/5 dark:hover:bg-gray-800/20">
            <td class="px-6 py-4 font-medium">#${order.id}</td>
            <td class="px-6 py-4">${order.userEmail || 'Guest'}</td>
            <td class="px-6 py-4">${new Date(order.createdAt).toLocaleDateString()}</td>
            <td class="px-6 py-4">$${order.totalAmount.toFixed(2)}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 font-semibold leading-tight rounded-full ${getStatusColor(order.status)}">
                    ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                </span>
            </td>
            <td class="px-6 py-4 text-right">
                <button onclick="viewOrder('${order.id}')" class="text-blue-500 hover:text-blue-400">View</button>
            </td>
        </tr>
    `).join('');
}

function updateUsersTable(users) {
    const tableBody = document.querySelector('#customers-section tbody');
    if (!tableBody) return;

    tableBody.innerHTML = users.map(user => `
        <tr class="border-b border-white/10 dark:border-gray-700/50 hover:bg-white/5 dark:hover:bg-gray-800/20">
            <td class="px-6 py-4 font-medium">${user.name}</td>
            <td class="px-6 py-4">${user.email}</td>
            <td class="px-6 py-4">$${(user.totalSpent || 0).toFixed(2)}</td>
            <td class="px-6 py-4">${new Date(user.createdAt).toLocaleDateString()}</td>
            <td class="px-6 py-4 text-right space-x-2">
                <button onclick="viewUser('${user.id}')" class="text-blue-500 hover:text-blue-400">View</button>
                <button onclick="deleteUser('${user.id}')" class="text-red-500 hover:text-red-400">Remove</button>
            </td>
        </tr>
    `).join('');
}

function updateProductsTable(products) {
    const tableBody = document.querySelector('#products-section tbody');
    if (!tableBody) return;

    tableBody.innerHTML = products.map(product => `
        <tr class="border-b border-white/10 dark:border-gray-700/50 hover:bg-white/5 dark:hover:bg-gray-800/20">
            <td class="px-6 py-4 font-medium whitespace-nowrap">${product.name}</td>
            <td class="px-6 py-4">${product.category}</td>
            <td class="px-6 py-4">$${product.price.toFixed(2)}</td>
            <td class="px-6 py-4">${product.stock || 'N/A'}</td>
            <td class="px-6 py-4 text-right space-x-2">
                <button onclick="editProduct('${product.id}')" class="text-blue-500 hover:text-blue-400">Edit</button>
                <button onclick="deleteProduct('${product.id}')" class="text-red-500 hover:text-red-400">Delete</button>
            </td>
        </tr>
    `).join('');
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

function showLoadingState() {
    // Add loading indicators
    const loadingHTML = '<div class="flex justify-center items-center py-8"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div></div>';
    
    document.querySelectorAll('.admin-section:not(.hidden) tbody').forEach(tbody => {
        if (tbody) tbody.innerHTML = loadingHTML;
    });
}

function hideLoadingState() {
    // Loading states will be replaced by actual content
}

function showErrorState(message) {
    const errorHTML = `<div class="flex justify-center items-center py-8 text-red-500">${message}</div>`;
    
    document.querySelectorAll('.admin-section:not(.hidden) tbody').forEach(tbody => {
        if (tbody) tbody.innerHTML = errorHTML;
    });
}

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
        // Implement user detail view
        alert(`Viewing user ${userId} - Feature to be implemented`);
    } catch (error) {
        console.error('Failed to view user:', error);
        alert('Failed to load user details');
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
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const formData = new FormData(this);
            const productData = {
                name: formData.get('name'),
                category: formData.get('category'),
                price: parseFloat(formData.get('price')),
                stock: parseInt(formData.get('stock')) || 0,
                description: formData.get('description'),
                images: formData.get('images') ? formData.get('images').split('\n').filter(img => img.trim()) : []
            };
            
            const productId = formData.get('id');
            
            try {
                let result;
                if (productId) {
                    // Update existing product
                    result = await adminAPI.updateProduct(productId, productData);
                } else {
                    // Create new product
                    result = await adminAPI.createProduct(productData);
                }
                
                closeProductModal();
                await loadProductsData(); // Reload products table
                alert(productId ? 'Product updated successfully!' : 'Product added successfully!');
            } catch (error) {
                console.error('Failed to save product:', error);
                alert('Failed to save product: ' + error.message);
            }
        });
    }
});

async function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    
    try {
        await adminAPI.deleteProduct(productId);
        await loadProductsData(); // Reload products
        alert('Product deleted successfully');
    } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product');
    }
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to remove this user?')) return;
    
    try {
        // Implement user deletion
        alert(`Deleting user ${userId} - Feature to be implemented`);
    } catch (error) {
        console.error('Failed to delete user:', error);
        alert('Failed to delete user');
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

function updateChartsWithData(stats) {
    // Update sales chart with real data
    if (salesChartInstance && stats.orderStatusStats) {
        const orderData = Object.entries(stats.orderStatusStats);
        salesChartInstance.data.labels = orderData.map(([status]) => status.charAt(0).toUpperCase() + status.slice(1));
        salesChartInstance.data.datasets[0].data = orderData.map(([, count]) => count);
        salesChartInstance.update();
    }

    // Update category chart with product categories
    if (categoryChartInstance && stats.topProducts) {
        const topProducts = stats.topProducts.slice(0, 5);
        categoryChartInstance.data.labels = topProducts.map(product => product.productName);
        categoryChartInstance.data.datasets[0].data = topProducts.map(product => product.sales);
        categoryChartInstance.update();
    }
}

function initializeCharts() {
    const isDark = document.documentElement.classList.contains('dark');
    
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx) {
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
    }

    const categoryCtx = document.getElementById('categoryChart');
    if (categoryCtx) {
        categoryChartInstance = new Chart(categoryCtx, {
            type: 'doughnut',
            data: {
                labels: ['Active', 'Bio', 'Limited', 'Kids'],
                datasets: [{
                    data: [35, 25, 25, 15],
                    backgroundColor: ['rgba(59, 130, 246, 0.8)', 'rgba(34, 197, 94, 0.8)', 'rgba(13, 148, 136, 0.8)', 'rgba(249, 115, 22, 0.8)'],
                    borderWidth: 0
                }]
            },
            options: getDoughnutChartOptions(isDark)
        });
    }

    const revenueCtx = document.getElementById('revenueChart');
    if (revenueCtx) {
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
    }
}

function updateChartsTheme(isDark) {
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
}
