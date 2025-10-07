/**
 * Products Controller (robust single-bind + form-clone)
 * - Clones forms to remove old listeners and attaches exactly one handler
 * - Uses separate add/edit forms inside a single modal
 * - Disables submit button + guards re-entrancy
 * - Safe to call multiple times; it will re-bind cleanly
 */
class ProductsController {
  constructor(api) {
    this.api = api;
    this.currentProducts = [];
    this.isSubmitting = false;
    this.isEditing = false;          // UI only
    this.editingProductId = null;    // UI only
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
      // Use explicit field IDs for add form
      const stockQ = parseInt(form.querySelector('#addProductStock')?.value, 10) || 0;
      const productData = {
        name: (form.querySelector('#addProductName')?.value || '').trim(),
        category: (form.querySelector('#addProductCategory')?.value || '').trim(),
        price: parseFloat(form.querySelector('#addProductPrice')?.value || '0') || 0,
        stock: stockQ,                 // compat
        stockQuantity: stockQ,         // compat
        shortDescription: (form.querySelector('#addProductShortDescription')?.value || '').trim(),
        description: (form.querySelector('#addProductDescription')?.value || '').trim(),
        detailedDescription: (form.querySelector('#addProductDetailedDescription')?.value || '').trim(),
        images: (form.querySelector('#addProductImages')?.value || '')
          .split('\n').map(s => s.trim()).filter(Boolean),
        datasheet: (form.querySelector('#addProductDatasheet')?.value || '').trim() || null,   // ✅ NEW
        setup: {
          quickStart: (form.querySelector('#addProductQuickStart')?.value || '').trim()
        }
      };

      await this.api.createProduct(productData);
      NotificationManager?.showSuccess?.('Product added successfully!');
      this.closeModal();
      await this.loadData();
    } catch (err) {
      console.error('Failed to add product:', err);
      NotificationManager?.showError?.('Failed to add product: ' + (err?.message || 'Unknown error'));
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

      const stockE = parseInt(fd.get('stock'), 10) || 0;
      const productData = {
        name: (fd.get('name') || '').trim(),
        category: (fd.get('category') || '').trim(),
        price: parseFloat(fd.get('price') || '0') || 0,
        stock: stockE,                 // compat
        stockQuantity: stockE,         // compat
        shortDescription: (fd.get('shortDescription') || '').trim(),
        description: (fd.get('description') || '').trim(),
        detailedDescription: (fd.get('detailedDescription') || '').trim(),
        images: String(fd.get('images') || '')
          .split('\n').map(s => s.trim()).filter(Boolean),
        datasheet: (fd.get('datasheet') || '').trim() || null,   // ✅ NEW
        setup: {
          quickStart: (fd.get('quickStart') || '').trim()
        }
      };

      await this.api.updateProduct(idField, productData);
      NotificationManager?.showSuccess?.('Product updated successfully!');
      this.closeModal();
      await this.loadData();
    } catch (err) {
      console.error('Failed to update product:', err);
      NotificationManager?.showError?.('Failed to update product: ' + (err?.message || 'Unknown error'));
    } finally {
      if (submitBtn) submitBtn.disabled = false;
      this.isSubmitting = false;
    }
  }

  /** Load and render table */
  async loadData() {
    try {
      UIHelpers?.showLoadingState?.('products');
      const productsResponse = await this.api.getProducts();
      this.currentProducts = productsResponse?.data?.products || [];
      this.updateTable(this.currentProducts);
    } catch (error) {
      console.error('Failed to load products data:', error);
      UIHelpers?.showErrorState?.('Failed to load products data');
    } finally {
      UIHelpers?.hideLoadingState?.();
    }
  }

  updateTable(products) {
    const tbody = document.querySelector('#products-section tbody');
    if (!tbody) return;

    if (!products || !products.length) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
            <div class="flex flex-col items-center">
              <svg class="w-12 h-12 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
              <p>No products yet.</p>
            </div>
          </td>
        </tr>`;
      return;
    }

    tbody.innerHTML = products.map(p => `
      <tr class="border-b border-white/10 dark:border-gray-700/50 hover:bg-white/5 dark:hover:bg-gray-800/20">
        <td class="px-6 py-4 font-medium whitespace-nowrap">${p.name ?? ''}</td>
        <td class="px-6 py-4">${p.category ?? ''}</td>
        <td class="px-6 py-4">$${Number(p.price || 0).toFixed(2)}</td>
        <td class="px-6 py-4">${p.stockQuantity ?? p.stock ?? 'N/A'}</td>
        <td class="px-6 py-4">
          ${p.datasheet ? `<a href="${p.datasheet}" target="_blank" class="text-blue-500 underline">Datasheet</a>` : '—'}
        </td>
        <td class="px-6 py-4 text-right space-x-2">
          <button onclick="productsController.editProduct('${p.id}')" class="text-blue-500 hover:text-blue-400">Edit</button>
          <button onclick="productsController.deleteProduct('${p.id}')" class="text-red-500 hover:text-red-400">Delete</button>
        </td>
      </tr>
    `).join('');
  }

  /** UI helpers — toggle between add/edit forms inside the same modal */
  showAddModal() {
    this.isEditing = false;
    this.editingProductId = null;

    const addForm = document.getElementById('addProductForm');
    const editForm = document.getElementById('editProductForm');
    document.getElementById('modalTitle').textContent = 'Add New Product';

    if (addForm) {
      addForm.reset();
      addForm.classList.remove('hidden');
    }
    if (editForm) editForm.classList.add('hidden');

    document.getElementById('productModal').classList.remove('hidden');
    this.bindFormOnce();
  }

  async editProduct(productId) {
    const product = this.currentProducts.find(p => p.id === productId);
    if (!product) return NotificationManager?.showError?.('Product not found');

    this.isEditing = true;
    this.editingProductId = productId;

    document.getElementById('modalTitle').textContent = 'Edit Product';

    // Ensure the edit form is visible, add form hidden
    const addForm = document.getElementById('addProductForm');
    const editForm = document.getElementById('editProductForm');
    if (addForm) addForm.classList.add('hidden');
    if (editForm) editForm.classList.remove('hidden');

    // Populate edit fields
    document.getElementById('productId').value = product.id || '';
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productPrice').value = product.price ?? '';
    document.getElementById('productStock').value = product.stockQuantity ?? product.stock ?? '';
    document.getElementById('productShortDescription').value = product.shortDescription ?? '';
    document.getElementById('productDescription').value = product.description ?? '';
    document.getElementById('productDetailedDescription').value = product.detailedDescription ?? '';
    document.getElementById('productQuickStart').value = product.setup?.quickStart ?? '';
    document.getElementById('productImages').value = Array.isArray(product.images) ? product.images.join('\n') : '';
    document.getElementById('productDatasheet').value = product.datasheet ?? '';   // ✅ NEW

    document.getElementById('productModal').classList.remove('hidden');
    this.bindFormOnce();
  }

  async deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      await this.api.deleteProduct(productId);
      await this.loadData();
      NotificationManager?.showSuccess?.('Product deleted successfully');
    } catch (error) {
      console.error('Failed to delete product:', error);
      NotificationManager?.showError?.('Failed to delete product');
    }
  }

  closeModal() {
    const modal = document.getElementById('productModal');
    if (modal) modal.classList.add('hidden');

    const addForm = document.getElementById('addProductForm');
    const editForm = document.getElementById('editProductForm');
    if (addForm) {
      addForm.reset();
      addForm.classList.add('hidden');
    }
    if (editForm) {
      editForm.reset();
      editForm.classList.add('hidden');
    }
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

// Make available globally
window.ProductsController = ProductsController;
