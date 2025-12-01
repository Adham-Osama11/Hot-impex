/**
 * Dashboard Controller
 * Manages the main dashboard functionality with enhanced live data
 */
class DashboardController {
    constructor(api) {
        this.api = api;
        this.refreshInterval = null;
        this.statsElements = {
            totalSales: document.querySelector('[data-stat="total-sales"]'),
            totalOrders: document.querySelector('[data-stat="total-orders"]'),
            totalProducts: document.querySelector('[data-stat="total-products"]'),
            totalCustomers: document.querySelector('[data-stat="total-customers"]'),
            monthlySales: document.querySelector('[data-stat="monthly-sales"]'),
            monthlyOrders: document.querySelector('[data-stat="monthly-orders"]'),
            averageOrder: document.querySelector('[data-stat="average-order"]'),
            completionRate: document.querySelector('[data-stat="completion-rate"]')
        };
        this.growthElements = {
            salesGrowth: document.querySelector('[data-growth="sales"]'),
            ordersGrowth: document.querySelector('[data-growth="orders"]'),
            customersGrowth: document.querySelector('[data-growth="customers"]')
        };
    }

    /**
     * Load and display dashboard data with auto-refresh
     */
    async loadData(autoRefresh = true) {
        try {
            UIHelpers.showLoadingState('dashboard');
            const response = await this.api.getDashboardStats();
            
            if (response.status === 'success' && response.data) {
                this.updateStats(response.data);
                this.updateGrowthIndicators(response.data);
                this.updateRecentActivities(response.data);
                this.updateAlerts(response.data);
                // ChartManager.updateChartsWithData(response.data); // Disabled - salesChart now shows product popularity
                console.log('Dashboard: Skipping chart data update to preserve product popularity chart');
                
                // Update last refresh time
                this.updateLastRefreshTime();
            } else {
                throw new Error('Invalid response format');
            }
            
            UIHelpers.hideLoadingState();
            
            // Set up auto-refresh every 30 seconds
            if (autoRefresh && !this.refreshInterval) {
                this.refreshInterval = setInterval(() => this.loadData(false), 30000);
            }
            
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            UIHelpers.showErrorState('Failed to load dashboard data');
        }
    }

    /**
     * Update dashboard statistics with enhanced data
     * @param {object} data - Statistics data with nested structure
     */
    updateStats(data) {
        const orders = data.orders || {};
        const products = data.products || {};
        const users = data.users || {};
        
        // Update main stats
        if (this.statsElements.totalSales) {
            const totalRevenue = orders.totalRevenue || 0;
            this.statsElements.totalSales.textContent = `$${totalRevenue.toLocaleString()}`;
        }
        
        if (this.statsElements.totalOrders) {
            const totalOrders = orders.total || 0;
            this.statsElements.totalOrders.textContent = totalOrders.toLocaleString();
        }
        
        if (this.statsElements.totalProducts) {
            const totalProducts = products.total || 0;
            this.statsElements.totalProducts.textContent = totalProducts.toLocaleString();
        }
        
        if (this.statsElements.totalCustomers) {
            const totalUsers = users.total || 0;
            this.statsElements.totalCustomers.textContent = totalUsers.toLocaleString();
        }

        // Update additional stats if elements exist
        if (this.statsElements.monthlySales) {
            const monthlyRevenue = orders.monthlyRevenue || 0;
            this.statsElements.monthlySales.textContent = `$${monthlyRevenue.toLocaleString()}`;
        }

        if (this.statsElements.monthlyOrders) {
            const monthlyOrders = orders.monthlyOrders || 0;
            this.statsElements.monthlyOrders.textContent = monthlyOrders.toLocaleString();
        }

        if (this.statsElements.averageOrder) {
            const avgOrder = orders.averageOrderValue || 0;
            this.statsElements.averageOrder.textContent = `$${avgOrder.toFixed(2)}`;
        }

        if (this.statsElements.completionRate) {
            const completionRate = orders.completionRate || 0;
            this.statsElements.completionRate.textContent = `${completionRate}%`;
        }

        // Update in-stock products stat
        const inStockElement = document.querySelector('[data-stat="in-stock"]');
        if (inStockElement) {
            const inStock = products.inStock || 0;
            inStockElement.textContent = inStock.toLocaleString();
        }
    }

    /**
     * Update growth indicators with percentage changes
     * @param {object} data - Statistics data
     */
    updateGrowthIndicators(data) {
        const orders = data.orders || {};
        const users = data.users || {};
        
        // Revenue growth
        if (this.growthElements.salesGrowth) {
            const revenueGrowth = orders.revenueGrowthPercentage || 0;
            this.updateGrowthElement(this.growthElements.salesGrowth, revenueGrowth);
        }

        // Orders growth
        if (this.growthElements.ordersGrowth) {
            const ordersGrowth = orders.orderGrowthPercentage || 0;
            this.updateGrowthElement(this.growthElements.ordersGrowth, ordersGrowth);
        }

        // Customers growth
        if (this.growthElements.customersGrowth) {
            const customersGrowth = users.growthPercentage || 0;
            this.updateGrowthElement(this.growthElements.customersGrowth, customersGrowth);
        }
    }

    /**
     * Update individual growth element
     * @param {HTMLElement} element - Growth element
     * @param {number} percentage - Growth percentage
     */
    updateGrowthElement(element, percentage) {
        if (!element) return;
        
        const isPositive = percentage >= 0;
        const icon = isPositive ? '↗️' : '↘️';
        const colorClass = isPositive ? 'text-green-600' : 'text-red-600';
        
        element.textContent = `${icon} ${Math.abs(percentage)}%`;
        element.className = `${colorClass} text-sm font-medium`;
    }

    /**
     * Update recent activities section with live data
     * @param {object} data - Statistics data
     */
    updateRecentActivities(data) {
        const activitiesContainer = document.querySelector('#recent-activities');
        if (!activitiesContainer || !data.recentActivity) return;

        const activities = data.recentActivity.activities || [];
        
        const activitiesHTML = activities.map(activity => {
            const timeAgo = this.getTimeAgo(new Date(activity.time));
            const amountDisplay = activity.amount ? `<span class="font-medium ${activity.color === 'green' ? 'text-green-600' : ''}">${activity.amount}</span>` : '';
            
            return `
                <div class="flex items-center space-x-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg">
                    <div class="flex-shrink-0">
                        <div class="w-8 h-8 bg-${activity.color}-100 dark:bg-${activity.color}-900 text-${activity.color}-600 rounded-full flex items-center justify-center">
                            <i class="fas fa-${activity.icon} text-sm"></i>
                        </div>
                    </div>
                    <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-gray-900 dark:text-white">${activity.title}</p>
                        <p class="text-sm text-gray-500 dark:text-gray-400 truncate">${activity.description}</p>
                    </div>
                    <div class="flex-shrink-0 text-right">
                        ${amountDisplay}
                        <p class="text-xs text-gray-400">${timeAgo}</p>
                    </div>
                </div>
            `;
        }).join('');

        activitiesContainer.innerHTML = activitiesHTML || '<p class="text-gray-500 text-center py-4">No recent activity</p>';
    }

    /**
     * Update alerts section with low stock and other notifications
     * @param {object} data - Statistics data
     */
    updateAlerts(data) {
        const alertsContainer = document.querySelector('#dashboard-alerts');
        if (!alertsContainer) return;

        const products = data.products || {};
        const orders = data.orders || {};
        const alerts = [];

        // Low stock alert
        if (products.lowStock > 0) {
            alerts.push({
                type: 'warning',
                icon: 'exclamation-triangle',
                title: 'Low Stock Alert',
                message: `${products.lowStock} products are running low on stock`,
                action: 'View Products'
            });
        }

        // Pending orders alert
        if (orders.pending > 10) {
            alerts.push({
                type: 'info',
                icon: 'clock',
                title: 'Pending Orders',
                message: `${orders.pending} orders are waiting for processing`,
                action: 'View Orders'
            });
        }

        if (alerts.length === 0) {
            alertsContainer.innerHTML = '<p class="text-gray-500 text-center py-4">No alerts</p>';
            return;
        }

        const alertsHTML = alerts.map(alert => `
            <div class="flex items-center justify-between p-3 bg-${alert.type === 'warning' ? 'yellow' : 'blue'}-50 dark:bg-${alert.type === 'warning' ? 'yellow' : 'blue'}-900/20 rounded-lg">
                <div class="flex items-center space-x-3">
                    <i class="fas fa-${alert.icon} text-${alert.type === 'warning' ? 'yellow' : 'blue'}-600"></i>
                    <div>
                        <p class="font-medium text-black dark:text-black">${alert.title}</p>
                        <p class="text-sm text-black dark:text-black">${alert.message}</p>
                    </div>
                </div>
                <button onclick="navigateToSection('${alert.type === 'warning' ? 'products' : 'orders'}')" class="text-${alert.type === 'warning' ? 'yellow' : 'blue'}-600 hover:text-${alert.type === 'warning' ? 'yellow' : 'blue'}-800 font-medium text-sm hover:underline transition-all duration-200">
                    ${alert.action}
                </button>
            </div>
        `).join('');

        alertsContainer.innerHTML = alertsHTML;
    }

    /**
     * Update last refresh time display
     */
    updateLastRefreshTime() {
        const refreshElement = document.querySelector('#last-refresh-time');
        if (refreshElement) {
            const now = new Date();
            refreshElement.textContent = `Last updated: ${now.toLocaleTimeString()}`;
        }
    }

    /**
     * Get time ago string for activities
     * @param {Date} date - Date to compare
     * @returns {string} Time ago string
     */
    getTimeAgo(date) {
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Just now';
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    }

    /**
     * Cleanup method to clear intervals
     */
    destroy() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }
}

/**
 * Global function to navigate between admin sections
 * @param {string} section - The section to navigate to
 */
function navigateToSection(section) {
    // Find the target sidebar link and trigger a click
    const sidebarLink = document.querySelector(`[data-section="${section}"]`);
    if (sidebarLink) {
        sidebarLink.click();
        
        // Add visual feedback
        const notification = document.createElement('div');
        notification.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50 transition-all duration-300';
        notification.innerHTML = `
            <div class="flex items-center space-x-2">
                <i class="fas fa-check-circle"></i>
                <span>Navigated to ${section.charAt(0).toUpperCase() + section.slice(1)}</span>
            </div>
        `;
        document.body.appendChild(notification);
        
        // Remove notification after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    } else {
        console.warn(`Section "${section}" not found`);
    }
}

// Make navigateToSection available globally
window.navigateToSection = navigateToSection;

// Export the controller
window.DashboardController = DashboardController;
