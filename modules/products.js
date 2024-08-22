const { readProducts, addProduct, updateProduct, deleteProduct } = require('../persist');

/**
 * Get all products
 * @returns {Promise<*|*[]>}
 */
async function getProducts() {
    return await readProducts();
}

async function getFeaturedProducts() {
    const allProducts = await readProducts();
    return allProducts.slice(0, 3); // Return the first 3 products
}

/**
 * Get a product by ID
 * @param id
 * @returns {Promise<*>}
 */
async function getProduct(id) {
    const products = await readProducts();
    return products.find(p => p.id === id);
}

/**
 * Create a new product
 * @param product
 * @returns {Promise<void>}
 */
async function createProduct(product) {
    await addProduct(product);
}

/**
 * Modify an existing product
 * @param product
 * @returns {Promise<void>}
 */
async function modifyProduct(product) {
    await updateProduct(product);
}

/**
 * Remove a product
 * @param id
 * @returns {Promise<void>}
 */
async function removeProduct(id) {
    await deleteProduct(id);
}

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    modifyProduct,
    removeProduct,
    getFeaturedProducts
};