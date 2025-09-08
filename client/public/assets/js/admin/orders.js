/**
 * Orders Controller
 * Manages order-related functionality
 */
class OrdersController {
    constructor(api) {
        this.api = api;
        this.currentOrders = [];
        this.currentFilter = 'all';
    }

    /**
     * Load and display orders data
     */
    async loadData() {
        try {
            UIHelpers.showLoadingState('orders');
            const ordersData = await this.api.getAllOrders({ limit: 50 });
            this.currentOrders = ordersData.data.orders;
            this.updateTable(this.currentOrders);
            UIHelpers.hideLoadingState();
        } catch (error) {
            console.error('Failed to load orders data:', error);
            UIHelpers.showErrorState('Failed to load orders data');
        }
    }

    /**
     * Update orders table
     * @param {Array} orders - Orders array
     */
    updateTable(orders) {
        const tableBody = document.querySelector('#orders-section tbody');
        if (!tableBody) return;

        tableBody.innerHTML = orders.map(order => `
            <tr class="border-b border-white/10 dark:border-gray-700/50 hover:bg-white/5 dark:hover:bg-gray-800/20">
                <td class="px-6 py-4 font-medium">#${order.id}</td>
                <td class="px-6 py-4">${order.userEmail || 'Guest'}</td>
                <td class="px-6 py-4">${new Date(order.createdAt).toLocaleDateString()}</td>
                <td class="px-6 py-4">$${order.totalAmount.toFixed(2)}</td>
                <td class="px-6 py-4">
                    <select onchange="ordersController.updateOrderStatus('${order.id}', this.value)" 
                            class="px-2 py-1 font-semibold leading-tight rounded-full ${this.getStatusColor(order.status)} border-none">
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                        <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                        <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                        <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                    </select>
                </td>
                <td class="px-6 py-4 text-right">
                    <button onclick="ordersController.viewOrder('${order.id}')" class="text-blue-500 hover:text-blue-400">View</button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * View order details
     * @param {string} orderId - Order ID to view
     */
    async viewOrder(orderId) {
        try {
            const order = this.currentOrders.find(o => o.id === orderId);
            if (!order) {
                NotificationManager.showError('Order not found');
                return;
            }

            // Create and show order details modal
            this.showOrderDetailsModal(order);
        } catch (error) {
            console.error('Failed to view order:', error);
            NotificationManager.showError('Failed to load order details');
        }
    }

    /**
     * Show order details modal
     * @param {object} order - Order data
     */
    showOrderDetailsModal(order) {
        const modalHTML = `
            <div id="orderDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="admin-card rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-8">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold">Order #${order.id}</h3>
                            <button onclick="ordersController.closeOrderModal()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <div class="space-y-6">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-800 dark:text-gray-300">Customer</label>
                                    <p class="text-lg">${order.userEmail || 'Guest'}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-800 dark:text-gray-300">Date</label>
                                    <p class="text-lg">${new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-800 dark:text-gray-300">Status</label>
                                    <p class="text-lg">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-800 dark:text-gray-300">Total</label>
                                    <p class="text-lg font-bold">$${order.totalAmount.toFixed(2)}</p>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">Items</label>
                                <div class="space-y-2">
                                    ${order.items ? order.items.map(item => `
                                        <div class="flex justify-between items-center p-3 bg-white/10 dark:bg-gray-800/20 rounded-lg">
                                            <span>${item.productName || item.productId}</span>
                                            <span>Qty: ${item.quantity} × $${item.price.toFixed(2)}</span>
                                        </div>
                                    `).join('') : '<p>No items found</p>'}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', modalHTML);
    }

    /**
     * Close order details modal
     */
    closeOrderModal() {
        const modal = document.getElementById('orderDetailsModal');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * Update order status
     * @param {string} orderId - Order ID
     * @param {string} newStatus - New status
     */
    async updateOrderStatus(orderId, newStatus) {
        try {
            await this.api.updateOrderStatus(orderId, newStatus);
            
            // Update local data
            const orderIndex = this.currentOrders.findIndex(o => o.id === orderId);
            if (orderIndex !== -1) {
                this.currentOrders[orderIndex].status = newStatus;
            }
            
            NotificationManager.showSuccess('Order status updated successfully');
        } catch (error) {
            console.error('Failed to update order status:', error);
            NotificationManager.showError('Failed to update order status');
            // Reload the page to reset the status
            this.loadData();
        }
    }

    /**
     * Filter orders by status
     * @param {string} status - Status to filter by
     */
    filterByStatus(status) {
        this.currentFilter = status;
        if (status === 'all') {
            this.updateTable(this.currentOrders);
        } else {
            const filtered = this.currentOrders.filter(order => order.status === status);
            this.updateTable(filtered);
        }
    }

    /**
     * Get status color classes
     * @param {string} status - Order status
     * @returns {string} - CSS classes
     */
    getStatusColor(status) {
        const statusColors = {
            'pending': 'text-yellow-700 bg-yellow-100 dark:bg-yellow-700 dark:text-yellow-100',
            'processing': 'text-blue-700 bg-blue-100 dark:bg-blue-700 dark:text-blue-100',
            'shipped': 'text-purple-700 bg-purple-100 dark:bg-purple-700 dark:text-purple-100',
            'delivered': 'text-green-700 bg-green-100 dark:bg-green-700 dark:text-green-100',
            'cancelled': 'text-red-700 bg-red-100 dark:bg-red-700 dark:text-red-100'
        };
        return statusColors[status] || statusColors.pending;
    }
}

// Export the controller
window.OrdersController = OrdersController;
