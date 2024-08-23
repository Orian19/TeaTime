const { getProduct } = require('./products');
const { getBlendById } = require('./tea-blender');
const fs = require('fs');
const path = require('path');

const cartsFilePath = path.join(__dirname, '../data/carts.json');

/**
 * Read carts from the josn file
 * @returns {any}
 */
function readCarts() {
    const data = fs.readFileSync(cartsFilePath);
    return JSON.parse(data);
}

/**
 * Write carts to the json file
 * @param carts
 * @returns {void}
 */
function writeCarts(carts) {
    fs.writeFileSync(cartsFilePath, JSON.stringify(carts, null, 2));
}

/**
 * Get all products in the user's cart
 * @param username
 * @returns {Array}
 */
function getCart(username) {
    const carts = readCarts();
    return carts[username] || [];
}

/**
 * Add a product to the user's cart
 * @param username
 * @param productId
 * @param quantity
 * @returns {Promise<void>}
 */
async function addToCart(username, productId, quantity = 1) {
    const product = await getProduct(productId);
    if (!product) {
        throw new Error('Product not found');
    }

    const carts = readCarts();
    const userCart = carts[username] || [];

    const existingProductIndex = userCart.findIndex(item => item.productId === productId);
    if (existingProductIndex !== -1) {
        userCart[existingProductIndex].quantity += quantity;
    } else {
        userCart.push({ productId: productId, quantity: quantity });
    }

    carts[username] = userCart;
    writeCarts(carts);
}

async function addBlendToCart(username, productId, quantity = 1) {
    const product = await getBlendById(username, productId);
    if (!product) {
        throw new Error('Product not found');
    }

    const carts = readCarts();
    const userCart = carts[username] || [];

    const existingProductIndex = userCart.findIndex(item => item.productId === productId);
    if (existingProductIndex !== -1) {
        userCart[existingProductIndex].quantity += quantity;
    } else {
        userCart.push({ productId: productId, quantity: quantity });
    }

    carts[username] = userCart;
    writeCarts(carts);
}


/**
 * Remove a product from the user's cart
 * @param username
 * @param productId
 */
function removeFromCart(username, productId) {
    const carts = readCarts();
    const userCart = carts[username] || [];
    const updatedCart = userCart.filter(p => p.productId !== productId);

    carts[username] = updatedCart;
    writeCarts(carts);
}

/**
 * Update the quantity of a product in the user's cart
 * @param username
 * @param productId
 * @param newQuantity
 */
function updateCartQuantity(username, productId, newQuantity) {
    const carts = readCarts();
    const userCart = carts[username] || [];

    const productIndex = userCart.findIndex(item => item.productId === productId);
    if (productIndex !== -1) {
        if (newQuantity <= 0) {
            userCart.splice(productIndex, 1); // Remove item if quantity is 0 or less
        } else {
            userCart[productIndex].quantity = newQuantity; // Update quantity
        }
    }

    carts[username] = userCart;
    writeCarts(carts);
}

/**
 * Clear the user's cart
 * @param username
 */
function clearCart(username) {
    const carts = readCarts();
    carts[username] = [];
    writeCarts(carts);
}

module.exports = {
    getCart,
    addToCart,
    addBlendToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart
};
