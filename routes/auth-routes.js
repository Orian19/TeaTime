const express = require('express');
const router = express.Router();
const { registerUser, authenticateUser } = require('../modules/user');

router.get('/register', (req, res) => {
    res.render('register');
});

router.post('/register', async (req, res) => {
    try {
        await registerUser(req.body.username, req.body.password);
        res.redirect('/auth/login');
    } catch(error) {
        res.status(400).send(error.message);
    }
});

router.get('/login', (req, res) => {
    res.render('login');
});

router.post('/login', async (req, res) => {
    const { username, password, rememberMe } = req.body;
    console.log(`Attempting login with username: ${username}`);
    try {
        const user = await authenticateUser(username, password);
        if(user) {
            req.session.username = username;
            req.session.isAdmin = user.isAdmin; // Set isAdmin in the session if the user is an admin
            if (rememberMe) {
                req.session.cookie.maxAge = 10 * 24 * 60 * 60 * 1000; // 10 days
            }
            console.log(`Login successful for username: ${username}`);
            res.redirect('/store');
        } else {
            console.log(`Login failed for username: ${username}`);
            res.status(401).send('Invalid username or password');
        }
    } catch(error) {
        console.error(`Error during login for username: ${username}: ${error.message}`);
        res.status(500).send('An error occurred during login');
    }
});

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err) {
            console.error(err);
        }
        res.redirect('/auth/login');
    })
});

// Middleware to check if user is admin
function isAdmin(req, res, next) {
    console.log('isAdmin middleware:', req.session);
    if (req.session.isAdmin) {
        next();
    } else {
        res.redirect('/login');
    } 
}

// Admin route
router.get('/admin', isAdmin, async (req, res) => {
    try {
        const activities = await getUserActivities(); 
        res.render('admin', { activities });
    } catch (error) {
        console.error(`Error fetching user activities: ${error.message}`);
        res.status(500).send('Server error');
    }
});

// Filter user activities
router.post('/admin/filter', isAdmin, async (req, res) => {
    try {
        const prefix = req.body.prefix;
        const activities = await filterUserActivities(prefix); // Implement this function to filter user activities based on the prefix
        res.render('admin', { activities });
    } catch (error) {
        console.error(`Error filtering user activities: ${error.message}`);
        res.status(500).send('Server error');
    }
});

// Manage products
router.get('/admin/products', isAdmin, (req, res) => {
    res.render('manage-products');
});

router.post('/admin/products/add', isAdmin, async (req, res) => {
    try {
        const { title, description, picture } = req.body;
        await addProduct({ title, description, picture }); // Implement this function to add a product to the database
        res.redirect('/admin/products');
    } catch (error) {
        console.error(`Error adding product: ${error.message}`);
        res.status(500).send('Server error');
    }
});

router.post('/admin/products/remove', isAdmin, async (req, res) => {
    try {
        const productId = req.body.productId;
        await removeProduct(productId); // Implement this function to remove a product from the database
        res.redirect('/admin/products');
    } catch (error) {
        console.error(`Error removing product: ${error.message}`);
        res.status(500).send('Server error');
    }
});

module.exports = router;
