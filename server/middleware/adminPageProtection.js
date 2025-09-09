/**
 * Admin Page Protection Middleware
 * Checks if user has admin privileges before serving admin pages
 */
const jwt = require('jsonwebtoken');
const hybridDb = require('../services/hybridDbService');

const adminPageProtection = async (req, res, next) => {
    // Only protect admin pages
    if (!req.path.startsWith('/admin/')) {
        return next();
    }

    // Skip protection for assets
    if (req.path.includes('/assets/') || req.path.includes('.js') || req.path.includes('.css') || req.path.includes('.png') || req.path.includes('.jpg') || req.path.includes('.svg')) {
        return next();
    }

    try {
        // Check for token in various places (for flexibility during development)
        const authHeader = req.headers.authorization;
        const tokenFromHeader = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
        const tokenFromQuery = req.query.token;
        const tokenFromCookie = req.cookies && req.cookies['hotimpex-token'];
        
        const token = tokenFromHeader || tokenFromQuery || tokenFromCookie;
        
        if (!token) {
            return res.status(401).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Admin Access Required - HOT IMPEX</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        body { 
                            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                            font-family: 'Inter', sans-serif;
                        }
                    </style>
                </head>
                <body class="min-h-screen flex items-center justify-center p-4">
                    <div class="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
                        <div class="text-6xl mb-4">🔒</div>
                        <h1 class="text-2xl font-bold text-gray-900 mb-4">Admin Access Required</h1>
                        <p class="text-gray-600 mb-6">You need to log in with an admin account to access this page.</p>
                        <div class="space-y-3">
                            <a href="/" class="block w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200">
                                🏠 Go to Home Page
                            </a>
                            <a href="/admin-login.html" class="block w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200">
                                🔑 Admin Login Helper
                            </a>
                        </div>
                        <p class="text-sm text-gray-500 mt-4">Contact your administrator if you believe you should have access.</p>
                    </div>
                </body>
                </html>
            `);
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hot-impex-secret-key');
        const user = await hybridDb.findUserById(decoded.id);
        
        if (!user || user.role !== 'admin') {
            return res.status(403).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Access Denied - HOT IMPEX</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        body { 
                            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                            font-family: 'Inter', sans-serif;
                        }
                    </style>
                </head>
                <body class="min-h-screen flex items-center justify-center p-4">
                    <div class="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
                        <div class="text-6xl mb-4">⛔</div>
                        <h1 class="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
                        <p class="text-gray-600 mb-6">You don't have administrator privileges. Only admin users can access this area.</p>
                        <div class="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p class="text-red-800 text-sm">
                                <strong>Your Role:</strong> ${user ? user.role || 'customer' : 'Not authenticated'}
                            </p>
                        </div>
                        <div class="space-y-3">
                            <a href="/" class="block w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200">
                                🏠 Go to Home Page
                            </a>
                            <button onclick="localStorage.removeItem('hotimpex-token'); window.location.href='/'" class="block w-full bg-gray-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-all duration-200">
                                🚪 Logout & Return Home
                            </button>
                        </div>
                    </div>
                </body>
                </html>
            `);
        }

        // Check if user is active
        if (user.isActive !== undefined && !user.isActive) {
            return res.status(403).send(`
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Account Deactivated - HOT IMPEX</title>
                    <script src="https://cdn.tailwindcss.com"></script>
                    <style>
                        body { 
                            background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
                            font-family: 'Inter', sans-serif;
                        }
                    </style>
                </head>
                <body class="min-h-screen flex items-center justify-center p-4">
                    <div class="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
                        <div class="text-6xl mb-4">⚠️</div>
                        <h1 class="text-2xl font-bold text-gray-900 mb-4">Account Deactivated</h1>
                        <p class="text-gray-600 mb-6">Your admin account has been deactivated. Please contact your system administrator.</p>
                        <a href="/" class="block w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200">
                            🏠 Go to Home Page
                        </a>
                    </div>
                </body>
                </html>
            `);
        }

        // User is authenticated and has admin role, allow access
        next();
        
    } catch (error) {
        console.error('Admin page protection error:', error);
        return res.status(401).send(`
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Authentication Error - HOT IMPEX</title>
                <script src="https://cdn.tailwindcss.com"></script>
                <style>
                    body { 
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        font-family: 'Inter', sans-serif;
                    }
                </style>
            </head>
            <body class="min-h-screen flex items-center justify-center p-4">
                <div class="bg-white p-8 rounded-2xl shadow-2xl max-w-md w-full text-center">
                    <div class="text-6xl mb-4">🚫</div>
                    <h1 class="text-2xl font-bold text-gray-900 mb-4">Authentication Error</h1>
                    <p class="text-gray-600 mb-6">Your session has expired or your authentication token is invalid.</p>
                    <div class="space-y-3">
                        <a href="/" class="block w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200">
                            🏠 Go to Home Page
                        </a>
                        <button onclick="localStorage.removeItem('hotimpex-token'); window.location.href='/admin-login.html'" class="block w-full bg-gradient-to-r from-green-500 to-teal-600 text-white font-bold py-3 px-6 rounded-lg hover:shadow-lg transition-all duration-200">
                            🔑 Login Again
                        </button>
                    </div>
                </div>
            </body>
            </html>
        `);
    }
};

module.exports = adminPageProtection;
