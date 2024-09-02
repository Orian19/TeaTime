const fs = require('fs').promises;
const path = require('path');
const Tea = require('./modules/tea');

const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = 'products.json';
const BLENDS_FILE = path.join(__dirname, 'data', 'blends.json');
const FLAVORS_FILE = path.join(__dirname, 'data', 'flavors.json');

// Ensure the data directory exists
fs.mkdir(DATA_DIR, { recursive: true }).catch(console.error);

/**
 * Safely read JSON data from a file
 * @param {string} filePath
 * @returns {Promise<any>}
 */
async function safeReadJSON(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.warn(`File not found: ${filePath}. Returning empty object/array.`);
            return filePath.endsWith('.json') ? (Array.isArray(filePath) ? [] : {}) : null;
        }
        console.error(`Error reading file ${filePath}:`, error);
        throw error;
    }
}

/**
 * Safely write JSON data to a file
 * @param {string} filePath
 * @param {any} data
 * @returns {Promise<void>}
 */
async function safeWriteJSON(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), { mode: 0o600 }); // Secure file permissions
    } catch (error) {
        console.error(`Error writing to file ${filePath}:`, error);
        throw error;
    }
}

/**
 * Read data from database file - users.json
 * @returns {Promise<any|{}>}
 */
async function readUsers(file) {
    return safeReadJSON(path.join(DATA_DIR, file));
}

/**
 * Write data to database file - users.json
 * @param {string} file
 * @param {any} users
 * @returns {Promise<void>}
 */
async function writeUsers(file, users) {
    await safeWriteJSON(path.join(DATA_DIR, file), users);
}

/**
 * Read data from database file - products.json
 * @returns {Promise<any|*[]>}
 */
async function readProducts() {
    const products = await safeReadJSON(path.join(DATA_DIR, PRODUCTS_FILE));
    return products.map(p => new Tea(
        p.id,
        p.name,
        p.description,
        parseFloat(p.price),
        p.category,
        p.origin,
        parseFloat(p.lat),
        parseFloat(p.lng),
        p.caffeine,
        p.temperature,
        p.imageUrl,
        parseInt(p.quantity) || 0,
    ));
}

/**
 * Write data to database file - products.json
 * @param {any} products
 * @returns {Promise<void>}
 */
async function writeProducts(products) {
    await safeWriteJSON(path.join(DATA_DIR, PRODUCTS_FILE), products);
}

/**
 * Add a new product to the database - products.json
 * @param {Tea} product
 * @returns {Promise<void>}
 */
async function addProduct(product) {
    const products = await readProducts();
    products.push(product);
    await writeProducts(products);
}

/**
 * Update a product in the database - products.json
 * @param {Tea} product
 * @returns {Promise<void>}
 */
async function updateProduct(product) {
    const products = await readProducts();
    const index = products.findIndex(p => p.id === product.id);

    console.log('Product ID to update:', product.id); // Log the ID to update
    console.log('Products list:', products); // Log the list of products

    if (index !== -1) {
        console.log('Found product at index:', index, 'Product:', products[index]); // Log the found product

        products[index] = {
            ...products[index],
            ...product
        };

        await writeProducts(products);
        console.log('Updated product:', products[index]); // Log after update
    } else {
        console.error(`Product with ID ${product.id} not found for update`);
        throw new Error(`Product with ID ${product.id} not found for update`);
    }
}

/**
 * Delete a product from the database file - products.json
 * @param {string} id
 * @returns {Promise<void>}
 */
async function deleteProduct(id) {
    const products = await readProducts();
    const updatedProducts = products.filter(p => p.id !== id);
    await writeProducts(updatedProducts);
}

/**
 * Read data from database file - orders.json
 * @returns {Promise<any|[]>}
 */
async function readOrders(file) {
    return safeReadJSON(path.join(DATA_DIR, file));
}

/**
 * Write data to database file - orders.json
 * @param {string} file
 * @param {any} orders
 * @returns {Promise<void>}
 */
async function writeOrders(file, orders) {
    await safeWriteJSON(path.join(DATA_DIR, file), orders);
}

/**
 * Read data from database file - blends
 * @returns {Promise<{}|any>}
 */
async function readBlends() {
    return safeReadJSON(BLENDS_FILE);
}

/**
 * Write data to database file - blends
 * @param {any} blends
 * @returns {Promise<void>}
 */
async function writeBlends(blends) {
    await safeWriteJSON(BLENDS_FILE, blends);
}

/**
 * Create a new blend and save it to the database
 * @param {string} username
 * @param {any} blend
 * @returns {Promise<*>}
 */
async function createBlend(username, blend) {
    const blends = await readBlends();
    if (!blends[username]) {
        blends[username] = [];
    }
    blend.id = Date.now().toString();
    blend.createdAt = new Date().toISOString();
    blends[username].push(blend);
    await writeBlends(blends);
    return blend;
}

/**
 * Delete a blend from the database
 * @param {string} username
 * @param {string} blendId
 * @returns {Promise<void>}
 */
async function deleteBlend(username, blendId) {
    const blends = await readBlends();
    if (!blends[username]) {
        return;
    }
    const index = blends[username].findIndex(blend => blend.id === blendId);
    if (index !== -1) {
        blends[username].splice(index, 1);
        await writeBlends(blends);
    }
}

/**
 * Get a user's blends from the database
 * @param {string} username
 * @returns {Promise<*|*[]>}
 */
async function getUserBlends(username) {
    const blends = await readBlends();
    return blends[username] || [];
}

/**
 * Get a specific blend by ID
 * @param {string} username
 * @param {string} blendId
 * @returns {Promise<*>}
 */
async function getBlendById(username, blendId) {
    const userBlends = await getUserBlends(username);
    return userBlends.find(blend => blend.id === blendId);
}

/**
 * Read data from database file - flavors
 * @returns {Promise<any|*[]>}
 */
async function readFlavors() {
    return safeReadJSON(FLAVORS_FILE);
}

module.exports = {
    readUsers,
    writeUsers,
    readProducts,
    writeProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    readOrders,
    writeOrders,
    readBlends,
    writeBlends,
    createBlend,
    deleteBlend,
    getUserBlends,
    getBlendById,
    readFlavors
};
