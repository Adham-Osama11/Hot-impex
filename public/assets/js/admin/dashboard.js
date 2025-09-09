/**
 * Dashboard Controller
 * Manages the main dashboard functionality
 */
class DashboardController {
    constructor(api) {
        this.api = api;
        this.statsElements = {
            totalSales: document.querySelector('[data-stat="total-sales"]'),
            totalOrders: document.querySelector('[data-stat="total-orders"]'),
            totalProducts: document.querySelector('[data-stat="total-products"]'),
            totalCustomers: document.querySelector('[data-stat="total-customers"]')
        };
    }

    /**
     * Load and display dashboard data
     */
    async loadData() {
        try {
            UIHelpers.showLoadingState('dashboard');
            const response = await this.api.getDashboardStats();
            
            if (response.status === 'success' && response.data) {
                this.updateStats(response.data);
                ChartManager.updateChartsWithData(response.data);
            } else {
                throw new Error('Invalid response format');
            }
            
            UIHelpers.hideLoadingState();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            UIHelpers.showErrorState('Failed to load dashboard data');
        }
    }

    /**
     * Update dashboard statistics
     * @param {object} data - Statistics data with nested structure
     */
    updateStats(data) {
        // Extract data from the nested structure
        const orders = data.orders || {};
        const products = data.products || {};
        const users = data.users || {};
        
        // Update total sales (revenue)
        if (this.statsElements.totalSales) {
            const totalRevenue = orders.totalRevenue || 0;
            this.statsElements.totalSales.textContent = `$${totalRevenue.toLocaleString()}`;
        }
        
        // Update total orders
        if (this.statsElements.totalOrders) {
            const totalOrders = orders.total || 0;
            this.statsElements.totalOrders.textContent = totalOrders.toLocaleString();
        }
        
        // Update total products
        if (this.statsElements.totalProducts) {
            const totalProducts = products.total || 0;
            this.statsElements.totalProducts.textContent = totalProducts.toLocaleString();
        }
        
        // Update total customers
        if (this.statsElements.totalCustomers) {
            const totalUsers = users.total || 0;
            this.statsElements.totalCustomers.textContent = totalUsers.toLocaleString();
        }

        this.updateRecentActivities(data);
    }

    /**
     * Update recent activities section
     * @param {object} data - Statistics data with nested structure
     */
    updateRecentActivities(data) {
        const activitiesContainer = document.querySelector('#recent-activities');
        if (!activitiesContainer) return;

        // Extract data from nested structure
        const orders = data.orders || {};
        const products = data.products || {};
        const users = data.users || {};

        const activities = [
            {
                type: 'order',
                message: `${orders.monthlyOrders || 0} new orders in the last 30 days`,
                time: 'Recent',
                value: `+$${(orders.totalRevenue || 0).toLocaleString()}`,
                icon: 'check',
                color: 'green'
            },
            {
                type: 'products',
                message: `${products.total || 0} products in catalog`,
                time: 'Current',
                value: `${products.featured || 0} featured`,
                icon: 'package',
                color: 'blue'
            },
            {
                type: 'customers',
                message: `${users.total || 0} registered customers`,
                time: 'Total',
                value: `${users.recentSignups || 0} new this month`,
                icon: 'users',
                color: 'purple'
            }
        ];

        // Here you would update the activities display
        // This can be expanded based on your specific UI requirements
    }
}

// Export the controller
window.DashboardController = DashboardController;
