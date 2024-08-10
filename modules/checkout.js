const { getCart } = require('./cart');
const { getProduct } = require('./products');
const { clearCart } = require('./cart');

/**
 * Get the cart details for checkout
 * @param {string} username - The username of the customer
 * @returns {Promise<object>} - The cart details including products, total price, etc.
 */
async function getCheckoutDetails(username) {
    const cart = getCart(username);
    let total = 0;

    const cartDetails = await Promise.all(
        cart.map(async item => {
            const product = await getProduct(item.productId);
            const itemTotal = product.price * item.quantity;
            total += itemTotal;
            return {
                ...product,
                quantity: item.quantity,
                itemTotal: itemTotal.toFixed(2)
            };
        })
    );

    return {
        cartDetails,
        total: total.toFixed(2)
    };
}

/**
 * Process the checkout and clear the cart
 * @param {string} username - The username of the customer
 * @returns {Promise<void>}
 */
async function processCheckout(username) {
    // todo: handle payment processing, order creation, etc.
    clearCart(username);
}

module.exports = {
    getCheckoutDetails,
    processCheckout
};
