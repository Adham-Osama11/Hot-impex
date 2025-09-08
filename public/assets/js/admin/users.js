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

        tableBody.innerHTML = users.map(user => {
            const fullName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A';
            return `
                <tr class="border-b border-white/10 dark:border-gray-700/50 hover:bg-white/5 dark:hover:bg-gray-800/20">
                    <td class="px-6 py-4 font-medium">${fullName}</td>
                    <td class="px-6 py-4">${user.email || 'N/A'}</td>
                    <td class="px-6 py-4">$${(user.totalSpent || 0).toFixed(2)}</td>
                    <td class="px-6 py-4">${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</td>
                    <td class="px-6 py-4 text-right space-x-2">
                        <button onclick="viewUser('${user.id || user._id}')" class="text-blue-500 hover:text-blue-400">View</button>
                        <button onclick="deleteUser('${user.id || user._id}')" class="text-red-500 hover:text-red-400">Remove</button>
                    </td>
                </tr>
            `;
        }).join('');
    }

    /**
     * View user details
     * @param {string} userId - User ID to view
     */
    async viewUser(userId) {
        try {
            // Get fresh user data from API
            const response = await this.api.request(`/users/${userId}`);
            const user = response.data.user;
            
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
     * Show add user modal
     */
    showAddUserModal() {
        // Check if modal already exists
        let modal = document.getElementById('userModal');
        if (!modal) {
            NotificationManager.showError('User modal not found in the DOM');
            return;
        }

        // Reset form for new user
        document.getElementById('userModalTitle').textContent = 'Add New Customer';
        document.getElementById('userSubmitButtonText').textContent = 'Add Customer';
        document.getElementById('userForm').reset();
        document.getElementById('userId').value = '';
        
        // Show password fields for new users
        document.getElementById('passwordSection').style.display = 'grid';
        document.getElementById('userPassword').required = true;
        document.getElementById('userPasswordConfirm').required = true;
        
        // Setup form submission handler
        this.setupUserFormHandler();
        
        // Show the modal
        modal.classList.remove('hidden');
    }

    /**
     * Show edit user modal
     * @param {object} user - User data to edit
     */
    showEditUserModal(user) {
        let modal = document.getElementById('userModal');
        if (!modal) {
            NotificationManager.showError('User modal not found in the DOM');
            return;
        }

        // Populate the modal with user data
        document.getElementById('userModalTitle').textContent = 'Edit Customer';
        document.getElementById('userSubmitButtonText').textContent = 'Update Customer';
        document.getElementById('userId').value = user.id || user._id;
        document.getElementById('userFirstName').value = user.firstName || '';
        document.getElementById('userLastName').value = user.lastName || '';
        document.getElementById('userEmail').value = user.email || '';
        document.getElementById('userPhone').value = user.phone || '';
        
        // Hide password requirement for editing (optional password change)
        document.getElementById('passwordSection').style.display = 'grid';
        document.getElementById('userPassword').required = false;
        document.getElementById('userPasswordConfirm').required = false;
        document.getElementById('userPassword').value = '';
        document.getElementById('userPasswordConfirm').value = '';
        
        // Setup form submission handler
        this.setupUserFormHandler();
        
        // Show the modal
        modal.classList.remove('hidden');
    }

    /**
     * Close user modal
     */
    closeUserModal() {
        const addModal = document.getElementById('userModal');
        const detailsModal = document.getElementById('userDetailsModal');
        
        if (addModal) {
            addModal.classList.add('hidden');
            document.getElementById('userForm').reset();
        }
        if (detailsModal) {
            detailsModal.classList.add('hidden');
        }
    }

    /**
     * Setup user form submission handler
     */
    setupUserFormHandler() {
        const form = document.getElementById('userForm');
        if (!form) return;

        // Remove existing listeners to prevent duplicates
        const newForm = form.cloneNode(true);
        form.parentNode.replaceChild(newForm, form);

        newForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleUserFormSubmission(e.target);
        });
    }

    /**
     * Handle user form submission
     * @param {HTMLFormElement} form - The form element
     */
    async handleUserFormSubmission(form) {
        try {
            const formData = new FormData(form);
            const userId = formData.get('id');
            
            // Validate passwords match if provided
            const password = formData.get('password');
            const passwordConfirm = formData.get('passwordConfirm');
            
            if (password && password !== passwordConfirm) {
                NotificationManager.showError('Passwords do not match');
                return;
            }
            
            // For new users, password is required
            if (!userId && !password) {
                NotificationManager.showError('Password is required for new customers');
                return;
            }
            
            // Validate password length if provided
            if (password && password.length < 6) {
                NotificationManager.showError('Password must be at least 6 characters long');
                return;
            }
            
            const userData = {
                firstName: formData.get('firstName').trim(),
                lastName: formData.get('lastName').trim(),
                email: formData.get('email').trim(),
                phone: formData.get('phone').trim()
            };
            
            // Add password only if provided
            if (password) {
                userData.password = password;
            }
            
            // Validate email format
            if (!userData.email || !userData.email.includes('@')) {
                NotificationManager.showError('Please enter a valid email address');
                return;
            }
            
            // Show loading state
            const submitButton = form.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.disabled = true;
            submitButton.textContent = userId ? 'Updating...' : 'Adding...';
            
            try {
                if (userId) {
                    // Update existing user
                    await this.api.request(`/users/${userId}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(userData)
                    });
                    NotificationManager.showSuccess('Customer updated successfully!');
                } else {
                    // Create new user
                    await this.api.request('/users', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(userData)
                    });
                    NotificationManager.showSuccess('Customer added successfully!');
                }
                
                this.closeUserModal();
                await this.loadData();
                
            } finally {
                // Reset button state
                submitButton.disabled = false;
                submitButton.textContent = originalText;
            }
            
        } catch (error) {
            console.error('Failed to save user:', error);
            NotificationManager.showError('Failed to save customer: ' + error.message);
        }
    }

    /**
     * Edit user from details modal
     */
    async editUserFromDetails() {
        try {
            const userId = document.getElementById('userDetailsModal').getAttribute('data-user-id');
            if (!userId) {
                NotificationManager.showError('User ID not found');
                return;
            }
            
            // Fetch user data again to populate edit form
            const response = await this.api.request(`/users/${userId}`);
            const user = response.data.user;
            
            // Close details modal and show edit modal
            this.closeUserModal();
            this.showEditUserModal(user);
            
        } catch (error) {
            console.error('Failed to load user for editing:', error);
            NotificationManager.showError('Failed to load user data for editing');
        }
    }

    /**
     * Show user details modal
     * @param {object} user - User data
     */
    showUserDetailsModal(user) {
        const modal = document.getElementById('userDetailsModal');
        if (!modal) {
            NotificationManager.showError('User details modal not found in the DOM');
            return;
        }

        const userDetailsContent = document.getElementById('userDetailsContent');
        const fullName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'N/A';
        
        userDetailsContent.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="glass-effect p-6 rounded-xl border border-white/20 dark:border-gray-700/20">
                    <h4 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Personal Information</h4>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</label>
                            <p class="text-gray-800 dark:text-gray-200">${fullName}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                            <p class="text-gray-800 dark:text-gray-200">${user.email || 'N/A'}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Phone</label>
                            <p class="text-gray-800 dark:text-gray-200">${user.phone || 'N/A'}</p>
                        </div>
                    </div>
                </div>
                
                <div class="glass-effect p-6 rounded-xl border border-white/20 dark:border-gray-700/20">
                    <h4 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Account Information</h4>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Customer ID</label>
                            <p class="text-gray-800 dark:text-gray-200">${user.id || user._id || 'N/A'}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Member Since</label>
                            <p class="text-gray-800 dark:text-gray-200">${user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
                        </div>
                        <div>
                            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400">Account Status</label>
                            <span class="px-2 py-1 text-xs font-semibold rounded-full ${user.isActive ? 'text-green-700 bg-green-100 dark:bg-green-900 dark:text-green-300' : 'text-red-700 bg-red-100 dark:bg-red-900 dark:text-red-300'}">
                                ${user.isActive ? 'Active' : 'Inactive'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="glass-effect p-6 rounded-xl border border-white/20 dark:border-gray-700/20">
                <h4 class="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-200">Purchase Summary</h4>
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div class="text-center">
                        <p class="text-2xl font-bold text-blue-600 dark:text-blue-400">$${(user.totalSpent || 0).toFixed(2)}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Total Spent</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-green-600 dark:text-green-400">${user.totalOrders || 0}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Total Orders</p>
                    </div>
                    <div class="text-center">
                        <p class="text-2xl font-bold text-purple-600 dark:text-purple-400">${user.avgOrderValue ? '$' + user.avgOrderValue.toFixed(2) : '$0.00'}</p>
                        <p class="text-sm text-gray-600 dark:text-gray-400">Avg Order Value</p>
                    </div>
                </div>
            </div>
        `;
        
        // Store current user ID for editing
        modal.setAttribute('data-user-id', user.id || user._id);
        
        // Show the modal
        modal.classList.remove('hidden');
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

// Global wrapper functions for onclick handlers
window.showAddUserModal = function() {
    if (window.usersController) {
        window.usersController.showAddUserModal();
    }
};

window.closeUserModal = function() {
    if (window.usersController) {
        window.usersController.closeUserModal();
    }
};

window.closeUserDetailsModal = function() {
    if (window.usersController) {
        window.usersController.closeUserModal();
    }
};

window.editUserFromDetails = function() {
    if (window.usersController) {
        window.usersController.editUserFromDetails();
    }
};

window.viewUser = function(userId) {
    if (window.usersController) {
        window.usersController.viewUser(userId);
    }
};

window.deleteUser = function(userId) {
    if (window.usersController) {
        window.usersController.deleteUser(userId);
    }
};
