/**
 * Users Controller
 * Manages user-related functionality
 */
class UsersController {
    constructor(api) {
        this.api = api;
        this.currentUsers = [];
        this.currentFilter = 'customer';
    }

    /**
     * Load and display users data
     */
    async loadData() {
        try {
            UIHelpers.showLoadingState('users');
            const usersData = await this.api.getAllUsers({ role: 'customer', limit: 50 });
            this.currentUsers = usersData.data.users;
            this.updateTable(this.currentUsers);
            UIHelpers.hideLoadingState();
        } catch (error) {
            console.error('Failed to load users data:', error);
            UIHelpers.showErrorState('Failed to load users data');
        }
    }

    /**
     * Update users table
     * @param {Array} users - Users array
     */
    updateTable(users) {
        const tableBody = document.querySelector('#customers-section tbody');
        if (!tableBody) return;

        tableBody.innerHTML = users.map(user => `
            <tr class="border-b border-white/10 dark:border-gray-700/50 hover:bg-white/5 dark:hover:bg-gray-800/20">
                <td class="px-6 py-4 font-medium">${user.name}</td>
                <td class="px-6 py-4">${user.email}</td>
                <td class="px-6 py-4">$${(user.totalSpent || 0).toFixed(2)}</td>
                <td class="px-6 py-4">${new Date(user.createdAt).toLocaleDateString()}</td>
                <td class="px-6 py-4 text-right space-x-2">
                    <button onclick="usersController.viewUser('${user.id}')" class="text-blue-500 hover:text-blue-400">View</button>
                    <button onclick="usersController.deleteUser('${user.id}')" class="text-red-500 hover:text-red-400">Remove</button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * View user details
     * @param {string} userId - User ID to view
     */
    async viewUser(userId) {
        try {
            const user = this.currentUsers.find(u => u.id === userId);
            if (!user) {
                NotificationManager.showError('User not found');
                return;
            }

            this.showUserDetailsModal(user);
        } catch (error) {
            console.error('Failed to view user:', error);
            NotificationManager.showError('Failed to load user details');
        }
    }

    /**
     * Show user details modal
     * @param {object} user - User data
     */
    showUserDetailsModal(user) {
        const modalHTML = `
            <div id="userDetailsModal" class="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div class="admin-card rounded-2xl shadow-2xl border border-white/30 dark:border-gray-700/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                    <div class="p-8">
                        <div class="flex justify-between items-center mb-6">
                            <h3 class="text-2xl font-bold">User Details</h3>
                            <button onclick="usersController.closeUserModal()" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </button>
                        </div>
                        
                        <div class="space-y-6">
                            <div class="grid grid-cols-2 gap-4">
                                <div>
                                    <label class="block text-sm font-medium text-gray-800 dark:text-gray-300">Name</label>
                                    <p class="text-lg">${user.name}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-800 dark:text-gray-300">Email</label>
                                    <p class="text-lg">${user.email}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-800 dark:text-gray-300">Role</label>
                                    <p class="text-lg">${user.role || 'Customer'}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-800 dark:text-gray-300">Total Spent</label>
                                    <p class="text-lg font-bold">$${(user.totalSpent || 0).toFixed(2)}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-800 dark:text-gray-300">Joined Date</label>
                                    <p class="text-lg">${new Date(user.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div>
                                    <label class="block text-sm font-medium text-gray-800 dark:text-gray-300">Status</label>
                                    <p class="text-lg">${user.isActive !== false ? 'Active' : 'Inactive'}</p>
                                </div>
                            </div>
                            
                            ${user.address ? `
                                <div>
                                    <label class="block text-sm font-medium text-gray-800 dark:text-gray-300 mb-2">Address</label>
                                    <div class="p-3 bg-white/10 dark:bg-gray-800/20 rounded-lg">
                                        <p>${user.address.street || ''}</p>
                                        <p>${user.address.city || ''}, ${user.address.state || ''} ${user.address.zipCode || ''}</p>
                                        <p>${user.address.country || ''}</p>
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
     * Close user details modal
     */
    closeUserModal() {
        const modal = document.getElementById('userDetailsModal');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * Delete a user
     * @param {string} userId - User ID to delete
     */
    async deleteUser(userId) {
        if (!confirm('Are you sure you want to remove this user? This action cannot be undone.')) {
            return;
        }
        
        try {
            await this.api.deleteUser(userId);
            await this.loadData(); // Reload users
            NotificationManager.showSuccess('User removed successfully');
        } catch (error) {
            console.error('Failed to delete user:', error);
            NotificationManager.showError('Failed to remove user');
        }
    }

    /**
     * Filter users by role
     * @param {string} role - Role to filter by
     */
    filterByRole(role) {
        this.currentFilter = role;
        // Reload data with new filter
        this.loadData();
    }

    /**
     * Search users by name or email
     * @param {string} searchTerm - Search term
     */
    searchUsers(searchTerm) {
        const filtered = this.currentUsers.filter(user =>
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.updateTable(filtered);
    }

    /**
     * Export users data to CSV
     */
    exportToCSV() {
        const csvContent = [
            ['Name', 'Email', 'Total Spent', 'Joined Date', 'Status'],
            ...this.currentUsers.map(user => [
                user.name,
                user.email,
                (user.totalSpent || 0).toFixed(2),
                new Date(user.createdAt).toLocaleDateString(),
                user.isActive !== false ? 'Active' : 'Inactive'
            ])
        ].map(row => row.join(',')).join('\\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

// Export the controller
window.UsersController = UsersController;
