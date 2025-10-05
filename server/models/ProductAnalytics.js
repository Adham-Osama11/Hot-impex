const mongoose = require('mongoose');

/**
 * Product Visit Analytics Schema
 * Tracks individual visits to product pages
 */
const ProductVisitSchema = new mongoose.Schema({
    // Product identification
    productId: {
        type: String,
        required: true,
        index: true
    },
    productName: {
        type: String,
        required: true
    },
    productCategory: {
        type: String,
        index: true
    },
    
    // Visit information
    visitTimestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    
    // User identification (optional)
    userId: {
        type: String,
        default: null
    },
    sessionId: {
        type: String,
        index: true
    },
    
    // Technical details
    userAgent: String,
    ipAddress: String,
    referrer: String,
    
    // Location data (optional)
    country: String,
    city: String
}, {
    timestamps: true, // Adds createdAt and updatedAt
    collection: 'product_visits'
});

// Compound indexes for efficient queries
ProductVisitSchema.index({ productId: 1, visitTimestamp: -1 });
ProductVisitSchema.index({ visitTimestamp: -1 });
ProductVisitSchema.index({ productCategory: 1, visitTimestamp: -1 });

/**
 * Product Analytics Summary Schema
 * Aggregated data for faster queries
 */
const ProductAnalyticsSummarySchema = new mongoose.Schema({
    productId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    productName: {
        type: String,
        required: true
    },
    productCategory: {
        type: String,
        index: true
    },
    
    // Visit statistics
    totalVisits: {
        type: Number,
        default: 0,
        index: true
    },
    uniqueVisitors: {
        type: Number,
        default: 0
    },
    
    // Time-based statistics
    visitsToday: {
        type: Number,
        default: 0
    },
    visitsThisWeek: {
        type: Number,
        default: 0
    },
    visitsThisMonth: {
        type: Number,
        default: 0
    },
    
    // Timestamps
    firstVisit: Date,
    lastVisit: Date,
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    collection: 'product_analytics_summary'
});

// Create the models
const ProductVisit = mongoose.model('ProductVisit', ProductVisitSchema);
const ProductAnalyticsSummary = mongoose.model('ProductAnalyticsSummary', ProductAnalyticsSummarySchema);

module.exports = {
    ProductVisit,
    ProductAnalyticsSummary
};