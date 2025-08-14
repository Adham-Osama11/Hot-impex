class Product {
    constructor(data) {
        this.id = data.id;
        this.name = data.name;
        this.category = data.category;
        this.categorySlug = data.categorySlug;
        this.description = data.description;
        this.shortDescription = data.shortDescription;
        this.price = data.price;
        this.currency = data.currency || 'EGP';
        this.inStock = data.inStock !== undefined ? data.inStock : true;
        this.featured = data.featured || false;
        this.bestSeller = data.bestSeller || false;
        this.images = data.images || [];
        this.mainImage = data.mainImage;
        this.specifications = data.specifications || {};
        this.warranty = data.warranty;
        this.brand = data.brand;
        this.model = data.model;
        this.tags = data.tags || [];
        this.createdAt = data.createdAt || new Date().toISOString();
        this.updatedAt = data.updatedAt || new Date().toISOString();
    }

    static validate(data) {
        const errors = [];

        if (!data.name || data.name.trim().length === 0) {
            errors.push('Product name is required');
        }

        if (!data.category || data.category.trim().length === 0) {
            errors.push('Product category is required');
        }

        if (!data.price || data.price <= 0) {
            errors.push('Product price must be greater than 0');
        }

        if (!data.description || data.description.trim().length === 0) {
            errors.push('Product description is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    static generateId(name) {
        const prefix = name.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 20);
        
        const timestamp = Date.now().toString().slice(-6);
        return `${prefix}-${timestamp}`;
    }

    toJSON() {
        return {
            id: this.id,
            name: this.name,
            category: this.category,
            categorySlug: this.categorySlug,
            description: this.description,
            shortDescription: this.shortDescription,
            price: this.price,
            currency: this.currency,
            inStock: this.inStock,
            featured: this.featured,
            bestSeller: this.bestSeller,
            images: this.images,
            mainImage: this.mainImage,
            specifications: this.specifications,
            warranty: this.warranty,
            brand: this.brand,
            model: this.model,
            tags: this.tags,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }
}

module.exports = Product;
