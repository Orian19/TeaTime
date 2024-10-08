const { getCartDetails, clearCart, writeCarts, readCarts} = require('./cart');
const {modifyProduct, getProduct} = require("./products");

/**
 * Get the cart details for checkout
 * @param {string} username - The username of the customer
 * @returns {Promise<object>} - The cart details including products, total price, etc.
 */
async function getCheckoutDetails(username) {
    try {
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
    } catch (error) {
        console.error(`Error getting checkout details for user ${username}:`, error);
        throw error;
    }
}


/**
 * Process the checkout and clear the cart
 * @param {string} username - The username of the customer
 * @returns {Promise<void>}
 */
async function processCheckout(username) {
    try {
        const carts = await readCarts();
        const userCart = carts[username];

        if (!userCart || userCart.length === 0) {
            throw new Error('Cart is empty.');
        }

        for (const item of userCart) {
            if (item.itemType === 'product') {
                const product = await getProduct(item.itemId);

                if (!product) {
                    throw new Error(`Product not found: ${item.itemId}`);
                }

                if (product.quantity < item.quantity) {
                    throw new Error(`Not enough stock for product ${product.name}. Available: ${product.quantity}`);
                }

                // Deduct the quantity
                product.quantity -= item.quantity;
                await modifyProduct(product);
            }
        }

        // Clear the user's cart after processing
        carts[username] = [];
        await writeCarts(carts);
    } catch (error) {
        console.error(`Error processing checkout for user ${username}:`, error);
        throw error;
    }
}


module.exports = {
    getCheckoutDetails,
    processCheckout
};
