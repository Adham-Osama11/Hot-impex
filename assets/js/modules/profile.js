// Hot Impex User Profile Module
// Handles user profile functionality including order management

class ProfileManager {
    constructor() {
        this.currentTab = 'profile';
        this.userOrders = [];
        this.init();
    }

    init() {
        if (!document.querySelector('.profile-tab')) {
            return; // Not on profile page
        }

        this.initializeProfileTabs();
        this.loadUserData();
    }

    initializeProfileTabs() {
        const profileTabs = document.querySelectorAll('.profile-tab');
        const tabContents = document.querySelectorAll('.tab-content');

        profileTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = tab.dataset.tab;
                this.switchTab(tabName);
            });
        });

        // Initialize first tab
        this.switchTab('profile');
    }

    switchTab(tabName) {
        this.currentTab = tabName;

        // Update tab buttons
        document.querySelectorAll('.profile-tab').forEach(tab => {
            tab.classList.remove('bg-blue-500', 'text-white');
            tab.classList.add('bg-gray-200', 'text-gray-700');
        });

        const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
        if (activeTab) {
            activeTab.classList.remove('bg-gray-200', 'text-gray-700');
            activeTab.classList.add('bg-blue-500', 'text-white');
        }

        // Update tab content
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });

        const activeContent = document.getElementById(`${tabName}-content`);
        if (activeContent) {
            activeContent.classList.remove('hidden');
        }

        // Load tab-specific data
        if (tabName === 'orders') {
            this.loadUserOrders();
        }
    }

    async loadUserData() {
        if (!AuthService.isLoggedIn()) {
            window.location.href = 'login.html';
            return;
        }

        try {
            const userInfo = AuthService.getUserInfo();
            if (userInfo) {
                this.displayUserInfo(userInfo);
            }

            // Load full profile data from API
            const profile = await AuthService.getUserProfile();
            this.displayUserInfo(profile);
        } catch (error) {
            console.error('Error loading user data:', error);
            UIComponents.showNotification('Failed to load user data', 'error');
        }
    }

    displayUserInfo(userInfo) {
        const nameField = document.getElementById('user-name');
        const emailField = document.getElementById('user-email');
        const phoneField = document.getElementById('user-phone');

        if (nameField && userInfo.name) nameField.value = userInfo.name;
        if (emailField && userInfo.email) emailField.value = userInfo.email;
        if (phoneField && userInfo.phone) phoneField.value = userInfo.phone;
    }

    async loadUserOrders() {
        if (!AuthService.isLoggedIn()) {
            return;
        }

        const ordersContainer = document.getElementById('orders-list');
        if (!ordersContainer) return;

        try {
            // Show loading state
            ordersContainer.innerHTML = `
                <div class="flex items-center justify-center py-8">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span class="ml-2 text-gray-600">Loading orders...</span>
                </div>
            `;

            const response = await APIService.getUserOrders();
            
            if (response.status === 'success') {
                this.userOrders = response.data.orders || [];
                this.displayOrders();
            } else {
                throw new Error(response.message || 'Failed to load orders');
            }
        } catch (error) {
            console.error('Error loading orders:', error);
            ordersContainer.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-red-500 text-4xl mb-2">❌</div>
                    <p class="text-gray-600">Failed to load orders</p>
                    <button onclick="profileManager.loadUserOrders()" class="mt-2 bg-blue-500 text-white px-4 py-2 rounded">
                        Try Again
                    </button>
                </div>
            `;
        }
    }

    displayOrders() {
        const ordersContainer = document.getElementById('orders-list');
        if (!ordersContainer) return;

        if (this.userOrders.length === 0) {
            ordersContainer.innerHTML = `
                <div class="text-center py-8">
                    <div class="text-gray-400 text-4xl mb-2">📦</div>
                    <p class="text-gray-600">No orders found</p>
                    <a href="shop.html" class="mt-2 inline-block bg-blue-500 text-white px-4 py-2 rounded">
                        Start Shopping
                    </a>
                </div>
            `;
            return;
        }

        ordersContainer.innerHTML = this.userOrders.map(order => this.createOrderCard(order)).join('');
    }

    createOrderCard(order) {
        const statusColors = {
            pending: 'bg-yellow-100 text-yellow-800',
            processing: 'bg-blue-100 text-blue-800',
            shipped: 'bg-purple-100 text-purple-800',
            delivered: 'bg-green-100 text-green-800',
            cancelled: 'bg-red-100 text-red-800'
        };

        const statusColor = statusColors[order.status] || 'bg-gray-100 text-gray-800';
        const orderDate = new Date(order.createdAt).toLocaleDateString();
        const total = order.total || 0;
        const currency = order.currency || 'EGP';

        return `
            <div class="bg-white rounded-lg shadow p-6 mb-4">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h3 class="font-semibold text-lg text-gray-900">
                            Order #${order.orderNumber || order._id}
                        </h3>
                        <p class="text-gray-600">
                            Placed on ${orderDate}
                        </p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-sm font-medium ${statusColor}">
                        ${order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                </div>

                <div class="border-t border-gray-200 pt-4">
                    <div class="flex justify-between items-center mb-2">
                        <span class="text-gray-600">Items:</span>
                        <span class="font-medium">${order.items?.length || 0}</span>
                    </div>
                    <div class="flex justify-between items-center mb-4">
                        <span class="text-gray-600">Total:</span>
                        <span class="font-bold text-lg">${total.toFixed(2)} ${currency}</span>
                    </div>
                </div>

                <div class="flex space-x-2">
                    <button onclick="profileManager.viewOrderDetails('${order._id}')" 
                            class="flex-1 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors">
                        View Details
                    </button>
                    ${order.status === 'pending' ? `
                        <button onclick="profileManager.cancelOrder('${order._id}')" 
                                class="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600 transition-colors">
                            Cancel
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }

    async viewOrderDetails(orderId) {
        try {
            const response = await APIService.getOrder(orderId);
            
            if (response.status === 'success') {
                const order = response.data.order;
                this.showOrderDetailsModal(order);
            } else {
                throw new Error(response.message || 'Failed to load order details');
            }
        } catch (error) {
            console.error('Error loading order details:', error);
            UIComponents.showNotification('Failed to load order details', 'error');
        }
    }

    showOrderDetailsModal(order) {
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4';
        modal.innerHTML = `
            <div class="bg-white rounded-lg max-w-2xl w-full max-h-96 overflow-y-auto">
                <div class="p-6">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-xl font-bold text-gray-900">
                            Order #${order.orderNumber || order._id}
                        </h2>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                                class="text-gray-500 hover:text-gray-700">
                            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </button>
                    </div>

                    <div class="mb-4">
                        <h3 class="font-semibold mb-2">Order Items:</h3>
                        <div class="space-y-2">
                            ${(order.items || []).map(item => `
                                <div class="flex justify-between items-center py-2 border-b border-gray-200">
                                    <div>
                                        <span class="font-medium">${item.productData?.name || 'Unknown Product'}</span>
                                        <span class="text-gray-600 ml-2">x${item.quantity}</span>
                                    </div>
                                    <span class="font-medium">${(item.productData?.price * item.quantity).toFixed(2)} ${order.currency || 'EGP'}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>

                    <div class="border-t border-gray-200 pt-4">
                        <div class="flex justify-between items-center font-bold text-lg">
                            <span>Total:</span>
                            <span>${order.total?.toFixed(2)} ${order.currency || 'EGP'}</span>
                        </div>
                    </div>

                    ${order.shippingAddress ? `
                        <div class="mt-4">
                            <h3 class="font-semibold mb-2">Shipping Address:</h3>
                            <p class="text-gray-600">
                                ${order.shippingAddress.street}, ${order.shippingAddress.city}<br>
                                ${order.shippingAddress.country} ${order.shippingAddress.zipCode}
                            </p>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        // Close modal when clicking outside
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    }

    async cancelOrder(orderId) {
        if (!confirm('Are you sure you want to cancel this order?')) {
            return;
        }

        try {
            const response = await APIService.cancelOrder(orderId);
            
            if (response.status === 'success') {
                UIComponents.showNotification('Order cancelled successfully', 'success');
                this.loadUserOrders(); // Reload orders
            } else {
                throw new Error(response.message || 'Failed to cancel order');
            }
        } catch (error) {
            console.error('Error cancelling order:', error);
            UIComponents.showNotification('Failed to cancel order', 'error');
        }
    }

    async updateProfile() {
        const form = document.getElementById('profile-form');
        if (!form) return;

        const formData = new FormData(form);
        const profileData = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            address: {
                street: formData.get('street'),
                city: formData.get('city'),
                zipCode: formData.get('zipCode'),
                country: formData.get('country')
            }
        };

        try {
            const updatedUser = await AuthService.updateProfile(profileData);
            UIComponents.showNotification('Profile updated successfully', 'success');
            this.displayUserInfo(updatedUser);
        } catch (error) {
            console.error('Error updating profile:', error);
            UIComponents.showNotification('Failed to update profile', 'error');
        }
    }
}

// Initialize profile manager
let profileManager;

document.addEventListener('DOMContentLoaded', () => {
    profileManager = new ProfileManager();
});

// Global function for profile page initialization
window.initializeProfilePage = () => {
    if (!window.profileManager) {
        window.profileManager = new ProfileManager();
    }
};

// Make profile manager globally available
window.ProfileManager = ProfileManager;
