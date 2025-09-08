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
            const statsData = await this.api.getDashboardStats();
            this.updateStats(statsData.data.stats);
            ChartManager.updateChartsWithData(statsData.data.stats);
            UIHelpers.hideLoadingState();
        } catch (error) {
            console.error('Failed to load dashboard data:', error);
            UIHelpers.showErrorState('Failed to load dashboard data');
        }
    }

    /**
     * Update dashboard statistics
     * @param {object} stats - Statistics data
     */
    updateStats(stats) {
        if (this.statsElements.totalSales) {
            this.statsElements.totalSales.textContent = `$${stats.totalRevenue.toLocaleString()}`;
        }
        if (this.statsElements.totalOrders) {
            this.statsElements.totalOrders.textContent = stats.totalOrders.toLocaleString();
        }
        if (this.statsElements.totalProducts) {
            this.statsElements.totalProducts.textContent = stats.totalProducts.toLocaleString();
        }
        if (this.statsElements.totalCustomers) {
            this.statsElements.totalCustomers.textContent = stats.totalUsers.toLocaleString();
        }

        this.updateRecentActivities(stats);
    }

    /**
     * Update recent activities section
     * @param {object} stats - Statistics data
     */
    updateRecentActivities(stats) {
        const activitiesContainer = document.querySelector('#recent-activities');
        if (!activitiesContainer) return;

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
                value: `${stats.topProducts?.length || 0} top sellers`,
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

        // Here you would update the activities display
        // This can be expanded based on your specific UI requirements
    }
}

// Export the controller
window.DashboardController = DashboardController;
