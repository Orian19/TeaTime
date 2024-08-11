const { readOrders, writeOrders } = require('../persist');

const ORDERS_FILE = 'orders.json';

/**
 * Add a new order
 * @param {object} order - The order object to be added
 * @returns {Promise<void>}
 */
async function addOrder(order) {
    try {
        const orders = await readOrders(ORDERS_FILE);
        orders.push(order);
        await writeOrders(ORDERS_FILE, orders);
        console.log('Order added successfully');
    } catch (error) {
        console.error('Error adding order:', error);
        throw error;
    }
}


/**
 * Get all orders
 * @returns {Promise<Array>} - Returns an array of orders
 */
async function getOrders() {
    return await readOrders(ORDERS_FILE) || [];
}

/**
 * Get orders by a specific user
 * @param {string} username - The username to filter orders by
 * @returns {Promise<Array>} - Returns an array of orders for the user
 */
async function getOrdersByUser(username) {
    const orders = await getOrders();
    return orders.filter(order => order.user === username);
}

module.exports = {
    addOrder,
    getOrders,
    getOrdersByUser,
};
