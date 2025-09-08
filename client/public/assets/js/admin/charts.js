/**
 * Chart Manager
 * Handles all chart-related functionality
 */
class ChartManager {
    constructor() {
        this.salesChartInstance = null;
        this.categoryChartInstance = null;
        this.revenueChartInstance = null;
    }

    /**
     * Initialize all charts
     */
    static initialize() {
        if (typeof Chart === 'undefined') {
            console.warn('Chart.js not loaded');
            return;
        }

        const isDark = document.documentElement.classList.contains('dark');
        
        // Initialize sales chart
        const salesCtx = document.getElementById('salesChart');
        if (salesCtx) {
            window.chartManager.salesChartInstance = new Chart(salesCtx, {
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
                options: ChartManager.getChartOptions(isDark)
            });
        }

        // Initialize category chart
        const categoryCtx = document.getElementById('categoryChart');
        if (categoryCtx) {
            window.chartManager.categoryChartInstance = new Chart(categoryCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Gaming', 'Electronics', 'Commercial', 'Cables'],
                    datasets: [{
                        data: [35, 25, 25, 15],
                        backgroundColor: [
                            'rgba(59, 130, 246, 0.8)', 
                            'rgba(34, 197, 94, 0.8)', 
                            'rgba(13, 148, 136, 0.8)', 
                            'rgba(249, 115, 22, 0.8)'
                        ],
                        borderWidth: 0
                    }]
                },
                options: ChartManager.getDoughnutChartOptions(isDark)
            });
        }

        // Initialize revenue chart
        const revenueCtx = document.getElementById('revenueChart');
        if (revenueCtx) {
            window.chartManager.revenueChartInstance = new Chart(revenueCtx, {
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
                options: ChartManager.getChartOptions(isDark)
            });
        }
    }

    /**
     * Update charts with real data
     * @param {object} stats - Statistics data
     */
    static updateChartsWithData(stats) {
        // Update sales chart with order status data
        if (window.chartManager.salesChartInstance && stats.orderStatusStats) {
            const orderData = Object.entries(stats.orderStatusStats);
            window.chartManager.salesChartInstance.data.labels = orderData.map(([status]) => 
                status.charAt(0).toUpperCase() + status.slice(1)
            );
            window.chartManager.salesChartInstance.data.datasets[0].data = orderData.map(([, count]) => count);
            window.chartManager.salesChartInstance.update();
        }

        // Update category chart with top products
        if (window.chartManager.categoryChartInstance && stats.topProducts) {
            const topProducts = stats.topProducts.slice(0, 5);
            window.chartManager.categoryChartInstance.data.labels = topProducts.map(product => 
                product.productName.length > 15 ? 
                product.productName.substring(0, 15) + '...' : 
                product.productName
            );
            window.chartManager.categoryChartInstance.data.datasets[0].data = topProducts.map(product => product.sales);
            window.chartManager.categoryChartInstance.update();
        }
    }

    /**
     * Update charts theme
     * @param {boolean} isDark - Whether dark mode is enabled
     */
    static updateTheme(isDark) {
        if (window.chartManager.salesChartInstance) {
            window.chartManager.salesChartInstance.options = ChartManager.getChartOptions(isDark);
            window.chartManager.salesChartInstance.update();
        }
        if (window.chartManager.categoryChartInstance) {
            window.chartManager.categoryChartInstance.options = ChartManager.getDoughnutChartOptions(isDark);
            window.chartManager.categoryChartInstance.update();
        }
        if (window.chartManager.revenueChartInstance) {
            window.chartManager.revenueChartInstance.options = ChartManager.getChartOptions(isDark);
            window.chartManager.revenueChartInstance.update();
        }
    }

    /**
     * Get chart options for line/bar charts
     * @param {boolean} isDark - Whether dark mode is enabled
     * @returns {object} - Chart options
     */
    static getChartOptions(isDark) {
        const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDark ? '#f3f4f6' : '#374151';
        
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { 
                legend: { 
                    display: false 
                },
                tooltip: {
                    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    titleColor: textColor,
                    bodyColor: textColor,
                    borderColor: gridColor,
                    borderWidth: 1
                }
            },
            scales: {
                y: { 
                    beginAtZero: true, 
                    grid: { color: gridColor }, 
                    ticks: { color: textColor }
                },
                x: { 
                    grid: { display: false }, 
                    ticks: { color: textColor }
                }
            }
        };
    }

    /**
     * Get doughnut chart options
     * @param {boolean} isDark - Whether dark mode is enabled
     * @returns {object} - Chart options
     */
    static getDoughnutChartOptions(isDark) {
        const textColor = isDark ? '#f3f4f6' : '#374151';
        
        return {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { 
                        padding: 20, 
                        usePointStyle: true, 
                        color: textColor,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: isDark ? 'rgba(0, 0, 0, 0.8)' : 'rgba(255, 255, 255, 0.8)',
                    titleColor: textColor,
                    bodyColor: textColor
                }
            }
        };
    }

    /**
     * Destroy all chart instances
     */
    static destroyAll() {
        if (window.chartManager.salesChartInstance) {
            window.chartManager.salesChartInstance.destroy();
        }
        if (window.chartManager.categoryChartInstance) {
            window.chartManager.categoryChartInstance.destroy();
        }
        if (window.chartManager.revenueChartInstance) {
            window.chartManager.revenueChartInstance.destroy();
        }
    }
}

// Initialize global chart manager instance
window.chartManager = new ChartManager();

// Export the class
window.ChartManager = ChartManager;
