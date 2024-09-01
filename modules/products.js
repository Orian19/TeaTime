const { readProducts, addProduct, updateProduct, deleteProduct } = require('../persist');

/**
 * Get all products
 * @returns {Promise<*|*[]>}
 */
async function getProducts() {
    try {
        return await readProducts();
    } catch (error) {
        console.error('Error retrieving products:', error.message);
        throw new Error('Failed to retrieve products. Please try again later.');
    }
}

/**
 * Get featured products
 * @returns {Promise<*>}
 */
async function getFeaturedProducts() {
    try {
        const allProducts = await readProducts();
        return allProducts.slice(0, 4); // Return the first 4 products
    } catch (error) {
        console.error('Error retrieving featured products:', error.message);
        throw new Error('Failed to retrieve featured products. Please try again later.');
    }
}

/**
 * Get a product by ID
 * @param id
 * @returns {Promise<*>}
 */
async function getProduct(id) {
    try {
        const products = await readProducts();
        return products.find(p => p.id === id);
    } catch (error) {
        console.error(`Error retrieving product with ID ${id}:`, error.message);
        throw new Error('Failed to retrieve the product. Please try again later.');
    }
}

/**
 * Create a new product
 * @param product
 * @returns {Promise<*>}
 */
async function createProduct(product) {
    try {
        const products = await readProducts();

        // Check if a product with the same ID already exists
        const existingProduct = products.find(p => p.id === product.id);
        if (existingProduct) {
            throw new Error('Product with the same ID already exists.');
        }

        await addProduct(product);
        return product;
    } catch (error) {
        console.error('Error creating product:', error.message);
        throw new Error('Failed to create product. Please try again later.');
    }
}

/**
 * Modify an existing product
 * @param product
 * @returns {Promise<void>}
 */
async function modifyProduct(product) {
    try {
        await updateProduct(product);
    } catch (error) {
        console.error('Error modifying product:', error.message);
        throw new Error('Failed to modify product. Please try again later.');
    }
}

/**
 * Remove a product
 * @param id
 * @returns {Promise<void>}
 */
async function removeProduct(id) {
    try {
        await deleteProduct(id);
    } catch (error) {
        console.error(`Error removing product with ID ${id}:`, error.message);
        throw new Error('Failed to remove product. Please try again later.');
    }
}

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    modifyProduct,
    removeProduct,
    getFeaturedProducts,
};
