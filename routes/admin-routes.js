const express = require('express');
const router = express.Router();
const { getUserActivities, filterUserActivities, addUserActivity } = require('../modules/admin');
const { getProducts, createProduct, removeProduct } = require('../modules/products');

// Middleware to check if user is admin
function isAdmin(req, res, next) {
    if (req.session && req.session.isAdmin) {
        next();
    } else {
        res.status(403).json({ error: 'Unauthorized' });
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
        const { name, description, imageUrl, price } = req.body;
        const newProduct = await createProduct({ name, description, imageUrl, price: parseFloat(price) });
        res.status(201).json(newProduct);
    } catch (error) {
        console.error(`Error adding product: ${error.message}`);
        res.status(500).json({ error: 'Server error' });
    }
});

// Remove a product
router.delete('/products/:id', isAdmin, async (req, res) => {
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