/**
 * UI Helpers
 * Utility functions for UI management
 */
class UIHelpers {
    /**
     * Show loading state for a specific section
     * @param {string} section - Section name
     */
    static showLoadingState(section = '') {
        const loadingHTML = `
            <div class="flex justify-center items-center py-8">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500"></div>
                <span class="ml-2 text-gray-600 dark:text-gray-400">Loading...</span>
            </div>
        `;
        
        if (section) {
            const sectionElement = document.querySelector(`#${section}-section tbody`);
            if (sectionElement) {
                sectionElement.innerHTML = loadingHTML;
            }
        } else {
            document.querySelectorAll('.admin-section:not(.hidden) tbody').forEach(tbody => {
                if (tbody) tbody.innerHTML = loadingHTML;
            });
        }
    }

    /**
     * Hide loading state
     */
    static hideLoadingState() {
        // Loading states will be replaced by actual content
    }

    /**
     * Show error state
     * @param {string} message - Error message
     * @param {string} section - Section name
     */
    static showErrorState(message, section = '') {
        const errorHTML = `
            <div class="flex flex-col justify-center items-center py-8 text-red-500">
                <svg class="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <p class="text-center">${message}</p>
                <button onclick="location.reload()" class="mt-2 px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600 transition-colors">
                    Retry
                </button>
            </div>
        `;
        
        if (section) {
            const sectionElement = document.querySelector(`#${section}-section tbody`);
            if (sectionElement) {
                sectionElement.innerHTML = errorHTML;
            }
        } else {
            document.querySelectorAll('.admin-section:not(.hidden) tbody').forEach(tbody => {
                if (tbody) tbody.innerHTML = errorHTML;
            });
        }
    }

    /**
     * Show empty state
     * @param {string} message - Empty state message
     * @param {string} section - Section name
     */
    static showEmptyState(message, section = '') {
        const emptyHTML = `
            <div class="flex flex-col justify-center items-center py-12 text-gray-500 dark:text-gray-400">
                <svg class="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"></path>
                </svg>
                <p class="text-lg font-medium">${message}</p>
                <p class="text-sm">No data available at the moment</p>
            </div>
        `;
        
        if (section) {
            const sectionElement = document.querySelector(`#${section}-section tbody`);
            if (sectionElement) {
                sectionElement.innerHTML = emptyHTML;
            }
        }
    }

    /**
     * Format currency
     * @param {number} amount - Amount to format
     * @param {string} currency - Currency code
     * @returns {string} - Formatted currency
     */
    static formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    }

    /**
     * Format date
     * @param {string|Date} date - Date to format
     * @returns {string} - Formatted date
     */
    static formatDate(date) {
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        }).format(new Date(date));
    }

    /**
     * Format relative time
     * @param {string|Date} date - Date to format
     * @returns {string} - Relative time
     */
    static formatRelativeTime(date) {
        const now = new Date();
        const targetDate = new Date(date);
        const diffTime = Math.abs(now - targetDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays === 0) return 'Today';
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
        return `${Math.floor(diffDays / 365)} years ago`;
    }

    /**
     * Debounce function
     * @param {Function} func - Function to debounce
     * @param {number} wait - Wait time in milliseconds
     * @returns {Function} - Debounced function
     */
    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Animate number counter
     * @param {HTMLElement} element - Element to animate
     * @param {number} end - End value
     * @param {number} duration - Animation duration in milliseconds
     */
    static animateCounter(element, end, duration = 1000) {
        const start = parseInt(element.textContent) || 0;
        const startTime = performance.now();
        
        function updateCounter(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const current = Math.floor(start + (end - start) * progress);
            element.textContent = current.toLocaleString();
            
            if (progress < 1) {
                requestAnimationFrame(updateCounter);
            }
        }
        
        requestAnimationFrame(updateCounter);
    }

    /**
     * Copy text to clipboard
     * @param {string} text - Text to copy
     * @returns {Promise<boolean>} - Success status
     */
    static async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                return true;
            } catch (err) {
                return false;
            } finally {
                document.body.removeChild(textArea);
            }
        }
    }

    /**
     * Validate email format
     * @param {string} email - Email to validate
     * @returns {boolean} - Validation result
     */
    static validateEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    /**
     * Truncate text
     * @param {string} text - Text to truncate
     * @param {number} length - Maximum length
     * @returns {string} - Truncated text
     */
    static truncateText(text, length = 50) {
        if (text.length <= length) return text;
        return text.substring(0, length) + '...';
    }
}

/**
 * Notification Manager
 * Handles toast notifications
 */
class NotificationManager {
    /**
     * Show success notification
     * @param {string} message - Success message
     */
    static showSuccess(message) {
        this.showNotification(message, 'success');
    }

    /**
     * Show error notification
     * @param {string} message - Error message
     */
    static showError(message) {
        this.showNotification(message, 'error');
    }

    /**
     * Show info notification
     * @param {string} message - Info message
     */
    static showInfo(message) {
        this.showNotification(message, 'info');
    }

    /**
     * Show warning notification
     * @param {string} message - Warning message
     */
    static showWarning(message) {
        this.showNotification(message, 'warning');
    }

    /**
     * Show notification
     * @param {string} message - Notification message
     * @param {string} type - Notification type
     */
    static showNotification(message, type = 'info') {
        const colors = {
            success: 'bg-green-500',
            error: 'bg-red-500',
            warning: 'bg-yellow-500',
            info: 'bg-blue-500'
        };

        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };

        const notification = document.createElement('div');
        notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg z-50 flex items-center space-x-2 transform translate-x-full transition-transform duration-300`;
        
        notification.innerHTML = `
            <span class="text-lg font-bold">${icons[type]}</span>
            <span>${message}</span>
            <button onclick="this.parentElement.remove()" class="ml-2 text-white hover:text-gray-200">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.classList.remove('translate-x-full');
        }, 100);

        // Auto remove after 5 seconds
        setTimeout(() => {
            notification.classList.add('translate-x-full');
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 5000);
    }
}

// Export classes
window.UIHelpers = UIHelpers;
window.NotificationManager = NotificationManager;
