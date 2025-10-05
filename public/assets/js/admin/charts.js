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
        
        // Initialize product popularity chart (formerly sales chart)
        const salesCtx = document.getElementById('salesChart');
        if (salesCtx) {
            // Reset canvas dimensions
            salesCtx.style.width = '';
            salesCtx.style.height = '';
            
            // Ensure analytics service is available and has data
            if (typeof AnalyticsService !== 'undefined') {
                // Generate sample data if no data exists
                const analytics = AnalyticsService.getAnalytics();
                if (Object.keys(analytics.productVisits).length === 0) {
                    console.log('No analytics data found, generating sample data...');
                    AnalyticsService.generateSampleData();
                }
            }
            
            const popularityData = ChartManager.getProductPopularityData();
            
            window.chartManager.salesChartInstance = new Chart(salesCtx, {
                type: 'bar', // Changed from 'line' to 'bar'
                data: popularityData,
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1.8, // Make it wider to accommodate product names
                    indexAxis: 'y', // Make it horizontal bar chart
                    resizeDelay: 200,
                    plugins: {
                        legend: {
                            display: false // Hide legend since we only have one dataset
                        },
                        tooltip: {
                            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.9)' : 'rgba(255, 255, 255, 0.95)',
                            titleColor: isDark ? '#f3f4f6' : '#374151',
                            bodyColor: isDark ? '#f3f4f6' : '#374151',
                            borderColor: isDark ? '#374151' : '#e5e7eb',
                            borderWidth: 1,
                            cornerRadius: 8,
                            displayColors: false,
                            callbacks: {
                                title: function(context) {
                                    return context[0].label;
                                },
                                label: function(context) {
                                    const visits = context.parsed.x;
                                    return `${visits} visit${visits !== 1 ? 's' : ''}`;
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            beginAtZero: true,
                            title: {
                                display: true,
                                text: 'Page Visits',
                                color: isDark ? '#f3f4f6' : '#374151',
                                font: {
                                    size: 14,
                                    weight: 'bold'
                                }
                            },
                            ticks: {
                                stepSize: 1, // Ensure integer steps for visit counts
                                color: isDark ? '#9ca3af' : '#6b7280',
                                font: {
                                    size: 12
                                }
                            },
                            grid: {
                                color: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
                                drawBorder: false
                            }
                        },
                        y: {
                            ticks: {
                                color: isDark ? '#f3f4f6' : '#374151',
                                font: {
                                    size: 11,
                                    weight: '500'
                                },
                                maxRotation: 0,
                                callback: function(value, index, values) {
                                    const label = this.getLabelForValue(value);
                                    // Truncate long product names for display
                                    return label.length > 25 ? label.substring(0, 25) + '...' : label;
                                }
                            },
                            grid: {
                                display: false
                            }
                        }
                    },
                    layout: {
                        padding: {
                            left: 10,
                            right: 20,
                            top: 10,
                            bottom: 10
                        }
                    }
                }
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
                    labels: ['Fixed Stand', 'Stand Tilt', 'Full Motion', 'Cables', 'Ceiling Bracket', 'Gaming', 'Motorized TV', 'TV Cart', 'Video Wall'],
                    datasets: [{
                        data: [28, 15, 18, 12, 8, 6, 5, 4, 4],
                        backgroundColor: ChartManager.getCategoryColors(),
                        borderWidth: 2,
                        borderColor: '#ffffff',
                        hoverBorderWidth: 3,
                        hoverBorderColor: '#ffffff'
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
        
        console.log('Updating charts with data:', { orders, products });
        
        // Skip updating the sales chart since it's now showing product popularity
        // The salesChart is now used for product popularity, not sales data
        console.log('Skipping sales chart update - chart now shows product popularity');
        
        // If you want to update the product popularity chart with fresh data, use this instead:
        if (window.chartManager && window.chartManager.salesChartInstance) {
            console.log('Refreshing product popularity chart...');
            ChartManager.updateProductPopularityChart();
        }

        // Update category chart with product categories
        if (window.chartManager && window.chartManager.categoryChartInstance && products.categories) {
            const categories = products.categories || [];
            const labels = categories.map(cat => cat._id);
            const data = categories.map(cat => cat.count);
            const colors = labels.map(label => ChartManager.getCategoryColor(label));
            
            window.chartManager.categoryChartInstance.data.labels = labels;
            window.chartManager.categoryChartInstance.data.datasets[0].data = data;
            window.chartManager.categoryChartInstance.data.datasets[0].backgroundColor = colors;
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
     * Get unique colors for product categories
     * @returns {array} - Array of colors for categories
     */
    static getCategoryColors() {
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

    /**
     * Get color for a specific category
     * @param {string} categoryName - Category name
     * @returns {string} - Color for the category
     */
    static getCategoryColor(categoryName) {
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
     * Get product popularity data for chart
     * @returns {object} - Chart data with labels and datasets
     */
    static getProductPopularityData() {
        console.log('Getting product popularity data...');
        console.log('AnalyticsService available:', typeof AnalyticsService !== 'undefined');
        
        // Check if AnalyticsService is available
        if (typeof AnalyticsService === 'undefined') {
            console.warn('AnalyticsService not available, using sample data');
            return {
                labels: ['Sample Product 1', 'Sample Product 2', 'Sample Product 3', 'Sample Product 4', 'Sample Product 5'],
                datasets: [{
                    label: 'Page Visits',
                    data: [5, 3, 2, 1, 1],
                    backgroundColor: [
                        'rgba(59, 130, 246, 0.8)',
                        'rgba(34, 197, 94, 0.8)', 
                        'rgba(249, 115, 22, 0.8)',
                        'rgba(168, 85, 247, 0.8)',
                        'rgba(236, 72, 153, 0.8)'
                    ],
                    borderColor: [
                        'rgb(59, 130, 246)',
                        'rgb(34, 197, 94)',
                        'rgb(249, 115, 22)',
                        'rgb(168, 85, 247)',
                        'rgb(236, 72, 153)'
                    ],
                    borderWidth: 2
                }]
            };
        }

        const chartData = AnalyticsService.getTopProductsChartData(10); // Get top 10 products
        console.log('Chart data received:', chartData);
        
        if (chartData.labels.length === 0) {
            console.log('No visit data, showing placeholder');
            // No visit data yet, show placeholder
            return {
                labels: ['No visit data yet'],
                datasets: [{
                    label: 'Page Visits',
                    data: [0],
                    backgroundColor: ['rgba(156, 163, 175, 0.8)'],
                    borderColor: ['rgb(156, 163, 175)'],
                    borderWidth: 2
                }]
            };
        }

        // Generate colors for each product
        const colors = [
            'rgba(59, 130, 246, 0.8)',   // Blue
            'rgba(34, 197, 94, 0.8)',    // Green
            'rgba(249, 115, 22, 0.8)',   // Orange
            'rgba(168, 85, 247, 0.8)',   // Purple
            'rgba(236, 72, 153, 0.8)',   // Pink
            'rgba(14, 165, 233, 0.8)',   // Sky
            'rgba(245, 158, 11, 0.8)',   // Amber
            'rgba(239, 68, 68, 0.8)',    // Red
            'rgba(16, 185, 129, 0.8)',   // Emerald
            'rgba(139, 92, 246, 0.8)'    // Violet
        ];

        const borderColors = [
            'rgb(59, 130, 246)',
            'rgb(34, 197, 94)',
            'rgb(249, 115, 22)',
            'rgb(168, 85, 247)',
            'rgb(236, 72, 153)',
            'rgb(14, 165, 233)',
            'rgb(245, 158, 11)',
            'rgb(239, 68, 68)',
            'rgb(16, 185, 129)',
            'rgb(139, 92, 246)'
        ];

        const result = {
            labels: chartData.fullNames, // Use full names instead of truncated ones
            datasets: [{
                label: 'Page Visits',
                data: chartData.data,
                backgroundColor: colors.slice(0, chartData.data.length),
                borderColor: borderColors.slice(0, chartData.data.length),
                borderWidth: 2
            }]
        };
        
        console.log('Final chart data structure:', result);
        return result;
    }

    /**
     * Update product popularity chart with latest data
     */
    static updateProductPopularityChart() {
        if (window.chartManager && window.chartManager.salesChartInstance) {
            const newData = ChartManager.getProductPopularityData();
            window.chartManager.salesChartInstance.data = newData;
            window.chartManager.salesChartInstance.update('resize');
        }
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

// Update total visits display
function updateTotalVisitsDisplay() {
    const totalVisitsElement = document.getElementById('total-visits');
    if (totalVisitsElement && typeof AnalyticsService !== 'undefined') {
        totalVisitsElement.textContent = AnalyticsService.getTotalVisits();
    }
}

// Auto-refresh product popularity chart every 30 seconds
setInterval(() => {
    if (window.chartManager && window.chartManager.salesChartInstance) {
        ChartManager.updateProductPopularityChart();
        updateTotalVisitsDisplay();
    }
}, 30000);

// Update visits display on page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(updateTotalVisitsDisplay, 1000);
});
