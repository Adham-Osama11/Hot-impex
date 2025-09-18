/**
 * Products Controller (single-flight, single-listener)
 * - Attaches the submit listener only once per page
 * - Uses capture-phase + stopImmediatePropagation to block other handlers
 * - Disables the submit button while the request is in-flight
 */
class ProductsController {
  constructor(api) {
    this.api = api;
    this.currentProducts = [];
    this.isEditing = false;
    this.editingProductId = null;
    this.isSubmitting = false;
    this.boundCaptureSubmit = null; // keep ref so we don't double-bind
    this.initializeEventListeners();
  }

  initializeEventListeners() {
    const attach = () => {
      const form = document.getElementById('productForm');
      if (!form) return;

      // Prevent duplicate bindings from this controller
      if (form.dataset.productsControllerBound === 'true') return;
      form.dataset.productsControllerBound = 'true';

      // Neutralize any inline onsubmit or legacy handlers
      form.removeAttribute('onsubmit');

      // Capture-phase gate: we intercept first, then stop others
      this.boundCaptureSubmit = (e) => {
        // If we’re already submitting, swallow subsequent submits
        if (this.isSubmitting) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          return;
        }

        // Hard-stop any other submit listeners (legacy admin.js, etc.)
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // Hand off to the real handler
        this.handleProductSubmit(e, form);
      };
      form.addEventListener('submit', this.boundCaptureSubmit, { capture: true });
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', attach, { once: true });
    } else {
      attach();
    }
  }

  async loadData() {
    try {
      UIHelpers.showLoadingState('products');
      const productsResponse = await this.api.getProducts();
      this.currentProducts = productsResponse.data.products;
      this.updateTable(this.currentProducts);
      UIHelpers.hideLoadingState();
    } catch (err) {
      console.error('Failed to load products data:', err);
      UIHelpers.showErrorState('Failed to load products data');
    }
  }

  updateTable(products) {
    const tableBody = document.querySelector('#products-section tbody');
    if (!tableBody) return;
    tableBody.innerHTML = products.map(product => `
      <tr class="border-b border-white/10 dark:border-gray-700/50 hover:bg-white/5 dark:hover:bg-gray-800/20">
        <td class="px-6 py-4 font-medium whitespace-nowrap">${product.name}</td>
        <td class="px-6 py-4">${product.category}</td>
        <td class="px-6 py-4">$${Number(product.price).toFixed(2)}</td>
        <td class="px-6 py-4">${product.stockQuantity ?? product.stock ?? 'N/A'}</td>
        <td class="px-6 py-4 text-right space-x-2">
          <button onclick="productsController.editProduct('${product.id}')" class="text-blue-500 hover:text-blue-400">Edit</button>
          <button onclick="productsController.deleteProduct('${product.id}')" class="text-red-500 hover:text-red-400">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  showAddModal() {
    this.isEditing = false;
    this.editingProductId = null;

    document.getElementById('modalTitle').textContent = 'Add New Product';
    document.getElementById('submitButtonText').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';

    document.getElementById('productModal').classList.remove('hidden');
  }

  async editProduct(productId) {
    try {
      const product = this.currentProducts.find(p => p.id === productId);
      if (!product) return NotificationManager.showError('Product not found');

      this.isEditing = true;
      this.editingProductId = productId;

      document.getElementById('modalTitle').textContent = 'Edit Product';
      document.getElementById('submitButtonText').textContent = 'Update Product';
      document.getElementById('productId').value = product.id;
      document.getElementById('productName').value = product.name || '';
      document.getElementById('productCategory').value = product.category || '';
      document.getElementById('productPrice').value = product.price ?? '';
      document.getElementById('productStock').value = product.stockQuantity ?? product.stock ?? '';
      document.getElementById('productShortDescription').value = product.shortDescription ?? '';
      document.getElementById('productDescription').value = product.description ?? '';
      document.getElementById('productImages').value = Array.isArray(product.images) ? product.images.join('\n') : '';

      document.getElementById('productModal').classList.remove('hidden');
    } catch (err) {
      console.error('Failed to edit product:', err);
      NotificationManager.showError('Failed to load product data');
    }
  }

  async deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await this.api.deleteProduct(productId);
      await this.loadData();
      NotificationManager.showSuccess('Product deleted successfully');
    } catch (err) {
      console.error('Failed to delete product:', err);
      NotificationManager.showError('Failed to delete product');
    }
  }

  // NOTE: form is passed from the capture listener so we can disable the button safely
  async handleProductSubmit(e, form) {
    if (this.isSubmitting) return;
    this.isSubmitting = true;

    // Disable the submitter button to block double-clicks
    const submitBtn = e.submitter || (form && form.querySelector('[type="submit"]'));
    if (submitBtn) submitBtn.disabled = true;

    try {
      const fd = new FormData(form || e.target);
      const productData = {
        name: fd.get('name')?.trim(),
        category: fd.get('category')?.trim(),
        price: parseFloat(fd.get('price')) || 0,
        // Use stockQuantity (what your schema expects), still accept "stock" from form
        stockQuantity: parseInt(fd.get('stock'), 10) || 0,
        shortDescription: fd.get('shortDescription')?.trim() || '',
        description: fd.get('description')?.trim() || '',
        images: (fd.get('images') || '')
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean)
      };

      let result;
      if (this.isEditing && this.editingProductId) {
        result = await this.api.updateProduct(this.editingProductId, productData);
        NotificationManager.showSuccess('Product updated successfully!');
      } else {
        result = await this.api.createProduct(productData);
        NotificationManager.showSuccess('Product added successfully!');
      }

      this.closeModal();
      await this.loadData();
    } catch (err) {
      console.error('Failed to save product:', err);
      NotificationManager.showError('Failed to save product: ' + (err?.message || 'Unknown error'));
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      this.isSubmitting = false;
    }
  }

  closeModal() {
    document.getElementById('productModal').classList.add('hidden');
    document.getElementById('productForm').reset();
    this.isEditing = false;
    this.editingProductId = null;
    this.isSubmitting = false;
  }

  filterByCategory(category) {
    if (category === 'all') return this.updateTable(this.currentProducts);
    const filtered = this.currentProducts.filter(p => (p.category || '').toLowerCase() === category.toLowerCase());
    this.updateTable(filtered);
  }

  searchProducts(searchTerm) {
    const q = (searchTerm || '').toLowerCase();
    const filtered = this.currentProducts.filter(p =>
      (p.name || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q)
    );
    this.updateTable(filtered);
  }
}

window.ProductsController = ProductsController;
