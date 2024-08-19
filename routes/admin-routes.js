const express = require('express');
const router = express.Router();
const { getUserActivities, filterUserActivities } = require('../modules/admin');
const { getProducts, createProduct, removeProduct } = require('../modules/products');

// Middleware to check if user is admin
function isAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) {
        next();
    } else {
        return res.redirect('/auth/login');
    }
}

// Admin route
router.get('/', isAdmin, (req, res) => {
    res.render('admin');
});

// Get all activities
router.get('/activities', isAdmin, async (req, res) => {
    try {
        const activities = await getUserActivities();
        res.json(activities);
    } catch (error) {
        console.error(`Error fetching user activities: ${error.message}`);
        res.status(500).json({ error: 'Server error' });
    }
});

// Filter user activities
router.post('/filter', isAdmin, async (req, res) => {
    try {
        const { prefix } = req.body;
        const filteredActivities = await filterUserActivities(prefix);
        res.json(filteredActivities);
    } catch (error) {
        console.error(`Error filtering user activities: ${error.message}`);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get all products
router.get('/products', isAdmin, async (req, res) => {
    try {
        const products = await getProducts();
        res.json(products);
    } catch (error) {
        console.error(`Error fetching products: ${error.message}`);
        res.status(500).json({ error: 'Server error' });
    }
});

// Add a new product
router.post('/products', isAdmin, async (req, res) => {
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
router.post('/products/:id', isAdmin, async (req, res) => {
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