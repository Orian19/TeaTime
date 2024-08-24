// modules/tea-blender.js
const { readProducts, createBlend, getUserBlends, getBlendById, readFlavors, deleteBlend } = require('../persist');

async function getBlendableTeas() {
    const [products, flavors] = await Promise.all([readProducts(), readFlavors()]);
    const baseTeas = products.filter(product => product.category !== 'Flavor');
    return [...baseTeas, ...flavors];
}

async function createUserBlend(username, blendData) {
    return await createBlend(username, blendData);
}

async function getUserBlendsList(username) {
    return await getUserBlends(username);
}

async function getBlend(username, blendId) {
    return await getBlendById(username, blendId);
}

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