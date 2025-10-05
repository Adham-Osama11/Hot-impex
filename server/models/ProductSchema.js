const mongoose = require('mongoose');

// Review sub-schema
const reviewSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    color: {
        type: String,
        default: 'blue'
    },
    initials: String
});

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
    detailedDescription: {
        type: String,
        required: true
    },
    perfectFor: [{
        type: String,
        required: true
    }],
    specifications: {
        type: Map,
        of: String,
        required: true,
        default: {}
    },
    packageContents: [{
        type: String,
        required: true
    }],
    setup: {
        quickStart: {
            type: String,
            required: true
        },
        instructions: [{
            type: String,
            required: true
        }],
        commonPatterns: [{
            type: String
        }]
    },
    reviews: [reviewSchema],
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
    },
    analytics: {
        totalViews: {
            type: Number,
            default: 0,
            min: 0
        },
        uniqueViews: {
            type: Number,
            default: 0,
            min: 0
        },
        viewsToday: {
            type: Number,
            default: 0,
            min: 0
        },
        viewsThisWeek: {
            type: Number,
            default: 0,
            min: 0
        },
        viewsThisMonth: {
            type: Number,
            default: 0,
            min: 0
        },
        lastViewed: {
            type: Date
        },
        firstViewed: {
            type: Date
        },
        popularityScore: {
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
productSchema.index({ 'analytics.totalViews': -1 });
productSchema.index({ 'analytics.popularityScore': -1 });
productSchema.index({ 'analytics.lastViewed': -1 });

// Virtual for checking if product is available
productSchema.virtual('isAvailable').get(function() {
    return this.inStock && this.stockQuantity > 0;
});

// Virtual for calculating view-to-sale conversion rate
productSchema.virtual('conversionRate').get(function() {
    if (this.analytics.totalViews === 0) return 0;
    return (this.sold / this.analytics.totalViews * 100).toFixed(2);
});

// Virtual for checking if product is trending (high views in recent period)
productSchema.virtual('isTrending').get(function() {
    const weeklyViews = this.analytics.viewsThisWeek || 0;
    const totalViews = this.analytics.totalViews || 0;
    
    // Product is trending if more than 30% of total views happened this week
    return totalViews > 10 && (weeklyViews / totalViews) > 0.3;
});

// Virtual for analytics summary
productSchema.virtual('analyticsInfo').get(function() {
    return {
        totalViews: this.analytics.totalViews,
        uniqueViews: this.analytics.uniqueViews,
        viewsToday: this.analytics.viewsToday,
        viewsThisWeek: this.analytics.viewsThisWeek,
        viewsThisMonth: this.analytics.viewsThisMonth,
        popularityScore: this.analytics.popularityScore,
        conversionRate: this.conversionRate,
        isTrending: this.isTrending,
        lastViewed: this.analytics.lastViewed,
        firstViewed: this.analytics.firstViewed
    };
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

// Static method to get most viewed products
productSchema.statics.getMostViewed = function(limit = 10, timeframe = 'all') {
    let sortField = 'analytics.totalViews';
    
    switch (timeframe) {
        case 'today':
            sortField = 'analytics.viewsToday';
            break;
        case 'week':
            sortField = 'analytics.viewsThisWeek';
            break;
        case 'month':
            sortField = 'analytics.viewsThisMonth';
            break;
        default:
            sortField = 'analytics.totalViews';
    }
    
    const sort = {};
    sort[sortField] = -1;
    
    return this.find({ inStock: true })
        .sort(sort)
        .limit(limit)
        .select('id name category analytics price mainImage');
};

// Static method to get trending products
productSchema.statics.getTrendingProducts = function(limit = 10) {
    return this.find({
        inStock: true,
        'analytics.totalViews': { $gt: 10 }
    })
    .sort({ 'analytics.popularityScore': -1 })
    .limit(limit)
    .select('id name category analytics price mainImage');
};

// Static method to update product analytics
productSchema.statics.updateAnalytics = function(productId, viewData) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(today.getTime() - (7 * 24 * 60 * 60 * 1000));
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // Calculate popularity score based on recent activity
    const weeklyWeight = 0.5;
    const monthlyWeight = 0.3;
    const totalWeight = 0.2;
    
    return this.findOneAndUpdate(
        { id: productId },
        {
            $inc: {
                'analytics.totalViews': 1,
                ...(viewData.isUnique && { 'analytics.uniqueViews': 1 }),
                ...(viewData.timestamp >= today && { 'analytics.viewsToday': 1 }),
                ...(viewData.timestamp >= thisWeek && { 'analytics.viewsThisWeek': 1 }),
                ...(viewData.timestamp >= thisMonth && { 'analytics.viewsThisMonth': 1 })
            },
            $set: {
                'analytics.lastViewed': viewData.timestamp,
                ...(viewData.isFirstView && { 'analytics.firstViewed': viewData.timestamp })
            }
        },
        { new: true }
    ).then(product => {
        if (product) {
            // Calculate and update popularity score
            const popularityScore = 
                (product.analytics.viewsThisWeek * weeklyWeight) +
                (product.analytics.viewsThisMonth * monthlyWeight) +
                (product.analytics.totalViews * totalWeight);
                
            return this.findOneAndUpdate(
                { id: productId },
                { $set: { 'analytics.popularityScore': Math.round(popularityScore) } },
                { new: true }
            );
        }
        return product;
    });
};

// Static method to reset daily/weekly/monthly counters (for scheduled tasks)
productSchema.statics.resetPeriodCounters = function(period) {
    let updateField = {};
    
    switch (period) {
        case 'daily':
            updateField = { 'analytics.viewsToday': 0 };
            break;
        case 'weekly':
            updateField = { 'analytics.viewsThisWeek': 0 };
            break;
        case 'monthly':
            updateField = { 'analytics.viewsThisMonth': 0 };
            break;
    }
    
    return this.updateMany({}, { $set: updateField });
};

module.exports = mongoose.model('Product', productSchema);
