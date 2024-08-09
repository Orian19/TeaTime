const express = require('express');
const router = express.Router();
const { addToCart, getCart } = require('../modules/cart');
const { getProducts } = require('../modules/products');

// GET store page
router.get('/', async (req, res) => {
    const products = await getProducts();
    res.render('store', {
        title: 'Our Tea Selection',
        products,
        user: req.session.username
    });
});

// Search functionality
router.get('/search', async (req, res) => {
    const searchTerm = req.query.search ? req.query.search.toLowerCase() : '';
    let products = await getProducts();

    if (searchTerm) {
        products = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }

    res.render('store', {
        title: 'Our Tea Selection',
        products,
        user: req.session.username,
        searchTerm
    });
});

router.post('/add-to-cart', async (req, res) => {
    if (!req.session.username) {
        return res.redirect('/auth/login');
    }

    try {
        await addToCart(req.session.username, req.body.productId, parseInt(req.body.quantity, 10));
        res.redirect('/store');
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/cart', (req, res) => {
    if (!req.session.username) {
        return res.redirect('/auth/login');
    }

    const userCart = getCart(req.session.username);
    res.render('cart', { cart: userCart, user: req.session.username });
});

module.exports = router;
