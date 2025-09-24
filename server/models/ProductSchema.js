const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        required: true,
        trim: true
    },
    categorySlug: {
        type: String,
        required: true,
        lowercase: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: true
    },
    shortDescription: {
        type: String,
        required: true
    },
    datasheet: {
    type: String, // URL or file path to PDF
    trim: true
    },

    price: {
        type: Number,
        required: true,
        min: 0
    },
    currency: {
        type: String,
        default: 'EGP',
        enum: ['EGP', 'USD', 'EUR']
    },
    inStock: {
        type: Boolean,
        default: true
    },
    featured: {
        type: Boolean,
        default: false,
        index: true
    },
    bestSeller: {
        type: Boolean,
        default: false,
        index: true
    },
    images: [{
        type: String
    }],
    mainImage: {
        type: String
    },
    specifications: {
        type: Map,
        of: String,
        default: {}
    },
    features: [{
        type: String
    }],
    warranty: {
        type: String
    },
    brand: {
        type: String
    },
    model: {
        type: String
    },
    tags: [{
        type: String,
        lowercase: true,
        trim: true
    }],
    stockQuantity: {
        type: Number,
        default: 0,
        min: 0
    },
    sold: {
        type: Number,
        default: 0,
        min: 0
    },
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0,
            min: 0
        }
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
productSchema.index({ name: 'text', description: 'text', tags: 'text' });
productSchema.index({ category: 1, inStock: 1 });
productSchema.index({ price: 1 });
productSchema.index({ featured: 1, bestSeller: 1 });

// Virtual for checking if product is available
productSchema.virtual('isAvailable').get(function() {
    return this.inStock && this.stockQuantity > 0;
});

// Static method to search products
productSchema.statics.searchProducts = function(query, options = {}) {
    const {
        category,
        minPrice,
        maxPrice,
        inStock,
        featured,
        bestSeller,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        page = 1,
        limit = 10
    } = options;

    let searchQuery = {};

    // Text search
    if (query) {
        searchQuery.$text = { $search: query };
    }

    // Category filter
    if (category) {
        searchQuery.categorySlug = category;
    }

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
        searchQuery.price = {};
        if (minPrice !== undefined) searchQuery.price.$gte = minPrice;
        if (maxPrice !== undefined) searchQuery.price.$lte = maxPrice;
    }

    // Stock filter
    if (inStock !== undefined) {
        searchQuery.inStock = inStock;
    }

    // Featured filter
    if (featured !== undefined) {
        searchQuery.featured = featured;
    }

    // Best seller filter
    if (bestSeller !== undefined) {
        searchQuery.bestSeller = bestSeller;
    }

    const skip = (page - 1) * limit;
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    return this.find(searchQuery)
        .sort(sort)
        .skip(skip)
        .limit(limit);
};

module.exports = mongoose.model('Product', productSchema);
