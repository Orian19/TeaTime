const fs = require('fs').promises;
const path = require('path');
const Tea = require('./modules/tea');

const DATA_DIR = path.join(__dirname, 'data');
const PRODUCTS_FILE = 'products.json';
const BLENDS_FILE = path.join(__dirname, 'data', 'blends.json');
const FLAVORS_FILE = path.join(__dirname, 'data', 'flavors.json');


// Create a directory if it doesn't exist
fs.mkdir(DATA_DIR, { recursive: true }).catch(console.error);

/**
 * Read data from database file - users.json
 * @returns {Promise<any|{}>}
 */
async function readUsers(file) {
    const filePath = path.join(DATA_DIR, file);
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return {}; // return an empty object if the file doesn't exist
    }
}

/** Write data to database file - users.json
 * @param users
 * @returns {Promise<void>}
 */
async function writeUsers(file, users) {
    const filePath = path.join(DATA_DIR, file);
    await fs.writeFile(filePath, JSON.stringify(users, null, 2));
}

/**
 * Read data from database file - products.json
 * @returns {Promise<any|*[]>}
 */
async function readProducts() {
    const filePath = path.join(DATA_DIR, PRODUCTS_FILE);
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const products = JSON.parse(data);
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
    } catch (error) {
        return []; // return an empty array if the file doesn't exist
    }
}

/**
 * Write data to database file - products.json
 * @param products
 * @returns {Promise<void>}
 */
async function writeProducts(products) {
    const filePath = path.join(DATA_DIR, PRODUCTS_FILE);
    await fs.writeFile(filePath, JSON.stringify(products, null, 2));
}

/**
 * Add a new product to the database - products.json
 * @param product
 * @returns {Promise<void>}
 */
async function addProduct(product) {
    const products = await readProducts();
    products.push(product);
    await writeProducts(products);
}

/**
 * Update a product in the database - products.json
 * @param product
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
    }
}



/**
 * Delete a product from the database file - products.json
 * @param id
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
    const filePath = path.join(DATA_DIR, file);
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        return []; // return an empty array if the file doesn't exist
    }
}

/**
 * Write data to database file - orders.json
 * @param file
 * @param orders
 * @returns {Promise<void>}
 */
async function writeOrders(file, orders) {
    const filePath = path.join(DATA_DIR, file);
    await fs.writeFile(filePath, JSON.stringify(orders, null, 2));
}

async function readBlends() {
    try {
        const data = await fs.readFile(BLENDS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {};
        }
        throw error;
    }
}

async function writeBlends(blends) {
    await fs.writeFile(BLENDS_FILE, JSON.stringify(blends, null, 2));
}

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

async function getUserBlends(username) {
    const blends = await readBlends();
    return blends[username] || [];
}

async function getBlendById(username, blendId) {
    const userBlends = await getUserBlends(username);
    return userBlends.find(blend => blend.id === blendId);
}

async function readFlavors() {
    try {
        const data = await fs.readFile(FLAVORS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error reading flavors:', error);
        return [];
    }
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
