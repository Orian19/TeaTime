const express = require('express');
const router = express.Router();
const { addToCart, getCart } = require('../modules/cart');
const { getProducts, getProduct } = require('../modules/products');
const { getCheckoutDetails, processCheckout } = require('../modules/checkout');

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
    console.log('Before adding to cart:', req.session);

    if (!req.session.username) {
        return res.redirect('/auth/login');
    }

    try {
        await addToCart(req.session.username, req.body.productId, parseInt(req.body.quantity, 10));

        req.session.save(err => {
            if (err) {
                console.error('Session save error:', err);
                return res.status(500).json({ error: 'Session save failed' });
            }
            console.log('After adding to cart:', req.session);
            res.redirect('/store');
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET cart page
router.get('/cart', async (req, res) => {
    if (!req.session.username) {
        return res.redirect('/auth/login');
    }

    const userCart = getCart(req.session.username);

    // Fetch full product details for each item in the cart
    const detailedCart = await Promise.all(userCart.map(async (item) => {
        const product = await getProduct(item.productId);
        return {
            ...product,
            quantity: item.quantity,
        };
    }));

    res.render('cart', { cart: detailedCart, user: req.session.username });
});

router.get('/checkout', async (req, res) => {
    if (!req.session.username) {
        return res.redirect('/auth/login');
    }

    const userCart = getCart(req.session.username);

    const cartDetails = await Promise.all(userCart.map(async item => {
        const product = await getProduct(item.productId);
        return {
            name: product.name,
            price: product.price,
            quantity: item.quantity,
            imageUrl: product.imageUrl,
            total: (product.price * item.quantity).toFixed(2)
        };
    }));
    res.render('checkout', { cartDetails });
});

router.post('/checkout/process', async (req, res) => {
    if (!req.session.username) {
        return res.redirect('/auth/login');
    }

    try {
        await processCheckout(req.session.username);
        res.redirect('/store');
    } catch (error) {
        console.error('Error during checkout processing:', error);
        res.status(500).send('An error occurred during the checkout process.');
    }
});

module.exports = router;
