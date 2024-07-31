const express = require('express');
const router = express.Router();
const { getProducts, getProduct } = require('../modules/products');

// GET store page
// router.get('/', async (req, res) => {
//     if(!req.session.username) {
//         return res.redirect('/auth/login');
//     }
//     const products = await getProducts();
//     res.render('store', { products, user: req.session.username });
// });
router.get('/', async (req, res) => {
    if (!req.session.username) {
        return res.redirect('/auth/login');
    }
    const products = await getProducts();
    res.render('store', {
        title: 'Our Tea Selection',
        products,
        user: req.session.username
    });
});

router.post('/add-to-cart', async (req, res) => {
    if(!req.session.user) {
        // return res.status(401).json({ error: 'Unauthorized' });
        return res.redirect('/auth/login'); // redirect to login screen if not logged in
    }
    const { productId } = req.body;
    const product = await getProduct(productId);
    if(!product) {
        return res.status(404).json({ error: 'Product not found' });
    }
    if(!req.session.cart) {
        req.session.cart = [];
    }
    req.session.cart.push(product);
    res.json({ message: 'Product added to cart' });
});

router.get('/cart', (req, res) => {
    if(!req.session.user) {
        return res.redirect('/auth/login');
    }
    res.render('cart', { cart: req.session.cart || [], user: req.session.user});
});

module.exports = router;
