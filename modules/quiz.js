const fs = require('fs');
const path = require('path');

// Path to the tea products JSON file
const productsFilePath = path.join(__dirname, '../data/products.json');

/**
 * Read tea products from the JSON file
 * @returns {Array} Array of tea products
 */
function readProducts() {
    if (!fs.existsSync(productsFilePath)) {
        return []; // Return an empty array if the file does not exist
    }
    const data = fs.readFileSync(productsFilePath);
    return JSON.parse(data);
}

/**
 * Find tea products that match the quiz preferences
 * @param {Object} preferences - User's tea preferences
 * @param {string} preferences.flavor - Preferred flavor
 * @param {string} preferences.caffeine - Caffeine preference
 * @param {string} preferences.brewingTime - Preferred brewing time
 * @param {string} preferences.temperature - Preferred temperature
 * @returns {Array} Array of matching tea products
 */
function findMatchingTeas(preferences) {
    const products = readProducts();

    // Filter products based on preferences
    return products.filter(product => {
        return (preferences.flavor === 'any' || product.flavor === preferences.flavor) &&
               (preferences.caffeine === 'any' || product.caffeine === preferences.caffeine) &&
               (preferences.brewingTime === 'any' || product.brewingTime === preferences.brewingTime) &&
               (preferences.temperature === 'any' || product.temperature === preferences.temperature);
    });
}

/**
 * Handle the quiz form submission and redirect to recommendations
 * @param {Object} preferences - User's tea preferences
 * @returns {Promise<Array>} A promise that resolves to an array of matching tea products
 */
async function handleQuizSubmission(preferences) {
    return findMatchingTeas(preferences);
}

module.exports = {
    handleQuizSubmission
};
