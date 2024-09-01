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
        if (error.code === 'ENOENT') {
            console.warn('Carts file not found. Returning empty object.');
            return {};
        }
        console.error('Error reading carts:', error);
        throw error;
    }
}

/**
 * Write carts to file
 * @param carts
 * @returns {Promise<void>}
 */
async function writeCarts(carts) {
    try {
        await fs.writeFile(cartsFilePath, JSON.stringify(carts, null, 2));
    } catch (error) {
        console.error('Error writing carts:', error);
        throw error;
    }
}


/**
 * Get cart for a user
 * @param username
 * @returns {Promise<*|*[]>}
 */
async function getCart(username) {
    try {
        const carts = await readCarts();
        return carts[username] || [];
    } catch (error) {
        console.error(`Error getting cart for user ${username}:`, error);
        throw error;
    }
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
    try {
        if (itemType === 'product') {
            const product = await getProduct(itemId);

            if (!product) {
                throw new Error('Product not found');
            }

            if (product.quantity < quantity) {
                throw new Error(`Not enough stock. Available: ${product.quantity}`);
            }

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
        } else if (itemType === 'custom_blend') {
            const carts = await readCarts();
            const userCart = carts[username] || [];
            userCart.push({ itemId, quantity, itemType });
            carts[username] = userCart;
            await writeCarts(carts);
        } else {
            throw new Error('Invalid item type');
        }
    } catch (error) {
        console.error(`Error adding item to cart for user ${username}:`, error);
        throw error;
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
    try {
        const carts = await readCarts();
        const userCart = carts[username] || [];
        const updatedCart = userCart.filter(item => !(item.itemId === itemId && item.itemType === itemType));
        carts[username] = updatedCart;
        await writeCarts(carts);
    } catch (error) {
        console.error(`Error removing item from cart for user ${username}:`, error);
        throw error;
    }
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
    try {
        const carts = await readCarts();
        const userCart = carts[username] || [];
        const itemIndex = userCart.findIndex(item => item.itemId === itemId && item.itemType === itemType);

        if (itemIndex !== -1) {
            if (newQuantity <= 0) {
                userCart.splice(itemIndex, 1);
            } else {
                if (itemType === 'product') {
                    const product = await getProduct(itemId);
                    if (newQuantity > product.quantity) {
                        throw new Error(`Not enough stock. Available: ${product.quantity}`);
                    }
                }
                userCart[itemIndex].quantity = newQuantity;
            }
        }

        carts[username] = userCart;
        await writeCarts(carts);
    } catch (error) {
        console.error(`Error updating cart quantity for user ${username}:`, error);
        throw error;
    }
}

/**
 * Get cart details
 * @param username
 * @returns {Promise<Awaited<{[p: string]: *}|{itemType: string, quantity: *, price: number, id: *, blendName: *}|undefined>[]>}
 */
async function getCartDetails(username) {
    try {
        const userCart = await getCart(username);
        const cartDetails = await Promise.all(userCart.map(async (item) => {
            if (item.itemType === 'product') {
                const product = await getProduct(item.itemId);
                if (!product) {
                    throw new Error(`Product not found: ${item.itemId}`);
                }
                return { ...product, quantity: item.quantity, itemType: 'product' };
            } else if (item.itemType === 'custom_blend') {
                const blend = await getBlend(username, item.itemId);
                if (!blend) {
                    throw new Error(`Blend not found: ${item.itemId}`);
                }
                return {
                    id: blend.id,
                    blendName: blend.name,
                    price: 9.99, // or calculate based on blend components
                    quantity: item.quantity,
                    itemType: 'custom_blend'
                };
            }
        }));

        return cartDetails.filter(item => item !== undefined);
    } catch (error) {
        console.error(`Error getting cart details for user ${username}:`, error);
        throw error;
    }
}

/**
 * Clear cart for a user
 * @param username
 * @returns {Promise<void>}
 */
async function clearCart(username) {
    try {
        const carts = await readCarts();
        delete carts[username];
        await writeCarts(carts);
    } catch (error) {
        console.error(`Error clearing cart for user ${username}:`, error);
        throw error;
    }
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
