/**
 * Products Controller
 * Manages product-related functionality
 */
class ProductsController {
    constructor(api) {
        this.api = api;
        this.currentProducts = [];
        this.isEditing = false;
        this.editingProductId = null;
        this.isSubmitting = false; // Prevent double submit
        this.initializeEventListeners();
    }

    /**
     * Initialize event listeners
     */
    initializeEventListeners() {
        // Add immediate event listener if DOM is already loaded
        const attachListener = () => {
            const productForm = document.getElementById('productForm');
            if (productForm) {
                console.log('Attaching submit listener to productForm');
                productForm.addEventListener('submit', (e) => this.handleProductSubmit(e));
            } else {
                console.log('productForm not found');
            }
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', attachListener);
        } else {
            attachListener();
        }
    }

    /**
     * Load and display products data
     */
    async loadData() {
        try {
            UIHelpers.showLoadingState('products');
            const productsResponse = await this.api.getProducts();
            this.currentProducts = productsResponse.data.products;
            this.updateTable(this.currentProducts);
            UIHelpers.hideLoadingState();
        } catch (error) {
            console.error('Failed to load products data:', error);
            UIHelpers.showErrorState('Failed to load products data');
        }
    }

    /**
     * Update products table
     * @param {Array} products - Products array
     */
    updateTable(products) {
        const tableBody = document.querySelector('#products-section tbody');
        if (!tableBody) return;

        tableBody.innerHTML = products.map(product => `
            <tr class="border-b border-white/10 dark:border-gray-700/50 hover:bg-white/5 dark:hover:bg-gray-800/20">
                <td class="px-6 py-4 font-medium whitespace-nowrap">${product.name}</td>
                <td class="px-6 py-4">${product.category}</td>
                <td class="px-6 py-4">$${product.price.toFixed(2)}</td>
                <td class="px-6 py-4">${product.stockQuantity !== undefined ? product.stockQuantity : (product.stock || 'N/A')}</td>
                <td class="px-6 py-4 text-right space-x-2">
                    <button onclick="productsController.editProduct('${product.id}')" class="text-blue-500 hover:text-blue-400">Edit</button>
                    <button onclick="productsController.deleteProduct('${product.id}')" class="text-red-500 hover:text-red-400">Delete</button>
                </td>
            </tr>
        `).join('');
    }

    /**
     * Show add product modal
     */
    showAddModal() {
        this.isEditing = false;
        this.editingProductId = null;
        
        document.getElementById('modalTitle').textContent = 'Add New Product';
        document.getElementById('submitButtonText').textContent = 'Add Product';
        document.getElementById('productForm').reset();
        document.getElementById('productId').value = '';
        
        document.getElementById('productModal').classList.remove('hidden');
    }

    /**
     * Edit a product
     * @param {string} productId - Product ID to edit
     */
    async editProduct(productId) {
        try {
            const product = this.currentProducts.find(p => p.id === productId);
            
            if (!product) {
                NotificationManager.showError('Product not found');
                return;
            }
            
            this.isEditing = true;
            this.editingProductId = productId;
            
            // Populate the modal with product data
            document.getElementById('modalTitle').textContent = 'Edit Product';
            document.getElementById('submitButtonText').textContent = 'Update Product';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stockQuantity !== undefined ? product.stockQuantity : (product.stock || '');
            document.getElementById('productShortDescription').value = product.shortDescription || '';
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productImages').value = product.images ? product.images.join('\\n') : '';
            
            document.getElementById('productModal').classList.remove('hidden');
        } catch (error) {
            console.error('Failed to edit product:', error);
            NotificationManager.showError('Failed to load product data');
        }
    }

    /**
     * Delete a product
     * @param {string} productId - Product ID to delete
     */
    async deleteProduct(productId) {
        if (!confirm('Are you sure you want to delete this product?')) return;
        
        try {
            await this.api.deleteProduct(productId);
            await this.loadData(); // Reload products
            NotificationManager.showSuccess('Product deleted successfully');
        } catch (error) {
            console.error('Failed to delete product:', error);
            NotificationManager.showError('Failed to delete product');
        }
    }

    /**
     * Handle product form submission
     * @param {Event} e - Form submit event
     */
    async handleProductSubmit(e) {
        console.log('handleProductSubmit called', e);
        e.preventDefault();
        e.stopPropagation();
        if (this.isSubmitting) return; // Guard against double submit
        this.isSubmitting = true;

        const formData = new FormData(e.target);
        const productData = {
            name: formData.get('name'),
            category: formData.get('category'),
            price: parseFloat(formData.get('price')),
            stock: parseInt(formData.get('stock')) || 0,
            shortDescription: formData.get('shortDescription'),
            description: formData.get('description'),
            images: formData.get('images') ? 
                formData.get('images').split('\\n').filter(img => img.trim()) : []
        };

        try {
            let result;
            if (this.isEditing && this.editingProductId) {
                result = await this.api.updateProduct(this.editingProductId, productData);
                NotificationManager.showSuccess('Product updated successfully!');
            } else {
                result = await this.api.createProduct(productData);
                NotificationManager.showSuccess('Product added successfully!');
            }

            this.closeModal();
            await this.loadData(); // Reload products table
        } catch (error) {
            console.error('Failed to save product:', error);
            NotificationManager.showError('Failed to save product: ' + error.message);
        } finally {
            this.isSubmitting = false;
        }
    }

    /**
     * Close the product modal
     */
    closeModal() {
        document.getElementById('productModal').classList.add('hidden');
        document.getElementById('productForm').reset();
        this.isEditing = false;
        this.editingProductId = null;
        this.isSubmitting = false;
    }

    /**
     * Filter products by category
     * @param {string} category - Category to filter by
     */
    filterByCategory(category) {
        if (category === 'all') {
            this.updateTable(this.currentProducts);
        } else {
            const filtered = this.currentProducts.filter(product => 
                product.category.toLowerCase() === category.toLowerCase()
            );
            this.updateTable(filtered);
        }
    }

    /**
     * Search products by name
     * @param {string} searchTerm - Search term
     */
    searchProducts(searchTerm) {
        const filtered = this.currentProducts.filter(product =>
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.category.toLowerCase().includes(searchTerm.toLowerCase())
        );
        this.updateTable(filtered);
    }
}

// Export the controller
window.ProductsController = ProductsController;
