const fs = require('fs').promises;
const path = require('path');

const BLENDS_FILE = path.join(__dirname, '..', 'data', 'blends.json');
const PRODUCTS_FILE = path.join(__dirname, '..', 'data', 'products.json');
const FLAVORS_FILE = path.join(__dirname, '..', 'data', 'flavors.json');

async function readBlends() {
    try {
        const data = await fs.readFile(BLENDS_FILE, 'utf8');
        if (!data.trim()) {
            return {};
        }
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

async function getBlendableTeas() {
    try {
        const [productsData, flavorsData] = await Promise.all([
            fs.readFile(PRODUCTS_FILE, 'utf8'),
            fs.readFile(FLAVORS_FILE, 'utf8')
        ]);

        const products = JSON.parse(productsData);
        const flavors = JSON.parse(flavorsData);

        const baseTeas = products.map(product => ({
            id: product.id,
            name: product.name,
            category: product.category
        }));

        const flavorTeas = flavors.map(flavor => ({
            id: flavor.id,
            name: flavor.name,
            category: 'Flavor'
        }));

        return [...baseTeas, ...flavorTeas];
    } catch (error) {
        console.error('Error reading products or flavors file:', error);
        return [];
    }
}

async function getUserBlends(username) {
    const blends = await readBlends();
    return blends[username] || [];
}

async function createBlend(username, blendName, baseTea, flavors) {
    const blends = await readBlends();
    const userBlends = blends[username] || [];
    
    const newBlend = {
        id: Date.now().toString(),
        name: blendName,
        baseTea,
        flavors,
        price: 10.99,
        createdAt: new Date().toISOString()
    };

    userBlends.push(newBlend);
    blends[username] = userBlends;
    await writeBlends(blends);
    return newBlend;
}

async function getBlendById(username, blendId) {
    const userBlends = await getUserBlends(username);
    return userBlends.find(blend => blend.id === blendId);
}

async function removeBlend(username, blendId) {
    const blends = await readBlends();
    const userBlends = blends[username] || [];
    
    const updatedUserBlends = userBlends.filter(blend => blend.id !== blendId);
    
    if (userBlends.length === updatedUserBlends.length) {
        throw new Error('Blend not found');
    }

    blends[username] = updatedUserBlends;
    await writeBlends(blends);
}

module.exports = {
    getBlendableTeas,
    getUserBlends,
    createBlend,
    getBlendById,
    removeBlend
};