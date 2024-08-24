const { getCartDetails, clearCart } = require('./cart');

/**
 * Get the cart details for checkout
 * @param {string} username - The username of the customer
 * @returns {Promise<object>} - The cart details including products, total price, etc.
 */
async function getCheckoutDetails(username) {
    const cartDetails = await getCartDetails(username);
    let total = 0;

    const checkoutItems = cartDetails.map(item => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        return {
            ...item,
            total: itemTotal.toFixed(2)
        };
    });

    return {
        cartDetails: checkoutItems,
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
    await clearCart(username);
}

module.exports = {
    getCheckoutDetails,
    processCheckout
};
