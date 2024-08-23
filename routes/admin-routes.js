const express = require('express');
const router = express.Router();
const { getUserActivities, filterUserActivities, isAdmin } = require('../modules/admin');
const { getProducts, createProduct, removeProduct } = require('../modules/products');
const { isAuthenticated } = require('../modules/user');

router.use(isAuthenticated);
router.use(isAdmin);

// Get admin page
router.get('/', (req, res) => {
    res.render('admin');
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

// Search user activities
router.get('/search', async (req, res) => {
    try {
        const searchTerm = req.query.search ? req.query.search.toLowerCase() : '';
        let activities = await getUserActivities();

        if (searchTerm) {
            activities = activities.filter(activity => 
                activity.username.toLowerCase().startsWith(searchTerm)
            );
        }

        res.json(activities);
    } catch (error) {
        console.error(`Error searching activities: ${error.message}`);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all products
router.get('/products', async (req, res) => {
    try {
        const products = await getProducts();
        res.json(products);
    } catch (error) {
        console.error(`Error fetching products: ${error.message}`);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add a new product
router.post('/products', async (req, res) => {
    try {
        const { id, name, description, price, category, origin, lat, lng, caffeine, temperature, imageUrl } = req.body;
        const newProduct = await createProduct({
            id,
            name,
            description,
            price: parseFloat(price),
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