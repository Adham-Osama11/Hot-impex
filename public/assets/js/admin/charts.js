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
                        label: 'Revenue (EGP)',
                        data: [0, 0, 0, 0, 0, 0, 0], // Will be updated with real data
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
        
        // Update sales chart with real weekly revenue trend data
        if (window.chartManager && window.chartManager.salesChartInstance) {
            const weeklyTrend = orders.weeklyRevenueTrend || [];
            console.log('Weekly revenue trend:', weeklyTrend);
            
            if (weeklyTrend.length > 0) {
                // Create labels and data from the actual trend data
                const labels = [];
                const salesData = [];
                
                // Sort by date to ensure proper order
                const sortedTrend = weeklyTrend.sort((a, b) => new Date(a._id) - new Date(b._id));
                
                // Fill the last 7 days, using 0 for missing days
                const today = new Date();
                const last7Days = [];
                
                for (let i = 6; i >= 0; i--) {
                    const date = new Date(today);
                    date.setDate(date.getDate() - i);
                    const dateStr = date.toISOString().split('T')[0]; // YYYY-MM-DD format
                    last7Days.push(dateStr);
                }
                
                // Create labels (day names) and data for the last 7 days
                last7Days.forEach(dateStr => {
                    const date = new Date(dateStr);
                    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                    labels.push(dayName);
                    
                    // Find revenue for this date
                    const dayData = sortedTrend.find(item => item._id === dateStr);
                    const revenue = dayData ? Math.round(dayData.dailyRevenue) : 0;
                    salesData.push(revenue);
                });
                
                console.log('Chart labels:', labels);
                console.log('Chart data:', salesData);
                
                // Update the chart
                window.chartManager.salesChartInstance.data.labels = labels;
                window.chartManager.salesChartInstance.data.datasets[0].data = salesData;
                window.chartManager.salesChartInstance.data.datasets[0].label = 'Daily Revenue ($)';
            } else {
                // Fallback to mock data if no real data available
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
                
                window.chartManager.salesChartInstance.data.labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
                window.chartManager.salesChartInstance.data.datasets[0].data = mockWeeklyData;
                window.chartManager.salesChartInstance.data.datasets[0].label = 'Daily Revenue (Estimated)';
                
                console.log('Using fallback mock data:', mockWeeklyData);
            }
            
            window.chartManager.salesChartInstance.update('none'); // Disable animation to prevent resize issues
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
