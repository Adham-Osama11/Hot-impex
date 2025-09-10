const jwt = require('jsonwebtoken');
const hybridDb = require('../services/hybridDbService');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'No token, authorization denied'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hot-impex-secret-key');
        const user = await hybridDb.findUserById(decoded.id);
        
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Token is not valid'
            });
        }

        // Check if user is active (for MongoDB users)
        if (user.isActive !== undefined && !user.isActive) {
            return res.status(401).json({
                status: 'error',
                message: 'Account is deactivated'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'Token is not valid'
        });
    }
};

// Optional auth middleware - allows both authenticated and guest users
const optionalAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            // No token provided, continue as guest user
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hot-impex-secret-key');
        const user = await hybridDb.findUserById(decoded.id);
        
        if (!user) {
            // Invalid token, continue as guest user
            req.user = null;
            return next();
        }

        // Check if user is active (for MongoDB users)
        if (user.isActive !== undefined && !user.isActive) {
            // Inactive user, continue as guest user
            req.user = null;
            return next();
        }

        req.user = user;
        next();
    } catch (error) {
        // Token verification failed, continue as guest user
        req.user = null;
        next();
    }
};

const adminAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'No token, authorization denied'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hot-impex-secret-key');
        const user = await hybridDb.findUserById(decoded.id);
        
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'Token is not valid'
            });
        }

        // Check if user is active (for MongoDB users)
        if (user.isActive !== undefined && !user.isActive) {
            return res.status(401).json({
                status: 'error',
                message: 'Account is deactivated'
            });
        }

        // Check if user is admin
        if (user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Access denied. Admin privileges required.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Admin auth error:', error);
        return res.status(401).json({
            status: 'error',
            message: 'Token is not valid'
        });
    }
};

module.exports = { auth, optionalAuth, adminAuth };
