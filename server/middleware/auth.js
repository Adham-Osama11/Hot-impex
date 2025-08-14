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

const adminAuth = async (req, res, next) => {
    try {
        await auth(req, res, () => {});
        
        if (req.user && req.user.role === 'admin') {
            next();
        } else {
            res.status(403).json({
                status: 'error',
                message: 'Access denied. Admin privileges required.'
            });
        }
    } catch (error) {
        res.status(401).json({
            status: 'error',
            message: 'Authentication failed'
        });
    }
};

module.exports = { auth, adminAuth };
