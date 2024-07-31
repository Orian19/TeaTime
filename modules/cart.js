// complete cart code

const { getProduct } = require('./products');
const { readCart, writeCart } = require('../persist');

/**
 * Get all products in the cart
 * @returns {Promise<*|*[]>}
 */
async function getCart() {
    return await readCart();
}

/**
 * Add a product to the cart
 * @param productId
 * @returns {Promise<void>}
 */
async function addToCart(productId) {
    const product = await getProduct(productId);
    if(!product) {
        throw new Error('Product not found');
    }
    const cart = await readCart();
    cart.push(product);
    await writeCart(cart);
}

/**
 * Remove a product from the cart
 * @param productId
 * @returns {Promise<void>}
 */
async function removeFromCart(productId) {
    const cart = await readCart();
    const updatedCart = cart.filter(p => p.id !== productId);
    await writeCart(updatedCart);
}

module.exports = {
    getCart,
    addToCart,
    removeFromCart
};
