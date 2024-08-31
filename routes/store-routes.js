const express = require('express');
const router = express.Router();
const { isAuthenticated } = require('../modules/user');
const { addToCart, getCart, removeFromCart, updateCartQuantity, getCartDetails, clearCart} = require('../modules/cart');
const { getProducts, getProduct } = require('../modules/products');
const { getCheckoutDetails, processCheckout } = require('../modules/checkout');
const { getReviews, addReview } = require('../modules/reviews');
const {addOrder} = require("../modules/orders");
const {addUserActivity} = require("../modules/admin");
const { getBlendableTeas, getUserBlendsList, getBlend, removeBlend, createUserBlend } = require('../modules/tea-blender');

// GET store page with pagination
router.get('/', async (req, res) => {
    const products = await getProducts();
    const originFilter = req.query.origin;
    const page = parseInt(req.query.page) || 1;
    const limit = 9; // Number of products per page
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / limit);

    let filteredProducts = products;

    if (originFilter) {
        filteredProducts = products.filter(product => product.origin === originFilter);
    }

    // Paginate filtered products
    const startIndex = (page - 1) * limit;
    const paginatedProducts = filteredProducts.slice(startIndex, startIndex + limit);

    // Dynamic Pagination Logic
    const maxVisiblePages = 5; // Number of pages to show before/after current page
    const startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    const pagination = {
        currentPage: page,
        totalPages,
        startPage,
        endPage,
    };

    res.render('store', {
        title: originFilter ? `Products from ${originFilter}` : 'Our Tea Selection',
        products: paginatedProducts,
        pagination,
    });
});

// GET product details
router.get('/product/:id', async (req, res) => {
    const productId = req.params.id;
    const product = await getProduct(productId);

    if (!product) {
        return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
});

// Search functionality with pagination
router.get('/search', async (req, res) => {
    const searchTerm = req.query.search ? req.query.search.toLowerCase() : '';
    let products = await getProducts();

    if (searchTerm) {
        products = products.filter(product =>
            product.name.toLowerCase().includes(searchTerm) ||
            product.description.toLowerCase().includes(searchTerm)
        );
    }

    // Pagination logic
    const page = parseInt(req.query.page) || 1;
    const limit = 9; // Number of products per page
    const totalProducts = products.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const paginatedProducts = products.slice((page - 1) * limit, page * limit);

    // Dynamic Pagination Logic
    const maxVisiblePages = 5; // Number of pages to show before/after current page
    const startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    const pagination = {
        currentPage: page,
        totalPages,
        startPage,
        endPage,
    };

    res.render('store', {
        title: 'Search Results',
        products: paginatedProducts,
        searchTerm,
        pagination,
    });
});

router.use(isAuthenticated); // Protect all routes below this line

router.get('/tea-blender', async (req, res) => {
    try {
        const blendableTeas = await getBlendableTeas();
        const userBlends = await getUserBlendsList(req.session.username);
        res.render('tea-blender', {
            title: 'Tea Blending Workshop',
            blendableTeas,
            userBlends
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
    const blend = await createUserBlend(req.session.username, req.body);
    res.json(blend);
});

// GET user blends
router.get('/user-blends', async (req, res) => {
    try {
        const userBlends = await getUserBlendsList(req.session.username);
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
    const { blendId, quantity } = req.body;
    const blend = await getBlend(req.session.username, blendId);

    if (!blend) {
        return res.status(404).json({ error: 'Blend not found' });
    }

    await addToCart(req.session.username, blendId, quantity, 'custom_blend');
    res.json({ success: true });
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
        console.error('Error adding to cart:', error.message);
        res.status(400).json({ error: error.message }); // Send a 400 Bad Request with the error message
    }
});


// GET cart page
router.get('/cart', async (req, res) => {
    try {
        const cartDetails = await getCartDetails(req.session.username);
        res.render('cart', { cart: cartDetails });
    } catch (error) {
        console.error('Error fetching cart details:', error);
        res.status(500).send('An error occurred while loading the cart.');
    }
});

// GET checkout page
router.get('/checkout', async (req, res) => {
    try {
        const userCart = await getCart(req.session.username);
        const cartDetails = await Promise.all(userCart.map(async item => {

            if (item.itemType === 'product') {
                const product = await getProduct(item.itemId);

                if (!product) {
                    throw new Error(`Product not found: ${item.itemId}`);
                }

                const price = parseFloat(product.price);
                return {
                    name: product.name,
                    price: price,
                    quantity: item.quantity,
                    imageUrl: product.imageUrl,
                    total: (price * item.quantity).toFixed(2),
                    itemType: 'product'
                };

            } else if (item.itemType === 'custom_blend') {
                const blend = await getBlend(req.session.username, item.itemId);

                if (!blend) {
                    throw new Error(`Blend not found: ${item.itemId}`);
                }

                const price = 9.99; // Or calculate based on blend components
                return {
                    name: blend.name,
                    price: price,
                    quantity: item.quantity,
                    imageUrl: '/images/tea-blend.jpg', // Use a default image for blends
                    total: (price * item.quantity).toFixed(2),
                    itemType: 'custom_blend'
                };
            }
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
router.post('/remove-item', async (req, res) => {
    const { itemId, itemType } = req.body;
    try {
        await removeFromCart(req.session.username, itemId, itemType);
        res.redirect('/store/cart');
    } catch (error) {
        console.error('Error removing item from cart:', error);
        res.status(500).send('Failed to remove item from cart.');
    }
});


router.post('/update-quantity', async (req, res) => {
    const { itemId, quantity, itemType } = req.body;
    try {
        await updateCartQuantity(req.session.username, itemId, parseInt(quantity, 10), itemType);
        res.redirect('/store/cart');
    } catch (error) {
        console.error('Error updating cart quantity:', error);
        res.status(500).send('Failed to update cart quantity.');
    }
});

router.post('/checkout/process', async (req, res) => {
    try {
        const { cartDetails, total } = await getCheckoutDetails(req.session.username);

        if (cartDetails.length === 0) {
            return res.status(400).json({ error: 'Your cart is empty. Please add items to your cart before checking out.' });
        }

        const orderItems = cartDetails.map(item => ({
            itemId: item.id,
            itemType: item.itemType,
            name: item.name,
            price: item.price,
            quantity: item.quantity
        }));

        const order = {
            id: Date.now().toString(),
            user: req.session.username,
            items: orderItems,
            total: total,
            date: new Date().toISOString(),
        };

        await addOrder(order);  // Save the order
        await processCheckout(req.session.username);  // Deduct stock and clear cart

        // Send a JSON response indicating success
        res.json({ success: true, redirect: '/store/thank-you' });
    } catch (error) {
        console.error('Error during checkout processing:', error.message);
        // Send a JSON response with the error message
        res.status(400).json({ error: error.message });
    }
});


// GET thank you page
router.get('/thank-you', (req, res) => {
    res.render('thank-you-payment');
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
