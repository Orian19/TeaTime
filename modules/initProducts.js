const { addProduct } = require('../persist');
const Tea = require('./tea');

/**
 * Initialize tea products
 * @returns {Promise<void>}
 */
async function initProducts() {
    const initProducts = [
        new Tea("EG001", "Classic Earl Grey", "A timeless black tea infused with oil of bergamot for a citrusy twist.", 7.99, "Black Tea", "India", "Medium", "3-5 minutes", "95°C", "/images/earl-grey.jpg"),
        // new Tea("GT001", "Sencha Green", "A refreshing Japanese green tea with a grassy, smooth flavor.", 9.99, "Green Tea", "Japan", "Low", "1-2 minutes", "75°C", "/images/sencha-green.jpg"),
        // todo: Add more products here
    ];

    for (const product of initProducts) {
        await addProduct(product);
    }

    console.log('Products initialized');
}

initProducts().catch(console.error);
