const express = require('express');
const router = express.Router();
const { getUserActivities, filterUserActivities, isAdmin } = require('../modules/admin');
const { getProducts, createProduct, removeProduct } = require('../modules/products');
const { isAuthenticated } = require('../modules/user');

router.use(isAuthenticated);
router.use(isAdmin);

// Get admin page
router.get('/', async (req, res) => {
    const searchTerm = req.query.search ? req.query.search.toLowerCase() : '';
    let activities = await getUserActivities();

    if (searchTerm) {
        activities = activities.filter(activity =>
            activity && activity.username &&
            activity.username.toLowerCase().startsWith(searchTerm)
        );
    }

    res.render('admin', { activities, searchTerm });
});

// Get filtered activities
router.get('/filtered-activities', async (req, res) => {
    const searchTerm = req.query.search ? req.query.search.toLowerCase() : '';
    let activities = await getUserActivities();

    if (searchTerm) {
        activities = activities.filter(activity =>
            activity && activity.username &&
            activity.username.toLowerCase().startsWith(searchTerm)
        );
    }

    res.json(activities);
});

// Get user activities
router.get('/activities', async (req, res) => {
    try {
        const activities = await getUserActivities();
        res.json(activities);
    } catch (error) {
        console.error(`Error fetching user activities: ${error.message}`);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all products with pagination and search
router.get('/products', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 6; // Number of products per page
        const searchTerm = req.query.search ? req.query.search.toLowerCase() : '';

        let products = await getProducts();

        if (searchTerm) {
            products = products.filter(product =>
                product.name.toLowerCase().includes(searchTerm) ||
                product.description.toLowerCase().includes(searchTerm) ||
                product.category.toLowerCase().includes(searchTerm)
            );
        }

        const totalProducts = products.length;
        const totalPages = Math.ceil(totalProducts / limit);
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;

        const paginatedProducts = products.slice(startIndex, endIndex);

        res.json({
            products: paginatedProducts,
            currentPage: page,
            totalPages: totalPages,
            totalProducts: totalProducts
        });
    } catch (error) {
        console.error(`Error fetching products: ${error.message}`);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add a new product
router.post('/products', async (req, res) => {
    try {
        // const { id, name, description, price, quantity, category, origin, lat, lng, caffeine, temperature, imageUrl } = req.body;
        const { id, name, description, price, category, origin, lat, lng, caffeine, temperature, imageUrl } = req.body;

        const newProduct = await createProduct({
            id,
            name,
            description,
            price: parseFloat(price),
            // quantity: parseInt(quantity),
            category,
            origin,
            lat: parseFloat(lat),
            lng: parseFloat(lng),
            caffeine,
            temperature,
            imageUrl
        });

        res.status(201).json(newProduct);

    } catch (error) {
        console.error(`Error adding product: ${error.message}`);
        res.status(500).json({ error: 'Server error' });
    }
});

// Update a product
router.put('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, price, quantity, category, origin, lat, lng, caffeine, temperature, imageUrl } = req.body;
        await updateProduct(
            id,
            name,
            description,
            parseFloat(price),
            // parseInt(quantity),
            category,
            origin,
            parseFloat(lat),
            parseFloat(lng),
            caffeine,
            temperature,
            imageUrl,
        );

        res.json(updatedProduct);

    } catch (error) {
        console.error(`Error updating product: ${error.message}`);
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove a product
router.post('/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        await removeProduct(id);
        res.json({ message: 'Product removed successfully' });
    } catch (error) {
        console.error(`Error removing product: ${error.message}`);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
