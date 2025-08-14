const fs = require('fs').promises;
const path = require('path');

class FileDatabase {
    constructor() {
        this.dbPath = path.join(__dirname, '../../database');
        this.products = null;
        this.users = null;
        this.orders = null;
    }

    async loadData(collection) {
        try {
            const filePath = path.join(this.dbPath, `${collection}.json`);
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error(`Error loading ${collection}:`, error);
            return collection === 'products' ? { products: [] } : 
                   collection === 'users' ? { users: [] } : 
                   { orders: [] };
        }
    }

    async saveData(collection, data) {
        try {
            const filePath = path.join(this.dbPath, `${collection}.json`);
            await fs.writeFile(filePath, JSON.stringify(data, null, 2));
            return true;
        } catch (error) {
            console.error(`Error saving ${collection}:`, error);
            return false;
        }
    }

    async getProducts() {
        if (!this.products) {
            this.products = await this.loadData('products');
        }
        return this.products;
    }

    async getUsers() {
        if (!this.users) {
            this.users = await this.loadData('users');
        }
        return this.users;
    }

    async getOrders() {
        if (!this.orders) {
            this.orders = await this.loadData('orders');
        }
        return this.orders;
    }

    async saveProducts(products) {
        this.products = products;
        return await this.saveData('products', products);
    }

    async saveUsers(users) {
        this.users = users;
        return await this.saveData('users', users);
    }

    async saveOrders(orders) {
        this.orders = orders;
        return await this.saveData('orders', orders);
    }

    // Product methods
    async findProductById(id) {
        const data = await this.getProducts();
        return data.products.find(product => product.id === id);
    }

    async findProductsByCategory(category) {
        const data = await this.getProducts();
        return data.products.filter(product => 
            product.categorySlug === category || product.category === category
        );
    }

    async searchProducts(query) {
        const data = await this.getProducts();
        const searchTerm = query.toLowerCase();
        return data.products.filter(product => 
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm) ||
            product.category.toLowerCase().includes(searchTerm)
        );
    }

    // User methods
    async findUserByEmail(email) {
        const data = await this.getUsers();
        return data.users.find(user => user.email === email);
    }

    async findUserById(id) {
        const data = await this.getUsers();
        return data.users.find(user => user.id === id);
    }

    async findUserByIdWithPassword(id) {
        const data = await this.getUsers();
        const user = data.users.find(user => user.id === id);
        if (user) {
            // Create a User instance to get the comparePassword method
            const User = require('../models/UserSchema');
            return new User(user);
        }
        return null;
    }

    async createUser(userData) {
        const data = await this.getUsers();
        const newUser = {
            id: 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            ...userData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        data.users.push(newUser);
        await this.saveUsers(data);
        return newUser;
    }

    async updateUser(userId, updateData) {
        const data = await this.getUsers();
        const userIndex = data.users.findIndex(user => user.id === userId);
        if (userIndex !== -1) {
            data.users[userIndex] = {
                ...data.users[userIndex],
                ...updateData,
                updatedAt: new Date().toISOString()
            };
            await this.saveUsers(data);
            return data.users[userIndex];
        }
        return null;
    }

    // Order methods
    async createOrder(orderData) {
        const data = await this.getOrders();
        const newOrder = {
            id: 'order_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            ...orderData,
            status: 'pending',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        data.orders.push(newOrder);
        await this.saveOrders(data);
        return newOrder;
    }

    async findOrderById(id) {
        const data = await this.getOrders();
        return data.orders.find(order => order.id === id);
    }

    async findOrdersByUserId(userId) {
        const data = await this.getOrders();
        return data.orders.filter(order => order.userId === userId);
    }

    async updateOrderStatus(orderId, status) {
        const data = await this.getOrders();
        const orderIndex = data.orders.findIndex(order => order.id === orderId);
        if (orderIndex !== -1) {
            data.orders[orderIndex].status = status;
            data.orders[orderIndex].updatedAt = new Date().toISOString();
            await this.saveOrders(data);
            return data.orders[orderIndex];
        }
        return null;
    }
}

module.exports = new FileDatabase();
