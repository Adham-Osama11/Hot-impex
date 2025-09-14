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
            console.log('Orders data received:', ordersData);
            
            // Handle different response structures
            this.currentOrders = ordersData.data?.orders || ordersData.data || [];
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

        tableBody.innerHTML = orders.map(order => {
            // Handle MongoDB _id vs id
            const orderId = order._id || order.id;
            // Handle user email from populated user or customerInfo
            const userEmail = order.user?.email || order.customerInfo?.email || 'Guest';
            // Handle pricing structure (MongoDB uses nested pricing)
            const totalAmount = order.pricing?.total || order.totalAmount || 0;
            // Use orderNumber if available, otherwise use ID
            const displayId = order.orderNumber || orderId;
            
            return `
                <tr class="border-b border-white/10 dark:border-gray-700/50 hover:bg-white/5 dark:hover:bg-gray-800/20">
                    <td class="px-6 py-4 font-medium">#${displayId}</td>
                    <td class="px-6 py-4">${userEmail}</td>
                    <td class="px-6 py-4">${new Date(order.createdAt).toLocaleDateString()}</td>
                    <td class="px-6 py-4">${totalAmount.toFixed(2)} ${order.currency || 'EGP'}</td>
                    <td class="px-6 py-4">
                        <select onchange="ordersController.updateOrderStatus('${orderId}', this.value)" 
                                class="px-2 py-1 font-semibold leading-tight rounded-full ${this.getStatusColor(order.status)} border-none">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="confirmed" ${order.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="shipped" ${order.status === 'shipped' ? 'selected' : ''}>Shipped</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                            <option value="refunded" ${order.status === 'refunded' ? 'selected' : ''}>Refunded</option>
                        </select>
                    </td>
                    <td class="px-6 py-4 text-right">
                        <button onclick="ordersController.viewOrder('${orderId}')" class="text-blue-500 hover:text-blue-400">View</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * View order details
     * @param {string} orderId - Order ID to view
     */
    async viewOrder(orderId) {
        try {
            const order = this.currentOrders.find(o => (o._id || o.id) === orderId);
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
        // Handle different data structures
        const orderId = order._id || order.id;
        const orderNumber = order.orderNumber || orderId;
        const userEmail = order.user?.email || order.customerInfo?.email || 'Guest';
        const userName = order.user ? 
            `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() :
            `${order.customerInfo?.firstName || ''} ${order.customerInfo?.lastName || ''}`.trim() || 'Guest';
        const totalAmount = order.pricing?.total || order.totalAmount || 0;
        const currency = order.currency || 'EGP';
        
        const modalHTML = `
            <div id="orderDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="admin-card rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-8">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold">Order #${orderNumber}</h3>
                            <button onclick="ordersController.closeOrderModal()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <div class="space-y-6">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-800 dark:text-gray-600">Customer</label>
                                    <p class="text-lg">${userName}</p>
                                    <p class="text-sm text-gray-600 dark:text-gray-400">${userEmail}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-800 dark:text-gray-600">Date</label>
                                    <p class="text-lg">${new Date(order.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-800 dark:text-gray-600">Status</label>
                                    <p class="text-lg">${order.status.charAt(0).toUpperCase() + order.status.slice(1)}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-800 dark:text-gray-600">Total</label>
                                    <p class="text-lg font-bold">${totalAmount.toFixed(2)} ${currency}</p>
                                </div>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-800 dark:text-gray-600 mb-2">Payment</label>
                                <p class="text-sm">${order.paymentMethod || 'N/A'} - ${order.paymentStatus || 'pending'}</p>
                            </div>

                            <div>
                                <label class="block text-sm font-medium text-gray-800 dark:text-gray-600 mb-2">Shipping Address</label>
                                <div class="text-sm">
                                    <p>${order.shippingAddress?.firstName || ''} ${order.shippingAddress?.lastName || ''}</p>
                                    <p>${order.shippingAddress?.street || ''}</p>
                                    <p>${order.shippingAddress?.city || ''}, ${order.shippingAddress?.country || ''}</p>
                                </div>
                            </div>
                            
                            <div>
                                <label class="block text-sm font-medium text-gray-800 dark:text-gray-600 mb-2">Items</label>
                                <div class="space-y-2">
                                    ${order.items && order.items.length > 0 ? order.items.map(item => `
                                        <div class="flex justify-between items-center p-3 bg-white/10 dark:bg-gray-800/20 rounded-lg">
                                            <div>
                                                <span class="font-medium">${item.productName || item.productId}</span>
                                                <span class="text-sm text-gray-600 dark:text-gray-500 block">Qty: ${item.quantity}</span>
                                            </div>
                                            <span class="font-semibold">${(item.price || 0).toFixed(2)} ${currency}</span>
                                        </div>
                                    `).join('') : '<p class="text-gray-500">No items found</p>'}
                                </div>
                            </div>

                            ${order.pricing ? `
                            <div class="border-t pt-4">
                                <div class="space-y-2">
                                    <div class="flex justify-between">
                                        <span>Subtotal:</span>
                                        <span>${(order.pricing.subtotal || 0).toFixed(2)} ${currency}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>Shipping:</span>
                                        <span>${(order.pricing.shipping || 0).toFixed(2)} ${currency}</span>
                                    </div>
                                    <div class="flex justify-between">
                                        <span>Tax:</span>
                                        <span>${(order.pricing.tax || 0).toFixed(2)} ${currency}</span>
                                    </div>
                                    <div class="flex justify-between font-bold border-t pt-2">
                                        <span>Total:</span>
                                        <span>${(order.pricing.total || 0).toFixed(2)} ${currency}</span>
                                    </div>
                                </div>
                            </div>
                            ` : ''}
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
            const orderIndex = this.currentOrders.findIndex(o => (o._id || o.id) === orderId);
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
            'confirmed': 'text-blue-700 bg-blue-100 dark:bg-blue-700 dark:text-blue-100',
            'processing': 'text-indigo-700 bg-indigo-100 dark:bg-indigo-700 dark:text-indigo-100',
            'shipped': 'text-purple-700 bg-purple-100 dark:bg-purple-700 dark:text-purple-100',
            'delivered': 'text-green-700 bg-green-100 dark:bg-green-700 dark:text-green-100',
            'cancelled': 'text-red-700 bg-red-100 dark:bg-red-700 dark:text-red-100',
            'refunded': 'text-gray-700 bg-gray-100 dark:bg-gray-700 dark:text-gray-100'
        };
        return statusColors[status] || statusColors.pending;
    }
}

// Export the controller
window.OrdersController = OrdersController;
