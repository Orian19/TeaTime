const { readProducts, createBlend, getUserBlends, getBlendById, readFlavors, deleteBlend } = require('../persist');

/**
 * Get all blendable teas
 * @returns {Promise<*[]>}
 */
async function getBlendableTeas() {
    const [products, flavors] = await Promise.all([readProducts(), readFlavors()]);
    const baseTeas = products.filter(product => product.category !== 'Flavor');
    return [...baseTeas, ...flavors];
}

/**
 * Create a new blend for a user
 * @param username
 * @param blendData
 * @returns {Promise<*>}
 */
async function createUserBlend(username, blendData) {
    return await createBlend(username, blendData);
}

/**
 * Get the list of blends for a user
 * @param username
 * @returns {Promise<*>}
 */
async function getUserBlendsList(username) {
    return await getUserBlends(username);
}

/**
 * Get a blend by ID
 * @param username
 * @param blendId
 * @returns {Promise<*>}
 */
async function getBlend(username, blendId) {
    return await getBlendById(username, blendId);
}

/**
 * Remove a blend by ID
 * @param username
 * @param blendId
 * @returns {Promise<void>}
 */
async function removeBlend(username, blendId) {
    return await deleteBlend(username, blendId);
}

module.exports = {
    getBlendableTeas,
    createUserBlend,
    getUserBlendsList,
    getBlend,
    removeBlend
};
