const mongoService = require('./mongoService');
const fileService = require('../config/db'); // Original file-based service
const mongodb = require('../config/mongodb');

class HybridDatabaseService {
    constructor() {
        this.useMongoDb = false;
        this.mongoConnected = false;
    }

    async initialize() {
        try {
            // Try to connect to MongoDB first
            await mongodb.connect();
            this.useMongoDb = true;
            this.mongoConnected = true;
            console.log('💾 Using MongoDB database');
            return true;
        } catch (error) {
            console.warn('⚠️  MongoDB connection failed, falling back to file-based database');
            console.warn('   Configure your MongoDB password in .env to use MongoDB');
            this.useMongoDb = false;
            this.mongoConnected = false;
            return false;
        }
    }

    // Product methods
    async getAllProducts(options = {}) {
        if (this.useMongoDb) {
            return await mongoService.getAllProducts(options);
        } else {
            // Fallback to file-based implementation
            const data = await fileService.getProducts();
            let products = data.products;
            
            // Apply filters for file-based system
            const { category, search, featured, bestSeller, limit, page = 1 } = options;
            
            if (category) {
                products = products.filter(product => 
                    product.categorySlug === category || product.category === category
                );
            }
            
            if (search) {
                const searchTerm = search.toLowerCase();
                products = products.filter(product => 
                    product.name.toLowerCase().includes(searchTerm) ||
                    product.description.toLowerCase().includes(searchTerm) ||
                    product.category.toLowerCase().includes(searchTerm)
                );
            }
            
            if (featured !== undefined) {
                products = products.filter(product => product.featured === featured);
            }
            
            if (bestSeller !== undefined) {
                products = products.filter(product => product.bestSeller === bestSeller);
            }
            
            // Pagination
            const startIndex = (page - 1) * (limit || 10);
            const endIndex = limit ? startIndex + parseInt(limit) : products.length;
            const paginatedProducts = products.slice(startIndex, endIndex);
            
            return {
                products: paginatedProducts,
                total: products.length,
                page: parseInt(page),
                totalPages: Math.ceil(products.length / (limit || 10))
            };
        }
    }

    async getProductById(id) {
        if (this.useMongoDb) {
            return await mongoService.getProductById(id);
        } else {
            return await fileService.findProductById(id);
        }
    }

    async getProductsByCategory(category) {
        if (this.useMongoDb) {
            return await mongoService.getProductsByCategory(category);
        } else {
            return await fileService.findProductsByCategory(category);
        }
    }

    async searchProducts(query) {
        if (this.useMongoDb) {
            return await mongoService.searchProducts(query);
        } else {
            return await fileService.searchProducts(query);
        }
    }

    async getCategories() {
        if (this.useMongoDb) {
            return await mongoService.getCategories();
        } else {
            const data = await fileService.getProducts();
            return [...new Set(data.products.map(product => product.category))];
        }
    }

    // User methods
    async findUserByEmail(email) {
        if (this.useMongoDb) {
            return await mongoService.findUserByEmail(email);
        } else {
            return await fileService.findUserByEmail(email);
        }
    }

    async findUserByEmailWithPassword(email) {
        if (this.useMongoDb) {
            return await mongoService.findUserByEmailWithPassword(email);
        } else {
            return await fileService.findUserByEmail(email);
        }
    }

    async findUserById(id) {
        if (this.useMongoDb) {
            return await mongoService.findUserById(id);
        } else {
            return await fileService.findUserById(id);
        }
    }

    async findUserByIdWithPassword(id) {
        if (this.useMongoDb) {
            return await mongoService.findUserByIdWithPassword(id);
        } else {
            return await fileService.findUserByIdWithPassword(id);
        }
    }

    async createUser(userData) {
        if (this.useMongoDb) {
            return await mongoService.createUser(userData);
        } else {
            return await fileService.createUser(userData);
        }
    }

    async updateUser(userId, updateData) {
        if (this.useMongoDb) {
            return await mongoService.updateUser(userId, updateData);
        } else {
            return await fileService.updateUser(userId, updateData);
        }
    }

    // Order methods
    async createOrder(orderData) {
        if (this.useMongoDb) {
            return await mongoService.createOrder(orderData);
        } else {
            return await fileService.createOrder(orderData);
        }
    }

    async getOrders() {
        if (this.useMongoDb) {
            // For MongoDB, we need to format the response to match file service
            const result = await this.getAllOrders({ limit: 1000 });
            return { orders: result.orders || result };
        } else {
            return await fileService.getOrders();
        }
    }

    async getUsers() {
        if (this.useMongoDb) {
            // For MongoDB, we need to format the response to match file service
            const result = await this.getAllUsers({ limit: 1000 });
            return { users: result.users || result };
        } else {
            return await fileService.getUsers();
        }
    }

    async getProducts() {
        if (this.useMongoDb) {
            // For MongoDB, we need to format the response to match file service
            const result = await this.getAllProducts({ limit: 1000 });
            return { products: result.products || result };
        } else {
            return await fileService.getProducts();
        }
    }

    async findOrderById(id) {
        if (this.useMongoDb) {
            return await mongoService.findOrderById(id);
        } else {
            return await fileService.findOrderById(id);
        }
    }

    async findOrdersByUserId(userId, options = {}) {
        if (this.useMongoDb) {
            return await mongoService.findOrdersByUserId(userId, options);
        } else {
            return await fileService.findOrdersByUserId(userId);
        }
    }

    // Admin methods
    async getDashboardStats() {
        if (this.useMongoDb) {
            return await mongoService.getDashboardStats();
        } else {
            // Simple file-based stats
            const [productsData, usersData, ordersData] = await Promise.all([
                fileService.getProducts(),
                fileService.getUsers(),
                fileService.getOrders()
            ]);

            const totalProducts = productsData.products.length;
            const totalUsers = usersData.users.filter(user => user.role === 'customer').length;
            const totalOrders = ordersData.orders.length;
            
            const totalRevenue = ordersData.orders
                .filter(order => order.status === 'delivered')
                .reduce((sum, order) => sum + order.totalAmount, 0);

            return {
                products: { total: totalProducts },
                users: { total: totalUsers },
                orders: { 
                    total: totalOrders, 
                    totalRevenue,
                    completed: ordersData.orders.filter(o => o.status === 'delivered').length 
                }
            };
        }
    }

    // Additional admin methods for CRUD operations
    async getAllUsers() {
        if (this.useMongoDb) {
            return await mongoService.getAllUsers();
        } else {
            const data = await fileService.getUsers();
            return data.users;
        }
    }

    async getAllOrders() {
        if (this.useMongoDb) {
            return await mongoService.getAllOrders();
        } else {
            const data = await fileService.getOrders();
            return data.orders;
        }
    }

    async updateOrder(orderId, updateData) {
        if (this.useMongoDb) {
            return await mongoService.updateOrder(orderId, updateData);
        } else {
            const data = await fileService.getOrders();
            const orderIndex = data.orders.findIndex(order => order.id === orderId);
            if (orderIndex === -1) {
                throw new Error('Order not found');
            }
            
            data.orders[orderIndex] = { ...data.orders[orderIndex], ...updateData };
            await fileService.saveOrders(data);
            return data.orders[orderIndex];
        }
    }

    async deleteUser(userId) {
        if (this.useMongoDb) {
            return await mongoService.deleteUser(userId);
        } else {
            const data = await fileService.getUsers();
            const userIndex = data.users.findIndex(user => user.id === userId);
            if (userIndex === -1) {
                throw new Error('User not found');
            }
            
            const deletedUser = data.users.splice(userIndex, 1)[0];
            await fileService.saveUsers(data);
            return deletedUser;
        }
    }

    async createProduct(productData) {
        if (this.useMongoDb) {
            return await mongoService.createProduct(productData);
        } else {
            const data = await fileService.getProducts();
            const newProduct = {
                id: Date.now().toString(),
                ...productData,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            
            data.products.push(newProduct);
            await fileService.saveProducts(data);
            return newProduct;
        }
    }

    async updateProduct(productId, updateData) {
        if (this.useMongoDb) {
            return await mongoService.updateProduct(productId, updateData);
        } else {
            const data = await fileService.getProducts();
            const productIndex = data.products.findIndex(product => product.id === productId);
            if (productIndex === -1) {
                throw new Error('Product not found');
            }
            
            data.products[productIndex] = { 
                ...data.products[productIndex], 
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            await fileService.saveProducts(data);
            return data.products[productIndex];
        }
    }

    async deleteProduct(productId) {
        if (this.useMongoDb) {
            return await mongoService.deleteProduct(productId);
        } else {
            const data = await fileService.getProducts();
            const productIndex = data.products.findIndex(product => product.id === productId);
            if (productIndex === -1) {
                throw new Error('Product not found');
            }
            
            const deletedProduct = data.products.splice(productIndex, 1)[0];
            await fileService.saveProducts(data);
            return deletedProduct;
        }
    }

    getConnectionInfo() {
        return {
            type: this.useMongoDb ? 'MongoDB' : 'File-based JSON',
            connected: this.useMongoDb ? this.mongoConnected : true,
            details: this.useMongoDb ? mongodb.getConnectionStatus() : 'Using local JSON files'
        };
    }
}

module.exports = new HybridDatabaseService();
