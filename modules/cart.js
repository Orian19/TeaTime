const { getProduct } = require('./products');
const { getBlend } = require('./tea-blender');
const fs = require('fs').promises;
const path = require('path');

const cartsFilePath = path.join(__dirname, '../data/carts.json');

/**
 * Read carts from file
 * @returns {Promise<{}|any>}
 */
async function readCarts() {
    try {
        const data = await fs.readFile(cartsFilePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}

/**
 * Write carts to file
 * @param carts
 * @returns {Promise<void>}
 */
async function writeCarts(carts) {
    await fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
}


/**
 * Get cart for a user
 * @param username
 * @returns {Promise<*|*[]>}
 */
async function getCart(username) {
    const carts = await readCarts();
    return carts[username] || [];
}

/**
 * Add item to cart
 * @param username
 * @param itemId
 * @param quantity
 * @param itemType
 * @returns {Promise<void>}
 */
async function addToCart(username, itemId, quantity = 1, itemType = 'product') {
    if (itemType === 'product') {
        const product = await getProduct(itemId);

        if (product && product.quantity >= quantity) {
            const carts = await readCarts();
            const userCart = carts[username] || [];
            const existingItemIndex = userCart.findIndex(item => item.itemId === itemId && item.itemType === itemType);

            if (existingItemIndex !== -1) {
                const newQuantity = userCart[existingItemIndex].quantity + quantity;
                if (newQuantity <= product.quantity) {
                    userCart[existingItemIndex].quantity = newQuantity;
                } else {
                    throw new Error(`Not enough stock. Available: ${product.quantity}`);
                }
            } else {
                userCart.push({ itemId, quantity, itemType });
            }

            carts[username] = userCart;
            await writeCarts(carts);
        } else {
            throw new Error('Product not available or not enough stock.');
        }
    } else if (itemType === 'custom_blend') {
        const carts = await readCarts();
        const userCart = carts[username] || [];
        userCart.push({ itemId, quantity, itemType });
        carts[username] = userCart;
        await writeCarts(carts);
    }
}

/**
 * Remove item from cart
 * @param username
 * @param itemId
 * @param itemType
 * @returns {Promise<void>}
 */
async function removeFromCart(username, itemId, itemType) {
    const carts = await readCarts();
    const userCart = carts[username] || [];
    const updatedCart = userCart.filter(item => !(item.itemId === itemId && item.itemType === itemType));
    carts[username] = updatedCart;
    await writeCarts(carts);
}

/**
 * Update cart item quantity
 * @param username
 * @param itemId
 * @param newQuantity
 * @param itemType
 * @returns {Promise<void>}
 */
async function updateCartQuantity(username, itemId, newQuantity, itemType) {
    const carts = await readCarts();
    const userCart = carts[username] || [];
    const itemIndex = userCart.findIndex(item => item.itemId === itemId && item.itemType === itemType);
    
    if (itemIndex !== -1) {
        if (newQuantity <= 0) {
            userCart.splice(itemIndex, 1);
        } else {
            userCart[itemIndex].quantity = newQuantity;
        }
    }

    carts[username] = userCart;
    await writeCarts(carts);
}

/**
 * Get cart details
 * @param username
 * @returns {Promise<Awaited<{[p: string]: *}|{itemType: string, quantity: *, price: number, id: *, blendName: *}|undefined>[]>}
 */
async function getCartDetails(username) {
    const userCart = await getCart(username);
    const cartDetails = await Promise.all(userCart.map(async (item) => {
        if (item.itemType === 'product') {
            const product = await getProduct(item.itemId);
            return { ...product, quantity: item.quantity, itemType: 'product' };
        } else if (item.itemType === 'custom_blend') {
            const blend = await getBlend(username, item.itemId);
            return { 
                id: blend.id,
                blendName: blend.name,
                price: 9.99, // or calculate based on blend components
                quantity: item.quantity,
                itemType: 'custom_blend'
            };
        }
    }));

    return cartDetails;
}

/**
 * Clear cart for a user
 * @param username
 * @returns {Promise<void>}
 */
async function clearCart(username) {
    const carts = await readCarts();
    delete carts[username];
    await writeCarts(carts);
}

module.exports = {
    getCart,
    addToCart,
    removeFromCart,
    updateCartQuantity,
    getCartDetails,
    clearCart,
    readCarts,
    writeCarts,
};
