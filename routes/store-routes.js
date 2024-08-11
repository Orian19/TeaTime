const express = require('express');
const router = express.Router();
const { addToCart, getCart, removeFromCart, updateCartQuantity, clearCart } = require('../modules/cart');
const { getProducts, getProduct } = require('../modules/products');
const { getCheckoutDetails, processCheckout } = require('../modules/checkout');
const { getReviews, addReview, removeReview, updateReview } = require('../modules/reviews');


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

// POST cart
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

// GET checkout
router.get('/checkout', async (req, res) => {
    if (!req.session.username) {
        return res.redirect('/auth/login');
    }

    const userCart = getCart(req.session.username);

    const cartDetails = await Promise.all(userCart.map(async item => {
        const product = await getProduct(item.productId);
        return {
            name: product.name,
            price: parseFloat(product.price),
            quantity: item.quantity,
            imageUrl: product.imageUrl,
            total: (product.price * item.quantity).toFixed(2)
        };
    }));

    res.render('checkout', { cartDetails });
});

// GET reviews
router.get('/reviews', (req, res) => {
    const reviews = getReviews();
    res.render('reviews', { reviews });
});

// POST add review
router.post('/submit-review', (req, res) => {
    const { name, rating, comment } = req.body;
    if (!name || !rating || !comment) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    try {
        addReview({ name, rating: parseInt(rating, 10), comment });
        res.redirect('/store/reviews'); // Redirect to the reviews page to see the updated list
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ success: false, message: 'Failed to add review' });
    }
});

router.post('/update-quantity', async (req, res) => {
    console.log('Update quantity route hit');
    if (!req.session.username) {
        return res.redirect('/auth/login');
    }

    const { productId, quantity } = req.body;
    try {
        updateCartQuantity(req.session.username, productId, parseInt(quantity, 10));
        res.redirect('/store/cart');
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        res.status(500).send('Failed to update cart quantity.');
    }
});

router.post('/checkout/process', async (req, res) => {
    if (!req.session.username) {
        return res.redirect('/auth/login');
    }

    try {
        await processCheckout(req.session.username);
        res.redirect('/store/thank-you');
    } catch (error) {
        console.error('Error during checkout processing:', error);
        res.status(500).send('An error occurred during the checkout process.');
    }
});

router.get('/thank-you', (req, res) => {
    res.render('thank-you-payment', { user: req.session.username });
});

module.exports = router;
