const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../modules/user');
const { addToCart, getCart, removeFromCart, updateCartQuantity, clearCart, addBlendToCart } = require('../modules/cart');
const { getProducts, getProduct } = require('../modules/products');
const { getCheckoutDetails, processCheckout } = require('../modules/checkout');
const { getReviews, addReview } = require('../modules/reviews');
const {addOrder} = require("../modules/orders");
const {addUserActivity} = require("../modules/admin");
const { getBlendableTeas, createBlend, getUserBlends, getBlendById, removeBlend } = require('../modules/tea-blender');

// GET store page
router.get('/', async (req, res) => {
    const products = await getProducts();
    const originFilter = req.query.origin;
    console.log('User:', req.session.user);

    let filteredProducts = products;

    if (originFilter) {
        // Filter products by origin if the origin parameter is given
        filteredProducts = products.filter(product => product.origin === originFilter);
    }

    res.render('store', {
        title: originFilter ? `Products from ${originFilter}` : 'Our Tea Selection',
        products: filteredProducts
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
        searchTerm
    });
});

router.use(isAuthenticated); // Protect all routes below this line

router.get('/tea-blender', async (req, res) => {
    try {
        const blendableTeas = await getBlendableTeas();
        res.render('tea-blender', { 
            title: 'Tea Blending Workshop', 
            blendableTeas,
        });
    } catch (error) {
        console.error('Error loading tea blender:', error);
        res.status(500).send('An error occurred while loading the tea blender');
    }
});

router.get('/blendable-teas', async (req, res) => {
    try {
        const blendableTeas = await getBlendableTeas();
        res.json(blendableTeas);
    } catch (error) {
        console.error('Error fetching blendable teas:', error);
        res.status(500).json({ error: 'Failed to fetch blendable teas' });
    }
});

// POST create new blend
router.post('/tea-blender', async (req, res) => {
    try {
        const { blendName, baseTea, flavors } = req.body;

        if (!blendName || !baseTea || !flavors || Object.keys(flavors).length === 0) {
            return res.status(400).json({ error: 'Invalid blend data' });
        }

        const newBlend = await createBlend(req.session.username, blendName, baseTea, flavors);
        res.status(201).json(newBlend);
    } catch (error) {
        console.error('Error creating blend:', error);
        res.status(500).json({ error: 'Failed to create blend' });
    }
});

// GET user blends
router.get('/user-blends', async (req, res) => {
    try {
        const userBlends = await getUserBlends(req.session.username);
        res.json(userBlends);
    } catch (error) {
        console.error('Error fetching user blends:', error);
        res.status(500).json({ error: 'Failed to fetch user blends' });
    }
});

// DELETE remove blend
router.delete('/remove-blend/:blendId', async (req, res) => {
    try {
        const { blendId } = req.params;
        await removeBlend(req.session.username, blendId);
        res.json({ success: true, message: 'Blend removed successfully' });
    } catch (error) {
        console.error('Error removing blend:', error);
        res.status(500).json({ error: 'Failed to remove blend' });
    }
});

// POST add blend to cart
router.post('/add-blend-to-cart', async (req, res) => {
    try {
        const { blendId } = req.body;
        const blend = await getBlendById(req.session.username, blendId);
        
        if (!blend) {
            return res.status(404).json({ success: false, error: 'Blend not found' });
        }

        await addBlendToCart(req.session.username, blendId, 1);
        await addUserActivity({
            username: req.session.username,
            type: 'add-to-cart',
            details: 'Custom Blend'
        });

        res.json({ success: true });

    } catch (error) {
        console.error('Error adding blend to cart:', error);
        res.status(500).json({ success: false, error: 'Failed to add blend to cart' });
    }
});


// POST add to cart
router.post('/add-to-cart', async (req, res) => {
    try {
        await addToCart(req.session.username, req.body.productId, parseInt(req.body.quantity, 10));
        await addUserActivity({
            username: req.session.username,
            type: 'add-to-cart'
        });

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
    const userCart = getCart(req.session.username);

    // Fetch full product details for each item in the cart
    const detailedCart = await Promise.all(userCart.map(async (item) => {
        const product = await getProduct(item.productId);
        return {
            ...product,
            quantity: item.quantity,
        };
    }));

    res.render('cart', { 
        cart: detailedCart
     });
});

// GET checkout page
router.get('/checkout', async (req, res) => {
    try {
        const userCart = getCart(req.session.username);
        const cartDetails = await Promise.all(userCart.map(async item => {
            const product = await getProduct(item.productId);

            if (!product) {
                return {
                    name: 'Personalized Blend',
                    price: 9.99,
                    quantity: item.quantity,
                    imageUrl: '',  // Default or placeholder image URL
                    total: (9.99 * item.quantity).toFixed(2)
                };
            }

            const price = parseFloat(product.price) 
            const total = (price * item.quantity).toFixed(2);  

            return {
                name: product.name,
                price: price,
                quantity: item.quantity,
                imageUrl: product.imageUrl,  // Default or placeholder image URL
                total: total
            };
        }));

        res.render('checkout', { 
            cartDetails,
        });
    } catch (error) {
        console.error(`Error loading checkout page: ${error.message}`);
        res.status(500).send('Server Error');
    }
});


// GET quiz page
router.get('/quiz', (req, res) => {
    res.render('quiz');
});

// GET products API
router.get('/api/products', async (req, res) => {
    try {
        const products = await getProducts();
        res.json(products);
    } catch (error) {
        console.error('Error fetching products:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// GET reviews page
router.get('/reviews', async(req, res) => {
    const reviews = await getReviews();
    res.render('reviews', { reviews });
});

// POST review
router.post('/reviews', async (req, res) => {
    const { name, rating, comment } = req.body;
    if (!name || !rating || !comment) {
        return res.status(400).json({ success: false, message: 'All fields are required' });
    }
    try {
        await addReview({ name, rating: parseInt(rating, 10), comment });
        res.json({ success: true, message: 'Review added successfully' });
    } catch (error) {
        console.error('Error adding review:', error);
        res.status(500).json({ success: false, message: 'Failed to add review' });
    }
});

// POST remove item from cart
router.delete('/remove-item', async (req, res) => {
    const { productId } = req.body;
    try {
        removeFromCart(req.session.username, productId);
        res.redirect('/store/cart');
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).send('Failed to remove item from cart.');
    }
});


router.post('/update-quantity', async (req, res) => {
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
    try {
        // Get detailed checkout information, including the total
        const { cartDetails, total } = await getCheckoutDetails(req.session.username);

        if (cartDetails.length === 0) {
            return res.redirect('/store/cart'); // Redirect back to cart if it's empty
        }

        // Map cartDetails to only include productId and quantity for the order items
        const orderItems = cartDetails.map(item => ({
            productId: item.id,  // Assuming `id` corresponds to `productId`
            quantity: item.quantity
        }));

        // Create an order object using the checkout details
        const order = {
            id: Date.now(), // Simple unique ID
            user: req.session.username,
            items: orderItems,  // Use stripped down orderItems
            total, // Use the total from getCheckoutDetails
            date: new Date().toISOString(),
        };

        await addOrder(order);

        // Process the checkout (clear the cart, etc.)
        await processCheckout(req.session.username);

        // Redirect to the thank you page
        res.redirect('/store/thank-you');
    } catch (error) {
        console.error('Error during checkout processing:', error);
        res.status(500).send('An error occurred during the checkout process.');
    }
});

// GET thank you page
router.get('/thank-you', (req, res) => {
    res.render('thank-you-payment', { user: req.session.username });
});

// GET map page
router.get('/map', (req, res) => {
    res.render('map');
});

// GET tea regions API
router.get('/api/tea-regions', async (req, res) => {
    const products = await getProducts();
    const regions = {};

    products.forEach(product => {
        if (!regions[product.origin]) {
            regions[product.origin] = {
                name: product.origin,
                products: [],
                lat: product.lat,
                lng: product.lng,
            };
        }
        regions[product.origin].products.push(product.name);
    });

    res.json(Object.values(regions));
});


module.exports = router;
