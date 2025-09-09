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

        // Ensure chartManager instance exists
        if (!window.chartManager) {
            window.chartManager = new ChartManager();
        }

        const isDark = document.documentElement.classList.contains('dark');
        
        // Destroy existing charts if they exist
        ChartManager.destroyAllCharts();
        
        // Initialize sales chart
        const salesCtx = document.getElementById('salesChart');
        if (salesCtx) {
            // Reset canvas dimensions
            salesCtx.style.width = '';
            salesCtx.style.height = '';
            
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
            // Reset canvas dimensions
            categoryCtx.style.width = '';
            categoryCtx.style.height = '';
            
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
            // Reset canvas dimensions
            revenueCtx.style.width = '';
            revenueCtx.style.height = '';
            
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
     * Destroy all existing charts
     */
    static destroyAllCharts() {
        if (window.chartManager) {
            if (window.chartManager.salesChartInstance) {
                window.chartManager.salesChartInstance.destroy();
                window.chartManager.salesChartInstance = null;
            }
            if (window.chartManager.categoryChartInstance) {
                window.chartManager.categoryChartInstance.destroy();
                window.chartManager.categoryChartInstance = null;
            }
            if (window.chartManager.revenueChartInstance) {
                window.chartManager.revenueChartInstance.destroy();
                window.chartManager.revenueChartInstance = null;
            }
        }
    }

    /**
     * Update charts with real data
     * @param {object} data - Statistics data with nested structure
     */
    static updateChartsWithData(data) {
        // Extract data from nested structure
        const orders = data.orders || {};
        const products = data.products || {};
        
        // Update sales chart with recent sales data (mock data since we don't have time series)
        if (window.chartManager && window.chartManager.salesChartInstance) {
            // Generate mock weekly data based on total revenue
            const totalRevenue = orders.totalRevenue || 0;
            const dailyAverage = totalRevenue / 30; // Assume 30 days
            const mockWeeklyData = [
                Math.round(dailyAverage * 0.8),
                Math.round(dailyAverage * 1.2),
                Math.round(dailyAverage * 1.5),
                Math.round(dailyAverage * 1.1),
                Math.round(dailyAverage * 0.9),
                Math.round(dailyAverage * 1.3),
                Math.round(dailyAverage * 1.6)
            ];
            
            window.chartManager.salesChartInstance.data.datasets[0].data = mockWeeklyData;
            window.chartManager.salesChartInstance.update('none'); // Disable animation to prevent resize issues
        }

        // Update category chart with product categories
        if (window.chartManager && window.chartManager.categoryChartInstance && products.categories) {
            const categories = products.categories || [];
            window.chartManager.categoryChartInstance.data.labels = categories.map(cat => cat._id);
            window.chartManager.categoryChartInstance.data.datasets[0].data = categories.map(cat => cat.count);
            window.chartManager.categoryChartInstance.update('none'); // Disable animation to prevent resize issues
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
            maintainAspectRatio: true,
            aspectRatio: 2,
            resizeDelay: 200,
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
            },
            layout: {
                padding: {
                    top: 10,
                    bottom: 10
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
            maintainAspectRatio: true,
            aspectRatio: 1,
            resizeDelay: 200,
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
            },
            layout: {
                padding: {
                    top: 10,
                    bottom: 10
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
