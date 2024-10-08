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
        console.error('Error adding order:', error.message);
        throw new Error('Failed to add order. Please try again.');
    }
}

/**
 * Get all orders
 * @returns {Promise<Array>} - Returns an array of orders
 */
async function getOrders() {
    try {
        return await readOrders(ORDERS_FILE) || [];
    } catch (error) {
        console.error('Error retrieving orders:', error.message);
        throw new Error('Failed to retrieve orders. Please try again later.');
    }
}

/**
 * Calculate order statistics
 * @param orders
 * @returns {{averageOrderValue: (number|number), totalOrders: *, totalRevenue: *}}
 */
function calculateOrderStats(orders) {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    return {
        totalOrders,
        totalRevenue,
        averageOrderValue,
    };
}

module.exports = {
    addOrder,
    getOrders,
    calculateOrderStats,
};
