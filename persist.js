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
        if (error.code === 'ENOENT') {
            console.warn(`File not found: ${file}. Returning empty object.`);
            return {}; // return an empty object if the file doesn't exist
        }
        console.error(`Error reading users from ${file}:`, error);
        throw error;
    }
}

/** Write data to database file - users.json
 * @param users
 * @returns {Promise<void>}
 */
async function writeUsers(file, users) {
    const filePath = path.join(DATA_DIR, file);
    try {
        await fs.writeFile(filePath, JSON.stringify(users, null, 2));
    } catch (error) {
        console.error(`Error writing users to ${file}:`, error);
        throw error;
    }
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
        if (error.code === 'ENOENT') {
            console.warn('Products file not found. Returning empty array.');
            return []; // return an empty array if the file doesn't exist
        }
        console.error('Error reading products:', error);
        throw error;
    }
}

/**
 * Write data to database file - products.json
 * @param products
 * @returns {Promise<void>}
 */
async function writeProducts(products) {
    const filePath = path.join(DATA_DIR, PRODUCTS_FILE);
    try {
        await fs.writeFile(filePath, JSON.stringify(products, null, 2));
    } catch (error) {
        console.error('Error writing products:', error);
        throw error;
    }
}

/**
 * Add a new product to the database - products.json
 * @param product
 * @returns {Promise<void>}
 */
async function addProduct(product) {
    try {
        const products = await readProducts();
        products.push(product);
        await writeProducts(products);
    } catch (error) {
        console.error('Error adding product:', error);
        throw error;
    }
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
        throw new Error(`Product with ID ${product.id} not found for update`);
    }
}

/**
 * Delete a product from the database file - products.json
 * @param id
 * @returns {Promise<void>}
 */
async function deleteProduct(id) {
    try {
        const products = await readProducts();
        const updatedProducts = products.filter(p => p.id !== id);
        await writeProducts(updatedProducts);
    } catch (error) {
        console.error('Error deleting product:', error);
        throw error;
    }
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
        if (error.code === 'ENOENT') {
            console.warn(`Orders file not found: ${file}. Returning empty array.`);
            return []; // return an empty array if the file doesn't exist
        }
        console.error(`Error reading orders from ${file}:`, error);
        throw error;
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
    try {
        await fs.writeFile(filePath, JSON.stringify(orders, null, 2));
    } catch (error) {
        console.error(`Error writing orders to ${file}:`, error);
        throw error;
    }
}

/**
 * Read data from database file - blends
 * @returns {Promise<{}|any>}
 */
async function readBlends() {
    try {
        const data = await fs.readFile(BLENDS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {};
        }
        console.error('Error reading blends:', error);
        throw error;
    }
}

/**
 * Write data to database file - blends
 * @param blends
 * @returns {Promise<void>}
 */
async function writeBlends(blends) {
    try {
        await fs.writeFile(BLENDS_FILE, JSON.stringify(blends, null, 2));
    } catch (error) {
        console.error('Error writing blends:', error);
        throw error;
    }
}

/**
 * Create a new blend and save it to the database
 * @param username
 * @param blend
 * @returns {Promise<*>}
 */
async function createBlend(username, blend) {
    try {
        const blends = await readBlends();
        if (!blends[username]) {
            blends[username] = [];
        }
        blend.id = Date.now().toString();
        blend.createdAt = new Date().toISOString();
        blends[username].push(blend);
        await writeBlends(blends);
        return blend;
    } catch (error) {
        console.error('Error creating blend:', error);
        throw error;
    }
}

/**
 * Delete a blend from the database
 * @param username
 * @param blendId
 * @returns {Promise<void>}
 */
async function deleteBlend(username, blendId) {
    try {
        const blends = await readBlends();
        if (!blends[username]) {
            return;
        }
        const index = blends[username].findIndex(blend => blend.id === blendId);
        if (index !== -1) {
            blends[username].splice(index, 1);
            await writeBlends(blends);
        }
    } catch (error) {
        console.error('Error deleting blend:', error);
        throw error;
    }
}

/**
 * Get a user's blends from the database
 * @param username
 * @returns {Promise<*|*[]>}
 */
async function getUserBlends(username) {
    try {
        const blends = await readBlends();
        return blends[username] || [];
    } catch (error) {
        console.error('Error getting user blends:', error);
        throw error;
    }
}

/**
 * Get a specific blend by ID
 * @param username
 * @param blendId
 * @returns {Promise<T>}
 */
async function getBlendById(username, blendId) {
    try {
        const userBlends = await getUserBlends(username);
        return userBlends.find(blend => blend.id === blendId);
    } catch (error) {
        console.error('Error getting blend by ID:', error);
        throw error;
    }
}

/**
 * Read data from database file - flavors
 * @returns {Promise<any|*[]>}
 */
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
