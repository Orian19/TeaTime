const {
    readProducts,
    createBlend,
    getUserBlends,
    getBlendById,
    readFlavors,
    deleteBlend
} = require('../persist');

/**
 * Get all blendable teas
 * @returns {Promise<*[]>}
 */
async function getBlendableTeas() {
    try {
        const [products, flavors] = await Promise.all([readProducts(), readFlavors()]);
        const baseTeas = products.filter(product => product.category !== 'Flavor');
        return [...baseTeas, ...flavors];
    } catch (error) {
        console.error('Error fetching blendable teas:', error);
        throw error;
    }
}

/**
 * Create a new blend for a user
 * @param username
 * @param blendData
 * @returns {Promise<*>}
 */
async function createUserBlend(username, blendData) {
    try {
        return await createBlend(username, blendData);
    } catch (error) {
        console.error(`Error creating blend for user ${username}:`, error);
        throw error;
    }
}

/**
 * Get the list of blends for a user
 * @param username
 * @returns {Promise<*>}
 */
async function getUserBlendsList(username) {
    try {
        return await getUserBlends(username);
    } catch (error) {
        console.error(`Error fetching blends for user ${username}:`, error);
        throw error;
    }
}

/**
 * Get a blend by ID
 * @param username
 * @param blendId
 * @returns {Promise<*>}
 */
async function getBlend(username, blendId) {
    try {
        return await getBlendById(username, blendId);
    } catch (error) {
        console.error(`Error fetching blend ${blendId} for user ${username}:`, error);
        throw error;
    }
}

/**
 * Remove a blend by ID
 * @param username
 * @param blendId
 * @returns {Promise<void>}
 */
async function removeBlend(username, blendId) {
    try {
        return await deleteBlend(username, blendId);
    } catch (error) {
        console.error(`Error removing blend ${blendId} for user ${username}:`, error);
        throw error;
    }
}

module.exports = {
    getBlendableTeas,
    createUserBlend,
    getUserBlendsList,
    getBlend,
    removeBlend
};
