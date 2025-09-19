/**
 * Products Controller (robust single-bind + form-clone)
 * - Removes any previously attached listeners by cloning the form
 * - Determines mode (add vs edit) from hidden input value (id/productId)
 * - Disables submit button + guards re-entrancy
 * - Safe to call multiple times; it will re-bind cleanly
 */
class ProductsController {
  constructor(api) {
    this.api = api;
    this.currentProducts = [];
    this.isSubmitting = false;
    this.isEditing = false;          // kept only for UI text; not used for logic
    this.editingProductId = null;    // kept only for UI text; not used for logic
    this.bindFormOnce();
  }

  /** Remove all old listeners and attach exactly one submit handler */
  bindFormOnce() {
    // Add Product Form
    const addForm = document.getElementById('addProductForm');
    if (addForm && !addForm.dataset.pctrlSanitized) {
      const newAddForm = addForm.cloneNode(true);
      newAddForm.removeAttribute('onsubmit');
      newAddForm.dataset.pctrlSanitized = '1';
      addForm.parentNode.replaceChild(newAddForm, addForm);
      newAddForm.addEventListener('submit', (e) => this.onAddSubmit(e, newAddForm), { capture: true });
    }

    // Edit Product Form
    const editForm = document.getElementById('editProductForm');
    if (editForm && !editForm.dataset.pctrlSanitized) {
      const newEditForm = editForm.cloneNode(true);
      newEditForm.removeAttribute('onsubmit');
      newEditForm.dataset.pctrlSanitized = '1';
      editForm.parentNode.replaceChild(newEditForm, editForm);
      newEditForm.addEventListener('submit', (e) => this.onEditSubmit(e, newEditForm), { capture: true });
    }
  }

  async onAddSubmit(e, form) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    const submitBtn = e.submitter || form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    try {
      const fd = new FormData(form);
      const productData = {
        name: (fd.get('name') || '').trim(),
        category: (fd.get('category') || '').trim(),
        price: parseFloat(fd.get('price') || '0') || 0,
        stockQuantity: parseInt(fd.get('stock'), 10) || 0,
        shortDescription: (fd.get('shortDescription') || '').trim(),
        description: (fd.get('description') || '').trim(),
        images: String(fd.get('images') || '').split('\n').map(s => s.trim()).filter(Boolean)
      };
      await this.api.createProduct(productData);
      NotificationManager.showSuccess('Product added successfully!');
      this.closeModal();
      await this.loadData();
    } catch (err) {
      console.error('Failed to add product:', err);
      NotificationManager.showError('Failed to add product: ' + (err?.message || 'Unknown error'));
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      this.isSubmitting = false;
    }
  }

  async onEditSubmit(e, form) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();
    if (this.isSubmitting) return;
    this.isSubmitting = true;
    const submitBtn = e.submitter || form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;
    try {
      const fd = new FormData(form);
      const idField = (fd.get('id') || '').trim();
      if (!idField) throw new Error('Missing product ID for edit');
      const productData = {
        name: (fd.get('name') || '').trim(),
        category: (fd.get('category') || '').trim(),
        price: parseFloat(fd.get('price') || '0') || 0,
        stockQuantity: parseInt(fd.get('stock'), 10) || 0,
        shortDescription: (fd.get('shortDescription') || '').trim(),
        description: (fd.get('description') || '').trim(),
        images: String(fd.get('images') || '').split('\n').map(s => s.trim()).filter(Boolean)
      };
      await this.api.updateProduct(idField, productData);
      NotificationManager.showSuccess('Product updated successfully!');
      this.closeModal();
      await this.loadData();
    } catch (err) {
      console.error('Failed to update product:', err);
      NotificationManager.showError('Failed to update product: ' + (err?.message || 'Unknown error'));
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      this.isSubmitting = false;
    }
  }

  /** Figure mode by reading hidden input, then call API exactly once */
  async onSubmit(e, form) {
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation();

    if (this.isSubmitting) return;
    this.isSubmitting = true;

    const submitBtn = e.submitter || form.querySelector('[type="submit"]');
    if (submitBtn) submitBtn.disabled = true;

    try {
      const fd = new FormData(form);

      // IMPORTANT: set name="id" on your hidden input (#productId). We also fall back to name="productId".
      const idField = (fd.get('id') || fd.get('productId') || '').trim();
      const mode = idField ? 'update' : 'create';

      // Build payload
      const productData = {
        name: (fd.get('name') || '').trim(),
        category: (fd.get('category') || '').trim(),
        price: parseFloat(fd.get('price') || '0') || 0,
        // Use stockQuantity (what your schema expects); accept "stock" from form
        stockQuantity: parseInt(fd.get('stock'), 10) || 0,
        shortDescription: (fd.get('shortDescription') || '').trim(),
        description: (fd.get('description') || '').trim(),
        images: String(fd.get('images') || '')
          .split('\n')
          .map(s => s.trim())
          .filter(Boolean)
      };

      if (mode === 'update') {
        await this.api.updateProduct(idField, productData);
        NotificationManager.showSuccess('Product updated successfully!');
      } else {
        await this.api.createProduct(productData);
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

  /** Load and render table */
  async loadData() {
    try {
      UIHelpers.showLoadingState('products');
      const productsResponse = await this.api.getProducts();
      this.currentProducts = productsResponse.data.products || [];
      this.updateTable(this.currentProducts);
      UIHelpers.hideLoadingState();
    } catch (error) {
      console.error('Failed to load products data:', error);
      UIHelpers.showErrorState('Failed to load products data');
    }
  }

  updateTable(products) {
    const tbody = document.querySelector('#products-section tbody');
    if (!tbody) return;
    tbody.innerHTML = (products || []).map(product => `
      <tr class="border-b border-white/10 dark:border-gray-700/50 hover:bg-white/5 dark:hover:bg-gray-800/20">
        <td class="px-6 py-4 font-medium whitespace-nowrap">${product.name ?? ''}</td>
        <td class="px-6 py-4">${product.category ?? ''}</td>
        <td class="px-6 py-4">$${Number(product.price || 0).toFixed(2)}</td>
        <!-- <td class="px-6 py-4">${product.stockQuantity ?? product.stock ?? 'N/A'}</td> -->
        <td class="px-6 py-4 text-right space-x-2">
          <button onclick="productsController.editProduct('${product.id}')" class="text-blue-500 hover:text-blue-400">Edit</button>
          <button onclick="productsController.deleteProduct('${product.id}')" class="text-red-500 hover:text-red-400">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  /** UI helpers — still set labels, but logic derives from hidden field */
  showAddModal() {
  this.isEditing = false;
  this.editingProductId = null;
  document.getElementById('modalTitle').textContent = 'Add New Product';
  document.getElementById('addProductForm').reset();
  document.getElementById('addProductForm').classList.remove('hidden');
  document.getElementById('editProductForm').classList.add('hidden');
  document.getElementById('productModal').classList.remove('hidden');
  this.bindFormOnce();
  }

  async editProduct(productId) {
    const product = this.currentProducts.find(p => p.id === productId);
    if (!product) return NotificationManager.showError('Product not found');

  this.isEditing = true;
  this.editingProductId = productId;
  document.getElementById('modalTitle').textContent = 'Edit Product';
  document.getElementById('editProductForm').reset();
  document.getElementById('addProductForm').classList.add('hidden');
  document.getElementById('editProductForm').classList.remove('hidden');
  // Populate fields
  document.getElementById('productName').value = product.name || '';
  document.getElementById('productCategory').value = product.category || '';
  document.getElementById('productPrice').value = product.price ?? '';
  document.getElementById('productStock').value = product.stockQuantity ?? product.stock ?? '';
  document.getElementById('productShortDescription').value = product.shortDescription ?? '';
  document.getElementById('productDescription').value = product.description ?? '';
  document.getElementById('productImages').value = Array.isArray(product.images) ? product.images.join('\n') : '';
  // CRUCIAL: set hidden id so mode becomes "update"
  const hidden = document.getElementById('productId');
  if (hidden) hidden.value = product.id;
  document.getElementById('productModal').classList.remove('hidden');
  this.bindFormOnce();
  }

  async deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await this.api.deleteProduct(productId);
      await this.loadData();
      NotificationManager.showSuccess('Product deleted successfully');
    } catch (error) {
      console.error('Failed to delete product:', error);
      NotificationManager.showError('Failed to delete product');
    }
  }

  closeModal() {
    document.getElementById('productModal').classList.add('hidden');
    const form = document.getElementById('productForm');
    if (form) form.reset();
    const hidden = document.getElementById('productId');
    if (hidden) hidden.value = '';
    this.isSubmitting = false;
  }

  filterByCategory(category) {
    if (category === 'all') return this.updateTable(this.currentProducts);
    const q = String(category || '').toLowerCase();
    this.updateTable(this.currentProducts.filter(p => (p.category || '').toLowerCase() === q));
  }

  searchProducts(term) {
    const q = String(term || '').toLowerCase();
    this.updateTable(this.currentProducts.filter(p =>
      (p.name || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q)
    ));
  }
}

// --- Singleton install helper (use this pattern where you instantiate) ---
// window.productsController = window.productsController || new ProductsController(api);
// If already created, you can call: window.productsController.bindFormOnce();
