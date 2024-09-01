const express = require('express');
const router = express.Router();
const { getUserActivities, filterUserActivities, isAdmin } = require('../modules/admin');
const { getProducts, createProduct, removeProduct, modifyProduct } = require('../modules/products');
const { isAuthenticated } = require('../modules/user');
const { getOrders, calculateOrderStats } = require('../modules/orders');

router.use(isAuthenticated);
router.use(isAdmin);

router.use((req, res, next) => {
    console.log(`Incoming request: ${req.method} ${req.url}`);
    next();
});


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
        const product = req.body;
        const createdProduct = await createProduct(product);

        if (!createdProduct) {
            return res.status(409).json({ message: `A product with the ID "${product.id}" already exists.` });
        }

        res.status(201).json({ message: 'Product added successfully' });
    } catch (error) {
        console.error(`Error adding product: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
    }
});

// Update an existing product
router.put('/products/:id', async (req, res) => {
    try {
        const product = req.body;
        product.id = req.params.id; // Ensure the ID in the URL is used

        await modifyProduct(product);
        res.status(200).json({ message: 'Product updated successfully' });
    } catch (error) {
        console.error(`Error updating product: ${error.message}`);
        res.status(500).json({ message: 'Server error' });
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

// Get all orders
router.get('/orders', async (req, res) => {
    try {
        const orders = await getOrders();
        const stats = calculateOrderStats(orders);
        res.json({ orders, stats });
    } catch (error) {
        console.error(`Error fetching orders: ${error.message}`);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;
